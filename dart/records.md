---
sidebar_position: 12
title: Records (Dart 3)
description: Anonymous immutable typed data bundles, destructuring, and records vs classes in Dart 3.
---

Records are **anonymous, immutable, structurally-typed** value objects. They're the lightweight alternative to creating a whole class just to bundle a few values together — with full type safety and zero boilerplate.

---

## The Core Idea

```dart
// Before records — three bad options:
// 1. Return a List (untyped, error-prone)
List<dynamic> getUser() => ['Alice', 30, true];
var name = result[0] as String; // fragile cast, no IDE help

// 2. Create a throwaway class (boilerplate for something used once)
class UserTuple { final String name; final int age; ... }

// 3. Use a Map (untyped, verbose)
Map<String, dynamic> getUser() => {'name': 'Alice', 'age': 30};

// With records — typed, concise, zero setup:
(String, int) getUser() => ('Alice', 30);
var (name, age) = getUser(); // typed destructuring
```

---

## Creating Records

```dart
// ── Positional records ─────────────────────────────────────────────────
var point    = (3.0, 4.0);               // (double, double)
var triple   = (1, 'hello', true);       // (int, String, bool)

// Access positional fields by $1, $2, ...
print(point.$1);   // 3.0
print(point.$2);   // 4.0
print(triple.$3);  // true

// ── Named records ──────────────────────────────────────────────────────
var person = (name: 'Alice', age: 30);
var color  = (r: 255, g: 128, b: 0);

// Access named fields by name
print(person.name);  // Alice
print(color.r);      // 255

// ── Mixed — positional + named ─────────────────────────────────────────
var entry = (42, label: 'answer', active: true);
print(entry.$1);       // 42
print(entry.label);    // answer
print(entry.active);   // true

// ── Type annotations ───────────────────────────────────────────────────
(double, double) coords = (3.0, 4.0);
({String name, int age}) user = (name: 'Bob', age: 25);
(int, {String label}) tagged = (1, label: 'first');
```

---

## Records Are Value Types

Two records are equal if and only if their **types, field names, and field values** all match:

```dart
// Positional records
var r1 = (1, 2, 3);
var r2 = (1, 2, 3);
print(r1 == r2);    // true  ✅ — same type, same values

// Named records
var n1 = (x: 1, y: 2);
var n2 = (x: 1, y: 2);
print(n1 == n2);    // true  ✅

// Field order matters for positional
var a = (1, 2);
var b = (2, 1);
print(a == b);      // false — different order

// Field names matter for named
var c = (x: 1, y: 2);
var d = (y: 2, x: 1);  // same names, different declaration order
print(c == d);          // true  ✅ — named fields are order-independent!

// Compare with classes — need to manually override ==
class Pt { final int x, y; Pt(this.x, this.y); }
print(Pt(1,2) == Pt(1,2));  // false ❌ without overriding ==

// Records work perfectly as Map keys and Set members
var counts = <(int, int), int>{};
counts[(0, 0)] = 1;
counts[(1, 2)] = 5;
print(counts[(0, 0)]); // 1

var seen = <(String, int)>{};
seen.add(('Alice', 30));
print(seen.contains(('Alice', 30))); // true ✅
```

---

## Records as Return Types

The most common use case — returning multiple values from a function without a throwaway class:

```dart
// ── Positional return ──────────────────────────────────────────────────
(bool, String) validatePassword(String password) {
  if (password.length < 8) return (false, 'Too short — min 8 characters');
  if (!password.contains(RegExp(r'[A-Z]'))) return (false, 'Needs uppercase letter');
  if (!password.contains(RegExp(r'[0-9]'))) return (false, 'Needs a digit');
  return (true, 'Password is strong');
}

var (ok, msg) = validatePassword('Secret1!');
print('$ok: $msg');  // true: Password is strong

// ── Named return — self-documenting ───────────────────────────────────
({double min, double max, double mean, double stdDev})
    statistics(List<double> data) {
  final sorted = [...data]..sort();
  final mean   = data.reduce((a, b) => a + b) / data.length;
  final variance = data
      .map((x) => (x - mean) * (x - mean))
      .reduce((a, b) => a + b) / data.length;
  return (
    min:    sorted.first,
    max:    sorted.last,
    mean:   mean,
    stdDev: sqrt(variance),
  );
}

var stats = statistics([4.0, 7.0, 13.0, 2.0, 1.0]);
print('Mean: ${stats.mean.toStringAsFixed(2)}');    // Mean: 5.40
print('StdDev: ${stats.stdDev.toStringAsFixed(2)}'); // StdDev: 3.94

// ── Parallel async operations — unpack the results cleanly ────────────
Future<(User, List<Order>, Settings)> loadDashboard(String userId) async {
  final (user, orders, settings) = await (
    fetchUser(userId),
    fetchOrders(userId),
    fetchSettings(userId),
  ).wait;                          // Dart 3 parallel wait
  return (user, orders, settings);
}
```

---

## Destructuring Records

Records are made to be unpacked:

```dart
// ── Variable declaration ───────────────────────────────────────────────
var (x, y)         = (10, 20);
var (:name, :age)  = (name: 'Carol', age: 25);   // shorthand: same var name as field
var (first, _, last) = (1, 2, 3);                 // _ discards middle value

// ── Assignment destructuring ───────────────────────────────────────────
int a = 1, b = 2;
(a, b) = (b, a);           // swap — no temp variable needed!
print('$a, $b');           // 2, 1

// ── In for loops ──────────────────────────────────────────────────────
var pairs = [(1, 'one'), (2, 'two'), (3, 'three')];
for (var (num, word) in pairs) {
  print('$num = $word');
}

// ── Named destructuring in loops ──────────────────────────────────────
var people = [
  (name: 'Alice', age: 30),
  (name: 'Bob',   age: 25),
];
for (var (:name, :age) in people) {
  print('$name is $age');
}

// ── Nested destructuring ───────────────────────────────────────────────
var nested = (1, (2, 3), (name: 'x', value: 4));
var (a2, (b2, c2), (:name2, value: v)) = nested;
print('$a2 $b2 $c2 $name2 $v'); // 1 2 3 x 4

// ── In switch (pattern matching) ──────────────────────────────────────
(String, int) result = ('Alice', 30);
switch (result) {
  case ('Alice', var age): print('Found Alice, age $age');
  case (var name, >= 18):  print('$name is an adult');
  case (var name, _):      print('$name is a minor');
}
```

