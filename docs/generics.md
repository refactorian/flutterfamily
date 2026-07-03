---
sidebar_position: 17
title: Generics
description: Type parameters, bounded generics, generic methods, and covariance in Dart.
---

Generics let you write code that works correctly across multiple types **without sacrificing type safety**. They are fundamental to Dart's collections, async APIs, and every well-designed library.

---

## Why Generics?

```dart
// Without generics — you lose all type information
List rawList = [1, 'hello', true];    // List<dynamic>
var first = rawList[0];               // dynamic — IDE can't help you
// first.toUpperCase();               // runtime crash — int has no toUpperCase

// With generics — type information is preserved end-to-end
List<int> numbers = [1, 2, 3];
var n = numbers[0];                   // int — full IDE support
// numbers.add('oops');              // ❌ compile error — caught immediately

List<String> names = ['Alice', 'Bob'];
var name = names[0];                  // String
print(name.toUpperCase());            // ✅ IDE knows .toUpperCase() is valid
```

---

## Generic Classes

```dart
// Single type parameter
class Box<T> {
  T value;
  Box(this.value);

  // Method using the type parameter
  Box<R> map<R>(R Function(T) transform) => Box(transform(value));

  bool contains(T other) => value == other;

  @override
  String toString() => 'Box<$T>($value)';
}

var intBox = Box(42);           // inferred: Box<int>
var strBox = Box('hello');      // inferred: Box<String>
var doubled = intBox.map((n) => n * 2);    // Box<int>
var asStr   = intBox.map((n) => '$n');     // Box<String>

print(intBox);   // Box<int>(42)
print(asStr);    // Box<String>(42)

// Multiple type parameters
class Pair<A, B> {
  final A first;
  final B second;
  const Pair(this.first, this.second);

  Pair<B, A> swap() => Pair(second, first);

  @override
  String toString() => '($first, $second)';
}

var p = Pair('Alice', 30);        // Pair<String, int>
print(p);                          // (Alice, 30)
print(p.swap());                   // (30, Alice)  → Pair<int, String>

// Three type parameters — used in things like trilateral maps
class Triple<A, B, C> {
  final A first; final B second; final C third;
  const Triple(this.first, this.second, this.third);
}
```

---

## Generic Methods

The type parameter lives on the function, not the class:

```dart
// Basic generic function
T identity<T>(T value) => value;
print(identity(42));       // 42  — inferred as identity<int>
print(identity('hello'));  // hello — inferred as identity<String>

// Useful generic utilities
T first<T>(List<T> list) => list.first;
T? firstOrNull<T>(List<T> list) => list.isEmpty ? null : list.first;
T? lastOrNull<T>(List<T> list) => list.isEmpty ? null : list.last;

List<T> repeat<T>(T item, int count) =>
    List.generate(count, (_) => item);

List<T> flatten<T>(List<List<T>> lists) =>
    lists.expand((l) => l).toList();

void swap<T>(List<T> list, int i, int j) {
  assert(i >= 0 && i < list.length);
  assert(j >= 0 && j < list.length);
  final tmp = list[i];
  list[i] = list[j];
  list[j] = tmp;
}

// Multiple type params on method
Map<K, V> zip<K, V>(List<K> keys, List<V> values) {
  assert(keys.length == values.length);
  return Map.fromIterables(keys, values);
}

Map<V, K> invert<K, V>(Map<K, V> map) =>
    Map.fromEntries(map.entries.map((e) => MapEntry(e.value, e.key)));

// Usage
var z = zip(['a', 'b', 'c'], [1, 2, 3]);
print(z);              // {a: 1, b: 2, c: 3}
print(invert(z));      // {1: a, 2: b, 3: c}
```

---

## Bounded Type Parameters

Constrain the type parameter to a specific type or interface:

```dart
// T must implement Comparable<T>
T max<T extends Comparable<T>>(T a, T b) =>
    a.compareTo(b) >= 0 ? a : b;

T min<T extends Comparable<T>>(T a, T b) =>
    a.compareTo(b) <= 0 ? a : b;

T clamp<T extends Comparable<T>>(T value, T lo, T hi) =>
    max(lo, min(hi, value));

print(max(3, 7));               // 7
print(max('apple', 'mango'));   // mango
print(clamp(15, 0, 10));        // 10

// Multiple constraints via abstract class
abstract class Entity {
  int get id;
  String get name;
}

class Repository<T extends Entity> {
  final _store = <int, T>{};

  void save(T entity) => _store[entity.id] = entity;
  T? findById(int id) => _store[id];
  List<T> findAll() => _store.values.toList();
  void delete(int id) => _store.remove(id);

  List<T> where(bool Function(T) predicate) =>
      _store.values.where(predicate).toList();
}

class User implements Entity {
  @override final int id;
  @override final String name;
  final String email;
  const User(this.id, this.name, this.email);
}

// Fully typed
var users = Repository<User>();
users.save(User(1, 'Alice', 'alice@example.com'));
users.save(User(2, 'Bob', 'bob@example.com'));
print(users.findById(1)?.name); // Alice

// Numeric constraint
num sumList<T extends num>(List<T> list) =>
    list.fold(0 as T, (a, b) => (a + b) as T);

print(sumList([1, 2, 3]));        // 6    (int)
print(sumList([1.5, 2.5, 3.0])); // 7.0  (double)
```

---

## Generic Data Structures

### Typed Stack

