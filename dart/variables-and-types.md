---
sidebar_position: 2
title: Variables & Types
description: var, final, const, type system, type inference, and built-in types in Dart.
---

Dart's type system is **sound** — the compiler guarantees that a variable of type `String` always holds a `String`. This catches entire categories of bugs before your code ever runs.

---

## Variable Declaration Keywords

```dart
// var — mutable, type inferred from initializer
var name    = 'Alice';    // inferred: String
var count   = 0;          // inferred: int
var ratio   = 3.14;       // inferred: double
var active  = true;       // inferred: bool
var items   = [1, 2, 3];  // inferred: List<int>

// Explicit type annotation — same as var, but self-documenting
String  name   = 'Alice';
int     count  = 0;
double  ratio  = 3.14;
List<int> ids  = [];

// final — assigned once, cannot be reassigned (runtime value OK)
final city      = 'Dhaka';
final timestamp = DateTime.now();    // ✅ runtime value
final items     = <String>[];        // list ref is final, contents mutable

// const — compile-time constant (value must be known at compile time)
const pi      = 3.14159265358979;
const appName = 'MyApp';
const timeout = Duration(seconds: 30);
// const now = DateTime.now(); // ❌ not a compile-time constant

// late — non-nullable, initialized before first use
late String email;                   // set manually before reading
late final String initials;          // set once, then immutable
late final int expensiveResult = _compute(); // lazy — computed on first access
```

### The `var` vs `final` vs `const` Decision

```dart
//  Ask yourself:
//
//  Will this ever be reassigned?
//  ├── No  →  Will its value be known at compile time?
//  │          ├── Yes  →  const
//  │          └── No   →  final
//  └── Yes →  var  (or explicit type)

// ✅ Prefer final over var — signals intent
final url  = 'https://api.example.com';   // never reassigned
var  retry = 0;                            // incremented in loop

// const propagates deeply — both the reference AND contents are frozen
const config = {'host': 'localhost', 'port': 8080};
// config['host'] = 'other'; // ❌ UnsupportedError at runtime

// final reference, mutable contents
final cache = <String, int>{};
cache['key'] = 42;  // ✅ mutating the map is fine
// cache = {};       // ❌ can't reassign the reference
```

---

## Numbers

### int

```dart
// 64-bit signed integer on all platforms
int score   = 100;
int negScore = -42;
int hex     = 0xFF;          // 255 — hexadecimal literal
int octal   = 0o77;          // 63  — octal literal (Dart 3+)
int binary  = 0b1010_1010;   // 170 — binary with separator
int million = 1_000_000;     // underscores improve readability

// Arithmetic
print(10 ~/ 3);   // 3  — integer division (unique Dart operator)
print(10 % 3);    // 1  — modulo / remainder
print(2.pow(10)); // doesn't exist — use dart:math pow()
import 'dart:math';
print(pow(2, 10)); // 1024

// int properties & methods
print(42.isEven);           // true
print(7.isOdd);             // true
print((-5).abs());          // 5
print(255.toRadixString(16)); // ff
print(255.toRadixString(2));  // 11111111
print(int.parse('42'));        // 42
print(int.parse('FF', radix: 16)); // 255
print(int.tryParse('abc'));    // null — safe parse
```

### double

```dart
double pi         = 3.14159265358979;
double scientific = 1.5e4;   // 15000.0
double negExp     = 2.5e-3;  // 0.0025
double inf        = double.infinity;
double nan        = double.nan;

// Special values
print(double.infinity.isInfinite);  // true
print(double.nan.isNaN);            // true
print((1.0).isFinite);              // true

// Rounding
double n = 3.7;
print(n.round());       // 4   — nearest integer
print(n.ceil());        // 4   — round up
print(n.floor());       // 3   — round down
print(n.truncate());    // 3   — toward zero (same as toInt())
print(n.toInt());       // 3   — truncates, never rounds

// Formatting — always use toStringAsFixed for display
print(3.14159.toStringAsFixed(2));  // 3.14
print(12345.6789.toStringAsFixed(1)); // 12345.7

// Precision warning — floating point is not exact
print(0.1 + 0.2);               // 0.30000000000000004 !!
print(0.1 + 0.2 == 0.3);        // false !!
print((0.1 + 0.2 - 0.3).abs() < 1e-10); // ✅ correct comparison
```

