---
sidebar_position: 13
title: Pattern Matching (Dart 3)
description: Patterns, switch expressions, guard clauses, and exhaustiveness checking in Dart 3.
---

Pattern matching is one of Dart 3's most powerful features. A pattern simultaneously **tests** a value's shape, **destructures** it into parts, and **binds** those parts to new variables — all in one expression.

---

## The Pattern Taxonomy

```
Patterns
├── Logical         or (||),  and (&&)
├── Relational      ==, !=, <, >, <=, >=
├── Cast            expr as Type
├── Null-check      pattern?
├── Null-assert     pattern!
├── Constant        42, 'hello', true, const Foo()
├── Variable        var x, final x, int x, _
├── Identifier      (bare name)
├── Wildcard        _
├── Parenthesized   (pattern)
├── Type            SomeType()
├── Object          ClassName(field: pattern, ...)
├── Record          (pattern, ...) / (name: pattern, ...)
├── List            [pattern, ..., ...rest]
├── Map             {'key': pattern, ...}
└── Declaration     var (a, b) = record;
```

---

## Constant & Literal Patterns

Match against exact compile-time values:

```dart
void describe(Object? value) {
  switch (value) {
    // Literal constants
    case null:       print('null');
    case true:       print('true');
    case false:      print('false');
    case 0:          print('zero');
    case 3.14:       print('pi');
    case 'hello':    print('greeting');

    // Named constants
    case double.infinity:   print('infinity');
    case double.nan:        print('NaN');
    case Colors.red:        print('red widget color');

    // Const expressions
    case const Duration(seconds: 1): print('one second');

    default: print('something else: $value');
  }
}
```

---

## Variable & Wildcard Patterns

Bind a matched value to a new variable:

```dart
// var — infers type
switch (value) {
  case var x: print('got $x');   // x has the same type as value
}

// Explicit type — also acts as a type check
switch (value) {
  case int x:    print('int: $x');
  case String x: print('String: $x');
}

// final — bound variable cannot be reassigned
switch (value) {
  case final int n: print(n);   // n is final int here
}

// Wildcard _ — match but don't bind
switch (point) {
  case (_, 0): print('on X axis');      // y is 0, x ignored
  case (0, _): print('on Y axis');      // x is 0, y ignored
  case (_, _): print('neither axis');
}

// Skip specific tuple positions
switch (rgb) {
  case (int r, _, int b): print('red=$r, blue=$b'); // green ignored
}
```

---

## Logical-Or Pattern (`||`)

Match if *any* sub-pattern matches:

```dart
// In switch
switch (shape) {
  case 'circle' || 'oval' || 'ellipse':
    print('round shape');
  case 'square' || 'rectangle' || 'rhombus':
    print('quadrilateral');
}

// With types
switch (value) {
  case int x || double x:    // matches either int or double
    print('number: $x');     // x is num (common supertype)
}

// In a list pattern
switch (list) {
  case [1, 2] || [2, 1]:
    print('contains 1 and 2 in some order');
}
```

---

## Logical-And Pattern (`&&`)

Match if *all* sub-patterns match (useful for binding + checking):

```dart
// Bind and check in one pattern
switch (value) {
  // Match a non-empty string AND bind it
  case String s && (!= ''):
    print('non-empty string: $s');

  // Match a positive int AND bind it
  case int n && (> 0):
    print('positive: $n');
}

// And with a guard (when) for complex conditions
switch (user) {
  case User(age: var age) && User(name: var name) when age >= 18:
    print('Adult: $name');
}
```

---

## Relational Patterns

Compare with `==`, `!=`, `<`, `>`, `<=`, `>=`:

```dart
// Pure relational (no variable binding)
switch (score) {
  case >= 90: print('A');
  case >= 80: print('B');
  case >= 70: print('C');
  case >= 60: print('D');
  case _:     print('F');
}

// Combined with logical-and to create ranges
switch (temperature) {
  case >= 100:             print('boiling');
  case (>= 37) && (< 100): print('hot');
  case (>= 20) && (< 37):  print('warm');
  case (>= 0)  && (< 20):  print('cool');
  case < 0:                print('freezing');
}

// Equality check (also a relational pattern)
switch (status) {
  case == 200: print('OK');
  case == 404: print('Not Found');
  case == 500: print('Server Error');
}
```

---

## Null-Check & Null-Assert Patterns

```dart
// Null-check pattern (?) — matches only if non-null, strips nullability
switch (nullableString) {
  case var s?:          // matches 'hello', does NOT match null
    print('Got: $s');   // s is String (not String?)
  case null:
    print('was null');
}

// In a list
switch (list) {
  case [var first?, var second?]:    // only if both are non-null
    print('Both present: $first, $second');
  case [_, _]:
    print('At least one is null');
}

// Null-assert pattern (!) — expects non-null, throws if null
// (Use sparingly — defeats null safety)
switch (map) {
  case {'key': var value!}:   // asserts value is non-null
    print(value);
}
```

---

## Cast Pattern (`as`)

Reinterpret the type of a matched value:

