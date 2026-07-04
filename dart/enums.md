---
sidebar_position: 11
title: Enums
description: Basic enums, enhanced enums (Dart 2.17+), and using enums for state management in Dart.
---

Enums define a **fixed set of named constants**. Dart's enums are among the most powerful in any language — they can carry data, implement interfaces, and define methods, making them a first-class tool for domain modelling.

---

## Basic Enums

```dart
enum Direction { north, south, east, west }
enum Status    { pending, active, suspended, deleted }
enum LogLevel  { verbose, debug, info, warning, error, fatal }

// Built-in properties every enum value has
var dir = Direction.north;
print(dir);           // Direction.north  (toString)
print(dir.name);      // north            (String name, Dart 2.15+)
print(dir.index);     // 0                (position in declaration)

// All values as a list
print(Direction.values);   // [Direction.north, Direction.south, ...]

// Lookup by name (throws if not found)
var east = Direction.values.byName('east');   // Direction.east

// Safe lookup (returns null instead of throwing)
Direction? maybe = Direction.values
    .where((d) => d.name == 'up')
    .firstOrNull;              // null — 'up' is not a Direction
```

---

## Switch on Enums — Exhaustive

Dart's switch is **exhaustive** on enums — the compiler warns if you miss a case:

```dart
// switch expression — returns a value, no default needed
String label(Direction d) => switch (d) {
  Direction.north => '↑ North',
  Direction.south => '↓ South',
  Direction.east  => '→ East',
  Direction.west  => '← West',
};

// switch statement — same exhaustiveness guarantee
void handleStatus(Status s) {
  switch (s) {
    case Status.pending:   schedulWork();
    case Status.active:    doWork();
    case Status.suspended: pauseWork();
    case Status.deleted:   cleanUp();
    // All 4 cases covered — no default needed
  }
}

// Add a new enum value → compile error at every unhandled switch → can't miss it ✅
```

---

## Enhanced Enums (Dart 2.17+)

Enums can have **fields, constructors, getters, and methods** — making them full-blown typed constants:

```dart
enum HttpMethod {
  get,
  post,
  put,
  patch,
  delete,
  head,
  options;

  bool get hasBody    => this == post || this == put || this == patch;
  bool get isReadOnly => this == get || this == head || this == options;

  String get uppercased => name.toUpperCase();
}

print(HttpMethod.post.hasBody);      // true
print(HttpMethod.get.isReadOnly);    // true
print(HttpMethod.delete.uppercased); // DELETE

// ── Enum with fields ─────────────────────────────────────────────────
enum Currency {
  usd(symbol: '\$', decimalPlaces: 2),
  eur(symbol: '€', decimalPlaces: 2),
  jpy(symbol: '¥', decimalPlaces: 0),
  btc(symbol: '₿', decimalPlaces: 8);

  // Fields (must be final)
  final String symbol;
  final int decimalPlaces;

  // Constructor (must be const)
  const Currency({required this.symbol, required this.decimalPlaces});

  // Methods
  String format(double amount) =>
      '$symbol${amount.toStringAsFixed(decimalPlaces)}';
}

print(Currency.usd.format(1234.5));   // $1234.50
print(Currency.jpy.format(1234.5));   // ¥1235
print(Currency.btc.format(0.00042));  // ₿0.00042000

// ── Enum with complex logic ───────────────────────────────────────────
enum Planet {
  mercury(3.303e+23, 2.4397e6),
  venus  (4.869e+24, 6.0518e6),
  earth  (5.976e+24, 6.37814e6),
  mars   (6.421e+23, 3.3972e6),
  jupiter(1.899e+27, 7.1492e7),
  saturn (5.685e+26, 6.0268e7),
  uranus (8.683e+25, 2.5559e7),
  neptune(1.024e+26, 2.4746e7);

  final double mass;    // kg
  final double radius;  // meters

  const Planet(this.mass, this.radius);

  static const double G = 6.67430e-11;

  double get surfaceGravity => G * mass / (radius * radius);

  double weightOn(double earthWeight) =>
      earthWeight * surfaceGravity / earth.surfaceGravity;

  bool get isInnerPlanet =>
      index <= mars.index;  // mercury, venus, earth, mars
}

print(Planet.mars.weightOn(75.0).toStringAsFixed(1)); // 28.5
print(Planet.jupiter.surfaceGravity.toStringAsFixed(1)); // 24.8
print(Planet.values.where((p) => p.isInnerPlanet).map((p) => p.name).toList());
// [mercury, venus, earth, mars]
```

---

## Enums Implementing Interfaces

```dart
abstract interface class Describable {
  String get description;
}

abstract interface class Iconable {
  String get icon;
}

enum AppRoute implements Describable, Iconable {
  home(description: 'Home Screen',    icon: '🏠'),
  search(description: 'Search',       icon: '🔍'),
  profile(description: 'My Profile',  icon: '👤'),
  settings(description: 'Settings',   icon: '⚙️');

  @override final String description;
  @override final String icon;

  const AppRoute({required this.description, required this.icon});

  String get title => description;
}

// Polymorphism — treat enum as an interface
void showTabs(List<Describable> items) {
  for (final item in items) print(item.description);
}
showTabs(AppRoute.values); // works!
```