### num — the common supertype

```dart
num x = 42;     // holds int
x = 3.14;       // holds double — both are fine
print(x is int);     // false (it's a double now)
print(x is double);  // true

// Useful when a function should accept both
num add(num a, num b) => a + b;
print(add(3, 4));     // 7   (int)
print(add(3.5, 4.5)); // 8.0 (double)
```

---

## Strings

### Creation & Literals

```dart
// Single or double quotes — pick one and be consistent
var s1 = 'hello, world';
var s2 = "hello, world";   // identical

// Escape sequences
print('Tab:\there');           // Tab:	here
print('Newline:\nhere');        // Newline: (new line) here
print('Quote: \'hi\'');        // Quote: 'hi'
print('Backslash: \\');        // Backslash: \
print('Unicode: \u{1F600}');   // Unicode: 😀
print('Hex: \x41');            // Hex: A

// Raw strings — backslashes are literal
var path  = r'C:\Users\Alice\Documents';    // no escape processing
var regex = r'^\d{3}-\d{4}$';              // regex stays readable

// Multi-line strings
var json = '''
{
  "name": "Alice",
  "age": 30
}
''';

var sql = """
  SELECT *
  FROM users
  WHERE active = true
""";

// Adjacent literals — compile-time concatenation (no + needed)
var message = 'Hello, '
    'this is a very long '
    'message split across lines.';
```

### String Interpolation

```dart
var name  = 'Dart';
var major = 3;
var list  = [1, 2, 3];

// Simple variable
print('Hello, $name!');                  // Hello, Dart!

// Expression (use ${})
print('Next version: ${major + 1}');    // Next version: 4
print('Upper: ${name.toUpperCase()}');  // Upper: DART
print('Length: ${list.length}');        // Length: 3
print('Sum: ${list.reduce((a,b)=>a+b)}'); // Sum: 6

// Nested interpolation
var items = ['a', 'b', 'c'];
print('Items: ${items.join(', ')}');    // Items: a, b, c

// Objects — uses toString()
var now = DateTime(2024, 1, 15);
print('Date: $now');                    // Date: 2024-01-15 00:00:00.000
```

### Essential String Methods

```dart
var s = '  Hello, World!  ';

// Whitespace
s.trim()               // 'Hello, World!'
s.trimLeft()           // 'Hello, World!  '
s.trimRight()          // '  Hello, World!'

// Case
s.toLowerCase()        // '  hello, world!  '
s.toUpperCase()        // '  HELLO, WORLD!  '

// Searching
s.contains('World')    // true
s.startsWith('  H')    // true
s.endsWith('!  ')      // true
s.indexOf('World')     // 8   (first occurrence)
s.lastIndexOf('l')     // 10  (last occurrence)
s.indexOf('xyz')       // -1  (not found)

// Slicing & splitting
s.substring(2, 7)      // 'Hello'
s.split(', ')          // ['  Hello', 'World!  ']
s.split('')            // list of individual characters
s.characters           // grapheme-aware iteration (package:characters)

// Replacing
s.replaceAll('l', 'r')           // '  Herro, Worrd!  '
s.replaceFirst('l', 'r')         // '  Herro, World!  '
s.replaceAllMapped(RegExp(r'\w+'), (m) => m.group(0)!.toUpperCase())

// Testing
s.isEmpty                        // false
''.isEmpty                       // true
'  '.trim().isEmpty              // true — blank check
s.length                         // 17 (code units, not graphemes)
s.codeUnitAt(2)                  // 72 ('H')
s[2]                             // 'H'

// Parsing
int.parse('42')                  // 42
int.tryParse('abc')              // null
double.parse('3.14')             // 3.14
double.tryParse('xyz')           // null
bool.tryParse('true')            // true (Dart 3.3+)

// Checking
RegExp(r'^\d+$').hasMatch('123') // true — all digits
```

