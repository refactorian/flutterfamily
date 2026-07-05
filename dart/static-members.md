---
sidebar_position: 10
title: Static Members
description: Static fields, methods, constants, singletons, and static vs instance members in Dart.
---

Static members belong to the **class itself**, not to any particular instance. They're shared across all instances and accessible without creating an object. Used well, they are a powerful tool for constants, utilities, factories, and controlled shared state.

---

## Static Fields

```dart
class Counter {
  // Static field — ONE copy shared by ALL instances
  static int _total = 0;
  static const int maxCount = 1000;   // static constant

  final int id;  // instance field — EACH object has its own

  Counter() : id = ++_total {
    if (_total > maxCount) {
      throw StateError('Cannot create more than $maxCount counters');
    }
  }

  static int get total => _total;
  static void resetAll() => _total = 0;

  @override
  String toString() => 'Counter#$id (total: $_total)';
}

var a = Counter();
var b = Counter();
var c = Counter();

print(Counter.total);   // 3  — accessed on the class, not an instance
print(a.id);            // 1
print(b.id);            // 2
Counter.resetAll();
print(Counter.total);   // 0
```

---

## Static Constants

Static constants are the right place for **class-scoped magic values**:

```dart
class HttpStatus {
  // Prevent instantiation — this class is a namespace for constants
  HttpStatus._();

  static const int ok                  = 200;
  static const int created             = 201;
  static const int noContent           = 204;
  static const int badRequest          = 400;
  static const int unauthorized        = 401;
  static const int forbidden           = 403;
  static const int notFound            = 404;
  static const int unprocessableEntity = 422;
  static const int tooManyRequests     = 429;
  static const int internalServerError = 500;
  static const int serviceUnavailable  = 503;

  static const Set<int> successCodes = {200, 201, 202, 204};
  static const Set<int> clientErrors = {400, 401, 403, 404, 422, 429};
  static const Set<int> serverErrors = {500, 502, 503, 504};

  static bool isSuccess(int code) => successCodes.contains(code);
  static bool isClientError(int code) => code >= 400 && code < 500;
  static bool isServerError(int code) => code >= 500;

  static String message(int code) => switch (code) {
    200 => 'OK',
    201 => 'Created',
    204 => 'No Content',
    400 => 'Bad Request',
    401 => 'Unauthorized',
    403 => 'Forbidden',
    404 => 'Not Found',
    422 => 'Unprocessable Entity',
    429 => 'Too Many Requests',
    500 => 'Internal Server Error',
    503 => 'Service Unavailable',
    int c when c >= 200 && c < 300 => '2xx Success',
    int c when c >= 400 && c < 500 => '4xx Client Error',
    int c when c >= 500 => '5xx Server Error',
    _   => 'Unknown',
  };
}

print(HttpStatus.message(404));         // Not Found
print(HttpStatus.isSuccess(201));       // true
print(HttpStatus.isServerError(503));   // true
```

---

## Static Methods — Utility Classes

```dart
import 'dart:math' as math;

class MathUtils {
  MathUtils._(); // prevent instantiation

  static const double pi  = 3.14159265358979;
  static const double e   = 2.71828182845905;
  static const double phi = 1.61803398874989; // golden ratio

  // Numeric utilities
  static double circleArea(double r)    => pi * r * r;
  static double sphereVolume(double r)  => (4 / 3) * pi * r * r * r;
  static double hypotenuse(double a, double b) =>
      math.sqrt(a * a + b * b);

  static int gcd(int a, int b) => b == 0 ? a : gcd(b, a % b);
  static int lcm(int a, int b) => (a * b).abs() ~/ gcd(a, b);

  static bool isPrime(int n) {
    if (n < 2) return false;
    if (n == 2) return true;
    if (n.isEven) return false;
    for (var i = 3; i * i <= n; i += 2) {
      if (n % i == 0) return false;
    }
    return true;
  }

  static List<int> primeFactors(int n) {
    final factors = <int>[];
    for (var i = 2; i * i <= n; i++) {
      while (n % i == 0) { factors.add(i); n ~/= i; }
    }
    if (n > 1) factors.add(n);
    return factors;
  }

  static T clamp<T extends Comparable<T>>(T value, T min, T max) =>
      value.compareTo(min) < 0 ? min
      : value.compareTo(max) > 0 ? max
      : value;
}

print(MathUtils.isPrime(97));           // true
print(MathUtils.primeFactors(360));     // [2, 2, 2, 3, 3, 5]
print(MathUtils.lcm(12, 18));          // 36
print(MathUtils.clamp(15, 0, 10));     // 10
print(MathUtils.hypotenuse(3, 4));     // 5.0
```

---

## Static Factory Methods

The **factory constructor** is the standard Dart pattern, but static factory *methods* offer more flexibility — they can have any name, return nullable, and be overridden in subclasses:

