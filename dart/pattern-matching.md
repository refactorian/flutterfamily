---
sidebar_position: 13
title: Pattern Matching
description: Patterns, switch expressions, guard clauses, and exhaustiveness checking in Dart 3.
---

Patterns let you **match, destructure, and bind** values simultaneously. Introduced in Dart 3.

---

## Pattern Types

### Literal Patterns

```dart
void check(Object value) {
  switch (value) {
    case 0:
      print('Zero');
    case 1 || 2 || 3:
      print('Small number');
    case int n when n < 0:
      print('Negative: $n');
    case int n:
      print('Other int: $n');
    case String s:
      print('String: $s');
    case null:
      print('Null');
    default:
      print('Something else');
  }
}
```

### Type Patterns

```dart
Object value = 3.14;

// Type check + bind
if (value case double d) {
  print('Double: $d');  // Double: 3.14
}

// In switch
switch (value) {
  case int n:    print('int: $n');
  case double d: print('double: $d');
  case String s: print('string: $s');
}
```

### List Patterns

```dart
void describe(List<int> list) {
  switch (list) {
    case []:
      print('Empty');
    case [var single]:
      print('One element: $single');
    case [var first, var second]:
      print('Two elements: $first and $second');
    case [var head, ...var tail]:
      print('Head: $head, tail has ${tail.length} elements');
    case [..., var last]:
      print('Last element: $last');
  }
}

describe([]);          // Empty
describe([42]);        // One element: 42
describe([1, 2]);      // Two elements: 1 and 2
describe([1, 2, 3, 4]); // Head: 1, tail has 3 elements
```

### Map Patterns

```dart
void parseConfig(Map<String, dynamic> config) {
  switch (config) {
    case {'type': 'circle', 'radius': double r}:
      print('Circle with radius $r');
    case {'type': 'rect', 'width': double w, 'height': double h}:
      print('Rectangle ${w}x${h}');
    case {'type': String t}:
      print('Unknown type: $t');
    default:
      print('Invalid config');
  }
}

parseConfig({'type': 'circle', 'radius': 5.0}); // Circle with radius 5.0
```

### Object Patterns

```dart
class Point {
  final double x, y;
  const Point(this.x, this.y);
}

Object shape = Point(3.0, 4.0);

switch (shape) {
  case Point(x: 0, y: 0):
    print('Origin');
  case Point(x: var x, y: 0):
    print('On X axis at $x');
  case Point(x: 0, y: var y):
    print('On Y axis at $y');
  case Point(x: var x, y: var y):
    print('Point at ($x, $y)');
}
```

### Record Patterns

```dart
var record = (name: 'Alice', age: 30);

switch (record) {
  case (name: 'Alice', age: var age):
    print('Alice is $age years old');
  case (name: var n, age: int age) when age >= 18:
    print('$n is an adult');
  case (:var name, :var age):
    print('$name: $age');
}
```

---

## Switch Expressions

Return a value from a switch:

```dart
// Instead of:
String describe(int n) {
  if (n < 0) return 'negative';
  if (n == 0) return 'zero';
  return 'positive';
}

// Write:
String describe(int n) => switch (n) {
  < 0 => 'negative',
  0   => 'zero',
  _   => 'positive',
};

// Type-based switch expression
double area(Shape shape) => switch (shape) {
  Circle(radius: var r)           => pi * r * r,
  Rectangle(width: var w, :var height) => w * height,
  Triangle(:var base, :var height)     => 0.5 * base * height,
};
```

---

## if-case Statement

```dart
// Check + destructure in one go
Object result = Success('Data loaded');

if (result case Success(value: var data)) {
  print('Got: $data');
}

// With else
if (result case Failure(message: var error)) {
  print('Error: $error');
} else if (result case Success(value: var data)) {
  print('Success: $data');
}
```

---

## Guard Clauses (when)

```dart
var scores = [45, 72, 90, 55, 88, 33];

for (var score in scores) {
  switch (score) {
    case int n when n >= 90:
      print('$n: A');
    case int n when n >= 80:
      print('$n: B');
    case int n when n >= 70:
      print('$n: C');
    case int n when n >= 60:
      print('$n: D');
    case int n:
      print('$n: F');
  }
}
```

---

## Exhaustiveness Checking

With sealed classes, Dart checks that all cases are covered:

```dart
sealed class Expr {}
class Num extends Expr  { final double value; Num(this.value); }
class Add extends Expr  { final Expr left, right; Add(this.left, this.right); }
class Mul extends Expr  { final Expr left, right; Mul(this.left, this.right); }

double eval(Expr expr) => switch (expr) {
  Num(value: var v)       => v,
  Add(left: var l, right: var r) => eval(l) + eval(r),
  Mul(left: var l, right: var r) => eval(l) * eval(r),
  // No default needed — sealed class is exhaustive!
};

// 3 + (4 * 2) = 11
var expression = Add(Num(3), Mul(Num(4), Num(2)));
print(eval(expression)); // 11.0
```
