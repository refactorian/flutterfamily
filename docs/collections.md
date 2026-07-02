---
sidebar_position: 5
title: Collections
description: List, Set, Map, Iterable, spread, collection-if/for, and immutable collections in Dart.
---

---

## List

An ordered, indexable collection of elements.

```dart
// Creating lists
var empty = <int>[];
var nums = [1, 2, 3, 4, 5];
var names = ['Alice', 'Bob', 'Carol'];
var mixed = <Object>[1, 'hello', true];  // mixed types

// Fixed-length list
var fixed = List.filled(5, 0);  // [0, 0, 0, 0, 0]

// Generated list
var squares = List.generate(5, (i) => i * i);  // [0, 1, 4, 9, 16]

// From another iterable
var fromIterable = List.of({1, 2, 3}); // from a Set

// Accessing elements
print(nums[0]);         // 1  (zero-indexed)
print(nums.last);       // 5
print(nums.first);      // 1
print(nums.length);     // 5
print(nums.isEmpty);    // false
print(nums.isNotEmpty); // true

// Modifying lists
nums.add(6);             // [1, 2, 3, 4, 5, 6]
nums.addAll([7, 8]);     // [1, 2, 3, 4, 5, 6, 7, 8]
nums.insert(0, 0);       // [0, 1, 2, 3, ...]  insert at index 0
nums.insertAll(0, [-2, -1]); // insert multiple at index
nums.remove(8);          // removes first occurrence of 8
nums.removeAt(0);        // removes element at index 0
nums.removeLast();       // removes last element
nums.removeWhere((n) => n > 5); // remove by condition
nums[0] = 99;            // replace by index
nums.clear();            // remove all
```

### List Searching & Testing

```dart
var data = [10, 20, 30, 40, 50];

print(data.contains(30));              // true
print(data.indexOf(30));               // 2
print(data.lastIndexOf(30));           // 2
print(data.indexWhere((n) => n > 25)); // 2 (index of 30)
print(data.any((n) => n > 40));        // true
print(data.every((n) => n > 5));       // true
print(data.where((n) => n > 25).toList()); // [30, 40, 50]
print(data.firstWhere((n) => n > 25));     // 30
print(data.lastWhere((n) => n < 40));      // 30
print(data.singleWhere((n) => n == 30));   // 30 (throws if 0 or 2+ matches)
```

### List Transformation

```dart
var nums = [1, 2, 3, 4, 5];

// map — transform each element (returns lazy Iterable)
var doubled = nums.map((n) => n * 2).toList();  // [2, 4, 6, 8, 10]

// where — filter (returns lazy Iterable)
var evens = nums.where((n) => n.isEven).toList();  // [2, 4]

// expand — flatMap
var pairs = nums.expand((n) => [n, n * 10]).toList();
// [1, 10, 2, 20, 3, 30, 4, 40, 5, 50]

// reduce — combine to single value (list must be non-empty)
var sum = nums.reduce((acc, n) => acc + n);  // 15

// fold — like reduce but with initial value (works on empty lists)
var product = nums.fold(1, (acc, n) => acc * n);  // 120

// take / skip
print(nums.take(3).toList());  // [1, 2, 3]
print(nums.skip(2).toList());  // [3, 4, 5]
print(nums.takeWhile((n) => n < 4).toList()); // [1, 2, 3]
print(nums.skipWhile((n) => n < 3).toList()); // [3, 4, 5]

// sort — in place
var unsorted = [3, 1, 4, 1, 5, 9, 2, 6];
unsorted.sort();  // [1, 1, 2, 3, 4, 5, 6, 9]

// Custom sort
var words = ['banana', 'apple', 'cherry'];
words.sort((a, b) => a.length.compareTo(b.length));
// ['apple', 'banana', 'cherry']

// reversed
print([1, 2, 3].reversed.toList());  // [3, 2, 1]

// toSet — remove duplicates
print([1, 2, 2, 3, 3, 3].toSet());  // {1, 2, 3}

// join
print(['a', 'b', 'c'].join(', ')); // a, b, c

// sublist
print([1, 2, 3, 4, 5].sublist(1, 3)); // [2, 3]
```

