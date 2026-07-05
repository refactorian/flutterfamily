---
sidebar_position: 9
title: Getters & Setters
description: Computed properties, validated setters, and read/write access patterns in Dart.
---

Getters and setters are **computed properties** — they look like field access to callers but run code behind the scenes. They let you enforce invariants, lazily compute values, and hide implementation details without changing a class's public API.

---

## Why Getters & Setters?

```dart
// Without getters — expose raw fields (fragile)
class Circle {
  double radius;
  double area;          // must stay in sync with radius manually
  Circle(this.radius) : area = 3.14159 * radius * radius;
}

var c = Circle(5.0);
c.radius = 10.0;
// c.area is now stale! Nothing forces it to update.

// With getters — area is always correct
class Circle {
  double radius;
  Circle(this.radius);

  double get area => 3.14159 * radius * radius; // always derived, never stale
}
```

---

## Basic Getters

```dart
class Circle {
  double radius;
  Circle(this.radius);

  // Read-only computed properties
  double get area          => 3.14159 * radius * radius;
  double get diameter      => radius * 2;
  double get circumference => 2 * 3.14159 * radius;

  // Boolean property
  bool get isUnit => radius == 1.0;
}

// Callers use them exactly like fields
var c = Circle(5.0);
print(c.radius);         // 5.0  — real field
print(c.area);           // 78.53975  — computed
print(c.diameter);       // 10.0
print(c.isUnit);         // false
// c.area = 100;         // ❌ no setter — compile error
```

---

## Getters & Setters with Validation

```dart
class Temperature {
  double _celsius;

  Temperature([this._celsius = 20.0]);

  // Getters — multiple views of the same data
  double get celsius    => _celsius;
  double get fahrenheit => _celsius * 9 / 5 + 32;
  double get kelvin     => _celsius + 273.15;

  String get description {
    if (_celsius < 0)   return 'Freezing';
    if (_celsius < 15)  return 'Cold';
    if (_celsius < 25)  return 'Comfortable';
    if (_celsius < 35)  return 'Warm';
    return 'Hot';
  }

  // Setters — with validation
  set celsius(double value) {
    if (value < -273.15) {
      throw ArgumentError('Temperature cannot go below absolute zero (-273.15°C)');
    }
    _celsius = value;
  }

  // Setter that converts from another unit
  set fahrenheit(double f) => celsius = (f - 32) * 5 / 9;
  set kelvin(double k)     => celsius = k - 273.15;
}

var temp = Temperature();
temp.celsius = 100.0;
print(temp.fahrenheit);    // 212.0
print(temp.kelvin);        // 373.15
print(temp.description);   // Hot

temp.fahrenheit = 32.0;    // set via fahrenheit setter
print(temp.celsius);       // 0.0

temp.celsius = -300;       // ❌ throws ArgumentError
```

---

## Overriding Getters in Subclasses

```dart
abstract class Shape {
  // Abstract getter — subclasses must implement
  double get area;
  double get perimeter;

  // Concrete getter using abstract ones
  bool get isLargerThan(Shape other) => area > other.area; // not valid syntax
  double get areaToPerimeterRatio => area / perimeter;

  String get summary =>
      '${runtimeType}: area=${area.toStringAsFixed(2)}, '
      'perimeter=${perimeter.toStringAsFixed(2)}';
}

class Circle extends Shape {
  final double radius;
  Circle(this.radius);

  @override
  double get area      => 3.14159 * radius * radius;

  @override
  double get perimeter => 2 * 3.14159 * radius;
}

class Square extends Shape {
  final double side;
  Square(this.side);

  @override
  double get area      => side * side;

  @override
  double get perimeter => 4 * side;
}

class NamedSquare extends Square {
  final String name;
  NamedSquare(double side, this.name) : super(side);

  // Override a concrete getter from the grandparent
  @override
  String get summary => '$name: ${super.summary}'; // call super getter
}

List<Shape> shapes = [Circle(5), Square(4), NamedSquare(6, 'Big')];
for (var s in shapes) {
  print(s.summary);
}
// Circle: area=78.54, perimeter=31.42
// Square: area=16.00, perimeter=16.00
// Big: Square: area=36.00, perimeter=24.00
```

---

## `late` Getters — Lazy Initialization

```dart
class HeavyDocument {
  final String rawContent;
  HeavyDocument(this.rawContent);

  // Computed once on first access, cached forever
  late final List<String> lines    = rawContent.split('\n');
  late final int          lineCount = lines.length;
  late final List<String> words    =
      rawContent.split(RegExp(r'\s+'));
  late final Map<String, int> wordFrequency = _buildWordFreq();

  Map<String, int> _buildWordFreq() {
    final freq = <String, int>{};
    for (final word in words) {
      freq[word.toLowerCase()] = (freq[word.toLowerCase()] ?? 0) + 1;
    }
    return freq;
  }
}

var doc = HeavyDocument(bigText);
// Nothing computed yet

print(doc.lineCount);     // computed now, cached
print(doc.lineCount);     // from cache — not recomputed
```

