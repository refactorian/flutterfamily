---
sidebar_position: 18
title: Extensions
description: Extension methods, extension types, and custom type-safe wrappers in Dart.
---

Extensions let you add new methods, getters, setters, and operators to **any existing type** — including types from the SDK and third-party packages — without modifying the original class or using inheritance.

---

## Why Extensions?

```dart
// Without extension — utility function, ugly call site
String capitalized(String s) => s.isEmpty ? s : s[0].toUpperCase() + s.substring(1);
capitalized(capitalized(user.name));   // nested, reads inside-out

// With extension — reads naturally, left to right
extension StringExt on String {
  String get capitalized => isEmpty ? this : this[0].toUpperCase() + substring(1);
}
user.name.capitalized.capitalized;    // ✅ chained, readable
```

---

## Declaring Extensions

```dart
// Named extension (recommended — can be hidden/shown on import)
extension StringExtensions on String {
  bool get isEmail    => contains('@') && contains('.');
  bool get isBlank    => trim().isEmpty;
  bool get isNotBlank => trim().isNotEmpty;
  bool get isNumeric  => double.tryParse(this) != null;

  String get capitalized =>
      isEmpty ? this : this[0].toUpperCase() + substring(1);

  String get titleCase => split(' ').map((w) => w.capitalized).join(' ');

  String truncate(int maxLength, {String ellipsis = '…'}) {
    if (length <= maxLength) return this;
    return '${substring(0, maxLength - ellipsis.length)}$ellipsis';
  }

  String repeat(int times, {String separator = ''}) =>
      List.generate(times, (_) => this).join(separator);

  String? get nullIfBlank => isBlank ? null : this;

  List<String> get words => trim().split(RegExp(r'\s+'));
  int get wordCount => isBlank ? 0 : words.length;

  // Parse wrappers that return null instead of throwing
  int?    get tryParseInt    => int.tryParse(this);
  double? get tryParseDouble => double.tryParse(this);
}

// Usage
print('hello world'.titleCase);          // Hello World
print('alice@example.com'.isEmail);      // true
print('  '.isBlank);                     // true
print('hello'.repeat(3, separator: '-')); // hello-hello-hello
print('42'.tryParseInt);                 // 42
print('abc'.tryParseInt);                // null
print('Long string here'.truncate(10));  // Long stri…
```

---

## Extensions on Built-in Types

### int

```dart
extension IntExtensions on int {
  // Duration helpers — makes code read like prose
  Duration get microseconds => Duration(microseconds: this);
  Duration get milliseconds => Duration(milliseconds: this);
  Duration get seconds      => Duration(seconds: this);
  Duration get minutes      => Duration(minutes: this);
  Duration get hours        => Duration(hours: this);
  Duration get days         => Duration(days: this);

  // Number theory
  bool get isPrime {
    if (this < 2) return false;
    if (this == 2) return true;
    if (isEven) return false;
    for (var i = 3; i * i <= this; i += 2) {
      if (this % i == 0) return false;
    }
    return true;
  }

  bool get isPerfect {
    if (this < 2) return false;
    var sum = 1;
    for (var i = 2; i * i <= this; i++) {
      if (this % i == 0) {
        sum += i;
        if (i != this ~/ i) sum += this ~/ i;
      }
    }
    return sum == this;
  }

  // Iteration helpers
  List<int> get range  => List.generate(this, (i) => i);           // [0..n)
  List<int> to(int end) => List.generate((end - this).abs() + 1,
      (i) => this < end ? this + i : this - i);                   // inclusive

  // Formatting
  String padded(int width) => toString().padLeft(width, '0');
  String get binary => toRadixString(2);
  String get hex    => '0x${toRadixString(16).toUpperCase()}';
}

// Usage
await Future.delayed(3.seconds);
print(17.isPrime);         // true
print(6.isPerfect);        // true
print(5.range);            // [0, 1, 2, 3, 4]
print(3.to(7));            // [3, 4, 5, 6, 7]
print(7.padded(3));        // 007
print(255.hex);            // 0xFF
```

### double

```dart
extension DoubleExtensions on double {
  double get rounded2  => double.parse(toStringAsFixed(2));
  double clampTo(double min, double max) => clamp(min, max).toDouble();
  bool   approxEqual(double other, {double epsilon = 1e-9}) =>
      (this - other).abs() < epsilon;

  // Angle conversions
  double get toRadians => this * 3.14159265358979 / 180;
  double get toDegrees => this * 180 / 3.14159265358979;
}

print(3.14159.rounded2);              // 3.14
print(180.0.toRadians.approxEqual(3.14159)); // true
```

### DateTime