```dart
class Temperature {
  final double _celsius;
  const Temperature._(this._celsius);

  // Static factory methods — named, clear, flexible
  static Temperature celsius(double c)    => Temperature._(c);
  static Temperature fahrenheit(double f) => Temperature._((f - 32) * 5 / 9);
  static Temperature kelvin(double k)     => Temperature._(k - 273.15);

  // Safe parse — returns null instead of throwing
  static Temperature? tryParse(String s) {
    final n = double.tryParse(s);
    return n == null ? null : Temperature._(n);
  }

  double get celsius    => _celsius;
  double get fahrenheit => _celsius * 9 / 5 + 32;
  double get kelvin     => _celsius + 273.15;

  @override
  String toString() => '${_celsius.toStringAsFixed(1)}°C';
}

var boiling  = Temperature.celsius(100);
var bodyTemp = Temperature.fahrenheit(98.6);
var absolute = Temperature.kelvin(0);

print(boiling);                           // 100.0°C
print(bodyTemp.celsius.toStringAsFixed(1)); // 37.0
print(absolute.celsius.toStringAsFixed(2)); // -273.15
```

---

## Singleton Pattern

```dart
// Classic Dart singleton using static + private constructor
class AppConfig {
  static final AppConfig _instance = AppConfig._internal();

  factory AppConfig() => _instance;   // redirects to cached instance
  AppConfig._internal() {
    // Initialization logic runs exactly once
    _loadDefaults();
  }

  // Configuration state
  String apiBase    = 'https://api.example.com';
  String apiVersion = 'v2';
  bool   debugMode  = false;
  Duration timeout  = const Duration(seconds: 30);

  void _loadDefaults() { /* read from environment */ }

  Uri endpoint(String path) =>
      Uri.parse('$apiBase/$apiVersion$path');
}

// Always the same instance
var config1 = AppConfig();
var config2 = AppConfig();
print(identical(config1, config2)); // true

config1.debugMode = true;
print(config2.debugMode);           // true — same object!
```

---

## Static State: Pitfalls & Best Practices

```dart
// ⚠️ Pitfall 1: Static state persists across tests
class UserSession {
  static User? _current;
  static User? get current => _current;
  static void login(User u)  => _current = u;
  static void logout()       => _current = null;
}

// In tests — previous test's login leaks into next test!
// Fix: call UserSession.logout() in tearDown()

// ⚠️ Pitfall 2: Static mutable state is global state
// Treat it like a global variable — use sparingly

// ✅ Better: inject dependencies instead of using static access
class ApiClient {
  final String baseUrl;      // instance field — injectable, testable
  ApiClient(this.baseUrl);
}

// ✅ Static constants are safe — they can't be mutated
class Durations {
  Durations._();
  static const Duration short   = Duration(milliseconds: 200);
  static const Duration medium  = Duration(milliseconds: 500);
  static const Duration long    = Duration(seconds: 2);
  static const Duration network = Duration(seconds: 30);
}

// ✅ Static methods with no side effects are safe
class StringUtils {
  StringUtils._();
  static String capitalize(String s) =>
      s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
  static bool isEmail(String s)  => s.contains('@') && s.contains('.');
  static String slugify(String s) =>
      s.toLowerCase().replaceAll(RegExp(r'\s+'), '-')
                     .replaceAll(RegExp(r'[^a-z0-9-]'), '');
}
```

---

## Static Members in Inheritance

```dart
// Static members are NOT inherited polymorphically
class Animal {
  static String type = 'animal';
  static Animal create() => Animal();

  void describe() => print('I am a ${Animal.type}');
}

class Dog extends Animal {
  static String type = 'dog';          // shadows, not overrides
  static Dog create() => Dog();        // shadows Animal.create()

  @override
  void describe() => print('I am a ${Dog.type}'); // uses own static
}

Animal a = Dog();
print(Animal.type);     // animal — static dispatch, not dynamic
print(Dog.type);        // dog
// a.type              // ❌ compile error — can't call static on instance
```

---

## Static Initializers

Static fields can be initialized with expressions — they run **lazily**, the first time the field is accessed:

```dart
class RegExPatterns {
  RegExPatterns._();

  // These are computed once on first access
  static final RegExp email   = RegExp(r'^[\w.-]+@[\w.-]+\.\w{2,}$');
  static final RegExp phone   = RegExp(r'^\+?[\d\s\-()]{7,15}$');
  static final RegExp url     = RegExp(r'https?://\S+');
  static final RegExp integer = RegExp(r'^-?\d+$');
  static final RegExp decimal = RegExp(r'^-?\d+(\.\d+)?$');

  static bool isEmail(String s)   => email.hasMatch(s.trim());
  static bool isPhone(String s)   => phone.hasMatch(s.trim());
  static bool isInteger(String s) => integer.hasMatch(s.trim());
}

// RegExp objects are compiled on first call to isEmail() etc., then cached
print(RegExPatterns.isEmail('alice@example.com')); // true
print(RegExPatterns.isPhone('+1 555 0100'));        // true
```

---

## Summary

| Member | Syntax | Shared? | Access |
|--------|--------|---------|--------|
| Static field | `static T name = value;` | ✅ All instances | `Class.name` |
| Static constant | `static const T name = value;` | ✅ Compile-time | `Class.name` |
| Static method | `static R method(params) {}` | ✅ No `this` | `Class.method()` |
| Static getter | `static T get name => ...;` | ✅ | `Class.name` |
| Static factory | `static T create() => T();` | ✅ | `Class.create()` |
| Instance field | `T name;` | ❌ Per object | `obj.name` |
| Instance method | `R method() {}` | ❌ Has `this` | `obj.method()` |

**Best practices:**
- Static **constants** — always fine, use freely
- Static **utility methods** (no side effects) — fine
- Static **mutable state** — treat like global variables, use sparingly
- Prefer **dependency injection** over static access for testability
