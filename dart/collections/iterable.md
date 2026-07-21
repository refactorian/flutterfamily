---
title: Iterable<E>
sidebar_position: 2
description: Complete guide to Dart's Iterable<E> — the foundation of all Dart collections. Covers lazy evaluation, generators, sync*/async*, yield, and every method.
---

# `Iterable<E>`

`Iterable<E>` is the **foundation** of nearly every collection in Dart. `List`, `Set`, `Queue`, and most collection-like types all extend or implement `Iterable<E>`. Understanding it deeply will make you a far better Dart developer.

---

## What Is an Iterable?

An `Iterable<E>` is a sequence of elements that can be accessed **one at a time** in order. Unlike a `List`, an `Iterable` does **not** necessarily store all its elements in memory — it may compute them **lazily** on demand.

```dart
// A concrete List (all elements in memory)
List<int> list = [1, 2, 3, 4, 5];

// An Iterable derived from that list (lazy)
Iterable<int> evens = list.where((n) => n.isEven);
// ↑ No computation yet! The filter runs only when you consume evens.

for (var n in evens) {
  print(n); // 2, 4
}
```

### Key Insight: Lazy Evaluation

```dart
var counter = 0;
var lazy = [1, 2, 3, 4, 5].map((n) {
  counter++;      // increments only when consumed
  return n * 2;
});

print(counter); // 0 — nothing computed yet!
lazy.toList();
print(counter); // 5 — now computed
```

---

## When to Use `Iterable`

✅ Use `Iterable` when you want to:
- Chain multiple operations without materializing intermediate lists
- Work with lazy sequences (potentially infinite)
- Write functions that accept any collection type
- Use generator functions (`sync*`, `async*`)

