---
sidebar_position: 14
title: Null Safety
description: Nullable types, null-aware operators, type promotion, late variables, and null safety patterns in Dart.
---

Dart's null safety is **sound** — the compiler *proves* that a non-nullable variable can never be null at runtime. It eliminates entire classes of null-pointer crashes before your code runs.

---

## The Core Idea

```dart
// Before null safety — any variable could silently be null
String name = getNameFromDB(); // might return null!
print(name.length);           // 💥 NullPointerException at runtime

// With null safety — nullability is part of the type
String  required = 'Alice';   // CANNOT be null — guaranteed by compiler
String? nullable = null;      // CAN be null — you must handle it

required = null;    // ❌ compile error
nullable = 'Bob';  // ✅ nullable can also hold a String
```

---

## Nullable vs Non-Nullable

```dart
// Non-nullable types — the default
String    name  = 'Alice';
int       count = 0;
List<int> nums  = [1, 2, 3];

// Nullable types — add ?
String?    optName  = null;
int?       optCount;        // defaults to null
List<int>? optNums;         // the list reference can be null

// These are different!
List<String>?  nullableList    = null;   // list ref is null
List<String?>  nullableContent = [null, 'a', null]; // elements can be null
List<String?>? both            = null;  // both can be null
```

---

## Null-Aware Operators

### `?.` — Null-Safe Access

```dart
String? name = null;

// Without ?. — crash!
// print(name.length); // ❌ Null check operator used on null

// With ?. — returns null if receiver is null
print(name?.length);          // null   (no crash)
print(name?.toUpperCase());   // null

String? text = 'hello';
print(text?.length);          // 5
print(text?.toUpperCase());   // HELLO

// Chaining — stops at the first null
class User { Address? address; }
class Address { String? city; }

User? user = null;
print(user?.address?.city);       // null (safe at every step)
print(user?.address?.city?.length); // null
```

### `??` — If-Null (Fallback)

```dart
String? name = null;
print(name ?? 'Guest');        // Guest
print(name ?? '');             // ''

String? other = 'Alice';
print(other ?? 'Guest');       // Alice — non-null, ?? skipped

// Chaining ??
String? a = null, b = null, c = 'found!';
print(a ?? b ?? c ?? 'default'); // found!

// Practical: safe default for display
String displayName(String? first, String? last) =>
    '${first ?? ''} ${last ?? ''}'.trim().isEmpty
        ? 'Anonymous'
        : '${first ?? ''} ${last ?? ''}'.trim();
```

### `??=` — Null-Aware Assignment

```dart
String? cache;
cache ??= 'computed value';  // assigns — cache was null
cache ??= 'other';           // skips — cache already has a value
print(cache); // computed value

// Pattern: lazy initialization
class Config {
  Map<String, String>? _env;
  Map<String, String> get env => _env ??= _loadEnv();
  Map<String, String> _loadEnv() => {'APP_ENV': 'production'};
}
```

### `!` — Null Assertion (Bang Operator)

```dart
String? maybeNull = 'definitely not null right now';

// Tell Dart: "I promise this is non-null"
String definite = maybeNull!;   // strips ?  — throws if null at runtime

// ⚠️ The ! operator is a last resort
// Bad — you're defeating null safety
String? risky = null;
print(risky!.length);  // ❌ Null check operator used on null (crashes!)

// When ! is justified:
// 1. After a null check the compiler can't see across
TextEditingController? _ctrl;

@override
void initState() {
  super.initState();
  _ctrl = TextEditingController();
}

// Here we KNOW _ctrl was set in initState
void submit() => print(_ctrl!.text);

// 2. With firstWhere (returns non-null or throws)
var user = users.firstWhere((u) => u.id == targetId);
// Dart infers User — but if none matches, it throws anyway
```

---

## Handling Nullable Values — Patterns

```dart
String? raw = maybeGetName();

// ── Pattern 1: if null check (type promotion) ────────────────────────
if (raw != null) {
  // raw is promoted to String here — no ! needed
  print(raw.toUpperCase());
}

// ── Pattern 2: early return / guard clause ───────────────────────────
String process(String? input) {
  if (input == null) return 'default';
  if (input.isEmpty) return 'empty';
  // input is String from here — fully safe
  return input.trim().toUpperCase();
}

// ── Pattern 3: ?? with fallback ──────────────────────────────────────
String display = raw ?? 'Unknown';

// ── Pattern 4: ?. with fallback ──────────────────────────────────────
int length = raw?.length ?? 0;

// ── Pattern 5: switch / pattern matching (Dart 3) ────────────────────
switch (raw) {
  case null:     print('no value');
  case '':       print('empty');
  case String s: print('got: $s');  // s is non-nullable String
}

// ── Pattern 6: where + whereType to strip nulls ──────────────────────
List<String?> data = ['Alice', null, 'Bob', null, 'Carol'];
List<String> clean = data.whereType<String>().toList(); // ['Alice', 'Bob', 'Carol']
// Or:
List<String> clean2 = [for (final d in data) if (d != null) d];
```

---

## Type Promotion — Deep Dive

Dart's **flow analysis** tracks what it knows about a variable's type:

