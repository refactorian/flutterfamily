---
sidebar_position: 3
title: Operators
description: Arithmetic, comparison, logical, bitwise, null-aware, cascade, and spread operators in Dart.
---

---

## Arithmetic Operators

```dart
int a = 10, b = 3;

print(a + b);   // 13   addition
print(a - b);   // 7    subtraction
print(a * b);   // 30   multiplication
print(a / b);   // 3.3333... double division
print(a ~/ b);  // 3    integer division (truncates)
print(a % b);   // 1    modulo (remainder)
print(-a);      // -10  unary negation

// Integer division is unique to Dart (~/)
print(10 ~/ 3);   // 3
print(-10 ~/ 3);  // -4
print(7 ~/ 2);    // 3

// Double arithmetic
double x = 5.0;
print(x / 2);   // 2.5
print(x ~/ 2);  // 2 — integer division works on doubles too
```

---

## Assignment Operators

```dart
var x = 10;

x += 5;   // x = x + 5   → 15
x -= 3;   // x = x - 3   → 12
x *= 2;   // x = x * 2   → 24
x /= 4;   // x = x / 4   → 6.0
x ~/= 2;  // x = x ~/ 2  → 3
x %= 2;   // x = x % 2   → 1

// Null-aware assignment — only assign if currently null
String? name;
name ??= 'Default';  // name is null, so assign 'Default'
name ??= 'Other';    // name is 'Default', so skip
print(name);         // Default
```

---

## Comparison Operators

```dart
print(5 == 5);   // true   equality
print(5 != 3);   // true   inequality
print(5 > 3);    // true   greater than
print(5 < 3);    // false  less than
print(5 >= 5);   // true   greater than or equal
print(5 <= 4);   // false  less than or equal

// Dart uses == for value equality (not reference equality)
var s1 = 'hello';
var s2 = 'hello';
print(s1 == s2);          // true  — same value
print(identical(s1, s2)); // true  — same object (interned strings)

var list1 = [1, 2, 3];
var list2 = [1, 2, 3];
print(list1 == list2);          // false — different objects
print(identical(list1, list2)); // false
// Use package:collection or listEquals() from Flutter for deep equality
```

---

## Logical Operators

```dart
bool a = true, b = false;

print(a && b);  // false  AND (short-circuits)
print(a || b);  // true   OR  (short-circuits)
print(!a);      // false  NOT

// Short-circuit evaluation
bool checkA() { print('A checked'); return true; }
bool checkB() { print('B checked'); return false; }

checkA() || checkB();  // prints "A checked" only (B skipped — already true)
checkB() && checkA();  // prints "B checked" only (A skipped — already false)
```

---

## Bitwise Operators

```dart
int a = 0b1100;  // 12
int b = 0b1010;  // 10

print(a & b);    // 0b1000 = 8    AND
print(a | b);    // 0b1110 = 14   OR
print(a ^ b);    // 0b0110 = 6    XOR
print(~a);       // bitwise NOT (result depends on int size)
print(a << 2);   // 0b110000 = 48  left shift
print(a >> 1);   // 0b0110 = 6     right shift
print(a >>> 1);  // unsigned right shift (Dart 2.14+)
```

---

## Type Test Operators

```dart
Object obj = 'Hello';

print(obj is String);    // true
print(obj is int);       // false
print(obj is! int);      // true  (NOT int)

// After is, Dart promotes the type automatically
if (obj is String) {
  print(obj.length);  // no cast needed!
}

// as — explicit cast (throws if wrong)
String str = obj as String;  // safe here
// int n = obj as int;       // throws _CastError
```

---

## Null-Aware Operators ⚡

These are some of Dart's most useful operators:

```dart
// ?? — if-null operator
String? name = null;
String display = name ?? 'Guest';  // 'Guest'

String? other = 'Alice';
String display2 = other ?? 'Guest';  // 'Alice'

// ??= — null-aware assignment
String? config;
config ??= 'default';  // assigns because config is null
config ??= 'other';    // skips because config is now 'default'

// ?. — null-safe method/property call
String? text = null;
print(text?.length);        // null (instead of throwing)
print(text?.toUpperCase()); // null

String? text2 = 'hello';
print(text2?.length);        // 5

// ?[] — null-safe index access
List<int>? nums = null;
print(nums?[0]);  // null

// Chaining null-aware operators
class User {
  Address? address;
}
class Address {
  String? city;
}

User? user = null;
print(user?.address?.city ?? 'Unknown'); // 'Unknown'
```

---

## Conditional (Ternary) Operator

```dart
int score = 85;
String grade = score >= 90 ? 'A' : (score >= 80 ? 'B' : 'C');
print(grade);  // B

// Same as:
String grade2;
if (score >= 90) {
  grade2 = 'A';
} else if (score >= 80) {
  grade2 = 'B';
} else {
  grade2 = 'C';
}
```