---

## Enums with Mixins

```dart
mixin Serializable on Enum {
  // 'on Enum' means it can only be applied to enums
  String toJson() => name;
}

enum Color with Serializable { red, green, blue }

print(Color.red.toJson()); // red

// Deserialization helper (typically static on the enum or in an extension)
extension ColorSerialization on Color {
  static Color fromJson(String name) => Color.values.byName(name);
}

var c = ColorSerialization.fromJson('green'); // Color.green
```

---

## Serialization & Deserialization Patterns

```dart
enum UserRole { admin, editor, viewer, guest }

// ── Serialize: enum → String ──────────────────────────────────────────
String roleToJson(UserRole r) => r.name; // 'admin', 'editor', etc.

// ── Deserialize: String → enum ────────────────────────────────────────
UserRole roleFromJson(String s) => UserRole.values.byName(s);

// ── Safe deserialization (returns null on unknown value) ───────────────
UserRole? roleMaybeFromJson(String? s) {
  if (s == null) return null;
  try { return UserRole.values.byName(s); }
  catch (_) { return null; }
}

// ── With custom JSON keys (different name in API) ─────────────────────
enum OrderStatus {
  pending('PENDING'),
  processing('IN_PROGRESS'),
  shipped('SHIPPED'),
  delivered('DELIVERED'),
  cancelled('CANCELLED');

  final String apiKey;
  const OrderStatus(this.apiKey);

  static OrderStatus fromApiKey(String key) =>
      values.firstWhere((s) => s.apiKey == key,
          orElse: () => throw ArgumentError('Unknown status: $key'));

  String toApiKey() => apiKey;
}

var status = OrderStatus.fromApiKey('IN_PROGRESS'); // OrderStatus.processing
print(status.toApiKey());                           // IN_PROGRESS
```

---

## Enum Iteration Patterns

```dart
enum Priority { low, medium, high, critical }

// Iterate all
Priority.values.forEach((p) => print(p.name));

// Filter
var urgent = Priority.values.where((p) => p.index >= Priority.high.index);
print(urgent.map((p) => p.name).toList()); // [high, critical]

// Map to something else
var labels = Map.fromEntries(
  Priority.values.map((p) => MapEntry(p, p.name.toUpperCase())),
);
print(labels[Priority.critical]); // CRITICAL

// Next / previous
extension PriorityNav on Priority {
  Priority get next =>
      Priority.values[(index + 1) % Priority.values.length];
  Priority get prev =>
      Priority.values[(index - 1 + Priority.values.length) % Priority.values.length];
  bool get isHigherThan => index > Priority.low.index;
}

print(Priority.high.next); // Priority.critical
print(Priority.low.prev);  // Priority.critical (wraps around)
```

---

## Enums as State Machines

Enums model **finite state machines** naturally:

```dart
enum ConnectionState {
  disconnected,
  connecting,
  connected,
  reconnecting,
  failed;

  // Allowed transitions
  Set<ConnectionState> get allowedTransitions => switch (this) {
    disconnected  => {connecting},
    connecting    => {connected, failed},
    connected     => {reconnecting, disconnected},
    reconnecting  => {connected, failed},
    failed        => {connecting, disconnected},
  };

  bool canTransitionTo(ConnectionState next) =>
      allowedTransitions.contains(next);

  bool get isActive => this == connected || this == reconnecting;
}

class Connection {
  ConnectionState _state = ConnectionState.disconnected;

  bool transition(ConnectionState next) {
    if (!_state.canTransitionTo(next)) {
      print('Invalid: $_state → $next');
      return false;
    }
    print('$_state → $next');
    _state = next;
    return true;
  }
}

var conn = Connection();
conn.transition(ConnectionState.connecting);  // disconnected → connecting
conn.transition(ConnectionState.connected);   // connecting → connected
conn.transition(ConnectionState.disconnected);// connected → disconnected
conn.transition(ConnectionState.connected);   // Invalid: disconnected → connected
```

---

## Summary

| Feature | Syntax | Notes |
|---------|--------|-------|
| Declare | `enum Foo { a, b, c }` | Basic enum |
| Enhanced | `enum Foo { a(x); final T x; const Foo(this.x); }` | Fields + methods |
| `.name` | `Foo.a.name` → `'a'` | String name of value |
| `.index` | `Foo.a.index` → `0` | Position in declaration |
| `.values` | `Foo.values` | All values as `List<Foo>` |
| `.byName` | `Foo.values.byName('a')` | Parse from string |
| Implements | `enum Foo implements Bar` | Satisfy interface |
| Mixin | `enum Foo with Bar` | Mix in behaviour |
| Switch | Exhaustive — no `default` needed | Compiler-verified |
| Serialize | `value.name` / `Value.values.byName(s)` | Round-trip via name |