❌ Avoid `Iterable` when you need to:
- Access elements by index (`list[i]`)
- Know the length upfront (some Iterables don't have O(1) `.length`)
- Mutate elements

---

## The `Iterator<E>` Protocol

Every `Iterable<E>` provides an `Iterator<E>` via `.iterator`. The `for-in` loop is sugar for this protocol:

```dart
// for-in loop
for (var n in [1, 2, 3]) {
  print(n);
}

// Equivalent manual iteration
var it = [1, 2, 3].iterator;
while (it.moveNext()) {
  print(it.current); // 1, 2, 3
}
```

`Iterator<E>` has two members:
- `bool moveNext()` — advances the cursor; returns `false` when exhausted
- `E get current` — the current element (undefined before first `moveNext()`)

---

## Properties

### `first`
Returns the first element. Throws `StateError` if empty.

```dart
print([1, 2, 3].first); // 1
print(<int>[].first);   // throws StateError
```

### `last`
Returns the last element. Throws `StateError` if empty.

```dart
print([1, 2, 3].last); // 3
```

### `single`
Returns the only element. Throws if zero or more than one element.

```dart
print([42].single);     // 42
print([1, 2].single);   // throws StateError: Too many elements
print(<int>[].single);  // throws StateError: No element
```

### `length`
The number of elements. **Warning:** On lazy Iterables this iterates the entire sequence, which is O(n).

```dart
print([1, 2, 3].length); // 3
print('abc'.runes.length); // 3
```

### `isEmpty` / `isNotEmpty`
True if the sequence has no elements. **Much preferred over `.length == 0`** on lazy Iterables because it stops after the first element.

```dart
print([].isEmpty);          // true
print([1, 2].isNotEmpty);   // true
```

### `firstOrNull` / `lastOrNull` / `singleOrNull` (Dart 3+)
Null-safe extensions built into `dart:core`. Return `null` instead of throwing `StateError` when empty or when constraints aren't met.

```dart
var empty = <int>[];
print(empty.firstOrNull);  // null
print(empty.lastOrNull);   // null
print(empty.singleOrNull); // null

var multi = [1, 2];
print(multi.singleOrNull); // null (more than 1 element)
```

### `indexed` (Dart 3+)
Returns an `Iterable<(int, E)>` of record tuples containing `(index, element)`.

```dart
var names = ['Alice', 'Bob', 'Carol'];
for (var (index, name) in names.indexed) {
  print('$index: $name');
}
// 0: Alice
// 1: Bob
// 2: Carol
```

---

## Methods

### `map<T>(T Function(E) f)` → `Iterable<T>`

Transforms every element. **Lazy.** Returns a new iterable; does not modify the original.

```dart
var nums = [1, 2, 3, 4, 5];
var doubled = nums.map((n) => n * 2);
print(doubled.toList()); // [2, 4, 6, 8, 10]

// Transform type
var strings = [1, 2, 3].map((n) => n.toString());
print(strings.toList()); // ['1', '2', '3']
```

### `where(bool Function(E) test)` → `Iterable<E>`

Filters elements matching the predicate. **Lazy.**

```dart
var nums = [1, 2, 3, 4, 5, 6];
var evens = nums.where((n) => n.isEven);
print(evens.toList()); // [2, 4, 6]

var words = ['apple', 'ant', 'banana', 'cherry'];
var aWords = words.where((w) => w.startsWith('a'));
print(aWords.toList()); // [apple, ant]
```

### `whereType<T>()` → `Iterable<T>`

Filters elements that are of type `T`. Equivalent to `where((e) => e is T).cast<T>()`.

```dart
var mixed = <Object>[1, 'hello', 2, 'world', 3.14];
var ints = mixed.whereType<int>();
print(ints.toList()); // [1, 2]
```

### `expand<T>(Iterable<T> Function(E) f)` → `Iterable<T>`

Maps each element to an iterable, then flattens one level. Also called `flatMap` in other languages. **Lazy.**

```dart
var nested = [[1, 2], [3, 4], [5, 6]];
var flat = nested.expand((list) => list);
print(flat.toList()); // [1, 2, 3, 4, 5, 6]

var words = ['hello', 'world'];
var chars = words.expand((w) => w.split(''));
print(chars.toList()); // [h, e, l, l, o, w, o, r, l, d]
```

### `reduce(E Function(E acc, E element) combine)` → `E`

Combines all elements into a single value using the provided function. **The list must not be empty.**

```dart
var nums = [1, 2, 3, 4, 5];
var sum = nums.reduce((a, b) => a + b);
print(sum); // 15

var longest = ['apple', 'fig', 'pineapple'].reduce(
  (a, b) => a.length >= b.length ? a : b,
);
print(longest); // pineapple
```

### `fold<T>(T initialValue, T Function(T acc, E element) combine)` → `T`

Like `reduce` but with an **initial value**. Works on empty iterables. Can change the result type.

```dart
var nums = [1, 2, 3, 4, 5];

// Sum (works even if empty)
var sum = nums.fold(0, (acc, n) => acc + n);
print(sum); // 15

// Product
var product = nums.fold(1, (acc, n) => acc * n);
print(product); // 120

// Build a string
var sentence = ['Hello', 'World'].fold(
  '',
  (acc, s) => acc.isEmpty ? s : '$acc $s',
);
print(sentence); // Hello World

// Count matching (type change: List<int> → int)
var evenCount = nums.fold(0, (acc, n) => n.isEven ? acc + 1 : acc);
print(evenCount); // 2
```

### `take(int count)` → `Iterable<E>`

Returns the first `count` elements. **Lazy.** If the iterable has fewer than `count` elements, returns all of them.

```dart
print([1, 2, 3, 4, 5].take(3).toList()); // [1, 2, 3]
print([1, 2].take(10).toList());          // [1, 2]
```

### `takeWhile(bool Function(E) test)` → `Iterable<E>`

Returns elements from the start while the predicate is true. Stops at the first falsy element.

```dart
var nums = [1, 2, 3, 4, 5, 1, 2];
print(nums.takeWhile((n) => n < 4).toList()); // [1, 2, 3]
```

### `skip(int count)` → `Iterable<E>`

Returns all elements except the first `count`. **Lazy.**

```dart
print([1, 2, 3, 4, 5].skip(2).toList()); // [3, 4, 5]
```

### `skipWhile(bool Function(E) test)` → `Iterable<E>`

Skips elements from the start while the predicate is true, then returns the rest.

```dart
var nums = [1, 2, 3, 4, 5];
print(nums.skipWhile((n) => n < 3).toList()); // [3, 4, 5]
```

### `any(bool Function(E) test)` → `bool`

Returns `true` if **at least one** element satisfies the predicate. Short-circuits (stops early).

```dart
print([1, 2, 3, 4].any((n) => n > 3));  // true
print([1, 2, 3, 4].any((n) => n > 10)); // false
print(<int>[].any((n) => n > 0));        // false (empty → false)
```

### `every(bool Function(E) test)` → `bool`

Returns `true` if **all** elements satisfy the predicate. Short-circuits on first failure.

```dart
print([2, 4, 6].every((n) => n.isEven));   // true
print([2, 3, 6].every((n) => n.isEven));   // false
print(<int>[].every((n) => n.isEven));     // true (vacuously true!)
```

### `contains(Object? element)` → `bool`

Returns `true` if any element equals `element` using `==`. Linear scan — O(n).

```dart
print([1, 2, 3].contains(2)); // true
print([1, 2, 3].contains(9)); // false
```

### `firstWhere(bool Function(E) test, {E Function()? orElse})` → `E`

Returns the first element matching the test. Throws `StateError` if not found and no `orElse`.

```dart
var nums = [1, 2, 3, 4, 5];
print(nums.firstWhere((n) => n > 3));             // 4
print(nums.firstWhere((n) => n > 9, orElse: () => -1)); // -1
```

### `lastWhere(bool Function(E) test, {E Function()? orElse})` → `E`

Like `firstWhere` but finds the **last** match.

```dart
var nums = [1, 2, 3, 4, 5];
print(nums.lastWhere((n) => n < 4)); // 3
```

### `singleWhere(bool Function(E) test, {E Function()? orElse})` → `E`

Returns the single element matching the test. Throws if zero or more than one match.

```dart
print([1, 2, 3].singleWhere((n) => n == 2));          // 2
print([1, 2, 3].singleWhere((n) => n > 5, orElse: () => -1)); // -1
```

### `elementAt(int index)` → `E`

Returns the element at the given index. **O(n) on lazy Iterables** — prefer `list[index]` for `List`.

```dart
print([10, 20, 30].elementAt(1)); // 20
```

### `join([String separator = ''])` → `String`

Converts all elements to strings and joins them.

```dart
print([1, 2, 3].join(', '));  // 1, 2, 3
print(['a', 'b', 'c'].join()); // abc
```

### `toList({bool growable = true})` → `List<E>`

Materializes the iterable into a `List`. Set `growable: false` for a fixed-length list.

```dart
var list = [1, 2, 3].map((n) => n * 2).toList();
print(list); // [2, 4, 6]
```

### `toSet()` → `Set<E>`

Materializes into a `Set`, removing duplicates.

```dart
var set = [1, 2, 2, 3, 3, 3].toSet();
print(set); // {1, 2, 3}
```

### `cast<R>()` → `Iterable<R>`

Returns a view with elements cast to type `R`. **Does not copy the data.** Throws at runtime if any element cannot be cast.

```dart
List<num> nums = [1, 2, 3];
List<int> ints = nums.cast<int>().toList();
```

### `followedBy(Iterable<E> other)` → `Iterable<E>`

Returns the elements of this iterable followed by `other`. **Lazy.**

```dart
var a = [1, 2, 3];
var b = [4, 5, 6];
print(a.followedBy(b).toList()); // [1, 2, 3, 4, 5, 6]
```

---

## Generators: `sync*` and `async*`

Dart has built-in generator syntax for creating `Iterable<E>` values lazily using `sync*` functions and `yield`.

### `sync*` — Synchronous Generators

```dart
// Infinite counter (never runs out of memory because it's lazy)
Iterable<int> counter(int start) sync* {
  var i = start;
  while (true) {
    yield i++; // pause, emit i, then continue
  }
}

// Take only what you need
print(counter(1).take(5).toList()); // [1, 2, 3, 4, 5]
```

```dart
// Fibonacci sequence
Iterable<int> fibonacci() sync* {
  int a = 0, b = 1;
  while (true) {
    yield a;
    final next = a + b;
    a = b;
    b = next;
  }
}

print(fibonacci().take(10).toList());
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]
```

```dart
// yield* — delegate to another iterable
Iterable<int> range(int start, int end) sync* {
  for (var i = start; i < end; i++) yield i;
}

Iterable<int> combined() sync* {
  yield* range(1, 4);  // yields 1, 2, 3
  yield 100;
  yield* range(7, 10); // yields 7, 8, 9
}

print(combined().toList()); // [1, 2, 3, 100, 7, 8, 9]
```

### `async*` — Asynchronous Generators → `Stream<E>`

```dart
Stream<int> asyncCounter(int start, int count) async* {
  for (var i = start; i < start + count; i++) {
    await Future.delayed(Duration(milliseconds: 100));
    yield i;
  }
}

await for (var n in asyncCounter(1, 5)) {
  print(n); // 1, 2, 3, 4, 5 (with delay)
}
```

---

## Chaining Operations

The power of `Iterable` is composing multiple operations into a readable pipeline. Each intermediate step is lazy:

```dart
var students = [
  {'name': 'Alice', 'grade': 92},
  {'name': 'Bob', 'grade': 74},
  {'name': 'Carol', 'grade': 88},
  {'name': 'Dave', 'grade': 55},
  {'name': 'Eve', 'grade': 99},
];

var topStudents = students
    .where((s) => (s['grade'] as int) >= 80)     // filter
    .map((s) => s['name'] as String)             // transform
    .toList()                                     // materialize
    ..sort();                                     // sort in place

print(topStudents); // [Alice, Carol, Eve]
```

---

## Performance Considerations

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `first`, `last` | O(1) on List; O(n) on lazy | Lazy iterables traverse to find last |
| `length` | O(1) on List; O(n) on lazy | Avoid on lazy chains |
| `elementAt(i)` | O(1) on List; O(n) on lazy | Use `list[i]` for indexed access |
| `contains` | O(n) | Use `Set.contains` for repeated lookups |
| `toList()` | O(n) | Materializes entire iterable |
| `take(n)` | O(n) consumed | Only consumes up to n elements |
| `any()` | O(1) to O(n) | Short-circuits on first match |
| `every()` | O(1) to O(n) | Short-circuits on first failure |

:::warning
Avoid calling `.length` on a `where()` or `map()` iterable in a loop — it re-evaluates the entire chain each time. Call `.toList()` first.
:::

---

## Real-World Examples

### Example 1: API Response Processing

```dart
// Parse a JSON list and extract active users' names
List<Map<String, dynamic>> apiResponse = [
  {'id': 1, 'name': 'Alice', 'active': true},
  {'id': 2, 'name': 'Bob',   'active': false},
  {'id': 3, 'name': 'Carol', 'active': true},
];

var activeNames = apiResponse
    .where((u) => u['active'] == true)
    .map((u) => u['name'] as String)
    .toList();

print(activeNames); // [Alice, Carol]
```

### Example 2: Lazy File Line Processing

```dart
import 'dart:io';

Iterable<String> readLines(String path) sync* {
  final file = File(path);
  // Yields lines one at a time — memory efficient for huge files
  yield* file.readAsLinesSync();
}

// Count lines matching a pattern — never loads all into memory at once
var count = readLines('log.txt')
    .where((line) => line.contains('ERROR'))
    .length;
```

### Example 3: Infinite Sequence

```dart
// Generate an infinite sequence of even numbers
Iterable<int> evens() sync* {
  int n = 0;
  while (true) yield (n += 2);
}

// Use only what you need
var first10Evens = evens().take(10).toList();
print(first10Evens); // [2, 4, 6, 8, 10, 12, 14, 16, 18, 20]
```

### Example 4: Flutter Widget List

```dart
// Build a list of widgets dynamically
List<String> items = ['Home', 'Profile', 'Settings', 'Logout'];

Column(
  children: items
      .where((item) => item != 'Logout')
      .map((item) => ListTile(title: Text(item)))
      .toList(),
)
```

---

## Common Mistakes

### ❌ Iterating a lazy Iterable multiple times

```dart
var lazy = [1, 2, 3].where((n) => n.isOdd);

// Each iteration re-runs the predicate
print(lazy.length); // fine, but iterates once
print(lazy.first);  // fine, but iterates again

// Better: materialize once
var list = lazy.toList();
print(list.length); // O(1)
print(list.first);  // O(1)
```

### ❌ Using `.length` in a loop condition

```dart
var evens = nums.where((n) => n.isEven);

// BAD: O(n²) — .length re-traverses each iteration
for (var i = 0; i < evens.length; i++) { ... }

// GOOD: materialize first
var evenList = evens.toList();
for (var i = 0; i < evenList.length; i++) { ... }
```

### ❌ Forgetting that `map()` returns an `Iterable`, not a `List`

```dart
var result = [1, 2, 3].map((n) => n * 2);
// result is Iterable<int>, NOT List<int>
result[0]; // ❌ compile error — Iterable has no [] operator
result.toList()[0]; // ✅
```

### ❌ Calling `.first` on an empty iterable

```dart
var empty = <int>[];
empty.first; // ❌ throws StateError

// ✅ Use built-in Dart 3 getter:
print(empty.firstOrNull); // null (safe)

// Or provide a fallback:
print(empty.firstWhere((_) => true, orElse: () => -1)); // -1
```

---

## Best Practices

- **Prefer `Iterable` parameters** in function signatures when you don't need indexing — it's more flexible.
- **Use `toList()` once**, store the result, then operate on the list.
- **Use generators** (`sync*`) for complex lazy sequences instead of building lists manually.
- **Prefer `any()` over `.length > 0`** — it short-circuits.
- **Prefer `isEmpty` over `.length == 0`** — it's O(1) on lazy Iterables.

---

## Summary

| Concept | Key Point |
|---------|-----------|
| Lazy evaluation | Most Iterable methods compute on demand |
| Chaining | Compose `map()`, `where()`, `expand()` into pipelines |
| `sync*` / `yield` | Create lazy Iterables with generator syntax |
| `toList()` / `toSet()` | Materialize to a concrete collection |
| `Iterator<E>` | The low-level protocol; `for-in` is sugar for it |