---

## Records in Collections

```dart
// List of records — typed tuples without a class
List<(String, double)> priceList = [
  ('Apple', 0.99),
  ('Banana', 0.49),
  ('Cherry', 2.99),
];

// Sort by price
priceList.sort((a, b) => a.$2.compareTo(b.$2));

// Filter and transform
var expensive = priceList
    .where((item) => item.$2 > 1.0)
    .map((item) => '${item.$1}: \$${item.$2}')
    .toList();
print(expensive); // [Apple: $0.99... wait — Cherry: $2.99]

// Named records in collections
List<({String name, int score, String grade})> results = [
  (name: 'Alice', score: 95, grade: 'A'),
  (name: 'Bob',   score: 78, grade: 'C'),
  (name: 'Carol', score: 88, grade: 'B'),
];

// Sort by score descending
results.sort((a, b) => b.score.compareTo(a.score));
for (var (:name, :score, :grade) in results) {
  print('$name: $score ($grade)');
}

// Group by grade
var byGrade = <String, List<String>>{};
for (var (:name, :grade, score: _) in results) {
  byGrade.putIfAbsent(grade, () => []).add(name);
}
```

---

## Records as Composite Map Keys

Records make perfect multi-field map keys — no need to write a key class:

```dart
// Grid / matrix lookup
var grid = <(int, int), String>{};
grid[(0, 0)] = 'origin';
grid[(1, 0)] = 'right';
grid[(0, 1)] = 'up';
print(grid[(1, 0)]); // right

// Cache with multiple parameters
var cache = <(String, int, bool), ApiResult>{};
String cacheKey(String endpoint, int page, bool includeDeleted) {
  // Without records — must serialize to string:
  // return '$endpoint:$page:$includeDeleted'; // fragile
}
// With records — use directly as a key:
cache[('/users', 1, false)] = await api.fetch('/users', page: 1);

// 2D game state
var visited = <(int row, int col)>{};
void visit(int row, int col) => visited.add((row: row, col: col));
bool hasVisited(int row, int col) => visited.contains((row: row, col: col));
```

---

## Generic Records & Typedefs

```dart
// Typedef for reusable record types
typedef Point      = (double x, double y);
typedef Point3D    = (double x, double y, double z);
typedef Range<T>   = (T min, T max);
typedef Labeled<T> = ({String label, T value});
typedef Pair<A, B> = (A first, B second);

// Usage
Point origin = (0.0, 0.0);
Range<int> ageRange = (0, 150);
Labeled<double> temperature = (label: 'temp', value: 36.6);
Pair<String, int> namedAge = ('Alice', 30);

// Functions that operate on typedef records
double distance(Point a, Point b) {
  final dx = a.x - b.x;
  final dy = a.y - b.y;
  return sqrt(dx * dx + dy * dy);
}

bool inRange<T extends Comparable<T>>(Range<T> range, T value) =>
    value.compareTo(range.min) >= 0 && value.compareTo(range.max) <= 0;

print(distance((0.0, 0.0), (3.0, 4.0)));    // 5.0
print(inRange((0, 100), 42));                // true
print(inRange((0, 100), 150));               // false
```

---

## Records vs Classes — When to Use Which

| Situation | Use Record | Use Class |
|-----------|-----------|-----------|
| Return 2–4 related values from a function | ✅ | |
| Temporary data bundle — used once, thrown away | ✅ | |
| Need automatic value equality | ✅ | |
| Composite map key | ✅ | |
| Swap multiple variables | ✅ | |
| Long-lived entity with identity | | ✅ |
| Need methods (beyond property access) | | ✅ |
| Need inheritance | | ✅ |
| Will be serialized/deserialized repeatedly | | ✅ |
| Public API that users will construct | | ✅ |
| Configuration object with defaults | | ✅ |

```dart
// ✅ Record — temporary, passed and unpacked immediately
(String, String) splitFullName(String full) {
  final parts = full.split(' ');
  return (parts.first, parts.last);
}
var (first, last) = splitFullName('Alice Smith');

// ✅ Class — reused, stored, has behavior
class FullName {
  final String first, last;
  const FullName(this.first, this.last);
  String get display => '$first $last';
  String get initials => '${first[0]}.${last[0]}.';
}
```

---

## Summary

```dart
// Positional
var r = (1, 'hello', true);
r.$1;  r.$2;  r.$3;

// Named
var r = (x: 1, y: 2);
r.x;  r.y;

// Type annotation
(int, String) pos = (1, 'a');
({int x, int y}) named = (x: 1, y: 2);

// Destructure
var (a, b)      = (1, 2);
var (:x, :y)    = (x: 1, y: 2);
var (p, _, q)   = (1, 2, 3);   // skip middle

// Swap
(a, b) = (b, a);

// Return multiple values
(bool, String) check() => (true, 'ok');
var (ok, msg) = check();

// Typedef
typedef Point = (double x, double y);

// In collections
List<(String, int)> items = [('a', 1), ('b', 2)];
Map<(int, int), String> grid = {(0, 0): 'origin'};
```
