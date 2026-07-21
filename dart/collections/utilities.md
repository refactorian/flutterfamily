---
title: Collection Utilities
sidebar_position: 18
description: Deep dive into Dart collection utilities — map, where, expand, reduce, fold, zip, grouping, chunking, flattening, and generators (sync* / async*).
---

# Collection Utilities

Dart collections are equipped with powerful functional utility methods. In addition, helper techniques like chunking, partitioning, zip, and grouping enable advanced data processing pipelines.

---

## 1. Fundamental Transformation & Filtering

### `map()` — Transform Each Element

```dart
final numbers = [1, 2, 3, 4];
final squared = numbers.map((n) => n * n).toList(); // [1, 4, 9, 16]
```

### `where()` & `whereType()` — Filter

```dart
final mixed = [1, 'apple', 2, 'banana', 3.14];
final intsOnly = mixed.whereType<int>().toList(); // [1, 2]
```

### `expand()` — FlatMap / Flattening

```dart
final pairs = [[1, 2], [3, 4], [5, 6]];
final flattened = pairs.expand((list) => list).toList(); // [1, 2, 3, 4, 5, 6]
```

---

## 2. Accumulation: `reduce()` vs `fold()`

- `reduce()` uses the first element as the initial accumulator. Throws error if collection is empty.
- `fold()` accepts an explicit initial value and works on empty collections.

```dart
final numbers = [10, 20, 30];

// reduce
final sumReduce = numbers.reduce((acc, val) => acc + val); // 60

// fold (safely handles empty lists and type conversions)
final emptyList = <int>[];
final sumFold = emptyList.fold(0, (acc, val) => acc + val); // 0

// Type change with fold (List<int> -> Map<String, int>)
final stats = numbers.fold<Map<String, int>>(
  {'sum': 0, 'count': 0},
  (acc, n) {
    acc['sum'] = acc['sum']! + n;
    acc['count'] = acc['count']! + 1;
    return acc;
  },
);
```

---

## 3. Advanced Utilities: Grouping, Chunking & Partitioning

### Grouping (`groupBy`)

Group items by a key function using standard Dart:

```dart
final words = ['apple', 'apricot', 'banana', 'blueberry', 'cherry'];

final Map<String, List<String>> grouped = {};
for (final word in words) {
  final key = word[0];
  grouped.putIfAbsent(key, () => []).add(word);
}
// {a: [apple, apricot], b: [banana, blueberry], c: [cherry]}
```

Or using `package:collection`:

```dart
import 'package:collection/collection.dart';

final groupedByLen = groupBy(words, (w) => w.length);
// {5: [apple], 7: [apricot], 6: [banana, cherry], 9: [blueberry]}
```

### Chunking / Batching

Splitting a list into chunks of fixed size:

```dart
List<List<T>> chunk<T>(List<T> list, int chunkSize) {
  return [
    for (var i = 0; i < list.length; i += chunkSize)
      list.sublist(i, (i + chunkSize > list.length) ? list.length : i + chunkSize)
  ];
}

void main() {
  final numbers = [1, 2, 3, 4, 5, 6, 7, 8];
  print(chunk(numbers, 3)); // [[1, 2, 3], [4, 5, 6], [7, 8]]
}
```

### Partitioning

Splitting a collection into two lists based on a predicate:

```dart
(List<T> match, List<T> nonMatch) partition<T>(Iterable<T> iterable, bool Function(T) test) {
  final match = <T>[];
  final nonMatch = <T>[];
  for (final element in iterable) {
    if (test(element)) {
      match.add(element);
    } else {
      nonMatch.add(element);
    }
  }
  return (match, nonMatch);
}

void main() {
  final numbers = [1, 2, 3, 4, 5, 6];
  final (evens, odds) = partition(numbers, (n) => n.isEven);
  print('Evens: $evens, Odds: $odds'); // Evens: [2, 4, 6], Odds: [1, 3, 5]
}
```

### Zipping Two Iterables

Combining elements of two iterables pairwise:

```dart
Iterable<(A, B)> zip<A, B>(Iterable<A> a, Iterable<B> b) sync* {
  final itA = a.iterator;
  final itB = b.iterator;
  while (itA.moveNext() && itB.moveNext()) {
    yield (itA.current, itB.current);
  }
}

void main() {
  final keys = ['id', 'name', 'role'];
  final values = [101, 'Alice', 'Admin'];

  final zipped = zip(keys, values).toList();
  print(zipped); // [(id, 101), (name, Alice), (role, Admin)]
}
```

---

## 4. Lazy Generator Functions (`sync*` & `async*`)

Dart generators allow custom iterative algorithms with zero memory allocation overhead.

```dart
// Synchronous generator
Iterable<int> range(int start, int end, [int step = 1]) sync* {
  for (var i = start; i < end; i += step) {
    yield i;
  }
}

void main() {
  for (final n in range(0, 10, 2)) {
    print(n); // 0, 2, 4, 6, 8
  }
}
```

---

## Summary

| Goal | Technique / Method |
|---|---|
| Filter elements | `where()`, `whereType()` |
| Transform 1-to-1 | `map()` |
| Transform 1-to-N & flatten | `expand()` |
| Combine into single result | `fold()` (preferred over `reduce()`) |
| Group elements | `groupBy` or `putIfAbsent` |
| Split into batches | Sublist chunking |
| Combine 2 lists into pairs | Custom `zip` generator or `IterableZip` |

---

**Previous:** [Collection Operators](./operators)  
**Next:** [Collection Equality](./equality)  
**Related:** [Iterable\<E\>](./iterable) · [Common Patterns](./patterns)