```dart
class Stack<T> {
  final _items = <T>[];

  void push(T item) => _items.add(item);

  T pop() {
    if (_items.isEmpty) throw StateError('Stack is empty');
    return _items.removeLast();
  }

  T peek() {
    if (_items.isEmpty) throw StateError('Stack is empty');
    return _items.last;
  }

  T? tryPop() => _items.isEmpty ? null : _items.removeLast();

  bool get isEmpty => _items.isEmpty;
  bool get isNotEmpty => _items.isNotEmpty;
  int get size => _items.length;

  void clear() => _items.clear();

  @override
  String toString() => 'Stack<$T>($_items)';
}

var history = Stack<String>();
history.push('/home');
history.push('/profile');
history.push('/settings');
print(history.pop());   // /settings
print(history.peek());  // /profile
print(history);         // Stack<String>([/home, /profile])
```

### Optional / Maybe type

```dart
// A typed nullable wrapper (useful when null has a different meaning)
class Optional<T extends Object> {
  final T? _value;

  const Optional.of(T value) : _value = value;
  const Optional.empty() : _value = null;

  bool get isPresent => _value != null;
  bool get isEmpty   => _value == null;

  T get value {
    if (_value == null) throw StateError('Optional is empty');
    return _value!;
  }

  T orElse(T defaultValue) => _value ?? defaultValue;
  T orElseGet(T Function() supplier) => _value ?? supplier();
  void orElseThrow(Exception e) { if (_value == null) throw e; }

  Optional<R> map<R extends Object>(R Function(T) transform) =>
      _value == null ? Optional.empty() : Optional.of(transform(_value!));

  Optional<T> filter(bool Function(T) predicate) =>
      _value != null && predicate(_value!) ? this : Optional.empty();

  @override
  String toString() => _value == null ? 'Optional.empty()' : 'Optional($_value)';
}

var maybeUser = Optional.of(User(1, 'Alice', 'alice@example.com'));
var name = maybeUser.map((u) => u.name).orElse('Unknown');
print(name); // Alice

var nobody = Optional<User>.empty();
nobody.map((u) => u.name).orElse('Unknown'); // Unknown
```

---

## Variance in Dart

Understanding how generic types relate to each other:

```dart
// Dart generics are INVARIANT by default
// List<Dog> is NOT a List<Animal>, even though Dog extends Animal
class Animal {}
class Dog extends Animal {}

List<Dog>    dogs    = [Dog(), Dog()];
List<Animal> animals = dogs;  // ❌ compile error — invariant!

// Why? Because this would be unsafe:
// animals.add(Cat());  // would corrupt the List<Dog>

// The safe way: create a new list
List<Animal> safe = List<Animal>.from(dogs); // ✅ new list

// The covariant keyword — opt-in to covariance (use with care)
class Cage<covariant T extends Animal> {
  T resident;
  Cage(this.resident);
}

Cage<Dog>    dogCage    = Cage(Dog());
Cage<Animal> animalCage = dogCage;   // ✅ — covariant allows this

// covariant on method parameters
class AnimalShelter {
  void accept(covariant Dog animal) { }  // only accepts Dog or subclass
}

// Function types are covariant in return type, contravariant in params:
// A function that returns Dog can be used where Animal return is expected
Animal Function() makeDog = () => Dog(); // ✅ Dog is an Animal
```

---

## Generic Constraints in Practice

```dart
// Constraint: must be JSON-serializable
abstract class JsonSerializable {
  Map<String, dynamic> toJson();
}

class JsonCache<T extends JsonSerializable> {
  final _cache = <String, T>{};

  void put(String key, T value) {
    _cache[key] = value;
    _persist(key, value.toJson()); // can call toJson() because of constraint
  }

  T? get(String key) => _cache[key];
}

// Constraint: must be Comparable AND have a name
abstract class NamedComparable<T> implements Comparable<T> {
  String get name;
}

List<T> sortByName<T extends NamedComparable<T>>(List<T> items) {
  return [...items]..sort((a, b) => a.name.compareTo(b.name));
}
```

---

## Type Inference with Generics

Dart is smart about inferring type parameters:

```dart
// Inferred from argument
var list = <int>[];             // explicit
var list = [1, 2, 3];          // inferred: List<int>

Box(42)                         // inferred: Box<int>
Box('hello')                    // inferred: Box<String>

// Inferred from context
List<String> names = [];        // empty but typed
final items = <Widget>[];       // explicit — needed when starting empty

// Bidirectional inference
var result = first([1, 2, 3]);  // inferred: first<int>([1,2,3]) → int

// When inference fails — provide explicitly
var empty = <Map<String, List<int>>>[];  // Dart needs help here
```

---

## Generic typedefs

```dart
// Type alias for complex generic types
typedef JsonMap = Map<String, dynamic>;
typedef Predicate<T> = bool Function(T value);
typedef Transformer<T, R> = R Function(T input);
typedef AsyncTransformer<T, R> = Future<R> Function(T input);
typedef Reducer<T> = T Function(T accumulator, T current);

// Usage
Predicate<int>    isPositive = (n) => n > 0;
Transformer<String, int> toInt = int.parse;
AsyncTransformer<String, User> parseUser =
    (json) async => User.fromJson(jsonDecode(json));
Reducer<int> sum = (a, b) => a + b;

// Generic typedef
typedef Either<L, R> = ({L? left, R? right});
// Note: for serious use, make it a sealed class instead
```

---

## Summary

| Concept | Syntax | Purpose |
|---------|--------|---------|
| Generic class | `class Box<T>` | Type-safe reusable class |
| Generic method | `T fn<T>(T value)` | Type-safe reusable function |
| Bounded | `<T extends Comparable<T>>` | Constrain what T can be |
| Multiple params | `class Pair<A, B>` | Multiple independent types |
| Covariant | `covariant T` | Opt-in to subtype flexibility |
| Inference | `Box(42)` = `Box<int>` | Compiler deduces the type |
| typedef | `typedef Fn<T> = T Function(T)` | Name a complex type |
