---
slug: dart-deep-comparison-and-value-equality
title: "Deep Comparison and Value Equality in Dart: From identical() to equatable and Macros"
authors: [admin]
tags: [dart, dart3, language-features, architecture]
---

# Deep Comparison and Value Equality in Dart: From identical() to equatable and Macros

Equality in programming appears straightforward: *are these two objects the same?*

In Dart, however, answering that question depends on whether you mean **reference equality** (do both variables point to the exact same location in memory?) or **value equality** (do both objects contain the same data fields and contents?).

Misunderstanding how Dart evaluates equality is one of the most persistent causes of subtle bugs and performance bottlenecks in Flutter applications:

* **Redundant Widget Rebuilds:** State management libraries like Bloc, Riverpod, and Provider rely on equality checks to skip unnecessary UI updates. Broken equality causes expensive re-renders.
* **Disappearing Set and Map Entries:** When the `hashCode` and `operator ==` contract is violated, `HashSet` and `HashMap` fail to locate or deduplicate objects.
* **Unexpected Collection Failures:** By default in Dart, `[1, 2] == [1, 2]` evaluates to `false`.
* **State Loss in Navigation & Caching:** Caches comparing requests or route arguments fail to recognize equivalent payloads.

{/* truncate */}

This comprehensive guide explores the full spectrum of equality in Dart—from fundamental language primitives like `identical()` and `Object.hash()`, to `package:collection`, `equatable`, code generation with `freezed`, Dart 3 records, and the future of Dart Macros.

---

## 1. Reference Equality vs. Value Equality

Every non-nullable Dart type inherits from `Object`, which defines the default equality operator:

```dart
// Default implementation in dart:core Object
bool operator ==(Object other) => identical(this, other);
```

By default, Dart performs **reference equality** (identity). Two distinct object instances in memory with identical field values are **not** considered equal unless you explicitly override how they should be compared.

```dart
class User {
  final String id;
  final String name;

  User(this.id, this.name);
}

void main() {
  final user1 = User('1', 'Alice');
  final user2 = User('1', 'Alice');

  print(user1 == user2); // false!
  print(identical(user1, user2)); // false
}
```

```text
┌─────────────────────────┐          ┌─────────────────────────┐
│ user1 (Address: 0x1A0F) │          │ user2 (Address: 0x2B4C) │
├─────────────────────────┤          ├─────────────────────────┤
│ id: '1'                 │          │ id: '1'                 │
│ name: 'Alice'           │          │ name: 'Alice'           │
└─────────────────────────┘          └─────────────────────────┘
                ▲                                  ▲
                │          identical()             │
                └─────────────── ✗ ────────────────┘
                              (false)
```

Even though `user1` and `user2` have identical property values, they occupy different heap allocations.

---

## 2. When Identity Matches: `identical()` and `const` Canonicalization

Dart provides the top-level function `identical(a, b)` to determine if two references point to the exact same instance in memory.

### Compile-Time `const` Canonicalization

When an object has a `const` constructor and is instantiated using the `const` keyword with identical arguments, the Dart compiler canonicalizes the instance. Only a single instance is stored in memory and reused throughout the entire application lifecycle:

```dart
class ConstUser {
  final String id;
  final String name;

  const ConstUser(this.id, this.name);
}

void main() {
  const u1 = ConstUser('1', 'Alice');
  const u2 = ConstUser('1', 'Alice');
  final u3 = ConstUser('1', 'Alice'); // Not created with const

  print(u1 == u2); // true (Identical memory address!)
  print(identical(u1, u2)); // true

  print(u1 == u3); // false! (u3 is a new heap allocation)
  print(identical(u1, u3)); // false
}
```

```text
┌─────────────────────────────────────────────────────────────┐
│                    Dart Constant Pool                       │
│  ┌───────────────────────────────────────────────────────┐  │
│  │ ConstUser(id: '1', name: 'Alice') [Address: 0x00FF]   │  │
│  └───────────────────────────────────────────────────────┘  │
│          ▲                               ▲                  │
└──────────┼───────────────────────────────┼──────────────────┘
           │                               │
       const u1                        const u2
```

`const` canonicalization is great for compile-time constants (e.g., widget themes, static configurations), but dynamic data loaded from APIs, databases, or user input cannot be instantiated as `const`. You must implement proper value equality.

---

## 3. The Equality & HashCode Contract