```dart
// Basic promotion
Object? value = getObject();
if (value is String) {
  // value is String here — .length and other String methods available
  print(value.length);
}
// Back to Object? here

// Promotion on null check
String? name = getName();
if (name == null) return;
// name is String from here — no ? no ! needed
print(name.toUpperCase());

// Promotion through logical operators
void process(Object? x) {
  if (x is! String) return;   // early return on wrong type
  // x is String here
  print(x.length);
}

// Promotion is NOT flow-sensitive for mutable class fields
class Container {
  String? value;

  void demo() {
    if (value != null) {
      // value might be set to null by another thread between the check and this line
      // Dart refuses to promote it — use a local variable instead
      final v = value;       // capture to local
      if (v != null) {
        print(v.length);    // ✅ local variable IS promoted
      }
    }
  }
}

// ✅ Best pattern for fields: capture first
void safe(Container c) {
  final val = c.value;   // local snapshot
  if (val == null) return;
  print(val.length);     // ✅ val is String
}
```

---

## `late` Variables

```dart
// late — "I promise to initialize this before reading it"

// ── Use case 1: dependency injection in StatefulWidget ───────────────
class MyState extends State<MyWidget> {
  late final AnimationController _controller;  // set in initState

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this); // assigned here
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }
}

// ── Use case 2: circular references ──────────────────────────────────
class Node {
  final int value;
  late Node next;    // can't set in constructor — other Node doesn't exist yet
  Node(this.value);
}

var a = Node(1);
var b = Node(2);
a.next = b;
b.next = a;  // circular — fine because late

// ── Use case 3: lazy expensive initialization ─────────────────────────
class DataProcessor {
  late final List<int> _sortedData = _loadAndSort(); // computed on first access

  List<int> _loadAndSort() {
    print('Computing...');
    return [5, 1, 3, 2, 4]..sort();
  }

  int get median => _sortedData[_sortedData.length ~/ 2];
}

var proc = DataProcessor();
// _sortedData not computed yet
print(proc.median);  // Computing... \n 3
print(proc.median);  // 3  (no recompute — late final)

// ⚠️ late is NOT safe — accessing before assignment throws
late String unset;
// print(unset); // ❌ LateInitializationError: Field 'unset' has not been initialized.
```

---

## Null Safety and Collections

```dart
// Non-null elements in a nullable list
List<int>? nullableList = null;
nullableList?.forEach(print);   // safe — skipped if null
nullableList?.length ?? 0;      // 0 if null

// Nullable elements in a non-null list
List<int?> withNulls = [1, null, 3, null, 5];

// Strip nulls — several approaches
var ints1 = withNulls.whereType<int>().toList();
var ints2 = withNulls.where((x) => x != null).cast<int>().toList();
var ints3 = [for (var x in withNulls) if (x != null) x];
// All produce: [1, 3, 5]

// Safe first/last
List<String> names = [];
String? first = names.firstOrNull;   // null — Dart 3 extension
String? last  = names.lastOrNull;    // null

// Safe indexed access
String? safe(List<String> list, int i) =>
    (i >= 0 && i < list.length) ? list[i] : null;
```

---

## Null Safety with Generics

```dart
// T vs T? in generics
class Optional<T extends Object> {
  final T? _value;

  const Optional.of(T value)  : _value = value;
  const Optional.empty()       : _value = null;

  bool get isPresent => _value != null;
  T    get value     => _value ?? (throw StateError('Empty'));
  T    orElse(T fallback) => _value ?? fallback;

  Optional<R> map<R extends Object>(R Function(T) fn) =>
      _value == null ? Optional.empty() : Optional.of(fn(_value!));
}

// In APIs — T vs T? has different semantics
class Cache<T> {
  final _store = <String, T>{};

  void put(String key, T value) => _store[key] = value;

  // Returns T? — null means "key not found"
  T? get(String key) => _store[key];

  // Returns T — throws if not found
  T require(String key) =>
      _store[key] ?? (throw ArgumentError('Key not found: $key'));
}
```

---

## Common Mistakes & How to Fix Them

```dart
// ❌ Mistake 1: Using ! unnecessarily
String? name = 'Alice';
print(name!.length);     // works but fragile
// ✅ Fix:
print(name?.length ?? 0); // or:
if (name != null) print(name.length);

// ❌ Mistake 2: Null check on a field that won't promote
class Foo {
  String? name;
  void show() {
    if (name != null) print(name!.length); // must use !
  }
}
// ✅ Fix: local variable
class Foo2 {
  String? name;
  void show() {
    final n = name;
    if (n != null) print(n.length); // n promotes
  }
}

// ❌ Mistake 3: Forgetting nullable element type
List<String> names = [];
// names.add(null); // ❌ null can't go here — intentional!

List<String?> maybeNames = [];
maybeNames.add(null); // ✅

// ❌ Mistake 4: late without initialization
late String value;
Future<void> init() async => value = await fetchValue();
// If you call something using value before init() completes → LateInitializationError
// ✅ Fix: use Future or nullable instead if timing is uncertain

// ❌ Mistake 5: Optional chaining still needs null fallback
Map<String, dynamic> json = {};
String name2 = json['name'] as String;       // ❌ throws if 'name' missing
// ✅ Fix:
String name3 = json['name'] as String? ?? 'Unknown'; // safe
```

---

## Null Safety Summary

| Syntax | Meaning |
|--------|---------|
| `String` | Non-nullable — can never hold null |
| `String?` | Nullable — String or null |
| `x?.y` | Access `y` only if `x` is non-null; else null |
| `x ?? y` | `x` if non-null, else `y` |
| `x ??= y` | Assign `y` to `x` only if `x` is null |
| `x!` | Assert `x` is non-null (runtime crash if wrong) |
| `late T x` | Non-null, but initialized after declaration |
| `late final T x = expr` | Lazy — computed once on first access |
| `if (x != null)` | Promotes `x` to non-nullable within block |
| `if (x is T)` | Promotes `x` to type `T` within block |
| `x?.y ?? z` | Safe access with fallback |
| `whereType<T>()` | Filter non-null items of type `T` |