### Spread & Collection Control

```dart
var a = [1, 2, 3];
var b = [4, 5, 6];

// Spread operator
var combined = [...a, ...b];   // [1, 2, 3, 4, 5, 6]

// Null-aware spread
List<int>? maybe = null;
var safe = [0, ...?maybe, 9]; // [0, 9]

// collection-if
bool showExtra = true;
var list = [
  1,
  2,
  if (showExtra) 3,   // only included when true
  4,
];
print(list); // [1, 2, 3, 4]

// collection-if with else
var items = [
  'always',
  if (DateTime.now().hour < 12) 'morning' else 'afternoon',
  'always2',
];

// collection-for
var matrix = [
  for (var i = 1; i <= 3; i++)
    for (var j = 1; j <= 3; j++)
      '$i×$j=${i * j}',
];
// ['1×1=1', '1×2=2', ..., '3×3=9']
```

---

## Set

An unordered collection with **no duplicates**.

```dart
// Creating sets
var empty = <int>{};          // empty set (NOTE: {} alone is a Map!)
var nums = {1, 2, 3, 4, 5};
var fromList = Set.of([1, 2, 2, 3, 3, 3]); // {1, 2, 3}

// Adding / removing
var s = <String>{};
s.add('apple');
s.addAll(['banana', 'cherry']);
s.remove('banana');
s.removeWhere((item) => item.length > 5);

// Checking
print(s.contains('apple'));  // true
print(s.length);
print(s.isEmpty);

// Set operations
var a = {1, 2, 3, 4, 5};
var b = {3, 4, 5, 6, 7};

print(a.union(b));        // {1, 2, 3, 4, 5, 6, 7}
print(a.intersection(b)); // {3, 4, 5}
print(a.difference(b));   // {1, 2}  (in a but not b)

// Converting
print(a.toList());        // [1, 2, 3, 4, 5] (order may vary)
```

---

## Map

A collection of key-value pairs. Keys are unique.

```dart
// Creating maps
var empty = <String, int>{};
var ages = {'Alice': 30, 'Bob': 25, 'Carol': 35};
var fromEntries = Map.fromEntries([
  MapEntry('x', 10),
  MapEntry('y', 20),
]);

// Accessing values
print(ages['Alice']);    // 30
print(ages['Unknown']); // null (not an error!)

// Safe access
print(ages['Unknown'] ?? 0);  // 0

// putIfAbsent — insert if key not present
ages.putIfAbsent('Dave', () => 40);  // adds Dave: 40
ages.putIfAbsent('Alice', () => 99); // skips — Alice already exists

// Updating
ages['Alice'] = 31;             // update or insert
ages.update('Bob', (v) => v + 1); // update existing (throws if missing)
ages.update('Eve', (v) => v + 1, ifAbsent: () => 20); // update or insert

// Removing
ages.remove('Carol');
ages.removeWhere((key, value) => value < 25);

// Iterating
for (var entry in ages.entries) {
  print('${entry.key}: ${entry.value}');
}

// Keys and values
print(ages.keys.toList());      // ['Alice', 'Bob', ...]
print(ages.values.toList());    // [31, 26, ...]
print(ages.containsKey('Bob')); // true
print(ages.containsValue(31));  // true

// Map methods
var doubled = ages.map((k, v) => MapEntry(k, v * 2));
```

### Nested Maps & JSON-like Structures

```dart
// JSON-like nested map
Map<String, dynamic> user = {
  'id': 1,
  'name': 'Alice',
  'address': {
    'city': 'Dhaka',
    'country': 'Bangladesh',
  },
  'tags': ['flutter', 'dart'],
};

// Access nested values
print(user['name']);                   // Alice
print((user['address'] as Map)['city']); // Dhaka
print((user['tags'] as List)[0]);      // flutter

// Type-safe access pattern
String? city = (user['address'] as Map<String, dynamic>?)?['city'] as String?;
```

---

## Iterable

`List`, `Set`, and most collection methods return `Iterable` — a lazy sequence.