---

## Getter-Only Classes (Immutable Value Objects)

```dart
// Use final fields + getters to build fully immutable objects
class Color {
  final int _r, _g, _b;

  const Color(int r, int g, int b)
      : _r = r.clamp(0, 255),
        _g = g.clamp(0, 255),
        _b = b.clamp(0, 255);

  // Getters expose components
  int get red   => _r;
  int get green => _g;
  int get blue  => _b;

  // Derived getters
  double get luminance => (0.299 * _r + 0.587 * _g + 0.114 * _b) / 255;
  bool   get isDark    => luminance < 0.5;
  bool   get isLight   => luminance >= 0.5;

  String get hex =>
      '#${_r.toRadixString(16).padLeft(2,'0')}'
       '${_g.toRadixString(16).padLeft(2,'0')}'
       '${_b.toRadixString(16).padLeft(2,'0')}';

  // "Mutating" via new instance
  Color withRed(int r)   => Color(r, _g, _b);
  Color withGreen(int g) => Color(_r, g, _b);
  Color withBlue(int b)  => Color(_r, _g, b);
  Color withAlpha(int a) => ColorWithAlpha(_r, _g, _b, a);

  Color mix(Color other, {double ratio = 0.5}) => Color(
    (_r + (other._r - _r) * ratio).round(),
    (_g + (other._g - _g) * ratio).round(),
    (_b + (other._b - _b) * ratio).round(),
  );

  @override
  String toString() => 'Color($hex)';

  @override
  bool operator ==(Object o) =>
      o is Color && _r == o._r && _g == o._g && _b == o._b;

  @override
  int get hashCode => Object.hash(_r, _g, _b);
}

const red  = Color(255, 0, 0);
const blue = Color(0, 0, 255);
var purple = red.mix(blue);
print(purple.hex);     // #7f007f
print(purple.isDark);  // true
```

---

## Getters on Abstract & Interface Classes

```dart
// Interface — defines what callers can read
abstract interface class Measurable {
  double get width;
  double get height;
  double get area => width * height;   // default implementation
  double get aspectRatio => width / height;
}

// Implementing class
class ImageAsset implements Measurable {
  @override final double width;
  @override final double height;
  final String path;

  const ImageAsset(this.path, {required this.width, required this.height});
  // area and aspectRatio are inherited from the interface default
}

// Mixin-style — add getter behaviour
mixin Dimensioned {
  double get width;
  double get height;

  double get diagonal => sqrt(width * width + height * height);
  bool   get isPortrait  => height > width;
  bool   get isLandscape => width > height;
  bool   get isSquare    => width == height;
}

class Screen with Dimensioned {
  @override final double width;
  @override final double height;
  Screen(this.width, this.height);
}

var phone = Screen(390, 844);
print(phone.isPortrait);      // true
print(phone.diagonal.toStringAsFixed(0)); // 933
```

---

## Setter-Only and Asymmetric Types

```dart
// Write-only property (rare, but occasionally useful for security)
class PasswordField {
  String _hashedPassword = '';

  // Setter — accepts plaintext, stores hash
  set password(String plaintext) {
    if (plaintext.length < 8) throw ArgumentError('Too short');
    _hashedPassword = _hash(plaintext);
  }

  // No getter — you cannot read the password back
  bool verify(String plaintext) => _hash(plaintext) == _hashedPassword;

  String _hash(String s) => s; // simplified
}

// Different types for get and set (not directly supported in Dart,
// but you can approximate it by naming differently)
class Scale {
  double _kg;
  Scale(this._kg);

  double get kg       => _kg;
  double get lbs      => _kg * 2.20462;
  double get stones   => _kg * 0.157473;

  set kg(double v)    => _kg = v;
  set lbs(double v)   => _kg = v / 2.20462;
  set stones(double v) => _kg = v / 0.157473;
}

var s = Scale(70);
print(s.lbs.toStringAsFixed(1)); // 154.3
s.lbs = 160;
print(s.kg.toStringAsFixed(1));  // 72.6
```

---

## Summary

| Syntax | Description |
|--------|-------------|
| `T get name => expr;` | Arrow getter — single expression |
| `T get name { ... return v; }` | Block getter — multi-line logic |
| `set name(T v) { ... }` | Setter with optional validation |
| `abstract T get name;` | Abstract getter — subclass must implement |
| `@override T get name => ...` | Override parent getter |
| `late final T name = expr;` | Lazy getter — computed once on first access |
| `super.name` | Call parent getter from override |

**Rules:**
- A getter and a setter for the same name must have the same type
- No parentheses when calling: `obj.area` not `obj.area()`
- Callers cannot tell if `area` is a field or a getter — that's the point
- Keep getters **cheap** — callers assume property access is fast