### StringBuffer — Efficient Building

```dart
// String concatenation in a loop is O(n²) — avoid it
// Bad:
var result = '';
for (var i = 0; i < 1000; i++) result += 'item$i,'; // very slow

// Good: StringBuffer is O(n)
final buf = StringBuffer();
buf.write('Name: ');
buf.write('Alice');
buf.writeln();            // adds newline
buf.writeAll(['a', 'b', 'c'], ', '); // joins with separator
buf.writeln('Done');

print(buf.toString());
// Name: Alice
// a, b, c
// Done

print(buf.length);  // character count
buf.clear();        // reset
```

---

## Booleans

```dart
bool yes = true;
bool no  = false;

// Dart is strictly typed — no JavaScript-style truthiness
// if (1)        {} // ❌ compile error
// if ('string') {} // ❌ compile error
// if (null)     {} // ❌ compile error
// if ([])       {} // ❌ compile error

// Must use actual bool expressions
if (list.isNotEmpty) {}   // ✅
if (count > 0) {}         // ✅
if (name != null) {}      // ✅
if (flag)        {}       // ✅ — flag is already bool
```

---

## The Type Hierarchy

```
Object?                  ← top type — everything including null
├── Object               ← non-null base of all types
│   ├── num
│   │   ├── int
│   │   └── double
│   ├── String
│   ├── bool
│   ├── List<E>
│   ├── Set<E>
│   ├── Map<K,V>
│   ├── Function
│   ├── Record
│   └── ... (your classes)
├── Null                 ← only 'null' has this type
└── Never                ← bottom type — no values, never returns
```

### `Object?` vs `Object` vs `dynamic` vs `Never`

```dart
// Object? — literally anything: any value OR null
Object? anything = 42;
anything = 'hello';
anything = null;
anything = [1, 2, 3];
// Can only call: toString(), hashCode, ==, runtimeType

// Object — anything except null
Object nonNull = 42;
nonNull = 'hello';
// nonNull = null;  // ❌ compile error

// dynamic — opts OUT of type checking entirely
dynamic escape = 42;
escape = 'hello';
escape.anyMethod();   // ✅ compiles, might crash at runtime
escape.whatever;      // no IDE help, no compile error

// Never — the bottom type, no valid value exists
// A function returning Never NEVER returns normally
Never alwaysThrows(String msg) => throw ArgumentError(msg);
Never alwaysLoops() { while(true) {} }

// Never is useful for exhaustiveness
String classify(bool b) => switch (b) {
  true  => 'yes',
  false => 'no',
  // Never reached — but if b were dynamic, Never would signal that
};
```

---

## Type Inference in Depth

```dart
// Dart infers from the initializer
var x = 42;         // int
var y = 3.14;       // double
var z = x + y;      // double (int + double = double)
var w = 'hello';    // String
var b = x > 0;      // bool

// Inference works with generics too
var list = [1, 2, 3];        // List<int>
var map  = {'a': 1, 'b': 2}; // Map<String, int>
var set  = {1.0, 2.0};       // Set<double>

// Mixed lists — infers common supertype
var mixed  = [1, 2.0];       // List<num>
var mixed2 = [1, 'hello'];   // List<Object>
var mixed3 = [1, null];      // List<int?>

// The inferred type is FIXED after inference
var count = 0;
// count = 'three'; // ❌ compile error — count is int, not String

// Inference flows through expressions
final doubled = list.map((n) => n * 2); // Iterable<int> — inferred!
final first   = list.first;             // int — inferred!

// When inference needs help — use explicit type
final empty  = <String>[];              // must say String, can't infer from []
final result = <int, List<String>>{};   // complex — be explicit
```

