---
sidebar_position: 11
title: Enums
description: Basic enums, enhanced enums (Dart 2.17+), and using enums for state management in Dart.
---

---

## Basic Enums

```dart
enum Direction { north, south, east, west }

enum Color { red, green, blue }

// Usage
var dir = Direction.north;
print(dir);          // Direction.north
print(dir.name);     // north
print(dir.index);    // 0

// In switch
switch (dir) {
  case Direction.north: print('Going up');
  case Direction.south: print('Going down');
  case Direction.east:  print('Going right');
  case Direction.west:  print('Going left');
}

// All values
print(Direction.values); // [Direction.north, Direction.south, ...]

// Parse from string (Dart 2.15+)
var parsed = Direction.values.byName('east'); // Direction.east
```

---

## Enhanced Enums (Dart 2.17+)

Enums can have fields, constructors, and methods!

```dart
enum Planet {
  mercury(3.303e+23, 2.4397e6),
  venus(4.869e+24, 6.0518e6),
  earth(5.976e+24, 6.37814e6),
  mars(6.421e+23, 3.3972e6);

  // Fields
  final double mass;    // kg
  final double radius;  // meters

  // Constructor (must be const)
  const Planet(this.mass, this.radius);

  // Methods
  static const double G = 6.67430e-11;
  double get surfaceGravity => G * mass / (radius * radius);
  double weightOn(double earthWeight) =>
      earthWeight * surfaceGravity / Planet.earth.surfaceGravity;
}

print(Planet.earth.surfaceGravity.toStringAsFixed(2)); // 9.80
print(Planet.mars.weightOn(75.0).toStringAsFixed(2));  // 28.46

// Enums can implement interfaces
enum Season implements Comparable<Season> {
  spring, summer, autumn, winter;

  @override
  int compareTo(Season other) => index.compareTo(other.index);

  Season get next => Season.values[(index + 1) % 4];
}

print(Season.summer.next); // Season.autumn
```

---

## Enums as State

Enums are perfect for representing UI state:

```dart
enum AppState { loading, success, error, empty }

class ViewModel {
  AppState _state = AppState.loading;

  AppState get state => _state;

  void load() async {
    _state = AppState.loading;
    try {
      await fetchData();
      _state = AppState.success;
    } catch (e) {
      _state = AppState.error;
    }
  }
}

// In Flutter UI:
Widget build(BuildContext context) {
  return switch (viewModel.state) {
    AppState.loading => CircularProgressIndicator(),
    AppState.success => DataWidget(),
    AppState.error   => ErrorWidget('Failed to load'),
    AppState.empty   => EmptyStateWidget(),
  };
}
```
