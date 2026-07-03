---
sidebar_position: 8
title: Constructors
description: Default, named, factory, redirecting, initializer list, and const constructors in Dart.
---

---

## Default Constructor

```dart
class Point {
  int x;
  int y;

  // Default constructor — same name as class
  Point(int x, int y) {
    this.x = x;
    this.y = y;
  }
}

// Shorthand: initializing formals (this.x syntax)
class Point {
  int x;
  int y;
  Point(this.x, this.y); // ← cleaner! assigns directly
}

var p = Point(3, 4);
print('${p.x}, ${p.y}'); // 3, 4
```

---

## Named Constructors

Classes can have multiple constructors with different names:

```dart
class Color {
  final int r, g, b;

  // Default
  Color(this.r, this.g, this.b);

  // Named constructors
  Color.red()   : r = 255, g = 0, b = 0;
  Color.green() : r = 0, g = 255, b = 0;
  Color.blue()  : r = 0, g = 0, b = 255;
  Color.black() : r = 0, g = 0, b = 0;
  Color.white() : r = 255, g = 255, b = 255;

  Color.fromHex(String hex)
      : r = int.parse(hex.substring(1, 3), radix: 16),
        g = int.parse(hex.substring(3, 5), radix: 16),
        b = int.parse(hex.substring(5, 7), radix: 16);

  Color.fromJson(Map<String, int> json)
      : r = json['r']!,
        g = json['g']!,
        b = json['b']!;

  @override
  String toString() => 'Color($r, $g, $b)';
}

var red = Color.red();
var cyan = Color(0, 255, 255);
var purple = Color.fromHex('#800080');
```

---

## Initializer Lists

Run before the constructor body. Used to set `final` fields:

```dart
class ImmutablePoint {
  final int x;
  final int y;
  final double distance;

  ImmutablePoint(int x, int y)
      : x = x,
        y = y,
        distance = sqrt(x * x + y * y);  // computed in initializer
}

// With assertions in initializer
class PositiveNumber {
  final int value;

  PositiveNumber(this.value) : assert(value > 0, 'Value must be positive');
}

// Calling another constructor
class Employee {
  final String name;
  final String department;
  final double salary;

  Employee(this.name, this.department, this.salary);

  Employee.intern(String name) : this(name, 'Internship', 0);
  Employee.ceo(String name) : this(name, 'Executive', 500000);
}
```

---

## Factory Constructors

A factory constructor doesn't always create a new instance — it can return an existing one:

```dart
// Singleton pattern
class AppConfig {
  static final AppConfig _instance = AppConfig._internal();

  factory AppConfig() => _instance;  // always returns the same instance

  AppConfig._internal();  // private named constructor

  String theme = 'light';
  bool darkMode = false;
}

var config1 = AppConfig();
var config2 = AppConfig();
print(identical(config1, config2)); // true — same instance!

// Factory for parsing / conditional creation
abstract class Animal {
  String get sound;

  factory Animal(String type) {
    switch (type) {
      case 'dog': return Dog();
      case 'cat': return Cat();
      default: throw ArgumentError('Unknown animal: $type');
    }
  }
}

class Dog implements Animal { @override String get sound => 'Woof'; }
class Cat implements Animal { @override String get sound => 'Meow'; }

var a = Animal('dog');
print(a.sound); // Woof

// Factory from JSON (very common pattern!)
class User {
  final String name;
  final int age;

  User(this.name, this.age);

  factory User.fromJson(Map<String, dynamic> json) {
    return User(
      json['name'] as String,
      json['age'] as int,
    );
  }

  Map<String, dynamic> toJson() => {'name': name, 'age': age};
}

var user = User.fromJson({'name': 'Alice', 'age': 30});
```

---

## Redirecting Constructors

```dart
class Point {
  final double x, y;

  Point(this.x, this.y);

  // Redirect to default constructor
  Point.origin() : this(0, 0);
  Point.onX(double x) : this(x, 0);
  Point.onY(double y) : this(0, y);
}

var origin = Point.origin();
print('${origin.x}, ${origin.y}'); // 0.0, 0.0
```

---

## Const Constructors

Creates compile-time constant objects — objects that can be used in `const` expressions:

```dart
class ImmutablePoint {
  final int x, y;

  // const constructor — all fields must be final
  const ImmutablePoint(this.x, this.y);
}

// Compile-time constants
const origin = ImmutablePoint(0, 0);
const unit = ImmutablePoint(1, 0);

// Canonicalized — const objects with same args are identical
print(identical(const ImmutablePoint(1, 2), const ImmutablePoint(1, 2))); // true

// Very common in Flutter
const Text('Hello')
const EdgeInsets.all(16)
const Color(0xFF2196F3)
```

---

## Constructor Summary

| Type | Syntax | Use Case |
|------|--------|----------|
| Default | `ClassName(params)` | Standard creation |
| Named | `ClassName.name(params)` | Alternative creation paths |
| Initializer list | `ClassName(p) : field = expr` | Computed/final fields |
| Redirecting | `ClassName.x() : this(...)` | Delegate to another constructor |
| Factory | `factory ClassName(...)` | Control what's returned |
| Const | `const ClassName(params)` | Compile-time constants |
