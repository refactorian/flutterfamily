---
sidebar_position: 8
title: Constructors
description: Default, named, factory, redirecting, initializer list, and const constructors in Dart.
---

Constructors are the entry points for creating objects. Dart gives you a rich set of constructor forms — each solving a specific problem. Understanding all of them is essential for writing idiomatic Dart.

---

## Default Constructor

```dart
class Point {
  int x;
  int y;

  // Verbose form
  Point(int x, int y) {
    this.x = x;
    this.y = y;
  }
}

// ✅ Idiomatic — initializing formals (this.param)
class Point {
  int x;
  int y;
  Point(this.x, this.y);   // assigns directly, no body needed
}

// Works with any combination of modifiers
class Config {
  final String host;        // final — set via constructor only
  final int port;
  bool secure;

  Config(this.host, this.port, {this.secure = false});
}

var p = Point(3, 4);
var cfg = Config('localhost', 8080, secure: true);
```

---

## Super Parameters (Dart 2.17+)

Forward parameters to the parent constructor without repeating names:

```dart
class Animal {
  final String name;
  final int age;
  Animal(this.name, this.age);
}

// ❌ Old style — redundant repetition
class Dog extends Animal {
  final String breed;
  Dog(String name, int age, this.breed) : super(name, age);
}

// ✅ Super parameters — DRY
class Dog extends Animal {
  final String breed;
  Dog(super.name, super.age, this.breed);   // super.name forwards to Animal(name, ...)
}

// Also works with named super params
class Widget {
  final Key? key;
  const Widget({this.key});
}

class Text extends Widget {
  final String data;
  // ✅ Dart 3 style — used in every Flutter widget
  const Text(this.data, {super.key});
}
```

---

## Named Constructors

Classes can have any number of named constructors. Name them after their purpose:

```dart
class Color {
  final int r, g, b, a;

  // Primary constructor
  const Color(this.r, this.g, this.b, [this.a = 255]);

  // Semantic named constructors
  const Color.red()   : r = 255, g = 0,   b = 0,   a = 255;
  const Color.green() : r = 0,   g = 255, b = 0,   a = 255;
  const Color.blue()  : r = 0,   g = 0,   b = 255, a = 255;
  const Color.white() : r = 255, g = 255, b = 255, a = 255;
  const Color.black() : r = 0,   g = 0,   b = 0,   a = 255;
  const Color.transparent() : r = 0, g = 0, b = 0, a = 0;

  // Parsing constructors
  factory Color.fromHex(String hex) {
    final s = hex.startsWith('#') ? hex.substring(1) : hex;
    return Color(
      int.parse(s.substring(0, 2), radix: 16),
      int.parse(s.substring(2, 4), radix: 16),
      int.parse(s.substring(4, 6), radix: 16),
      s.length == 8 ? int.parse(s.substring(6, 8), radix: 16) : 255,
    );
  }

  factory Color.fromJson(Map<String, dynamic> json) => Color(
    json['r'] as int,
    json['g'] as int,
    json['b'] as int,
    json['a'] as int? ?? 255,
  );

  // Conversion
  Map<String, int> toJson() => {'r': r, 'g': g, 'b': b, 'a': a};

  String toHex() =>
      '#${r.toRadixString(16).padLeft(2, '0')}'
      '${g.toRadixString(16).padLeft(2, '0')}'
      '${b.toRadixString(16).padLeft(2, '0')}';

  @override
  String toString() => 'Color($r, $g, $b, $a)';
}

var red    = Color.red();
var purple = Color.fromHex('#800080');
var parsed = Color.fromJson({'r': 0, 'g': 0, 'b': 255, 'a': 128});
print(purple.toHex()); // #800080
```

---

## Initializer Lists

An initializer list runs **before** the constructor body and **before** the superclass constructor body. Use it to:
- Compute `final` fields that need derived values
- Validate inputs via `assert`
- Call the super constructor with transformed arguments

