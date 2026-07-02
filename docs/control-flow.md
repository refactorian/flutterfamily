---
sidebar_position: 6
title: Control Flow
description: if/else, switch, loops, break/continue, assert, and pattern-based control flow in Dart.
---

---

## if / else

```dart
int score = 85;

// Basic if/else
if (score >= 90) {
  print('A');
} else if (score >= 80) {
  print('B');
} else if (score >= 70) {
  print('C');
} else {
  print('F');
}

// Single-line (braces optional for one statement, but not recommended)
if (score > 50) print('Pass');

// Ternary instead of if-expression
var grade = score >= 90 ? 'A' : (score >= 80 ? 'B' : 'C');
```

---

## switch Statement

### Classic switch

```dart
var day = 'Monday';

switch (day) {
  case 'Monday':
  case 'Tuesday':
  case 'Wednesday':
  case 'Thursday':
  case 'Friday':
    print('Weekday');
    break;
  case 'Saturday':
  case 'Sunday':
    print('Weekend');
    break;
  default:
    print('Unknown');
}
```

### Modern switch (Dart 3) — Switch Expression

```dart
// switch expression returns a value
var dayType = switch (day) {
  'Saturday' || 'Sunday' => 'Weekend',
  'Monday' || 'Tuesday' || 'Wednesday' || 'Thursday' || 'Friday' => 'Weekday',
  _ => 'Unknown',  // default
};
print(dayType); // Weekday

// switch statement (Dart 3 style — no break needed!)
switch (day) {
  case 'Saturday' || 'Sunday':
    print('Weekend');
  case _:
    print('Weekday');
}

// switch with guards (when clause)
int n = 42;
switch (n) {
  case int x when x < 0:
    print('Negative');
  case int x when x == 0:
    print('Zero');
  case int x when x > 0:
    print('Positive: $x');
}

// switch with type patterns
Object shape = Circle(5.0);
switch (shape) {
  case Circle(radius: var r):
    print('Circle with radius $r');
  case Rectangle(width: var w, height: var h):
    print('Rectangle ${w}x${h}');
  default:
    print('Unknown shape');
}
```

---

## for Loops

```dart
// Classic for loop
for (int i = 0; i < 5; i++) {
  print(i); // 0, 1, 2, 3, 4
}

// for-in loop (iterates over any Iterable)
var fruits = ['apple', 'banana', 'cherry'];
for (var fruit in fruits) {
  print(fruit);
}

// forEach method
fruits.forEach((fruit) => print(fruit));
// Note: forEach doesn't support break/continue
// Prefer for-in when you need those

// Indexed iteration (Dart 3)
for (var (i, fruit) in fruits.indexed) {
  print('$i: $fruit');
}
// Or with manual index:
for (var i = 0; i < fruits.length; i++) {
  print('$i: ${fruits[i]}');
}
```

---

## while & do-while

```dart
// while — condition checked BEFORE each iteration
int i = 0;
while (i < 5) {
  print(i);
  i++;
}

// do-while — condition checked AFTER each iteration (runs at least once)
int j = 10;
do {
  print(j); // prints 10 even though condition is false immediately
  j++;
} while (j < 5);

// Infinite loop with break
while (true) {
  var input = readLine();
  if (input == 'quit') break;
  print('You said: $input');
}
```

---

## break & continue

```dart
// break — exits the loop entirely
for (var i = 0; i < 10; i++) {
  if (i == 5) break;
  print(i); // 0, 1, 2, 3, 4
}

// continue — skips to next iteration
for (var i = 0; i < 10; i++) {
  if (i.isEven) continue;
  print(i); // 1, 3, 5, 7, 9
}

// Labels — break/continue outer loops
outer:
for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    if (j == 1) continue outer; // skip to next i
    print('$i, $j');
  }
}
// Output: 0,0  1,0  2,0

outerLoop:
for (var i = 0; i < 3; i++) {
  for (var j = 0; j < 3; j++) {
    if (i == 1 && j == 1) break outerLoop; // exit both loops
    print('$i, $j');
  }
}
```

---

## assert

Used during development to enforce invariants. Disabled in production.

```dart
int divide(int a, int b) {
  assert(b != 0, 'Divisor cannot be zero!');
  return a ~/ b;
}

divide(10, 0); // AssertionError: Divisor cannot be zero! (in debug mode)

// Assert with no message
assert(someValue > 0);

// Run with assertions enabled:
// dart run --enable-asserts app.dart
// In Flutter: debug mode always enables assertions
```

---

## Pattern-Based Control Flow (Dart 3)

```dart
// if-case
Object response = {'status': 200, 'data': 'Hello'};

if (response case {'status': 200, 'data': String data}) {
  print('Success: $data');
} else if (response case {'status': int code}) {
  print('Error code: $code');
}

// Exhaustive switch on sealed class
sealed class Shape {}
class Circle extends Shape { final double radius; Circle(this.radius); }
class Square extends Shape { final double side; Square(this.side); }
class Triangle extends Shape { final double base, height; Triangle(this.base, this.height); }

double area(Shape shape) => switch (shape) {
  Circle(radius: var r)        => 3.14159 * r * r,
  Square(side: var s)          => s * s,
  Triangle(base: var b, height: var h) => 0.5 * b * h,
};
// No default needed — Dart knows Shape has exactly 3 subclasses!
```

---

## Loops with Async

```dart
// await for — iterate over a Stream
Stream<int> countTo(int n) async* {
  for (var i = 1; i <= n; i++) {
    await Future.delayed(Duration(milliseconds: 100));
    yield i;
  }
}

Future<void> main() async {
  await for (var n in countTo(5)) {
    print(n); // 1, 2, 3, 4, 5
  }
  print('Done!');
}

// async inside for loop
Future<void> processAll(List<String> urls) async {
  for (var url in urls) {
    var result = await fetch(url);
    print(result);
  }
  // Sequential — waits for each before next

  // Parallel alternative:
  await Future.wait(urls.map(fetch));
}
```

---

## Summary

| Control Structure | Purpose |
|-------------------|---------|
| `if / else if / else` | Conditional branching |
| `switch` (classic) | Multi-case branching on a value |
| `switch` (Dart 3) | Pattern-based exhaustive branching |
| `for (init; cond; incr)` | Classic counted loop |
| `for (var x in list)` | Iterate over iterable |
| `while (cond)` | Loop while true, check first |
| `do { } while (cond)` | Loop while true, run once first |
| `break` | Exit loop or switch |
| `continue` | Skip to next iteration |
| `assert` | Enforce invariants (debug only) |
| `await for` | Iterate over async Stream |