```dart
extension DateTimeExtensions on DateTime {
  // Checks
  bool get isToday {
    final now = DateTime.now();
    return year == now.year && month == now.month && day == now.day;
  }
  bool get isYesterday => subtract(const Duration(days: 1)).isToday;
  bool get isTomorrow  => add(const Duration(days: 1)).isToday;
  bool get isWeekend   => weekday == DateTime.saturday || weekday == DateTime.sunday;
  bool get isWeekday   => !isWeekend;
  bool get isPast      => isBefore(DateTime.now());
  bool get isFuture    => isAfter(DateTime.now());

  // Start/end of time periods
  DateTime get startOfDay  => DateTime(year, month, day);
  DateTime get endOfDay    => DateTime(year, month, day, 23, 59, 59, 999);
  DateTime get startOfMonth => DateTime(year, month);
  DateTime get startOfYear  => DateTime(year);

  // Human-readable
  String get timeAgo {
    final diff = DateTime.now().difference(this);
    if (diff.inSeconds < 60)  return '${diff.inSeconds}s ago';
    if (diff.inMinutes < 60)  return '${diff.inMinutes}m ago';
    if (diff.inHours < 24)    return '${diff.inHours}h ago';
    if (diff.inDays < 30)     return '${diff.inDays}d ago';
    return '$day/$month/$year';
  }

  // Arithmetic helpers
  DateTime addDays(int days) => add(Duration(days: days));
  DateTime subtractDays(int days) => subtract(Duration(days: days));
  int get daysInMonth => DateTime(year, month + 1, 0).day;
}
```

### List

```dart
extension ListExtensions<T> on List<T> {
  T? get firstOrNull => isEmpty ? null : first;
  T? get lastOrNull  => isEmpty ? null : last;
  T  get random      => this[DateTime.now().millisecondsSinceEpoch % length];

  List<T> get shuffled => [...this]..shuffle();
  List<T> get reversed_ => reversed.toList(); // avoid conflict with .reversed

  // Chunking
  List<List<T>> chunks(int size) => [
    for (var i = 0; i < length; i += size)
      sublist(i, (i + size).clamp(0, length)),
  ];

  // Grouping
  Map<K, List<T>> groupBy<K>(K Function(T) keyOf) =>
      fold({}, (map, item) => map..putIfAbsent(keyOf(item), () => []).add(item));

  // Safe operations
  T? safeGet(int index) => (index >= 0 && index < length) ? this[index] : null;

  // Deduplication
  List<T> get distinct => LinkedHashSet<T>.from(this).toList();
  List<T> distinctBy<K>(K Function(T) keyOf) {
    final seen = <K>{};
    return where((item) => seen.add(keyOf(item))).toList();
  }

  // Flattening (when T is a List)
  List<T> intersperse(T separator) => isEmpty
      ? this
      : [for (var i = 0; i < length; i++) ...[this[i], if (i < length - 1) separator]];
}

extension IterableExtensions<T> on Iterable<T> {
  // Partition into two lists based on a predicate
  (List<T>, List<T>) partition(bool Function(T) test) {
    final yes = <T>[], no = <T>[];
    for (final item in this) (test(item) ? yes : no).add(item);
    return (yes, no);
  }
}

// Usage
var nums = [3, 1, 4, 1, 5, 9, 2, 6, 5];
print(nums.distinct);                         // [3, 1, 4, 5, 9, 2, 6]
print(nums.chunks(3));                        // [[3,1,4],[1,5,9],[2,6,5]]

var words = ['apple', 'ant', 'banana', 'bee'];
print(words.groupBy((w) => w[0]));            // {a: [apple, ant], b: [banana, bee]}

var (evens, odds) = nums.partition((n) => n.isEven);
print(evens); // [4, 2, 6]
print(odds);  // [3, 1, 1, 5, 9, 5]
```

### Map

```dart
extension MapExtensions<K, V> on Map<K, V> {
  Map<K, V> where_(bool Function(K, V) test) =>
      Map.fromEntries(entries.where((e) => test(e.key, e.value)));

  Map<V, K> get inverted => Map.fromEntries(entries.map((e) => MapEntry(e.value, e.key)));

  Map<K, R> mapValues<R>(R Function(V) transform) =>
      map((k, v) => MapEntry(k, transform(v)));

  Map<K, V> mergeWith(Map<K, V> other, {V Function(V a, V b)? onConflict}) {
    final result = {...this};
    for (final entry in other.entries) {
      result[entry.key] = (onConflict != null && containsKey(entry.key))
          ? onConflict(result[entry.key] as V, entry.value)
          : entry.value;
    }
    return result;
  }
}
```

---

## Extensions on Nullable Types

```dart
// Extend String? (the nullable type itself)
extension NullableStringExt on String? {
  bool get isNullOrBlank => this == null || this!.trim().isEmpty;
  String get orEmpty => this ?? '';
  String orDefault(String d) => (this == null || this!.isEmpty) ? d : this!;
}

// Usage
String? name = null;
print(name.isNullOrBlank);     // true (no ?. needed!)
print(name.orEmpty);           // ''
print(name.orDefault('Guest')); // Guest

// Extend T? for any type
extension NullableExt<T> on T? {
  T orElse(T fallback) => this ?? fallback;
  R? let<R>(R Function(T) transform) => this != null ? transform(this as T) : null;
  void ifNotNull(void Function(T) action) { if (this != null) action(this as T); }
}

String? value = 'hello';
value.ifNotNull((s) => print(s.toUpperCase())); // HELLO
var length = value.let((s) => s.length);         // 5
```