```dart
class ImmutableVector {
  final double x, y;
  final double magnitude;         // derived — can't use constructor body for final

  ImmutableVector(double x, double y)
      : x = x,
        y = y,
        magnitude = sqrt(x * x + y * y); // initializer list — computed before body

  ImmutableVector.unit(double angle)
      : x = cos(angle),
        y = sin(angle),
        magnitude = 1.0;
}

// Assertions in initializer list
class Percentage {
  final double value;

  Percentage(this.value)
      : assert(value >= 0.0 && value <= 100.0,
            'Percentage must be 0–100, got $value');
}

// Super + own fields + assert all together
class ColoredPoint {
  final int x, y;
  final String color;

  ColoredPoint(this.x, this.y, this.color)
      : assert(x >= 0 && y >= 0, 'Coordinates must be non-negative'),
        assert(color.isNotEmpty, 'Color cannot be empty');
}

// Transforming before passing to super
class CaseInsensitiveKey extends Comparable<CaseInsensitiveKey> {
  final String _key;
  CaseInsensitiveKey(String key) : _key = key.toLowerCase();

  @override int compareTo(CaseInsensitiveKey other) => _key.compareTo(other._key);
  @override String toString() => _key;
}
```

---

## Redirecting Constructors

Delegate to another constructor in the same class — no body, no initializer list:

```dart
class Duration2 {
  final int totalSeconds;

  Duration2(this.totalSeconds);

  // Redirect to primary
  Duration2.fromMinutes(int minutes)   : this(minutes * 60);
  Duration2.fromHours(int hours)       : this(hours * 3600);
  Duration2.fromDays(int days)         : this(days * 86400);

  int get minutes => totalSeconds ~/ 60;
  int get hours   => totalSeconds ~/ 3600;

  @override
  String toString() {
    final h = totalSeconds ~/ 3600;
    final m = (totalSeconds % 3600) ~/ 60;
    final s = totalSeconds % 60;
    return '${h.toString().padLeft(2,'0')}:'
           '${m.toString().padLeft(2,'0')}:'
           '${s.toString().padLeft(2,'0')}';
  }
}

print(Duration2.fromHours(2));    // 02:00:00
print(Duration2.fromMinutes(90)); // 01:30:00
```

---

## Factory Constructors

A factory constructor can **return an existing instance**, return a **subtype**, or apply **caching / pooling**:

```dart
// ── 1. Singleton ──────────────────────────────────────────────────────
class AppConfig {
  static final AppConfig _instance = AppConfig._();
  factory AppConfig() => _instance;
  AppConfig._();  // private — prevents external instantiation

  String apiBase = 'https://api.example.com';
  Duration timeout = const Duration(seconds: 30);
}

// ── 2. Cache / Flyweight ──────────────────────────────────────────────
class FontFamily {
  static final _cache = <String, FontFamily>{};
  final String name;

  factory FontFamily(String name) =>
      _cache.putIfAbsent(name, () => FontFamily._(name));

  FontFamily._(this.name);
}

var f1 = FontFamily('Roboto');
var f2 = FontFamily('Roboto');
print(identical(f1, f2)); // true — same instance

// ── 3. Return a subtype ───────────────────────────────────────────────
abstract class Logger {
  void log(String msg);

  factory Logger(String type) => switch (type) {
    'console' => ConsoleLogger(),
    'file'    => FileLogger(),
    'null'    => NullLogger(),
    _         => throw ArgumentError('Unknown logger: $type'),
  };
}

class ConsoleLogger implements Logger {
  @override void log(String msg) => print(msg);
}
class FileLogger implements Logger {
  @override void log(String msg) { /* write to file */ }
}
class NullLogger implements Logger {
  @override void log(String msg) { /* discard */ }
}

var logger = Logger('console');  // returns ConsoleLogger

// ── 4. JSON / deserialization (most common use case) ──────────────────
class User {
  final int id;
  final String name;
  final String email;
  final DateTime createdAt;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.createdAt,
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
    id:        json['id']         as int,
    name:      json['name']       as String,
    email:     json['email']      as String,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  Map<String, dynamic> toJson() => {
    'id':         id,
    'name':       name,
    'email':      email,
    'created_at': createdAt.toIso8601String(),
  };

  User copyWith({int? id, String? name, String? email, DateTime? createdAt}) =>
      User(
        id:        id        ?? this.id,
        name:      name      ?? this.name,
        email:     email     ?? this.email,
        createdAt: createdAt ?? this.createdAt,
      );

  @override
  bool operator ==(Object o) => o is User && id == o.id;

  @override
  int get hashCode => id.hashCode;

  @override
  String toString() => 'User($id, $name)';
}
```

