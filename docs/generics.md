---
sidebar_position: 17
title: Generics
description: Type parameters, bounded generics, generic methods, and covariance in Dart.
---

---

## Why Generics?

```dart
// Without generics — lose type safety
List items = [1, 'hello', true]; // List<dynamic>
var first = items[0]; // dynamic — no type info

// With generics — type safe
List<int> numbers = [1, 2, 3];
var n = numbers[0]; // int — full type info and IDE support
// numbers.add('hello'); // ❌ compile error
```

---

## Generic Classes

```dart
class Box<T> {
  T value;
  Box(this.value);

  Box<R> map<R>(R Function(T) transform) => Box(transform(value));

  @override
  String toString() => 'Box<$T>($value)';
}

var intBox = Box(42);          // Box<int>
var strBox = Box('hello');     // Box<String>
var doubled = intBox.map((n) => n * 2);    // Box<int>
var asString = intBox.map((n) => '$n');    // Box<String>

print(intBox);    // Box<int>(42)
print(doubled);   // Box<int>(84)
print(asString);  // Box<String>(42)
```

---

## Generic Methods

```dart
// Generic function
T first<T>(List<T> list) => list.first;
T? firstOrNull<T>(List<T> list) => list.isEmpty ? null : list.first;

List<T> repeat<T>(T item, int times) =>
    List.generate(times, (_) => item);

// Multiple type parameters
Map<K, V> zip<K, V>(List<K> keys, List<V> values) =>
    Map.fromIterables(keys, values);

void swap<T>(List<T> list, int i, int j) {
  var temp = list[i];
  list[i] = list[j];
  list[j] = temp;
}
```

---

## Bounded Type Parameters

```dart
// T extends Comparable — T must implement Comparable
T max<T extends Comparable<T>>(T a, T b) => a.compareTo(b) >= 0 ? a : b;

print(max(3, 7));        // 7
print(max('apple', 'mango')); // mango

// T extends a class
class Repository<T extends Entity> {
  final List<T> _items = [];

  void add(T item) => _items.add(item);

  T? findById(int id) =>
      _items.where((item) => item.id == id).firstOrNull;
}

abstract class Entity {
  int get id;
}
```

---

## Generic Stack Example

```dart
class Stack<T> {
  final _items = <T>[];

  void push(T item) => _items.add(item);

  T pop() {
    if (isEmpty) throw StateError('Stack is empty');
    return _items.removeLast();
  }

  T peek() {
    if (isEmpty) throw StateError('Stack is empty');
    return _items.last;
  }

  bool get isEmpty => _items.isEmpty;
  int get size => _items.length;

  @override
  String toString() => 'Stack($_items)';
}

var stack = Stack<int>();
stack.push(1);
stack.push(2);
stack.push(3);
print(stack);     // Stack([1, 2, 3])
print(stack.pop()); // 3
print(stack);     // Stack([1, 2])
```

---

## Covariance & Contravariance

```dart
// Generics are invariant by default in Dart
List<Dog> dogs = [Dog(), Dog()];
// List<Animal> animals = dogs;  // ❌ not allowed!

// But you can use the supertype
List<Animal> animals = List<Animal>.from(dogs); // OK — creates new list

// Covariant keyword (use carefully)
class Kennel<covariant T extends Animal> {
  T animal;
  Kennel(this.animal);
}

Kennel<Dog> dogKennel = Kennel(Dog());
Kennel<Animal> animalKennel = dogKennel; // OK with covariant
```
