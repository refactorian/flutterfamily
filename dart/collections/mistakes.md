---
title: Common Mistakes
sidebar_position: 23
description: Comprehensive catalog of common Dart collection pitfalls, runtime errors, performance antipatterns, and how to fix them.
---

# Common Collection Mistakes

Avoid these common pitfalls when working with Dart collections.

---

## 1. Modifying a Collection While Iterating

### ❌ Bad Code
```dart
final numbers = [1, 2, 3, 4, 5];
for (final n in numbers) {
  if (n.isEven) {
    numbers.remove(n); // Throws ConcurrentModificationError!
  }
}
```

### ✅ Solution
Use `removeWhere()` or iterate over a shallow copy:
```dart
// Option A: removeWhere
numbers.removeWhere((n) => n.isEven);

// Option B: Shallow copy iteration
for (final n in [...numbers]) {
  if (n.isEven) numbers.remove(n);
}
```

---

## 2. Using `{}` Intending to Create a Set

### ❌ Bad Code
```dart
final mySet = {}; // Creates a Map<dynamic, dynamic>, NOT a Set!
print(mySet.runtimeType); // _Map<dynamic, dynamic>
```

### ✅ Solution
```dart
final mySet = <String>{}; // Explicit type parameter
final set2 = <int>{1, 2, 3};
```

---

## 3. Assuming `List.contains()` is Fast

### ❌ Bad Code
```dart
final hugeList = List.generate(100000, (i) => i);

// O(n) scan every single check - very slow in loops!
for (var i = 0; i < 1000; i++) {
  if (hugeList.contains(i)) { ... }
}
```

### ✅ Solution
Convert to a `Set` for O(1) checks:
```dart
final hugeSet = hugeList.toSet();
for (var i = 0; i < 1000; i++) {
  if (hugeSet.contains(i)) { ... }
}
```

---

## 4. Misunderstanding `List.filled()` Reference Sharing

### ❌ Bad Code
```dart
// All 3 elements point to the SAME List instance!
final grid = List.filled(3, <int>[]);
grid[0].add(99);

print(grid); // [[99], [99], [99]] - unexpected mutation!
```

### ✅ Solution
Use `List.generate()` to produce fresh instances:
```dart
final grid = List.generate(3, (_) => <int>[]);
grid[0].add(99);

print(grid); // [[99], [], []]
```

---

## 5. Expecting Equality (`==`) to Check Collection Contents

### ❌ Bad Code
```dart
final listA = [1, 2, 3];
final listB = [1, 2, 3];

if (listA == listB) {
  // Never executed! Reference comparison fails.
}
```

### ✅ Solution
Use `package:collection`:
```dart
import 'package:collection/collection.dart';

if (const ListEquality().equals(listA, listB)) {
  // Executed successfully
}
```

---

## 6. Null Safety Pitfalls with `Map` Lookups

### ❌ Bad Code
```dart
final Map<String, int> scores = {'Alice': 100};
int bobScore = scores['Bob']!; // Throws Null check operator used on a null value!
```

### ✅ Solution
```dart
int bobScore = scores['Bob'] ?? 0;

// Or test existence
if (scores.containsKey('Bob')) {
  print(scores['Bob']);
}
```

---

## Summary

- Am I mutating a list inside a `for-in` loop? (Use `removeWhere`)
- Did I write `{}` expecting a `Set`? (Use `<T>{}`)
- Am I using `List.contains` inside a tight loop? (Convert to `Set`)
- Did I create nested objects with `List.filled`? (Use `List.generate`)
- Am I comparing collections with `==`? (Use `package:collection`)
