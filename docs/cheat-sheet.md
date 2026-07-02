---
sidebar_position: 24
title: Cheat Sheet
description: Quick reference guide for Dart syntax, operators, collections, classes, null safety, async programming, and CLI commands.
---

> Quick reference for everything. Bookmark this page.

---

## Variables & Types

```dart
// Declaration
var name    = 'Alice';        // inferred type, mutable
final age   = 30;             // set once at runtime
const pi    = 3.14159;        // compile-time constant
late String email;            // non-null, initialized before use
dynamic val = 42;             // no type checking — avoid

// Types
int     n = 42;
double  d = 3.14;
num     x = 42;               // int or double
String  s = 'hello';
bool    b = true;
List<int>         list = [1, 2, 3];
Set<String>       set  = {'a', 'b'};
Map<String, int>  map  = {'x': 1};

// Null safety
String?  nullable = null;     // can be null
String   required = 'hello';  // CANNOT be null
```

---

## String Tricks

```dart
var name = 'Dart';
'Hello, $name!'               // interpolation
'Result: ${2 + 2}'           // expression
r'raw\nstring'               // raw (no escapes)
'''multi
line'''                       // triple quotes
'Hello ' 'World'              // adjacent = concat

// Common methods
s.length         s.isEmpty        s.isNotEmpty
s.toUpperCase()  s.toLowerCase()  s.trim()
s.contains('x')  s.startsWith('x') s.endsWith('x')
s.replaceAll('a', 'b')        s.split(',')
s.substring(0, 5)             s.indexOf('x')
s.padLeft(10, '0')            s.padRight(10)
int.parse(s)     double.parse(s)  s.toString()
```

---

## Operators

```dart
// Arithmetic
+   -   *   /    ~/   %       // ~/ is integer division

// Assignment
=   +=  -=  *=   /=   ??=    // ??= only assigns if null

// Comparison
==  !=  <   >    <=   >=

// Logical
&&  ||  !                     // short-circuit

// Null-aware
x ?? y        // y if x is null
x?.member     // null if x is null
x!            // assert non-null (throws if null)
x ??= y       // assign y to x only if x is null

// Type
x is T        // true if x is type T
x is! T       // true if x is NOT type T
x as T        // cast (throws if wrong)

// Cascade
obj..a = 1..b()..c = 2       // chain calls on same object
obj?..method()               // null-safe cascade

// Spread
[...list1, ...list2]         // combine lists
{...map1, ...map2}           // merge maps (right wins)
[...?nullableList]           // null-safe spread
```

---

## Collections

```dart
// List
var list = <int>[1, 2, 3];
list.add(4);  list.addAll([5,6]);  list.remove(1);
list.removeAt(0);  list.removeWhere((n) => n > 3);
list[0] = 99;  list.length;  list.isEmpty;
list.contains(2);  list.indexOf(2);
list.sort();  list.reversed.toList();
list.sublist(1, 3);  list.join(', ');

// Transformation
list.map((n) => n * 2).toList()
list.where((n) => n.isEven).toList()
list.reduce((a, b) => a + b)
list.fold(0, (acc, n) => acc + n)
list.expand((n) => [n, n]).toList()
list.any((n) => n > 5)
list.every((n) => n > 0)
list.firstWhere((n) => n > 2)
list.whereType<String>().toList()  // filter by type
list.take(3).toList()  list.skip(2).toList()

// Set
var set = <String>{'a', 'b', 'c'};
set.add('d');  set.remove('a');  set.contains('b');
set.union(other);  set.intersection(other);  set.difference(other);

// Map
var map = <String, int>{'a': 1};
map['key'] = 2;   map['key'];         // null if missing
map.remove('key');
map.containsKey('k');  map.containsValue(1);
map.putIfAbsent('k', () => 0);
map.update('k', (v) => v + 1, ifAbsent: () => 1);
for (var e in map.entries) { e.key; e.value; }
map.keys.toList();  map.values.toList();
map.map((k, v) => MapEntry(k, v * 2));

// Collection control
[1, if (cond) 2, 3]              // collection-if
[1, if (cond) 2 else 9, 3]       // with else
[for (var i in list) i * 2]      // collection-for
```

