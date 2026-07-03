---
sidebar_position: 6
title: Control Flow
description: if/else, switch, loops, break/continue, assert, and pattern-based control flow in Dart.
---

Dart gives you the full toolkit: classic conditionals and loops, modern pattern-based switching, async iteration, and labelled jumps. This chapter covers all of them with real-world context.

---

## if / else

```dart
int score = 85;

// Basic if / else if / else
if (score >= 90) {
  print('A');
} else if (score >= 80) {
  print('B');
} else if (score >= 70) {
  print('C');
} else {
  print('F');
}

// Always use braces — even for single statements
// ✅ Clear
if (score > 50) {
  print('Pass');
}
// ⚠️  Error-prone (next dev might add a line and break the logic)
if (score > 50) print('Pass');
```

### Ternary Operator

Use for simple two-branch assignments. Avoid nesting more than once.

```dart
var label = score >= 50 ? 'Pass' : 'Fail';

// One level of nesting is OK
var grade = score >= 90 ? 'A' : (score >= 80 ? 'B' : 'C');

// Too deep → use a switch expression or helper function instead
String classify(int s) => switch (s) {
  >= 90 => 'A',
  >= 80 => 'B',
  >= 70 => 'C',
  >= 60 => 'D',
  _     => 'F',
};
```

### Null-Short-Circuit Patterns

```dart
// Guard clause — return early rather than nesting
String processUser(User? user) {
  if (user == null) return 'No user';
  if (!user.isActive) return 'User inactive';
  if (user.name.isEmpty) return 'Name missing';

  // Happy path is now un-nested
  return user.name.toUpperCase();
}
```

---

## switch Statement

### Classic switch (pre-Dart 3)

```dart
var day = 'Monday';

switch (day) {
  case 'Monday':
  case 'Tuesday':
  case 'Wednesday':
  case 'Thursday':
  case 'Friday':
    print('Weekday');
    break;       // ← required in classic style to prevent fall-through
  case 'Saturday':
  case 'Sunday':
    print('Weekend');
    break;
  default:
    print('Unknown');
}
```

### Modern switch Statement (Dart 3 — no `break` needed)

```dart
// Dart 3 switch statement — each case has its own implicit break
switch (day) {
  case 'Saturday' || 'Sunday':
    print('Weekend!');
  case 'Monday' || 'Tuesday' || 'Wednesday' || 'Thursday' || 'Friday':
    print('Weekday');
  case _:             // wildcard default
    print('Unknown');
}
```

### switch Expression (Dart 3 — returns a value)

```dart
// Assign the result of a switch directly
var type = switch (day) {
  'Saturday' || 'Sunday' => 'Weekend',
  'Monday' || 'Tuesday' || 'Wednesday' || 'Thursday' || 'Friday' => 'Weekday',
  _ => 'Unknown',
};

// Great for mapping enums to values
enum Direction { north, south, east, west }

String arrow(Direction d) => switch (d) {
  Direction.north => '↑',
  Direction.south => '↓',
  Direction.east  => '→',
  Direction.west  => '←',
  // No default needed — enum is exhaustive!
};

// Compute values inline
double taxRate(String country) => switch (country) {
  'US'  => 0.08,
  'UK'  => 0.20,
  'DE'  => 0.19,
  'AU'  => 0.10,
  _     => 0.0,
};
```

### switch with Guards (`when`)

```dart
int n = 42;

switch (n) {
  case int x when x < 0:
    print('Negative: $x');
  case 0:
    print('Zero');
  case int x when x.isEven:
    print('Positive even: $x');   // 42 matches here
  case int x:
    print('Positive odd: $x');
}

// Guards in switch expressions
String category(int n) => switch (n) {
  < 0           => 'negative',
  0             => 'zero',
  int x when x.isEven && x < 100 => 'small even',
  int x when x.isOdd  && x < 100 => 'small odd',
  _             => 'large',
};
```

### switch with Type Patterns