---

## Type Promotion

Dart's flow analysis automatically narrows types within conditional blocks:

```dart
Object value = 'hello';

// After is check — promoted to String
if (value is String) {
  print(value.length);       // ✅ value is String here
  print(value.toUpperCase()); // ✅
}
// Back to Object here

// After null check — nullable promoted to non-nullable
String? name = getName();
if (name != null) {
  print(name.length); // ✅ name is String (non-nullable) here
}

// Early return promotes for the rest of the function
String process(String? input) {
  if (input == null) return 'empty';
  // input is String from here — no ! needed
  return input.trim().toUpperCase();
}

// Promotion does NOT work on class fields (thread-safety)
class Foo {
  String? name;

  void show() {
    if (name != null) {
      // name might be set to null by another thread between check and use
      print(name!.length); // ← need ! for fields (Dart won't promote them)
    }
    // Workaround: capture to local variable first
    final local = name;
    if (local != null) {
      print(local.length); // ✅ local variable IS promoted
    }
  }
}
```

---

## Runes & Unicode

```dart
// Dart strings are UTF-16 code unit sequences
// Most characters are 1 code unit; emoji are often 2 (surrogate pairs)

var hello = 'Hello';
print(hello.length);           // 5  — code units

var emoji = '😀';
print(emoji.length);           // 2  — surrogate pair (2 code units)
print(emoji.runes.length);     // 1  — one Unicode code point

// Runes — Unicode code points
for (var rune in '🎯Dart'.runes) {
  print('U+${rune.toRadixString(16).toUpperCase().padLeft(4,'0')}');
}
// U+1F3AF
// U+0044  (D)
// U+0061  (a)  etc.

// Create string from code points
var arrow  = String.fromCharCode(0x2192);     // →
var smiley = String.fromCharCodes([0x1F600]); // 😀
var dart   = String.fromCharCodes([68, 97, 114, 116]); // Dart

// Safe Unicode-aware iteration: use package:characters
// import 'package:characters/characters.dart';
// '😀hello'.characters.length  // 6 (not 7)
// '😀hello'.characters.first   // '😀'
```

---

## `typedef` — Type Aliases

```dart
// Simple aliases — improve readability
typedef UserId    = int;
typedef ProductId = String;
typedef JsonMap   = Map<String, dynamic>;

UserId    uid = 42;
ProductId pid = 'sku-001';
JsonMap   data = {'key': 'value'};

// Function type aliases
typedef Comparator<T>     = int Function(T a, T b);
typedef Predicate<T>      = bool Function(T value);
typedef Transformer<T, R> = R Function(T input);
typedef VoidCallback      = void Function();
typedef AsyncCallback     = Future<void> Function();

Predicate<int> isPositive = (n) => n > 0;
Transformer<String, int> strlen = (s) => s.length;

// Record type aliases (Dart 3)
typedef Point    = (double x, double y);
typedef Named<T> = ({String label, T value});

Point   origin = (0.0, 0.0);
Named<int> entry = (label: 'score', value: 100);
```

---

## Summary

| Keyword | Reassignable? | Value Timing | Null? |
|---------|:---:|---|:---:|
| `var` | ✅ | Runtime | Only if `?` |
| `final` | ❌ | Runtime | Only if `?` |
| `const` | ❌ | Compile time | ❌ Never |
| `late` | ✅* | Before first read | ❌ Never |
| `dynamic` | ✅ | Runtime | ✅ Yes |

| Type | Meaning |
|------|---------|
| `String` | Non-nullable String |
| `String?` | Nullable String (String or null) |
| `Object` | Any non-null value |
| `Object?` | Any value including null |
| `dynamic` | Any value, no type checking |
| `Never` | Function that never returns normally |
