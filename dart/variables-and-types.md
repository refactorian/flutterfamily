---
sidebar_position: 2
title: Variables & Types
description: var, final, const, type system, type inference, and built-in types in Dart.
---

---

## Declaring Variables

Dart gives you several ways to declare variables:

```dart
// var — type inferred, mutable
var name = 'Alice';
var age = 30;
var height = 5.9;

// Explicit type — same as above but more verbose
String name = 'Alice';
int age = 30;
double height = 5.9;

// final — set once, cannot be reassigned
final city = 'Dhaka';
final int maxRetries = 3;

// const — compile-time constant
const pi = 3.14159;
const appName = 'MyApp';

// late — initialized later (but before use)
late String lazyValue;
lazyValue = 'initialized when needed';
print(lazyValue); // OK
```

### var vs final vs const

```dart
// var: can be reassigned
var x = 10;
x = 20;  // ✅ fine

// final: set once at runtime
final y = DateTime.now();  // runtime value — OK
// y = DateTime.now();     // ❌ compile error

// const: set once at compile time
const z = 42;              // must be a compile-time constant
// const now = DateTime.now(); // ❌ compile error — not a compile-time constant

// const propagates to its contents
const list = [1, 2, 3];   // list AND its elements are immutable
final list2 = [1, 2, 3];  // list2 cannot be reassigned, but items can be added
```

---

## Built-in Types

### Numbers

```dart
// int — whole numbers (64-bit)
int score = 100;
int hex = 0xFF;       // hexadecimal
int binary = 0b1010;  // binary
int million = 1_000_000; // underscores for readability (Dart 2.12+)

// double — floating point (64-bit IEEE 754)
double pi = 3.14159;
double scientific = 1.5e4;  // 15000.0
double negExp = 2.5e-3;     // 0.0025

// num — supertype of both int and double
num value = 42;
value = 3.14;  // OK — num can hold either

// Conversions
int a = 5;
double b = a.toDouble();  // 5.0
double c = 3.7;
int d = c.toInt();        // 3 (truncates, does NOT round)
int e = c.round();        // 4
int f = c.ceil();         // 4
int g = c.floor();        // 3

// Useful int/double properties
print(42.isEven);       // true
print(7.isOdd);         // true
print((-5).abs());      // 5
print(3.14.isFinite);   // true
print(double.infinity); // Infinity
print(double.nan);      // NaN
```

### Strings

```dart
// Single or double quotes — both work, be consistent
var s1 = 'hello';
var s2 = "world";

// Raw strings (no escape processing)
var path = r'C:\Users\name\file.txt';
var regex = r'\d+\.\d+';

// Multi-line strings (triple quotes)
var poem = '''
Roses are red,
Violets are blue,
Dart is awesome,
And Flutter is too!
''';

// String interpolation
var name = 'Dart';
var version = 3;
print('Hello, $name!');                // Hello, Dart!
print('Version: ${version + 1}');     // Version: 4
print('Uppercase: ${name.toUpperCase()}'); // Uppercase: DART

// Adjacent string literals are concatenated at compile time
var longString = 'Hello, '
    'this is a '
    'long string.';

// String methods
var s = '  Hello, World!  ';
print(s.trim());              // 'Hello, World!'
print(s.trimLeft());          // 'Hello, World!  '
print(s.toLowerCase());       // '  hello, world!  '
print(s.toUpperCase());       // '  HELLO, WORLD!  '
print(s.contains('World'));   // true
print(s.replaceAll('l', 'r')); // '  Herro, Worrd!  '
print(s.split(', '));         // ['  Hello', 'World!  ']
print(s.startsWith('  H'));   // true
print(s.endsWith('!  '));     // true
print(s.indexOf('World'));    // 8
print(s.length);              // 17
print(s[0]);                  // ' ' (character access)
print(s.substring(2, 7));     // 'Hello'
print(s.isEmpty);             // false
print(''.isEmpty);            // true
print('  '.trim().isEmpty);   // true

// String building (efficient for many concatenations)
var buffer = StringBuffer();
buffer.write('Hello');
buffer.write(', ');
buffer.writeln('World!');
print(buffer.toString()); // Hello, World!\n
```

### Booleans

```dart
bool isActive = true;
bool isDone = false;

// Boolean expressions
print(true && false);   // false
print(true || false);   // true
print(!true);           // false

// Dart is strict — no truthy/falsy like JavaScript!
// if (1) {}       // ❌ compile error
// if ('hello') {} // ❌ compile error
// if (null) {}    // ❌ compile error
if (1 == 1) {}   // ✅ must be an actual bool
```