---

## Const Constructors

`const` constructors create **compile-time constants**. All fields must be `final`, and the body must be empty:

```dart
class ImmutablePoint {
  final int x, y;
  const ImmutablePoint(this.x, this.y);

  // ✅ Const named constructors too
  const ImmutablePoint.origin() : x = 0, y = 0;

  // Derived value — use a getter, not a field (would need to be final + computed)
  double get distanceFromOrigin => sqrt((x * x + y * y).toDouble());
}

// Compile-time constant objects
const origin = ImmutablePoint.origin();
const unit   = ImmutablePoint(1, 0);

// Canonicalization — identical instances when same arguments
const a = ImmutablePoint(1, 2);
const b = ImmutablePoint(1, 2);
print(identical(a, b)); // true — only one object created!

// Flutter relies on this heavily:
const padding = EdgeInsets.all(16);          // one object, reused
const color   = Color(0xFF2196F3);           // same
const text    = Text('Hello');               // same widget, never rebuilt

// ⚠️ const requires truly constant arguments
const notAllowed = ImmutablePoint(DateTime.now().millisecondsSinceEpoch, 0);
// ❌ DateTime.now() is not a compile-time constant
```

---

## Constructor Tearoffs

In Dart 2.15+, you can refer to a constructor **as a function** without calling it:

```dart
class Point {
  final int x, y;
  const Point(this.x, this.y);
  Point.origin() : x = 0, y = 0;
}

// Constructor tearoff — Point.new is the default constructor as a function
var makePoint = Point.new;
var p = makePoint(3, 4);    // same as Point(3, 4)

// Named constructor tearoff
var makeOrigin = Point.origin;
var o = makeOrigin();       // same as Point.origin()

// Very useful with map/where/etc.
var coords = [(1,2), (3,4), (5,6)];
var points = coords.map((r) => Point(r.$1, r.$2)).toList(); // lambda
var points2 = coords.map(Point.new.call).toList();           // tearoff style

// Common pattern: list of objects from JSON list
List<User> users = jsonList.map(User.fromJson).toList();
// ↑ User.fromJson is the tearoff — no need for (json) => User.fromJson(json)
```

---

## `late final` Field Initialization

When a field can't be set in the constructor but should only be set once:

```dart
class DatabaseConnection {
  late final String _connectionString;  // set once in init()
  late final Database _db;

  bool _initialized = false;

  Future<void> init(String host, int port) async {
    assert(!_initialized, 'Already initialized');
    _connectionString = 'postgres://$host:$port/app';
    _db = await Database.connect(_connectionString);
    _initialized = true;
  }

  Future<List<Row>> query(String sql) async {
    assert(_initialized, 'Call init() first');
    return _db.execute(sql);
  }
}

// Also used for lazy expensive computation
class Report {
  final List<Sale> _sales;
  Report(this._sales);

  // Computed on first access, cached forever
  late final double totalRevenue =
      _sales.fold(0.0, (sum, s) => sum + s.amount);

  late final Map<String, double> byRegion = {
    for (var g in _sales.groupBy((s) => s.region).entries)
      g.key: g.value.fold(0.0, (s, sale) => s + sale.amount)
  };
}
```

---

## Summary

| Type | Syntax | Returns | Key Use |
|------|--------|---------|---------|
| Default | `Foo(this.x)` | New instance | Standard creation |
| Named | `Foo.fromX(...)` | New instance | Multiple creation paths |
| Initializer list | `Foo(x) : f = expr` | New instance | Final fields, validation |
| Redirecting | `Foo.y() : this(...)` | Delegates | DRY aliases |
| Factory | `factory Foo(...)` | Any instance of Foo | Caching, subtypes, parsing |
| Const | `const Foo(this.x)` | Canonicalized constant | Compile-time constants |
| Super param | `Foo(super.x)` | New instance | Forwarding to parent |
| Tearoff | `Foo.new` / `Foo.named` | Function | Passing constructor as value |
