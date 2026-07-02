---
sidebar_position: 10
title: Static Members
description: Static fields, methods, constants, singletons, and static vs instance members in Dart.
---

---

## Static Fields

```dart
class Counter {
  static int _count = 0;  // shared across all instances

  Counter() {
    _count++;
  }

  static int get count => _count;
  static void reset() => _count = 0;

  // Instance method can access static members
  void printCount() => print('Count: $_count');
}

var c1 = Counter();
var c2 = Counter();
var c3 = Counter();
print(Counter.count); // 3
Counter.reset();
print(Counter.count); // 0
```

---

## Static Methods & Constants

```dart
class MathUtils {
  // Can't instantiate this class — no instance needed
  MathUtils._();  // private constructor to prevent instantiation

  static const double pi = 3.14159265358979;
  static const double e = 2.71828182845905;

  static double circleArea(double r) => pi * r * r;
  static double power(double base, double exp) => pow(base, exp).toDouble();
  static int clamp(int value, int min, int max) => value.clamp(min, max);
  static bool isPrime(int n) {
    if (n < 2) return false;
    for (var i = 2; i <= sqrt(n); i++) {
      if (n % i == 0) return false;
    }
    return true;
  }
}

// Access without creating an instance
print(MathUtils.pi);             // 3.14159265358979
print(MathUtils.circleArea(5));  // 78.539...
print(MathUtils.isPrime(17));    // true
```

---

## Static vs Instance

```dart
class User {
  // Instance — belongs to each object
  final String name;
  final String email;

  // Static — belongs to the class
  static int userCount = 0;
  static const int maxUsers = 1000;

  User(this.name, this.email) {
    userCount++; // static accessed without instance
  }

  // Instance method — can use 'this'
  String describe() => '$name <$email>';

  // Static method — no 'this', no instance fields
  static bool isValidEmail(String email) => email.contains('@');
}

print(User.maxUsers);                  // 1000  (class-level)
print(User.isValidEmail('a@b.com'));   // true
var u = User('Alice', 'alice@example.com');
print(u.describe());                   // Alice <alice@example.com>
print(User.userCount);                 // 1
```

---

## Summary

| Concept | Syntax | Access Via |
|---------|--------|------------|
| Static field | `static int count = 0;` | `ClassName.count` |
| Static constant | `static const maxAge = 150;` | `ClassName.maxAge` |
| Static method | `static void reset() {}` | `ClassName.reset()` |
| Static getter | `static int get total => _t;` | `ClassName.total` |
| Prevent instantiation | `ClassName._();` (private ctor) | — |

> Static members belong to the **class**, not any particular object. Use them for shared state, utility functions, and constants.
