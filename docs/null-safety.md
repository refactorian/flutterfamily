---
sidebar_position: 14
title: Null Safety
description: Nullable types, null-aware operators, type promotion, late variables, and null safety patterns in Dart.
---

Dart's null safety is **sound** — the compiler guarantees that non-nullable variables can never be null at runtime.

---

## The Problem Null Safety Solves

```dart
// Without null safety (pre-Dart 2.12), this would crash at runtime:
String name = getNameFromDatabase();
print(name.length); // 💥 NullPointerException if getNameFromDatabase() returns null

// With null safety:
String name = getNameFromDatabase(); // ← compiler error if this might be null!
String? name = getNameFromDatabase(); // ← must explicitly handle null
```

---

## Nullable vs Non-Nullable Types

```dart
// Non-nullable — CANNOT be null (the default)
String name = 'Alice';
int age = 30;
List<String> items = [];

// name = null;  // ❌ compile error!

// Nullable — CAN be null (add ?)
String? optionalName = null;  // ✅ OK
int? optionalAge;             // null by default
List<String>? optionalList;   // null by default

optionalName = 'Bob';         // ✅ can also hold a String
```

---

## Null-Aware Operators

### `?.` — Null-Safe Member Access

```dart
String? name = null;
print(name?.length);        // null (instead of NullPointerException)
print(name?.toUpperCase()); // null

String? text = 'hello';
print(text?.length);        // 5

// Chaining
class Address { String? city; }
class User { Address? address; }

User? user = User();
print(user?.address?.city); // null (safe at each step)
```

### `??` — If-Null Operator

```dart
String? name = null;
String display = name ?? 'Guest';  // 'Guest'

int? count = null;
int total = count ?? 0;  // 0

// Chaining
String? a = null, b = null, c = 'found!';
print(a ?? b ?? c);  // 'found!'
print(a ?? b ?? 'default'); // 'default'
```

### `??=` — Null-Aware Assignment

```dart
String? cache;

// Only assigns if null
cache ??= expensiveComputation();  // assigned if cache is null
cache ??= expensiveComputation();  // skipped — cache already has value
```

### `!` — Null Assertion (Bang Operator)

```dart
String? maybeNull = 'definitely not null';
String definitelyNotNull = maybeNull!;  // removes nullability — throws if null

// ⚠️ Use with care — defeats null safety!
String? risky = null;
// risky!.length  // ❌ throws Null check operator used on a null value

// Good use: when you KNOW it's non-null but compiler can't tell
class MyWidget {
  TextEditingController? _controller;

  void init() {
    _controller = TextEditingController();
  }

  String getText() => _controller!.text; // safe if you call init() first
}
```

---

## Handling Nullable Values

```dart
String? name = getName();

// Option 1: if null check
if (name != null) {
  print(name.length); // name is promoted to String here!
}

// Option 2: early return
String processName(String? name) {
  if (name == null) return 'Unknown';
  return name.toUpperCase(); // name is String here
}

// Option 3: ?? with default
print(name ?? 'Unknown');

// Option 4: ?. with fallback
print(name?.toUpperCase() ?? 'UNKNOWN');

// Option 5: Pattern matching (Dart 3)
switch (name) {
  case null:     print('No name');
  case String s: print(s.toUpperCase());
}
```

---

## Type Promotion

After a null check, Dart automatically promotes the type:

```dart
Object? value = 'hello';

if (value != null) {
  // value is promoted to Object (non-nullable) here
  print(value.toString()); // OK
}

if (value is String) {
  // value is promoted to String here
  print(value.length); // OK — no cast needed!
  print(value.toUpperCase()); // OK
}

// Promotion works with local variables, not fields
class Foo {
  String? name;

  void process() {
    if (name != null) {
      // name might still be null — another thread could set it!
      print(name!.length); // need ! for fields
    }

    // Workaround: assign to local variable first
    var localName = name;
    if (localName != null) {
      print(localName.length); // ✅ works — local variable is promoted
    }
  }
}
```

---

## `late` Variables

For non-null variables that can't be initialized immediately:

```dart
// late — promise to initialize before use
class DatabaseService {
  late final Database _db;  // initialized in init()

  Future<void> init() async {
    _db = await Database.connect();
  }

  Future<List<Row>> query(String sql) async {
    return await _db.execute(sql); // throws if init() not called!
  }
}

// late with initializer — lazy initialization
class Config {
  late final String _expensiveValue = computeExpensiveValue();
  // Only computed when first accessed!
}

// ⚠️ Accessing a late variable before initialization throws LateInitializationError
late String name;
// print(name); // ❌ LateInitializationError
name = 'Alice';
print(name); // ✅ Alice
```

---

## Nullable Collections

```dart
// These are all different!
List<String>? nullableList = null;     // The list itself can be null
List<String?> nullableElements = [null, 'a', null, 'b']; // Elements can be null
List<String?>? everything = null;      // Both can be null

// Working with nullable elements
var data = ['Alice', null, 'Bob', null, 'Carol'];
var nonNull = data.whereType<String>().toList(); // ['Alice', 'Bob', 'Carol']

// Remove nulls with pattern
var cleaned = [for (var item in data) if (item != null) item];
```

---

## Common Null Safety Patterns

```dart
// Pattern 1: Provide defaults
String greet(String? name) => 'Hello, ${name ?? 'Guest'}!';

// Pattern 2: Early return (guard clause)
String process(String? input) {
  if (input == null) return 'No input';
  if (input.isEmpty) return 'Empty input';
  return input.trim().toUpperCase();
}

// Pattern 3: Functional null handling
String? findUser(int id) => users.where((u) => u.id == id).firstOrNull?.name;

// Pattern 4: Convert nullable to non-nullable for bulk processing
List<String> activeEmails(List<User?> users) =>
    users.whereType<User>()
         .where((u) => u.isActive)
         .map((u) => u.email)
         .whereType<String>()
         .toList();

// Pattern 5: Null-safe JSON parsing
String parseName(Map<String, dynamic>? json) {
  return json?['name'] as String? ?? 'Unknown';
}
```

---

## Summary

| Syntax | Meaning |
|--------|---------|
| `String` | Non-null String — can never be null |
| `String?` | Nullable String — can be null |
| `x?.y` | Access y only if x is non-null |
| `x ?? y` | Return x if non-null, else y |
| `x ??= y` | Assign y to x only if x is null |
| `x!` | Assert x is non-null (throws if null) |
| `late T x` | Non-null, initialized before use |
| `if (x != null)` | Type promotion: x is T inside |
| `x?.y ?? default` | Safe access with fallback |