---

## Extensions on Generic Types

```dart
// Extension on Future
extension FutureExtensions<T> on Future<T> {
  // Catch a specific error type, return fallback
  Future<T> catchAs<E extends Object>(T Function(E) onError) =>
      this.catchError((e) => onError(e as E), test: (e) => e is E);

  // Add a timeout with a default value
  Future<T> withTimeout(Duration d, {required T onTimeout()}) =>
      timeout(d, onTimeout: onTimeout);

  // Map the result
  Future<R> mapResult<R>(R Function(T) transform) =>
      then(transform);
}

// Extension on Stream
extension StreamExtensions<T> on Stream<T> {
  // Debounce — wait for a pause in events
  Stream<T> debounce(Duration d) {
    Timer? timer;
    late final controller = StreamController<T>.broadcast();
    listen((event) {
      timer?.cancel();
      timer = Timer(d, () => controller.add(event));
    }, onDone: controller.close);
    return controller.stream;
  }
}
```

---

## Operator Extensions

You can add operators to types that don't have them:

```dart
extension VectorOps on List<double> {
  List<double> operator +(List<double> other) =>
      [for (var i = 0; i < length; i++) this[i] + other[i]];

  List<double> operator *(double scalar) =>
      map((v) => v * scalar).toList();

  double get magnitude =>
      sqrt(fold(0.0, (sum, v) => sum + v * v));
}

var v1 = [3.0, 4.0];
var v2 = [1.0, 2.0];
print(v1 + v2);         // [4.0, 6.0]
print(v1 * 2);          // [6.0, 8.0]
print(v1.magnitude);    // 5.0
```

---

## Scope, Visibility & Conflicts

```dart
// Named extensions can be imported selectively
import 'string_ext.dart' show StringExtensions;
import 'string_ext.dart' hide StringExtensions;

// Anonymous extensions — always in scope, cannot be hidden
extension on int { bool get isNice => this == 69; }

// Conflict resolution — two extensions define the same member
extension ExtA on String { String get shout => toUpperCase(); }
extension ExtB on String { String get shout => '$this!!!'; }

// Ambiguous — compile error if both are imported
// Fix: use the extension explicitly
print(ExtA('hello').shout);   // HELLO
print(ExtB('hello').shout);   // hello!!!

// Or import one of them with hide
import 'ext_b.dart' hide ExtB;
'hello'.shout;   // uses ExtA now — no conflict
```

---

## Extension Types (Dart 3) — Zero-Cost Wrappers

Unlike regular extensions (which add methods), extension *types* create a **new type** backed by an existing one, with zero runtime overhead:

```dart
// Without: confusing, stringly-typed
void createOrder(String userId, String productId, int quantity) { }
createOrder('usr_42', 'prd_99', 5);  // are those in the right order?

// With extension types: type-safe, self-documenting
extension type UserId(String id)    { bool get isValid => id.startsWith('usr_'); }
extension type ProductId(String id) { bool get isValid => id.startsWith('prd_'); }

void createOrder(UserId user, ProductId product, int qty) { }
createOrder(UserId('usr_42'), ProductId('prd_99'), 5);  // ✅ safe
// createOrder(ProductId('prd_99'), UserId('usr_42'), 5); // ❌ compile error!

// Extension type with implements — inherits the interface of the wrapped type
extension type Positive(int value) implements int {
  Positive operator +(Positive other) => Positive(value + other.value);
  // Inherits all int operations: +, -, *, etc.
}

// Sealed extension type for type-safe units
extension type Meters(double value) implements double {
  Meters operator +(Meters other) => Meters(value + other.value);
  Kilometers get toKm => Kilometers(value / 1000);
}
extension type Kilometers(double value) implements double {
  Meters get toMeters => Meters(value * 1000);
}

var d1 = Meters(500.0);
var d2 = Meters(300.0);
print(d1 + d2);             // Meters(800.0)
print(d1.toKm);             // Kilometers(0.5)
// d1 + Kilometers(1.0);    // ❌ type error — can't add different units
```

---

## When to Use Extensions vs Other Approaches

| Approach | Use When |
|----------|----------|
| **Extension method** | Adding behavior to an existing type you can't modify |
| **Extension type** | Creating a zero-cost strongly-typed wrapper |
| **Subclass** | Adding behavior + changing identity / `is` checks |
| **Utility function** | Simple one-off; no need to chain |
| **Mixin** | Sharing behavior across your own class hierarchy |

---

## Summary

```dart
// Regular extension — adds members to an existing type
extension FooExt on SomeType {
  ReturnType method() { ... }
  ReturnType get prop => ...;
  set prop(ReturnType v) { ... }
  ReturnType operator +(SomeType other) => ...;
}

// Extension on nullable
extension NullFooExt on SomeType? { ... }

// Generic extension
extension ListExt<T> on List<T> { ... }

// Extension type — new type, zero cost
extension type MyType(WrappedType value) implements WrappedType {
  // New methods / operators
}

// Explicit disambiguation
ExtensionName(object).conflictingMethod();
```
