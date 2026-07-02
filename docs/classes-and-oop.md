---
sidebar_position: 7
title: Classes & OOP
description: Classes, objects, inheritance, interfaces, abstract classes, sealed classes, and object equality in Dart.
---

---

## Defining a Class

```dart
class Dog {
  // Instance variables (fields)
  String name;
  String breed;
  int age;

  // Constructor
  Dog(this.name, this.breed, this.age);

  // Instance methods
  void bark() => print('$name says: Woof!');

  String describe() => '$name is a $age-year-old $breed.';

  // Override toString (from Object)
  @override
  String toString() => 'Dog($name, $breed, $age)';
}

// Usage
var rex = Dog('Rex', 'Labrador', 3);
rex.bark();            // Rex says: Woof!
print(rex.describe()); // Rex is a 3-year-old Labrador.
print(rex);            // Dog(Rex, Labrador, 3)
```

---

## Instance Variables

```dart
class Person {
  // Public (default in Dart — no public keyword)
  String name;

  // Private to the library (prefix with _)
  int _age;  // accessible within the same file/library

  // Final — set once in constructor
  final String id;

  // Late — initialized later (must be set before use)
  late String email;

  Person(this.name, this._age, this.id);

  int get age => _age;  // expose privately stored value
}

var p = Person('Alice', 30, 'user_1');
print(p.name);   // Alice
```

> In Dart, `_` makes something private to the **library** (file), not the class.

---

## Inheritance

```dart
class Animal {
  String name;
  Animal(this.name);

  void breathe() => print('$name breathes');
  void speak() => print('...');

  @override
  String toString() => 'Animal($name)';
}

class Dog extends Animal {
  String breed;

  // Call super constructor
  Dog(String name, this.breed) : super(name);

  @override
  void speak() => print('$name says: Woof!');

  // New method
  void fetch() => print('$name fetches the ball!');
}

class Cat extends Animal {
  Cat(String name) : super(name);

  @override
  void speak() => print('$name says: Meow!');
}

void main() {
  var dog = Dog('Rex', 'Labrador');
  dog.breathe();  // Rex breathes (inherited)
  dog.speak();    // Rex says: Woof! (overridden)
  dog.fetch();    // Rex fetches the ball!

  // Polymorphism
  List<Animal> animals = [Dog('Rex', 'Lab'), Cat('Whiskers')];
  for (var a in animals) {
    a.speak();  // dynamic dispatch
  }
}
```

### The `super` Keyword

```dart
class Vehicle {
  String brand;
  int speed;

  Vehicle(this.brand, this.speed);

  void describe() => print('$brand at $speed km/h');
}

class ElectricCar extends Vehicle {
  int batteryLevel;

  ElectricCar(String brand, int speed, this.batteryLevel)
      : super(brand, speed);  // call super constructor

  @override
  void describe() {
    super.describe();  // call super method
    print('Battery: $batteryLevel%');
  }
}
```

---

## Abstract Classes

Abstract classes cannot be instantiated — they define a contract.

```dart
abstract class Shape {
  // Abstract method — subclasses MUST implement
  double get area;
  double get perimeter;

  // Concrete method — subclasses inherit
  void printInfo() {
    print('Area: ${area.toStringAsFixed(2)}, Perimeter: ${perimeter.toStringAsFixed(2)}');
  }
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);

  @override
  double get area => 3.14159 * radius * radius;

  @override
  double get perimeter => 2 * 3.14159 * radius;
}

class Rectangle extends Shape {
  final double width, height;
  Rectangle(this.width, this.height);

  @override
  double get area => width * height;

  @override
  double get perimeter => 2 * (width + height);
}

// var s = Shape(); // ❌ cannot instantiate abstract class
var c = Circle(5);
c.printInfo(); // Area: 78.54, Perimeter: 31.42
```

---

## Interfaces (implements)

Dart has no `interface` keyword. **Every class implicitly defines an interface.**

```dart
// "Interface" via abstract class
abstract class Flyable {
  void fly();
  int get altitude;
}

abstract class Swimmable {
  void swim();
  int get depth;
}

// A class can implement multiple interfaces
class Duck extends Animal implements Flyable, Swimmable {
  Duck(String name) : super(name);

  @override
  void fly() => print('$name flaps wings!');

  @override
  int get altitude => 10;

  @override
  void swim() => print('$name paddles!');

  @override
  int get depth => 1;
}

// Using interface type
Flyable flyer = Duck('Donald');
flyer.fly();
```

---

## Sealed Classes (Dart 3)

Sealed classes can only be extended/implemented in the **same library**. Perfect for exhaustive pattern matching.

```dart
sealed class Result<T> {}

class Success<T> extends Result<T> {
  final T value;
  Success(this.value);
}

class Failure<T> extends Result<T> {
  final String error;
  Failure(this.error);
}

// Exhaustive switch — no default needed!
String describe<T>(Result<T> result) => switch (result) {
  Success(value: var v) => 'Success: $v',
  Failure(error: var e) => 'Error: $e',
};

// Add a new subclass → compiler error at switch site → can't miss it!
```

---

## Object Equality

```dart
class Point {
  final int x, y;
  const Point(this.x, this.y);

  // Override == operator
  @override
  bool operator ==(Object other) =>
      other is Point && x == other.x && y == other.y;

  // Must override hashCode if overriding ==
  @override
  int get hashCode => Object.hash(x, y);

  @override
  String toString() => 'Point($x, $y)';
}

var p1 = Point(1, 2);
var p2 = Point(1, 2);
var p3 = Point(3, 4);

print(p1 == p2);           // true  (same values)
print(p1 == p3);           // false
print(identical(p1, p2));  // false (different objects)

// Can be used as Map keys or Set members since hashCode is consistent
var set = {p1, p2, p3};
print(set.length); // 2  (p1 and p2 are considered equal)
```

---

## Class Modifiers (Dart 3)

```dart
// abstract — can't be instantiated
abstract class A {}

// final — can't be extended or implemented outside library
final class B {}

// sealed — can only be subclassed in same library
sealed class C {}

// base — can be extended but not implemented
base class D {}

// interface — can be implemented but not extended
interface class E {}

// mixin class — can be used as mixin or class
mixin class F {}
```

---

## Summary

| Concept | Syntax |
|---------|--------|
| Define class | `class Name { ... }` |
| Extend class | `class Child extends Parent` |
| Implement interface | `class Impl implements Interface` |
| Abstract class | `abstract class Name` |
| Sealed class (Dart 3) | `sealed class Name` |
| Override method | `@override void method()` |
| Call super | `super.method()` |
| Private member | `_memberName` |
| Override equality | `operator ==` + `hashCode` |