---

## Cascade Operator `..`

Cascade lets you chain multiple calls on the same object without repeating the variable:

```dart
// Without cascade:
var paint = Paint();
paint.color = Colors.blue;
paint.strokeWidth = 2.0;
paint.style = PaintingStyle.stroke;

// With cascade:
var paint = Paint()
  ..color = Colors.blue
  ..strokeWidth = 2.0
  ..style = PaintingStyle.stroke;

// Works with method calls too
var buffer = StringBuffer()
  ..write('Hello')
  ..write(', ')
  ..writeln('World!');

// Null-aware cascade: ?..
// Only cascades if the object is non-null
StringBuffer? maybeBuffer = null;
maybeBuffer?..write('hello')..write(' world');  // nothing happens

// Cascade returns the original object
var list = <int>[]
  ..add(1)
  ..add(2)
  ..add(3);
print(list); // [1, 2, 3]
```

---

## Spread Operator `...`

```dart
// Spread in lists
var first = [1, 2, 3];
var second = [4, 5, 6];
var combined = [...first, ...second];
print(combined); // [1, 2, 3, 4, 5, 6]

// Null-aware spread: ...?
List<int>? maybe = null;
var safe = [1, 2, ...?maybe, 3];
print(safe); // [1, 2, 3]

// Spread in maps
var defaults = {'color': 'blue', 'size': 10};
var overrides = {'color': 'red'};
var merged = {...defaults, ...overrides};
print(merged); // {color: red, size: 10}  (override wins)

// Spread in sets
var a = {1, 2, 3};
var b = {3, 4, 5};
var union = {...a, ...b};
print(union); // {1, 2, 3, 4, 5}
```

---

## Increment & Decrement

```dart
var i = 5;

// Prefix — increment then return
print(++i);  // 6 (i is now 6)
print(--i);  // 5 (i is now 5)

// Postfix — return then increment
print(i++);  // 5 (returns 5, then i becomes 6)
print(i--);  // 6 (returns 6, then i becomes 5)
print(i);    // 5
```

---

## Operator Overloading

You can define custom behavior for operators in your classes:

```dart
class Vector {
  final double x, y;
  const Vector(this.x, this.y);

  // Overload +
  Vector operator +(Vector other) => Vector(x + other.x, y + other.y);

  // Overload -
  Vector operator -(Vector other) => Vector(x - other.x, y - other.y);

  // Overload *
  Vector operator *(double scalar) => Vector(x * scalar, y * scalar);

  // Overload == (must also override hashCode)
  @override
  bool operator ==(Object other) =>
      other is Vector && x == other.x && y == other.y;

  @override
  int get hashCode => Object.hash(x, y);

  // Overload [] for index access
  double operator [](int index) {
    if (index == 0) return x;
    if (index == 1) return y;
    throw RangeError.index(index, this);
  }

  @override
  String toString() => 'Vector($x, $y)';
}

void main() {
  var v1 = Vector(1, 2);
  var v2 = Vector(3, 4);
  print(v1 + v2);   // Vector(4.0, 6.0)
  print(v1 * 3);    // Vector(3.0, 6.0)
  print(v1 == v2);  // false
  print(v1[0]);     // 1.0
}
```

### Overloadable Operators

```
<    >    <=   >=
+    -    *    /    ~/    %
|    ^    &    <<   >>   >>>
==   []   []=  ~    unary-
```

---

## Operator Precedence (High → Low)

```
Unary postfix   e.  e?.  e!  e++  e--  e()  e[]
Unary prefix    -e  !e   ~e  ++e  --e  await
Multiplicative  *  /  ~/  %
Additive        +  -
Shift           <<  >>  >>>
Bitwise AND     &
Bitwise XOR     ^
Bitwise OR      |
Relational      <  >  <=  >=  as  is  is!
Equality        ==  !=
Logical AND     &&
Logical OR      ||
If-null         ??
Conditional     ?:
Cascade         ..  ?..
Assignment      =  *=  /=  +=  -=  etc.
```

---

## Summary

| Category | Operators |
|----------|-----------|
| Arithmetic | `+  -  *  /  ~/  %` |
| Assignment | `=  +=  -=  *=  /=  ??=` |
| Comparison | `==  !=  <  >  <=  >=` |
| Logical | `&&  \|\|  !` |
| Bitwise | `&  \|  ^  ~  <<  >>  >>>` |
| Type test | `is  is!  as` |
| Null-aware | `??  ??.  ?.  ?[]  ...?` |
| Cascade | `..  ?..` |
| Spread | `...  ...?` |
| Conditional | `? :` |