Overriding `operator ==` requires strictly adhering to the **Equality and HashCode Contract** defined by the Dart language specification.

### The Four Golden Invariants

1. **Reflexive:** For any object `a`, `a == a` must return `true`.
2. **Symmetric:** For any objects `a` and `b`, `a == b` must return the same result as `b == a`.
3. **Transitive:** For any objects `a`, `b`, and `c`, if `a == b` and `b == c`, then `a == c` must be `true`.
4. **Consistent:** Repeated invocations of `a == b` must consistently return `true` or `false`, provided neither object has been modified.
5. **HashCode Invariant:** If `a == b`, then `a.hashCode == b.hashCode` **MUST** be `true`.

```text
┌─────────────────────────────────────────────────────────────┐
│                 The HashCode Invariant                      │
├─────────────────────────────────────────────────────────────┤
│   a == b           ===>   a.hashCode == b.hashCode (MUST)   │
│   a.hashCode != b.hashCode ===>   a != b           (MUST)   │
│   a.hashCode == b.hashCode ===>   a == b           (MAYBE)  │
└─────────────────────────────────────────────────────────────┘
```

### Why Violating HashCode Breaks Sets and Maps

Dart's `HashSet`, `LinkedHashSet`, `HashMap`, and `LinkedHashMap` use hash buckets for $O(1)$ lookups.

When you add an element to a `Set`:
1. Dart computes the object's `hashCode` to find the correct internal bucket.
2. If multiple items share the same hash code (a hash collision), Dart uses `operator ==` to check if the item already exists in that bucket.

```text
HashSet Storage:
Bucket 102 ──► [ ItemA (hash: 102) ]
Bucket 103 ──► [ ItemB (hash: 103) ] ──► [ ItemC (hash: 103) ] (collision checked via ==)
Bucket 104 ──► [ Empty ]
```

If two objects return `true` for `==` but have different `hashCode` values, they land in different buckets. The `Set` will fail to recognize them as duplicates!

### The Mutable HashCode Disaster

> **Critical Rule:** Never mutate an object after adding it to a `Set` or using it as a key in a `Map`.

```dart
class MutableUser {
  String name;
  MutableUser(this.name);

  @override
  bool operator ==(Object other) =>
      identical(this, other) || other is MutableUser && other.name == name;

  @override
  int get hashCode => name.hashCode;
}

void main() {
  final user = MutableUser('Bob');
  final userSet = <MutableUser>{user};

  print(userSet.contains(user)); // true

  // Mutating the field alters the hashCode!
  user.name = 'Robert';

  // The object is still in the set, but in the OLD hash bucket:
  print(userSet.contains(user)); // false! (Lost in the set)
  print(userSet.length); // 1
}
```

Value objects should always be **immutable** (`final` fields) to prevent this subtle corruption.

---

## 4. Manual Implementation: The Vanilla Dart Approach

To implement value equality in pure Dart without external libraries:

```dart
class Product {
  final String sku;
  final String title;
  final double price;
  final bool inStock;

  const Product({
    required this.sku,
    required this.title,
    required this.price,
    this.inStock = true,
  });

  @override
  bool operator ==(Object other) {
    // 1. Fast reference check
    if (identical(this, other)) return true;

    // 2. Type test and field comparison
    return other is Product &&
        other.sku == sku &&
        other.title == title &&
        other.price == price &&
        other.inStock == inStock;
  }

  @override
  int get hashCode => Object.hash(sku, title, price, inStock);
}
```

### Understanding `Object.hash()` and `Object.hashAll()`

Dart provides built-in hashing helpers in `dart:core`:

* `Object.hash(v1, v2, v3, ...)`: Combines up to 20 positional arguments into a single high-quality hash code using a Jenkins-style hash function.
* `Object.hashAll(Iterable)`: Hashes an ordered collection of elements.
* `Object.hashAllUnordered(Iterable)`: Hashes an unordered collection (such as a `Set` or `Map`), producing the same hash code regardless of element iteration order.

```dart
// For 1 to 20 fields:
@override
int get hashCode => Object.hash(id, name, age);

// For dynamic lists of fields:
@override
int get hashCode => Object.hashAll([id, name, age, ...extraProps]);
```

### The Polymorphic Equality Question: `is` vs `runtimeType`

Notice the type check: `other is Product`.

```dart
// Option A (Recommended):
return other is Product && ...

// Option B (Strict Exact Type):
return other.runtimeType == runtimeType && other is Product && ...
```