### Symbols

```dart
// Symbols represent operator or identifier names
Symbol s = #hello;
Symbol operator = #operator;

// Mostly used with reflection / mirrors — rare in everyday code
```

---

## Type Inference

Dart's type inference is powerful — `var` is not "untyped":

```dart
var x = 42;        // Dart infers: int
var s = 'hello';   // Dart infers: String
var list = [1, 2, 3]; // Dart infers: List<int>
var map = {'a': 1};   // Dart infers: Map<String, int>

// The inferred type is fixed
var count = 0;
// count = 'hello';  // ❌ compile error — count is int

// Use dynamic to opt out of type checking (avoid when possible)
dynamic anything = 42;
anything = 'now a string';  // OK at runtime, but no compile-time checks
anything.nonExistentMethod(); // ❌ runtime error — not caught at compile time!
```

---

## Type Checking & Casting

```dart
Object obj = 'Hello';

// is — check type
print(obj is String);  // true
print(obj is int);     // false

// is! — check NOT type
print(obj is! int);    // true

// as — cast (throws if wrong type)
String str = obj as String;
// int num = obj as int;  // ❌ throws CastError at runtime

// Smart casts — after is check, Dart auto-casts in scope
if (obj is String) {
  print(obj.length);  // no cast needed — Dart knows it's String here
}

// Pattern-based type check (Dart 3)
switch (obj) {
  case String s:
    print('String: ${s.length}');
  case int n:
    print('Number: $n');
}
```

---

## The `Object` and `dynamic` Types

```dart
// Object — base class of everything (except null)
Object a = 42;
Object b = 'hello';
Object c = [1, 2, 3];

// Can only use Object's methods (toString, hashCode, ==, runtimeType)
print(a.toString());   // '42'
print(a.runtimeType);  // int

// dynamic — no type checking at all (escape hatch)
dynamic d = 42;
d = 'changed';
d = [1, 2, 3];
print(d.length);  // OK at runtime — but no IDE help, no compile checks

// Never — the bottom type (function that never returns)
Never throwError(String msg) => throw Exception(msg);
```

---

## Type Aliases (typedef)

```dart
// Simple type alias
typedef Name = String;
typedef Age = int;

Name firstName = 'Alice';
Age userAge = 30;

// Function type alias
typedef Comparator<T> = int Function(T a, T b);
typedef Callback = void Function(String event);
typedef JsonMap = Map<String, dynamic>;

// Usage
Callback onEvent = (event) => print('Event: $event');
JsonMap data = {'key': 'value', 'count': 42};

// Modern record alias (Dart 3)
typedef Point = (double x, double y);
Point origin = (0.0, 0.0);
```

---

## Constants in Depth

```dart
// const creates deeply immutable objects
const coordinates = [10, 20, 30]; // list is immutable!
// coordinates.add(40); // ❌ throws UnsupportedError at runtime
// coordinates[0] = 99; // ❌ throws UnsupportedError at runtime

// final list is reassign-proof but mutably contents
final mutableList = [10, 20, 30];
mutableList.add(40);   // ✅ OK
// mutableList = [];   // ❌ can't reassign

// const in class
class Circle {
  static const double pi = 3.14159;
  final double radius;
  const Circle(this.radius); // const constructor
}

const c = Circle(5.0); // creates a compile-time constant object
```

---

## Runes & Unicode

```dart
// Dart strings are sequences of UTF-16 code units
// Runes expose the full Unicode code points

var heart = '♥';
print(heart.runes.toList());  // [9829]
print(heart.codeUnitAt(0));   // 9829

// Emoji can be > 1 code unit
var emoji = '😀';
print(emoji.length);          // 2 (it's a surrogate pair!)
print(emoji.runes.length);    // 1 (one code point)

// Creating from code point
var arrow = String.fromCharCode(0x2192); // →
var smiley = String.fromCharCodes([0x1F600]); // 😀
```

---

## Summary

| Keyword | Use Case | Reassignable? | When set? |
|---------|----------|---------------|-----------|
| `var` | General use, type inferred | ✅ Yes | Anytime |
| `String`, `int` | Explicit typed variable | ✅ Yes | Anytime |
| `final` | Set once | ❌ No | Runtime |
| `const` | Compile-time constant | ❌ No | Compile time |
| `late` | Lazy init / non-null set later | ✅ (if not final) | Before first use |
| `dynamic` | Opt out of type system | ✅ Yes | Anytime |