---

## Functions

```dart
// Declaration
int add(int a, int b) => a + b;   // arrow
int add(int a, int b) { return a + b; }  // block

// Named parameters
void fn({required String a, int b = 0, String? c}) {}
fn(a: 'x');   fn(a: 'x', b: 2, c: 'y');

// Optional positional
void fn(String a, [int b = 0, String? c]) {}
fn('x');  fn('x', 2);  fn('x', 2, 'y');

// Anonymous
var fn = (int x) => x * 2;
var fn = (int x) { return x * 2; };

// First-class
void apply(int Function(int) fn, int x) => fn(x);
Function makeAdder(int n) => (int x) => x + n;

// Generators
Iterable<int> fn() sync*  { yield 1; yield* other; }
Stream<int>   fn() async* { yield 1; await Future.delayed(...); }
```

---

## Control Flow

```dart
// if / else
if (x > 0) { } else if (x < 0) { } else { }

// switch (Dart 3)
switch (value) {
  case 1 || 2:          print('one or two');
  case int n when n > 5: print('big: $n');
  case String s:         print('string: $s');
  case _:                print('other');
}

// switch expression
var label = switch (n) { 1 => 'one', 2 => 'two', _ => 'other' };

// if-case (Dart 3)
if (value case {'key': String s}) { print(s); }

// Loops
for (var i = 0; i < 10; i++) { }
for (var item in list) { }
while (cond) { }
do { } while (cond);
list.forEach((item) => print(item));  // no break/continue

// Jump
break;              // exit loop/switch
continue;           // next iteration
outer: for (...) {  // labeled break/continue
  for (...) { break outer; }
}
```

---

## Classes

```dart
class Animal {
  // Fields
  final String name;     // public
  int _age;              // private (library-level)
  late String nickname;  // set later

  // Constructor (initializing formals)
  Animal(this.name, this._age);

  // Named constructor
  Animal.unnamed() : name = 'Unknown', _age = 0;

  // Getters & setters
  int get age => _age;
  set age(int v) { if (v >= 0) _age = v; }
  String get display => '$name ($age)';

  // Methods
  void speak() => print('...');

  // Static
  static int count = 0;
  static void reset() => count = 0;

  @override String toString() => 'Animal($name)';
  @override bool operator ==(Object o) => o is Animal && name == o.name;
  @override int get hashCode => name.hashCode;
}

// Inheritance
class Dog extends Animal {
  Dog(String name) : super(name, 0);

  @override
  void speak() => print('$name: Woof!');
}

// Implements (interface)
class Robot implements Animal { /* must implement all */ }

// Abstract class
abstract class Shape {
  double get area;      // must implement
  void draw() { }       // optional to override
}

// Sealed class (Dart 3)
sealed class Result<T> {}
class Ok<T>  extends Result<T> { final T value; Ok(this.value); }
class Err<T> extends Result<T> { final String msg; Err(this.msg); }
```

---

## Constructors

```dart
class Point {
  final double x, y;

  // Default
  Point(this.x, this.y);

  // Named
  Point.origin() : x = 0, y = 0;
  Point.onX(double x) : x = x, y = 0;

  // Redirecting
  Point.unit() : this(1, 0);

  // Factory
  factory Point.fromJson(Map json) => Point(json['x'], json['y']);
  factory Point.fromList(List l) => Point(l[0], l[1]);

  // Const
  const Point.zero() : x = 0, y = 0;

  // Initializer list with assert
  Point.positive(this.x, this.y) : assert(x > 0 && y > 0);
}
```

---

## Enums

