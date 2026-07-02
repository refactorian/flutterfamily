---
sidebar_position: 18
title: Extensions
description: Extension methods, extension types, and custom type-safe wrappers in Dart.
---

Extensions let you add methods to existing types without modifying them.

---

## Basic Extensions

```dart
// Add methods to String
extension StringExtensions on String {
  bool get isEmail => contains('@') && contains('.');
  bool get isBlank => trim().isEmpty;

  String capitalize() =>
      isEmpty ? this : this[0].toUpperCase() + substring(1);

  String truncate(int maxLength, {String ellipsis = '...'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - ellipsis.length)}$ellipsis';
  }

  List<String> splitByWords() => trim().split(RegExp(r'\s+'));
  int get wordCount => splitByWords().length;
}

// Usage
print('hello'.capitalize());              // Hello
print('alice@example.com'.isEmail);       // true
print('  '.isBlank);                      // true
print('Hello World'.truncate(8));         // Hello...
print('Hello World Dart'.wordCount);      // 3
```

---

## Extensions on Other Types

```dart
// Extension on int
extension IntExtensions on int {
  bool get isPrime {
    if (this < 2) return false;
    for (var i = 2; i <= sqrt(this.toDouble()); i++) {
      if (this % i == 0) return false;
    }
    return true;
  }

  Duration get seconds => Duration(seconds: this);
  Duration get milliseconds => Duration(milliseconds: this);
  Duration get minutes => Duration(minutes: this);

  List<int> get range => List.generate(this, (i) => i);
}

print(17.isPrime);    // true
print(4.isPrime);     // false
await Future.delayed(2.seconds);
print(5.range);       // [0, 1, 2, 3, 4]

// Extension on DateTime
extension DateExtensions on DateTime {
  bool get isToday {
    var now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }

  String get formatted => '$day/$month/$year';
  bool get isWeekend => weekday == DateTime.saturday || weekday == DateTime.sunday;
}

// Extension on List
extension ListExtensions<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull => isEmpty ? null : last;

  List<List<T>> chunks(int size) => [
    for (var i = 0; i < length; i += size)
      sublist(i, (i + size).clamp(0, length))
  ];

  Map<K, List<T>> groupBy<K>(K Function(T) keyOf) {
    var result = <K, List<T>>{};
    for (var item in this) {
      result.putIfAbsent(keyOf(item), () => []).add(item);
    }
    return result;
  }
}

var words = ['apple', 'ant', 'banana', 'bee', 'cherry'];
print(words.groupBy((w) => w[0]));
// {a: [apple, ant], b: [banana, bee], c: [cherry]}
```

---

## Named Extensions

```dart
// Named extension (can be hidden/shown on import)
extension NumberFormatting on double {
  String get currency => '\$${toStringAsFixed(2)}';
  String get percent => '${(this * 100).toStringAsFixed(1)}%';
}

print(3.14.currency);  // $3.14
print(0.75.percent);   // 75.0%
```

---

## Extension Types (Dart 3)

Extension types wrap existing types with new interfaces, with zero overhead:

```dart
// Create a type-safe wrapper around int for user IDs
extension type UserId(int id) {
  bool get isValid => id > 0;
}

extension type ProductId(int id) {
  bool get isValid => id > 0;
}

UserId userId = UserId(42);
ProductId productId = ProductId(42);

// Type-safe! Can't mix up IDs
void getUser(UserId id) { }
getUser(userId);    // ✅
// getUser(productId); // ❌ compile error — wrong type!

// Extension types implement and extend
extension type Celsius(double temp) {
  Celsius operator +(Celsius other) => Celsius(temp + other.temp);
  double toFahrenheit() => temp * 9/5 + 32;
}
```