```dart
// Iterable is lazy — no work is done until you iterate
var lazy = [1, 2, 3, 4, 5]
    .where((n) => n.isOdd)
    .map((n) => n * 10);
// Nothing computed yet!

for (var n in lazy) {
  print(n); // 10, 30, 50
}

// Force evaluation with toList() or toSet()
var eager = lazy.toList(); // [10, 30, 50]

// Useful Iterable methods
var it = [5, 3, 1, 4, 2].where((n) => n > 2);
print(it.length);                   // 3
print(it.isEmpty);                  // false
print(it.first);                    // 5
print(it.last);                     // 4
print(it.elementAt(1));             // 3
print(it.toList());                 // [5, 3, 4]
print(it.contains(3));              // true
print(it.any((n) => n > 4));        // true
print(it.every((n) => n > 0));      // true
print(it.fold(0, (a, b) => a + b)); // 12
print(it.join(' - '));              // 5 - 3 - 4
```

---

## Queue & Other Collections

```dart
import 'dart:collection';

// Queue — efficient add/remove from both ends
var queue = Queue<int>();
queue.addFirst(1);   // [1]
queue.addLast(2);    // [1, 2]
queue.addFirst(0);   // [0, 1, 2]
queue.removeFirst(); // returns 0
queue.removeLast();  // returns 2

// LinkedList — doubly linked
// HashMap — unordered map (slightly faster than Map for large data)
// SplayTreeMap — sorted by key
// LinkedHashMap — insertion-ordered (this is what {} gives you by default!)
```

---

## Practical Collection Patterns

```dart
// Group by
var words = ['apple', 'ant', 'banana', 'blueberry', 'cherry'];
Map<String, List<String>> grouped = {};
for (var word in words) {
  grouped.putIfAbsent(word[0], () => []).add(word);
}
// {a: [apple, ant], b: [banana, blueberry], c: [cherry]}

// Frequency count
var text = 'hello world';
var freq = <String, int>{};
for (var char in text.split('')) {
  freq[char] = (freq[char] ?? 0) + 1;
}
// {h: 1, e: 1, l: 3, o: 2, ' ': 1, w: 1, r: 1, d: 1}

// Flatten
var nested = [[1, 2], [3, 4], [5, 6]];
var flat = nested.expand((list) => list).toList();
// [1, 2, 3, 4, 5, 6]

// Zip two lists
var keys = ['a', 'b', 'c'];
var values = [1, 2, 3];
var zipped = Map.fromIterables(keys, values);
// {a: 1, b: 2, c: 3}

// Chunk / batch
List<List<T>> chunk<T>(List<T> list, int size) {
  return [
    for (var i = 0; i < list.length; i += size)
      list.sublist(i, (i + size).clamp(0, list.length))
  ];
}
print(chunk([1,2,3,4,5,6,7], 3)); // [[1,2,3], [4,5,6], [7]]
```

---

## Immutable Collections

```dart
// const lists/sets/maps are deeply immutable
const immutableList = [1, 2, 3];
// immutableList.add(4); // ❌ UnsupportedError at runtime

// List.unmodifiable — runtime immutable wrapper
var source = [1, 2, 3];
var unmod = List.unmodifiable(source);
// unmod.add(4); // ❌ UnsupportedError

// Map.unmodifiable
var unmodMap = Map.unmodifiable({'a': 1, 'b': 2});

// from package:collection (useful for Flutter state management)
// UnmodifiableListView, UnmodifiableMapView, UnmodifiableSetView
```

---

## Summary

| Type | Ordered? | Unique? | Key-Value? | Use When |
|------|----------|---------|------------|----------|
| `List<E>` | ✅ Yes | ❌ No | ❌ No | Ordered items, indexable |
| `Set<E>` | ❌ No | ✅ Yes | ❌ No | Unique items, fast lookup |
| `Map<K,V>` | ❌ No* | Keys ✅ | ✅ Yes | Key-value pairs |
| `Queue<E>` | ✅ Yes | ❌ No | ❌ No | FIFO/LIFO operations |

*`LinkedHashMap` (the default) preserves insertion order.