```dart
// Basic
enum Direction { north, south, east, west }
Direction.north.name;    // 'north'
Direction.north.index;   // 0
Direction.values;        // all values
Direction.values.byName('east'); // Direction.east

// Enhanced (Dart 2.17+)
enum Planet {
  earth(5.976e+24, 6.37814e6),
  mars(6.421e+23, 3.3972e6);

  final double mass, radius;
  const Planet(this.mass, this.radius);

  double get gravity => 6.674e-11 * mass / (radius * radius);
}
Planet.earth.gravity;   // ~9.8
```

---

## Records (Dart 3)

```dart
// Create
var point    = (3.0, 4.0);            // positional
var person   = (name: 'Alice', age: 30); // named
var mixed    = (42, name: 'Dart');    // both

// Access
point.$1;  point.$2;         // positional fields
person.name;  person.age;    // named fields

// Type annotation
(double, double) coords = (3.0, 4.0);
({String name, int age}) user = (name: 'Bob', age: 25);

// Destructuring
var (x, y)          = (1, 2);
var (:name, :age)   = (name: 'Carol', age: 25);
var (a, _, c)       = (1, 2, 3);   // ignore middle

// Return multiple values
(String, int) parse(String s) { ... }
var (name, age) = parse('Alice:30');

// Swap
(a, b) = (b, a);

// Typedef
typedef Point = (double x, double y);
```

---

## Pattern Matching (Dart 3)

```dart
// switch statement patterns
switch (value) {
  case 0:                      // literal
  case int n when n < 0:       // type + guard
  case String s:               // type
  case [var first, ...]:       // list
  case {'key': var v}:         // map
  case (int x, int y):         // record
  case Circle(radius: var r):  // object
  case _:                      // wildcard
}

// switch expression
var result = switch (shape) {
  Circle(:var radius)        => pi * radius * radius,
  Rectangle(:var width, :var height) => width * height,
};

// if-case
if (json case {'name': String name, 'age': int age}) {
  print('$name is $age');
}

// Destructure in for loop
for (var (i, v) in list.indexed) { }
for (var (:name, :score) in records) { }
```

---

## Null Safety

```dart
String  nonNull  = 'hello';    // never null
String? nullable = null;       // can be null

nullable?.length               // null if null
nullable ?? 'default'          // fallback if null
nullable!                      // assert non-null (⚠️ throws if null)
nullable ??= 'default'         // assign if null

// Type promotion
if (x != null) { x.length; }  // x promoted to String
if (x is String) { x.length; }// x promoted to String

// Patterns (Dart 3)
switch (x) {
  case null:     print('null');
  case String s: print(s.length);
}
```

---

## Async / Await

```dart
// Async function
Future<String> fetch() async {
  var data = await apiCall();      // wait for Future
  return data['name'];
}

// Error handling
try {
  var result = await fetch();
} on NetworkException catch (e) {
  print(e.message);
} catch (e, stack) {
  print('$e\n$stack');
} finally {
  cleanup();
}

// Parallel
var results = await Future.wait([f1, f2, f3]);
var fastest = await Future.any([f1, f2, f3]);

// Stream
Stream<int> count() async* { yield 1; yield 2; yield 3; }
await for (var n in count()) { print(n); }
count().listen((n) => print(n), onError: (e) => ..., onDone: () => ...);

// Timeout
await fetch().timeout(Duration(seconds: 5), onTimeout: () => 'default');

// Timer
Timer(Duration(seconds: 1), callback);      // once
Timer.periodic(Duration(seconds: 1), (_) => tick());  // repeating

// Isolates (true parallelism)
var result = await Isolate.run(() => heavyWork());
```

---

## Exception Handling

```dart
// Throw
throw Exception('message');
throw ArgumentError.value(val, 'param', 'reason');
throw StateError('bad state');

// Catch
try { ... }
on SpecificException catch (e) { }   // specific type
catch (e, stack) { }                 // any + stack trace
finally { }                          // always runs

rethrow;                             // re-throw, preserves stack

// Custom exception
class AppException implements Exception {
  final String message;
  AppException(this.message);
  @override String toString() => 'AppException: $message';
}
```

