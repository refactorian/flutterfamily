---
sidebar_position: 9
title: Getters & Setters
description: Computed properties, validated setters, and read/write access patterns in Dart.
---

Getters and setters are special methods that provide **read and write access** to an object's properties. They let you expose computed values and add validation to assignments — all while looking like plain field access to the caller.

---

## Basic Getters

```dart
class Circle {
  double radius;

  Circle(this.radius);

  // Computed getter — calculated on access
  double get area => 3.14159 * radius * radius;
  double get diameter => radius * 2;
  double get circumference => 2 * 3.14159 * radius;

  // They look like fields to the caller
}

var c = Circle(5.0);
print(c.area);          // 78.53975
print(c.diameter);      // 10.0
print(c.circumference); // 31.4159
// c.area = 10;         // ❌ no setter defined
```

---

## Getters & Setters with Validation

```dart
class Temperature {
  double _celsius;

  Temperature(this._celsius);

  // Getter
  double get celsius => _celsius;
  double get fahrenheit => _celsius * 9 / 5 + 32;
  double get kelvin => _celsius + 273.15;

  // Setter with validation
  set celsius(double value) {
    if (value < -273.15) throw ArgumentError('Below absolute zero!');
    _celsius = value;
  }

  set fahrenheit(double value) => celsius = (value - 32) * 5 / 9;
}

var temp = Temperature(100.0);
print(temp.fahrenheit); // 212.0
temp.celsius = -300;    // ❌ throws ArgumentError
```

---

## Properties in Practice

```dart
class Rectangle {
  double width;
  double height;

  Rectangle(this.width, this.height);

  double get area => width * height;
  double get perimeter => 2 * (width + height);
  bool get isSquare => width == height;

  // Setter that changes multiple fields
  set size(double value) {
    width = value;
    height = value;
  }
}

var r = Rectangle(4, 6);
print(r.area);       // 24.0
print(r.isSquare);   // false
r.size = 5;          // sets both width and height
print(r.isSquare);   // true
```

---

## Summary

| Syntax | Purpose |
|--------|---------|
| `T get name => expr;` | Computed read-only property |
| `set name(T v) { ... }` | Write property with logic |
| `T get name { ... }` | Multi-line getter |
| Private `_field` + getter | Controlled exposure of internal state |
| Getter + setter pair | Full validated property |

> **Rule of thumb:** If reading a property is expensive, document that clearly. Callers expect getters to be cheap (like field access).