```dart
Object value = 3.14;

switch (value) {
  case int n:    print('Integer: $n');
  case double d: print('Double: $d');    // matches here
  case String s: print('String: $s');
  case bool b:   print('Bool: $b');
  case null:     print('Null');
  case _:        print('Other: $value');
}

// Type pattern + destructure (very powerful)
void describe(Object shape) {
  switch (shape) {
    case Circle(radius: var r) when r > 10:
      print('Big circle, r=$r');
    case Circle(radius: var r):
      print('Small circle, r=$r');
    case Rectangle(width: var w, height: var h):
      print('Rect ${w}x${h}');
    case _:
      print('Unknown shape');
  }
}
```

### Exhaustive switch on sealed classes

```dart
sealed class PaymentResult {}
class PaymentSuccess extends PaymentResult { final String txId; PaymentSuccess(this.txId); }
class PaymentFailed  extends PaymentResult { final String reason; PaymentFailed(this.reason); }
class PaymentPending extends PaymentResult { final DateTime eta; PaymentPending(this.eta); }

// Dart verifies ALL subclasses are handled — no default needed
String message(PaymentResult r) => switch (r) {
  PaymentSuccess(txId: var id)   => 'Paid! Transaction: $id',
  PaymentFailed(reason: var why) => 'Failed: $why',
  PaymentPending(eta: var when)  => 'Pending until $when',
};

// Add a new subclass → compiler error here → you can't miss it ✅
```

---

## for Loops

```dart
// Classic C-style for
for (int i = 0; i < 5; i++) {
  print(i); // 0 1 2 3 4
}

// Multiple variables
for (int i = 0, j = 10; i < j; i++, j--) {
  print('i=$i j=$j');
}

// for-in — iterate any Iterable
var fruits = ['apple', 'banana', 'cherry'];
for (var fruit in fruits) {
  print(fruit);
}

// for-in with index (Dart 3 — .indexed)
for (var (i, fruit) in fruits.indexed) {
  print('$i: $fruit');
}
// 0: apple  1: banana  2: cherry

// forEach — concise, but no break/continue
fruits.forEach(print);          // just print
fruits.forEach((f) => print(f.toUpperCase()));

// When you need break/continue → use for-in, not forEach
for (var fruit in fruits) {
  if (fruit == 'banana') continue;  // skip banana
  print(fruit);
}
```

### Iterating Maps

```dart
var scores = {'Alice': 95, 'Bob': 82, 'Carol': 78};

// Entries
for (var entry in scores.entries) {
  print('${entry.key}: ${entry.value}');
}

// Destructured (Dart 3)
for (var MapEntry(key: name, value: score) in scores.entries) {
  print('$name scored $score');
}

// Keys only / values only
for (var name in scores.keys)   { print(name); }
for (var score in scores.values){ print(score); }
```

---

## while & do-while

```dart
// while — condition BEFORE body (may never run)
int i = 0;
while (i < 5) {
  print(i++);
}

// do-while — condition AFTER body (runs at least once)
int attempts = 0;
bool connected = false;
do {
  connected = tryConnect();
  attempts++;
} while (!connected && attempts < 3);
print(connected ? 'Connected!' : 'Gave up after $attempts attempts');

// Classic event loop pattern
while (true) {
  var command = readCommand();
  if (command == 'exit') break;
  execute(command);
}
```

---

## break & continue

```dart
// break — exit the nearest enclosing loop or switch
for (var i = 0; i < 100; i++) {
  if (i * i > 50) {
    print('First i where i² > 50 is $i');
    break;
  }
}

// continue — skip rest of body, go to next iteration
var sum = 0;
for (var i = 1; i <= 10; i++) {
  if (i % 3 == 0) continue; // skip multiples of 3
  sum += i;
}
print(sum); // 1+2+4+5+7+8+10 = 37
```

### Labelled break / continue

Used to jump out of **nested** loops — use sparingly; extracting to a function is usually cleaner.

```dart
// continue outer — skip to next i without completing inner loop
outerLoop:
for (var i = 0; i < 4; i++) {
  for (var j = 0; j < 4; j++) {
    if (j == 2) continue outerLoop;
    print('($i, $j)');
  }
}
// (0,0) (0,1)  (1,0) (1,1)  (2,0) (2,1)  (3,0) (3,1)

// break outer — exit both loops entirely
search:
for (var row = 0; row < matrix.length; row++) {
  for (var col = 0; col < matrix[row].length; col++) {
    if (matrix[row][col] == target) {
      print('Found at ($row, $col)');
      break search;
    }
  }
}

// ✅ Cleaner alternative — extract to a function and use return
(int, int)? findInMatrix(List<List<int>> m, int target) {
  for (var r = 0; r < m.length; r++) {
    for (var c = 0; c < m[r].length; c++) {
      if (m[r][c] == target) return (r, c);
    }
  }
  return null;
}
```