---

## Generics

```dart
// Generic class
class Box<T> {
  T value;
  Box(this.value);
}
var intBox = Box(42);    // Box<int>
var strBox = Box('hi');  // Box<String>

// Generic method
T first<T>(List<T> list) => list.first;
List<R> mapList<T, R>(List<T> list, R Function(T) fn) =>
    list.map(fn).toList();

// Bounded
T max<T extends Comparable<T>>(T a, T b) =>
    a.compareTo(b) >= 0 ? a : b;

// Common usages
Future<T>          // async that returns T
Stream<T>          // async sequence of T
List<T>            // typed list
Map<K, V>          // typed map
```

---

## Extensions

```dart
extension StringExt on String {
  bool get isEmail    => contains('@') && contains('.');
  bool get isBlank    => trim().isEmpty;
  String capitalize() => isEmpty ? this : this[0].toUpperCase() + substring(1);
  String truncate(int n) => length <= n ? this : '${substring(0, n)}...';
}

extension IntExt on int {
  Duration get seconds => Duration(seconds: this);
  Duration get ms      => Duration(milliseconds: this);
  List<int> get range => List.generate(this, (i) => i);
}

// Usage (no import needed in same library)
'alice@example.com'.isEmail  // true
5.seconds                    // Duration(seconds: 5)
10.range                     // [0,1,2,...,9]

// Extension type (Dart 3) — zero-cost wrapper
extension type UserId(int id) { bool get isValid => id > 0; }
```

---

## Mixins

```dart
mixin Loggable {
  void log(String msg) => print('[${runtimeType}] $msg');
}

mixin Serializable {
  Map<String, dynamic> toJson();
  String toJsonString() => jsonEncode(toJson());
}

// on clause — restrict to subclasses
mixin Flying on Animal {
  void fly() { breathe(); print('$name flies!'); }
}

// Apply multiple
class Duck extends Animal with Flying, Loggable {
  @override Map<String, dynamic> toJson() => {'name': name};
}

// mixin class (Dart 3) — use as mixin OR standalone class
mixin class Logger {
  void log(String msg) => print(msg);
}
var l = Logger();       // as class
class S with Logger { } // as mixin
```

---

## Useful dart: Libraries

```dart
import 'dart:math';
sqrt(16);  pow(2, 10);  pi;  e;
Random().nextInt(100);
Random().nextDouble();
min(3, 5);  max(3, 5);

import 'dart:convert';
jsonEncode({'key': 'value'});    // → '{"key":"value"}'
jsonDecode('{"key":"value"}');   // → Map
base64Encode(bytes);
base64Decode(str);
utf8.encode('hello');
utf8.decode(bytes);

import 'dart:io';
File('path.txt').readAsStringSync();
File('path.txt').writeAsStringSync('data');
await File('path.txt').readAsString();
Directory.current;
Platform.isAndroid;  Platform.isIOS;

import 'dart:async';
Future.value(42);
Future.delayed(Duration(seconds: 1), () => 'done');
Future.wait([f1, f2]);
StreamController<int>();
Timer(Duration(seconds: 1), callback);

import 'dart:collection';
Queue<int>()..addFirst(1)..addLast(2);
LinkedHashMap<String, int>();   // ordered
SplayTreeMap<String, int>();    // sorted
```

---

## Common Patterns

