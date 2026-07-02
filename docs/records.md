---
sidebar_position: 12
title: Records
description: Anonymous immutable typed data bundles, destructuring, and records vs classes in Dart 3.
---

Records are **anonymous, immutable**, typed bundles of values. Think of them as lightweight, ad-hoc data classes — introduced in Dart 3.

---

## Creating Records

```dart
// Positional record
var point = (3.0, 4.0);
print(point.$1); // 3.0
print(point.$2); // 4.0

// Named record
var person = (name: 'Alice', age: 30);
print(person.name); // Alice
print(person.age);  // 30

// Mixed (positional + named)
var mixed = (42, name: 'Dart', active: true);
print(mixed.$1);      // 42
print(mixed.name);    // Dart
print(mixed.active);  // true

// Record type annotation
(double, double) coords = (3.0, 4.0);
({String name, int age}) user = (name: 'Bob', age: 25);
```

---

## Records are Value Types

Records are **equal** if their fields are equal:

```dart
var r1 = (1, 2, 3);
var r2 = (1, 2, 3);
print(r1 == r2); // true ✅

var r3 = (name: 'Alice', age: 30);
var r4 = (name: 'Alice', age: 30);
print(r3 == r4); // true ✅

// Contrast with class instances:
class Point { final int x, y; Point(this.x, this.y); }
print(Point(1,2) == Point(1,2)); // false (unless you override ==)
```

---

## Records as Return Types

Perfect for returning multiple values from a function!

```dart
// Return two values from a function
(String, int) parseUser(String input) {
  var parts = input.split(':');
  return (parts[0], int.parse(parts[1]));
}

var (name, age) = parseUser('Alice:30');
print(name); // Alice
print(age);  // 30

// Named return
({double min, double max, double avg}) statistics(List<double> data) {
  data.sort();
  return (
    min: data.first,
    max: data.last,
    avg: data.reduce((a, b) => a + b) / data.length,
  );
}

var stats = statistics([3.0, 1.0, 4.0, 1.0, 5.0]);
print('Min: ${stats.min}, Max: ${stats.max}, Avg: ${stats.avg}');
```

---

## Destructuring Records

```dart
// Positional destructuring
var (x, y) = (10, 20);
print(x); // 10
print(y); // 20

// Named destructuring
var (:name, :age) = (name: 'Carol', age: 25);
print(name); // Carol
print(age);  // 25

// Ignore parts with _
var (first, _, third) = (1, 2, 3);
print(first); // 1
print(third); // 3

// In for-loops
var pairs = [(1, 'one'), (2, 'two'), (3, 'three')];
for (var (num, word) in pairs) {
  print('$num = $word');
}

// Swap variables elegantly!
var a = 1, b = 2;
(a, b) = (b, a);
print('$a, $b'); // 2, 1
```

---

## Records vs Classes

| Feature | Record | Class |
|---------|--------|-------|
| Mutable | ❌ Always immutable | ✅ Can be mutable |
| Named fields | ✅ Optional | ✅ Yes |
| Methods | ❌ No | ✅ Yes |
| Inheritance | ❌ No | ✅ Yes |
| Value equality | ✅ Automatic | ❌ Must implement |
| Boilerplate | None | Some |

Use records for **temporary bundles** of data; use classes for **entities with behavior**.

---

## Typedef for Records

```dart
typedef Point = (double x, double y);
typedef Color = ({int r, int g, int b});

Point origin = (0.0, 0.0);
Color red = (r: 255, g: 0, b: 0);

double distance(Point p1, Point p2) {
  var dx = p1.$1 - p2.$1;
  var dy = p1.$2 - p2.$2;
  return sqrt(dx * dx + dy * dy);
}
```