---

## assert

Asserts enforce **developer invariants** in debug mode. They compile out completely in production (AOT/release builds).

```dart
int divide(int a, int b) {
  assert(b != 0, 'Divisor b must not be zero');
  return a ~/ b;
}

// Assert expressions can be complex
void setAge(int age) {
  assert(age >= 0 && age <= 150, 'Age $age is not realistic');
  _age = age;
}

// Assert in constructors (via initializer list)
class PositiveValue {
  final int value;
  PositiveValue(this.value) : assert(value > 0, 'Must be positive, got $value');
}

// Enable in debug runs:
// dart run --enable-asserts app.dart
// Flutter debug mode always has assertions enabled.
// Never rely on asserts for production validation — use ArgumentError instead.
```

---

## if-case (Dart 3)

Combines a type/structure check with binding — cleaner than `is` + cast:

```dart
Object response = {'status': 200, 'body': 'Hello'};

// Destructure and bind in one step
if (response case {'status': 200, 'body': String body}) {
  print('Success: $body');
} else if (response case {'status': int code, 'error': String msg}) {
  print('HTTP $code: $msg');
} else {
  print('Unexpected response format');
}

// With type patterns
dynamic json = fetchSomething();
if (json case List<dynamic> items when items.isNotEmpty) {
  print('Got ${items.length} items, first: ${items.first}');
}

// Very clean for unwrapping sealed classes
if (result case Ok(value: var data)) {
  renderData(data);
}
```

---

## Loops with Async

### Sequential async iteration

```dart
// await for — iterate a Stream one event at a time
Stream<String> readLines(String path) async* {
  final file = File(path);
  await for (var line in file.openRead().transform(utf8.decoder).transform(LineSplitter())) {
    yield line;
  }
}

Future<void> main() async {
  await for (var line in readLines('data.txt')) {
    print(line);
  }
  print('Done reading');
}
```

### Sequential vs parallel async loops

```dart
// Sequential — waits for each before starting next (safe, slow)
Future<void> sequential(List<String> urls) async {
  for (var url in urls) {
    var data = await fetch(url); // each awaited in turn
    process(data);
  }
}

// Parallel — all requests fire at once (fast, but watch concurrency limits)
Future<void> parallel(List<String> urls) async {
  var results = await Future.wait(urls.map(fetch));
  results.forEach(process);
}

// Controlled concurrency — N at a time
Future<void> batched(List<String> urls, {int batchSize = 5}) async {
  for (var i = 0; i < urls.length; i += batchSize) {
    var batch = urls.sublist(i, (i + batchSize).clamp(0, urls.length));
    var results = await Future.wait(batch.map(fetch));
    results.forEach(process);
  }
}
```

---

## Summary

| Construct | Syntax | Notes |
|-----------|--------|-------|
| Conditional | `if (cond) { } else { }` | Always use braces |
| Ternary | `cond ? a : b` | One level deep only |
| Classic switch | `switch (x) { case v: break; }` | Needs `break` |
| Dart 3 switch stmt | `switch (x) { case v: }` | No `break` needed |
| Switch expression | `switch (x) { v => expr, }` | Returns a value |
| Guard clause | `case T x when x > 0:` | Filter within a case |
| Classic for | `for (int i = 0; i < n; i++)` | Full control |
| for-in | `for (var x in iterable)` | Clean iteration |
| Indexed for-in | `for (var (i, x) in list.indexed)` | Dart 3 |
| while | `while (cond) { }` | Check-before |
| do-while | `do { } while (cond)` | Check-after, runs once |
| break | `break;` / `break label;` | Exit loop/switch |
| continue | `continue;` / `continue label;` | Next iteration |
| assert | `assert(cond, 'msg')` | Debug-only invariant |
| if-case | `if (x case Pattern p)` | Match + bind, Dart 3 |
| await for | `await for (var x in stream)` | Async stream loop |