* **`other is Product` (Subtype-compatible):** Allows subclasses to compare equal to parent classes if the subclass doesn't introduce new state.
* **`other.runtimeType == runtimeType` (Exact type):** Enforces that instances must be the exact same class. Useful when subclasses add distinct fields that affect equality.

For most Flutter domain models, `other is ClassName` is standard.

---

## 5. The Collection Equality Trap

One of the most frequent surprises for developers new to Dart:

```dart
final listA = [1, 2, 3];
final listB = [1, 2, 3];

print(listA == listB); // false!
```

Dart's built-in collections (`List`, `Set`, `Map`) **do not override `operator ==`**. They use reference equality. This design decision preserves $O(1)$ equality performance and prevents infinite recursion on self-referential collections.

However, if your data model contains a list:

```dart
class Team {
  final String name;
  final List<String> members;

  const Team(this.name, this.members);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Team &&
          other.name == name &&
          other.members == members; // ❌ BUG: Reference comparison!

  @override
  int get hashCode => Object.hash(name, members); // ❌ BUG: Reference hash!
}
```

Even if two `Team` instances have identical member lists, `team1 == team2` will return `false` because `[ 'Alice' ] != [ 'Alice' ]`.

### The Solution: `package:collection`

The official Dart [`package:collection`](https://pub.dev/packages/collection) provides robust collection equality classes:

```dart
import 'package:collection/collection.dart';

void main() {
  // 1. List Equality (Ordered)
  const listEquality = ListEquality<int>();
  print(listEquality.equals([1, 2, 3], [1, 2, 3])); // true
  print(listEquality.equals([1, 2, 3], [3, 2, 1])); // false

  // 2. Set Equality (Unordered)
  const setEquality = SetEquality<String>();
  print(setEquality.equals({'admin', 'user'}, {'user', 'admin'})); // true

  // 3. Map Equality
  const mapEquality = MapEquality<String, dynamic>();
  print(mapEquality.equals({'a': 1, 'b': 2}, {'b': 2, 'a': 1})); // true

  // 4. Deep Collection Equality (Nested structures)
  const deepEquality = DeepCollectionEquality();
  final data1 = {'users': [{'id': 1}, {'id': 2}]};
  final data2 = {'users': [{'id': 1}, {'id': 2}]};
  print(deepEquality.equals(data1, data2)); // true
}
```

### Correct Implementation with `ListEquality`

```dart
import 'package:collection/collection.dart';

class Team {
  final String name;
  final List<String> members;

  const Team(this.name, this.members);

  static const _listEquality = ListEquality<String>();

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is Team &&
          other.name == name &&
          _listEquality.equals(other.members, members);

  @override
  int get hashCode => Object.hash(name, _listEquality.hash(members));
}
```

---

## 6. Solution 1: The `equatable` Package

Writing manual `operator ==` and `hashCode` overrides for dozens of data models is tedious, repetitive, and error-prone. The [`equatable`](https://pub.dev/packages/equatable) package simplifies value equality without requiring any code generation.

Add to `pubspec.yaml`:

```yaml
dependencies:
  equatable: ^2.0.7
```

### Extending `Equatable`

Define your class by extending `Equatable` and returning all fields in the `props` getter:

```dart
import 'package:equatable/equatable.dart';

class UserProfile extends Equatable {
  final String id;
  final String email;
  final List<String> roles;

  const UserProfile({
    required this.id,
    required this.email,
    required this.roles,
  });

  @override
  List<Object?> get props => [id, email, roles];
}
```

`Equatable` automatically:
1. Implements `operator ==` by comparing every element in `props`.
2. Automatically performs deep equality checks on any collections inside `props`.
3. Computes a consistent `hashCode` from `props`.

```dart
void main() {
  final u1 = UserProfile(id: '1', email: 'user@test.com', roles: ['admin']);
  final u2 = UserProfile(id: '1', email: 'user@test.com', roles: ['admin']);

  print(u1 == u2); // true!
  print(u1.hashCode == u2.hashCode); // true!
}
```

### Using `EquatableMixin`

If your class already extends another class (e.g., `ChangeNotifier`, `Bloc`, or a custom base class), you cannot extend `Equatable` due to Dart's single inheritance model. Use `EquatableMixin` instead:

```dart
import 'package:equatable/equatable.dart';
import 'package:flutter/foundation.dart';

class SessionState extends ChangeNotifier with EquatableMixin {
  final String token;
  final DateTime expiry;

  SessionState({required this.token, required this.expiry});

  @override
  List<Object?> get props => [token, expiry];
}
```

### Clean Debugging with `stringify`

By default, `Equatable` can generate descriptive `toString()` output showing your properties:

```dart
class CounterState extends Equatable {
  final int count;
  final bool isLoading;

  const CounterState({required this.count, this.isLoading = false});

  @override
  List<Object?> get props => [count, isLoading];

  @override
  bool get stringify => true;
}

// Usage:
// print(CounterState(count: 42, isLoading: true));
// Output: CounterState(42, true)
```

---

## 7. Solution 2: Code Generation with `freezed`

For complex immutable state trees, [`freezed`](https://pub.dev/packages/freezed) is the gold standard in Flutter development. It generates:

* Value equality and `hashCode` (with deep collection equality)
* `copyWith()` method for non-destructive mutations
* Pattern matching and union types
* JSON serialization (`fromJson` / `toJson`)

### Freezed Model Example

```dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'order.freezed.dart';
part 'order.g.dart';

@freezed
class Order with _$Order {
  const factory Order({
    required String orderId,
    required double totalAmount,
    required List<String> itemIds,
    @Default(false) bool isDelivered,
  }) = _Order;

  factory Order.fromJson(Map<String, dynamic> json) => _$OrderFromJson(json);
}
```

Generate the code:

```bash
dart run build_runner build --delete-conflicting-outputs
```

### Benefits of `freezed`
* **Zero Runtime Overhead:** Equality logic is generated at compile time.
* **Deep Equality:** Nested lists and maps are compared deeply by default.
* **Type Safety:** Enforces complete immutability (`UnmodifiableListView`).

---

## 8. Solution 3: Dart 3 Records (Built-in Structural Value Equality)

Dart 3 introduced **Records** as first-class composite types. Unlike regular Dart classes, Records provide **built-in structural value equality** out of the box!

```dart
void main() {
  // Named records
  final posA = (x: 10, y: 20, label: 'Origin');
  final posB = (x: 10, y: 20, label: 'Origin');

  print(posA == posB); // true!
  print(posA.hashCode == posB.hashCode); // true!

  // Positional records
  final pair1 = ('Dart', 3);
  final pair2 = ('Dart', 3);
  print(pair1 == pair2); // true!
}
```

### Using Records as Compound Map Keys

Before Dart 3, combining two values into a Map key required creating a custom class with `==` and `hashCode`. With Records, this is trivial:

```dart
// Multi-parameter cache key without writing any classes!
final cache = <(String endpoint, int page), List<String>>{};

final key1 = (endpoint: '/products', page: 1);
final key2 = (endpoint: '/products', page: 1);

cache[key1] = ['Product A', 'Product B'];

// Successful cache hit because Record equality matches by value:
print(cache[key2]); // ['Product A', 'Product B']
```

---

## 9. Solution 4: The Future of Dart Macros

The Dart team is actively developing **Dart Macros**—a language-level metaprogramming feature that executes during compilation without needing `build_runner` or separate `.g.dart` files.

In future Dart releases, generating a complete data class with value equality, hash codes, `copyWith`, and `toString` will be as simple as attaching an annotation:

```dart
// Future Dart Macro syntax
@DataClass()
class Customer {
  final String id;
  final String name;
  final List<String> permissions;
}
```

The `@DataClass` macro will inspect the class fields at compile time and inject `operator ==`, `hashCode`, `copyWith()`, and `toString()` directly into the compiler's abstract syntax tree (AST).

---

## 10. Performance Impact in Flutter State Management

Why is value equality critical for Flutter architecture?

### Skipping Redundant Widget Rebuilds in Bloc & Cubit

`Bloc` and `Cubit` use a stream distinct filter to avoid emitting duplicate states:

```text
State Stream Emission:
  Current State: UserLoadedState(userId: '1', name: 'Alice')
  New State:     UserLoadedState(userId: '1', name: 'Alice')

  With Equatable:
  Current == New  ──►  TRUE   ──►  Stream ignores update (UI DOES NOT rebuild) ⚡

  Without Equatable:
  Current == New  ──►  FALSE  ──►  Stream emits new state (UI REBUILDS needlessly) 🐢
```

```dart
class UserProfileWidget extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    return BlocBuilder<UserBloc, UserState>(
      builder: (context, state) {
        // If UserState does not implement value equality,
        // this build method runs on EVERY event, causing frame drops!
        return Text('User: ${state.name}');
      },
    );
  }
}
```

### Riverpod Selector Optimization

Riverpod uses `==` inside `.select()` to determine if a consumer widget should update:

```dart
// Only rebuilds when the user's name actually changes by value
final userName = ref.watch(
  userProvider.select((user) => user.name),
);
```

If the extracted value is a complex object without value equality, Riverpod will re-execute the build function whenever the parent provider changes.

---

## 11. Comprehensive Unit Testing for Equality

Always verify your equality implementations with dedicated unit tests using `package:test`:

```dart
import 'package:test/test.dart';

class GeoPoint {
  final double latitude;
  final double longitude;

  const GeoPoint(this.latitude, this.longitude);

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is GeoPoint &&
          other.latitude == latitude &&
          other.longitude == longitude;

  @override
  int get hashCode => Object.hash(latitude, longitude);
}

void main() {
  group('GeoPoint Equality Contract', () {
    const p1 = GeoPoint(37.7749, -122.4194);
    const p2 = GeoPoint(37.7749, -122.4194);
    const p3 = GeoPoint(37.7749, -122.4194);
    const pDiff = GeoPoint(40.7128, -74.0060);

    test('Reflexivity: a == a is always true', () {
      expect(p1 == p1, isTrue);
    });

    test('Symmetry: a == b implies b == a', () {
      expect(p1 == p2, isTrue);
      expect(p2 == p1, isTrue);
    });

    test('Transitivity: a == b and b == c implies a == c', () {
      expect(p1 == p2, isTrue);
      expect(p2 == p3, isTrue);
      expect(p1 == p3, isTrue);
    });

    test('Inequality for distinct fields', () {
      expect(p1 == pDiff, isFalse);
    });

    test('HashCode matches when objects are equal', () {
      expect(p1.hashCode, equals(p2.hashCode));
    });

    test('Deduplication inside Set', () {
      final points = {p1, p2, p3};
      expect(points.length, equals(1));
    });

    test('Key retrieval in Map', () {
      final map = {p1: 'San Francisco'};
      expect(map[p2], equals('San Francisco'));
    });
  });
}
```

---

## 12. Decision Matrix & Best Practices

| Approach | Deep Collection Equality? | Code Generation? | Built-in `copyWith`? | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`identical()` / `Object.==`** | ❌ No | None | No | Stateful services, controllers, identity-based entities |
| **`Object.hash()` (Manual)** | Manual | None | No | Tiny classes (1–2 fields) without external dependencies |
| **`package:collection`** | ✅ Yes | None | No | Comparing arbitrary nested lists, sets, and JSON structures |
| **`package:equatable`** | ✅ Yes | None | No | **Flutter Bloc states/events, lightweight view models** |
| **`package:freezed`** | ✅ Yes | Yes (`build_runner`) | ✅ Yes | **Large domain models, API DTOs, complex unions** |
| **Dart 3 Records** | ✅ Yes (Nested) | None | No | **Lightweight tuples, multi-return values, compound map keys** |
| **Dart Macros** | ✅ Yes | Compile-time | ✅ Yes | *Future standard for zero-boilerplate data classes* |

```text
               Which equality strategy should you use?
                                  │
         ┌────────────────────────┼────────────────────────┐
         ▼                        ▼                        ▼
 Lightweight Tuples        Bloc / UI States         Domain Models / DTOs
   or Map Keys                    │                        │
         │                        ▼                        ▼
  Dart 3 Records          package:equatable        package:freezed
   (x: 10, y: 20)           (props: [...])          (@freezed class)
```

### Key Takeaways:

1. **Default is Identity:** Dart default equality compares memory addresses, not property values.
2. **Honor the Contract:** Never override `operator ==` without overriding `hashCode` using `Object.hash()`.
3. **Beware Collections:** `[1] != [1]` by default. Use `package:collection` or `package:equatable` for deep collection comparisons.
4. **Keep Value Objects Immutable:** Mutating an object after inserting it into a `Set` or `Map` will corrupt hash-based lookups.
5. **Optimize Flutter Builds:** State objects used with Bloc, Riverpod, or Provider must implement value equality to prevent wasteful widget rebuilds.