```dart
// In a record — one field needs a different type
switch (response) {
  case (int statusCode, var body as String):
    print('$statusCode: ${body.toUpperCase()}');
}

// In a map — cast the value type
switch (json) {
  case {'users': var users as List<dynamic>}:
    for (var user in users) { }
}
```

---

## Object Patterns

Match against a class instance and destructure its fields:

```dart
class Point {
  final double x, y;
  const Point(this.x, this.y);
}

class Circle {
  final Point center;
  final double radius;
  const Circle(this.center, this.radius);
}

// Basic object pattern
switch (shape) {
  case Circle(center: Point(x: 0, y: 0), radius: var r):
    print('Circle at origin, r=$r');

  case Circle(center: var c, radius: var r) when r > 100:
    print('Big circle at (${c.x}, ${c.y})');

  case Circle(:var center, :var radius):  // shorthand — field name = var name
    print('Circle at $center r=$radius');

  case Point(x: var x, y: var y):
    print('Point at ($x, $y)');
}

// Shorthand field extraction — :varName means field 'varName' → var varName
switch (user) {
  case User(:var name, :var email, age: var age):
    print('$name <$email> age $age');
}
```

---

## Record Patterns

```dart
// Positional records
var point = (3.0, 4.0);
switch (point) {
  case (0.0, 0.0):      print('origin');
  case (var x, 0.0):    print('on X axis at $x');
  case (0.0, var y):    print('on Y axis at $y');
  case (var x, var y):  print('at ($x, $y)');
}

// Named records
var person = (name: 'Alice', age: 30, active: true);
switch (person) {
  case (name: 'Alice', age: var age, active: true):
    print('Alice is $age and active');
  case (:var name, age: >= 18, active: _):
    print('$name is an adult');
  case (:var name, :var age, active: false):
    print('$name ($age) is inactive');
}

// Destructure in variable declaration
var (x, y)             = (10, 20);
var (:name, :age)      = (name: 'Bob', age: 25);
var (first, _, third)  = (1, 2, 3);   // skip middle

// Swap two variables elegantly
(x, y) = (y, x);
```

---

## List Patterns

```dart
void processCommand(List<String> args) {
  switch (args) {
    case []:
      print('No command');

    case ['help']:
      showHelp();

    case ['run', var file]:
      runFile(file);

    case ['run', var file, '--verbose']:
      runFile(file, verbose: true);

    // Rest pattern ...
    case ['run', var file, ...var flags]:
      runFile(file, flags: flags);

    // Leading elements + rest
    case [var cmd, ...]:
      print('Unknown command: $cmd');
  }
}

// Fixed-structure matching
switch (rgb) {
  case [255, 0, 0]:    print('red');
  case [0, 255, 0]:    print('green');
  case [0, 0, 255]:    print('blue');
  case [var r, var g, var b] when r == g && g == b:
    print('greyscale: $r');
  case [var r, var g, var b]:
    print('color: rgb($r,$g,$b)');
}

// Matrix / 2D structure
switch (matrix) {
  case [[var a, var b], [var c, var d]]:
    print('2x2 matrix: [[$a,$b],[$c,$d]]');
}
```

---

## Map Patterns

```dart
// JSON / API response parsing
void handleResponse(Map<String, dynamic> json) {
  switch (json) {
    case {'type': 'user', 'id': int id, 'name': String name}:
      createUser(id, name);

    case {'type': 'product', 'id': int id, 'price': num price}:
      createProduct(id, price);

    case {'error': String msg, 'code': int code}:
      throw ApiException(msg, code);

    case {'type': String t}:
      throw UnknownTypeException(t);
  }
}

// Partial match — only specified keys need to be present
switch (config) {
  // Other keys can exist — only 'debug' must be present and true
  case {'debug': true}:
    enableDebugMode();
  case {'logLevel': String level}:
    setLogLevel(level);
}

// Nested map patterns
switch (nested) {
  case {'user': {'name': String name, 'address': {'city': String city}}}:
    print('$name lives in $city');
}
```

---

## Switch Expressions

A `switch` that **returns a value**. Every branch must be an expression:

```dart
// Basic
String classify(int n) => switch (n) {
  0        => 'zero',
  < 0      => 'negative',
  1 || 2   => 'one or two',
  int x when x.isEven => 'even: $x',
  _        => 'other',
};

// Replace long if-else chains
String httpStatus(int code) => switch (code) {
  200 => 'OK',
  201 => 'Created',
  204 => 'No Content',
  301 => 'Moved Permanently',
  302 => 'Found',
  400 => 'Bad Request',
  401 => 'Unauthorized',
  403 => 'Forbidden',
  404 => 'Not Found',
  422 => 'Unprocessable Entity',
  500 => 'Internal Server Error',
  503 => 'Service Unavailable',
  int c when c >= 200 && c < 300 => '2xx Success',
  int c when c >= 400 && c < 500 => '4xx Client Error',
  int c when c >= 500             => '5xx Server Error',
  _   => 'Unknown',
};

// Multi-line expression (use parentheses)
Widget iconFor(AppRoute route) => switch (route) {
  AppRoute.home     => const Icon(Icons.home),
  AppRoute.search   => const Icon(Icons.search),
  AppRoute.profile  => const Icon(Icons.person),
  AppRoute.settings => const Icon(Icons.settings),
};

// Throwing in a switch expression
Never unreachable(Object value) => throw StateError('Unreachable: $value');

String strictClassify(Object value) => switch (value) {
  int n    => 'int: $n',
  String s => 'string: $s',
  _        => unreachable(value),
};
```