```dart
// copyWith (immutable update)
class User {
  final String name;
  final int age;
  const User(this.name, this.age);
  User copyWith({String? name, int? age}) =>
      User(name ?? this.name, age ?? this.age);
}
var updated = user.copyWith(age: 31);

// fromJson / toJson
factory User.fromJson(Map<String, dynamic> j) =>
    User(j['name'] as String, j['age'] as int);
Map<String, dynamic> toJson() => {'name': name, 'age': age};

// Singleton
class AppConfig {
  static final _i = AppConfig._();
  factory AppConfig() => _i;
  AppConfig._();
}

// Result type
sealed class Result<T> {}
class Ok<T>  extends Result<T> { final T value; Ok(this.value); }
class Err<T> extends Result<T> { final String msg; Err(this.msg); }

// Retry
Future<T> retry<T>(Future<T> Function() fn, {int tries = 3}) async {
  for (var i = 0; i < tries; i++) {
    try { return await fn(); }
    catch (e) { if (i == tries - 1) rethrow; }
  }
  throw StateError('unreachable');
}

// Memoize
final _cache = <int, int>{};
int fib(int n) => n <= 1 ? n : (_cache[n] ??= fib(n-1) + fib(n-2));

// Partition list
var evens = nums.where((n) => n.isEven).toList();
var odds  = nums.where((n) => n.isOdd).toList();

// Flatten
var flat = nested.expand((l) => l).toList();

// Zip → Map
var map = Map.fromIterables(keys, values);

// Group by
var grouped = items.fold<Map<String, List<Item>>>(
  {},
  (acc, item) => acc..putIfAbsent(item.key, () => []).add(item),
);
```

---

## Flutter Quick Reference

```dart
// Always use const widgets
const Text('Hello')
const SizedBox(height: 16)
const EdgeInsets.all(16)

// copyWith for state updates
state.copyWith(loading: false, data: result)

// Build pattern for async state
switch (state) {
  Loading()      => CircularProgressIndicator(),
  Data(:var val) => Text('$val'),
  Error(:var msg)=> Text('Error: $msg'),
}

// Check mounted after await
Future<void> load() async {
  await heavyWork();
  if (!mounted) return;      // Always do this
  setState(() { _data = result; });
}

// Extension on BuildContext
context.theme.colorScheme.primary
context.push(NextPage())
context.showSnack('Saved!')

// Key types
Key('unique')           // value key
ValueKey(id)            // typed value key
GlobalKey()             // access widget across tree
```

---

## dart CLI Commands

```bash
dart run                    # run bin/main.dart
dart run lib/file.dart      # run specific file
dart test                   # run tests
dart format .               # format all files
dart analyze                # static analysis
dart compile exe bin/app.dart -o app  # compile to native
dart compile js bin/app.dart -o app.js # compile to JS
dart pub get                # install deps
dart pub upgrade            # upgrade deps
dart pub add http           # add package
dart pub outdated           # check for updates
dart fix --apply            # auto-fix lint warnings
dart doc                    # generate docs
```

---

## Type Quick Reference

```
Object           ← base of all non-null types
├── num
│   ├── int      ← whole numbers
│   └── double   ← floating point
├── String
├── bool
├── List<E>
├── Set<E>
├── Map<K,V>
├── Function
├── Record
└── Null         ← only 'null' has this type

T                → non-nullable T
T?               → nullable T (T or null)
dynamic          → opt out of type system
Never            → function never returns
Object?          → anything including null
void             → intentionally discarding value
```

---

## Lint / Analysis

```yaml
# analysis_options.yaml
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    prefer_const_constructors: true
    prefer_final_fields: true
    prefer_final_locals: true
    avoid_print: true
    prefer_single_quotes: true
    sort_pub_dependencies: true
    always_use_package_imports: true

analyzer:
  errors:
    missing_required_param: error
    dead_code: warning
  exclude:
    - '**/*.g.dart'
    - '**/*.freezed.dart'
```

---

## Golden Rules 🏆

1. **Prefer `final` over `var`** — immutability by default
2. **Use `const` everywhere in Flutter** — fewer rebuilds
3. **Never use `dynamic`** — use generics or sealed classes
4. **Handle nulls explicitly** — no `!` unless you're 100% certain
5. **Await every Future** — missing `await` is a very common bug
6. **Check `mounted` after every `await` in StatefulWidgets**
7. **Use `sealed` classes for exhaustive switching**
8. **Prefer `whereType<T>()` over `cast<T>()`** — safe filtering
9. **Use named parameters for 3+ arguments** — readability
10. **Run `dart analyze` before every commit**