---

## Exhaustiveness Checking

When switching over a **sealed class**, Dart verifies that all subtypes are handled:

```dart
sealed class Shape {}
class Circle    extends Shape { final double radius; Circle(this.radius); }
class Rectangle extends Shape { final double w, h;  Rectangle(this.w, this.h); }
class Triangle  extends Shape { final double b, ht; Triangle(this.b, this.ht); }

// ✅ Exhaustive — all 3 subtypes covered, no default needed
double area(Shape s) => switch (s) {
  Circle(radius: var r)         => 3.14159 * r * r,
  Rectangle(w: var w, h: var h) => w * h,
  Triangle(b: var b, ht: var h) => 0.5 * b * h,
};

// Compiler enforces exhaustiveness:
// Adding a 4th subclass → compile error at every switch site → can't miss it!

// Also works for enums
enum Coin { penny, nickel, dime, quarter }

int cents(Coin c) => switch (c) {
  Coin.penny   => 1,
  Coin.nickel  => 5,
  Coin.dime    => 10,
  Coin.quarter => 25,
  // exhaustive — no default needed
};
```

---

## Nested Patterns

Patterns compose — you can nest them arbitrarily deep:

```dart
// Destructure nested records
(String, (int, bool)) nested = ('Alice', (30, true));
var (name, (age, active)) = nested;
print('$name, $age, $active'); // Alice, 30, true

// Nested object + record + list
switch (response) {
  case ApiResponse(
    status: 200,
    data: {'users': [User(:var name), ...var rest]},
  ):
    print('First user: $name, and ${rest.length} more');
}

// Real-world: parse a deeply nested JSON safely
switch (json) {
  case {
    'event': 'purchase',
    'payload': {
      'items': [{'sku': String sku, 'qty': int qty}, ...],
      'total': num total,
    },
  }:
    processPurchase(sku, qty, total);
}
```

---

## Real-World Patterns

### Expression evaluator (recursive)

```dart
sealed class Expr {}
class Lit  extends Expr { final num v;           Lit(this.v); }
class Add  extends Expr { final Expr l, r;       Add(this.l, this.r); }
class Sub  extends Expr { final Expr l, r;       Sub(this.l, this.r); }
class Mul  extends Expr { final Expr l, r;       Mul(this.l, this.r); }
class Div  extends Expr { final Expr l, r;       Div(this.l, this.r); }
class Neg  extends Expr { final Expr e;          Neg(this.e); }

num eval(Expr e) => switch (e) {
  Lit(v: var v)           => v,
  Add(l: var l, r: var r) => eval(l) + eval(r),
  Sub(l: var l, r: var r) => eval(l) - eval(r),
  Mul(l: var l, r: var r) => eval(l) * eval(r),
  Div(l: var l, r: var r) => eval(l) / eval(r),
  Neg(e: var e)           => -eval(e),
};

// (3 + 4) * -2  →  -14
var expr = Mul(Add(Lit(3), Lit(4)), Neg(Lit(2)));
print(eval(expr)); // -14.0
```

### API response decoder

```dart
sealed class ApiResult<T> {}
class ApiOk<T>    extends ApiResult<T> { final T data; ApiOk(this.data); }
class ApiErr<T>   extends ApiResult<T> { final int code; final String msg; ApiErr(this.code, this.msg); }
class ApiEmpty<T> extends ApiResult<T> {}

ApiResult<T> decodeResult<T>(Map<String, dynamic> json, T Function(Map) decoder) =>
    switch (json) {
      {'success': true,  'data': Map<String, dynamic> d} => ApiOk(decoder(d)),
      {'success': false, 'code': int c, 'message': String m} => ApiErr(c, m),
      {'success': true}  => ApiEmpty(),
      _ => ApiErr(0, 'Unexpected response format'),
    };
```

---

## Summary

| Pattern | Syntax | What It Does |
|---------|--------|--------------|
| Literal | `42`, `'str'`, `true` | Exact value match |
| Constant | `const Foo()` | Compile-time constant match |
| Variable | `var x`, `int x`, `final x` | Bind to new variable |
| Wildcard | `_` | Match anything, bind nothing |
| Logical-or | `a \|\| b` | Match if either matches |
| Logical-and | `a && b` | Match if both match |
| Relational | `>= 0`, `< 100` | Numeric comparison |
| Null-check | `pattern?` | Match non-null, strip `?` |
| Null-assert | `pattern!` | Assert non-null (throws) |
| Cast | `x as T` | Reinterpret type |
| Object | `Foo(field: p)` | Destructure class instance |
| Record | `(p1, name: p2)` | Destructure record |
| List | `[p1, p2, ...rest]` | Destructure list |
| Map | `{'k': p}` | Destructure map by key |
