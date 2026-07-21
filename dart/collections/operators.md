---
title: Collection Operators
sidebar_position: 17
description: Master Dart collection operators — spread (...), null-aware spread (...?), cascade (..), null-aware cascade (?..), records inside collections, pattern matching, and destructuring.
---

# Collection Operators & Language Features

Dart provides powerful operators and language constructs designed specifically to work seamlessly with collections. This guide covers spread operators, cascades, records, pattern matching, destructuring, and switch patterns when applied to collections.

---

## 1. Spread Operator (`...`) & Null-Aware Spread (`...?`)

The spread operator inserts all elements of an iterable into another collection.

```dart
// Basic spread
final listA = [1, 2, 3];
final listB = [4, 5, 6];
final combined = [...listA, ...listB]; // [1, 2, 3, 4, 5, 6]

// Null-aware spread
List<int>? nullableList = null;
final safeList = [0, ...?nullableList, 7]; // [0, 7]
```

### Map Spreading

When spreading maps, keys defined later override earlier ones:

```dart
final defaults = {'theme': 'light', 'fontSize': 14, 'showNotifications': true};
final userPreferences = {'theme': 'dark', 'fontSize': 16};

final finalConfig = {
  ...defaults,
  ...userPreferences,
};
// Result: {theme: 'dark', fontSize: 16, showNotifications: true}
```

---

## 2. Cascade Operator (`..`) & Null-Aware Cascade (`?..`)

Cascades allow you to perform a sequence of operations on the same object.

```dart
// Without cascade
final list = <int>[];
list.add(1);
list.add(2);
list.sort();

// With cascade
final resultList = <int>[]
  ..add(3)
  ..add(1)
  ..add(2)
  ..sort(); // Returns the list [1, 2, 3]
```

### Combining Cascades with Collection Methods

```dart
List<String> getCleanedTags(List<String> rawTags) {
  return rawTags.map((t) => t.trim().toLowerCase()).toList()
    ..removeWhere((t) => t.isEmpty)
    ..sort();
}
```

:::warning
Be careful with methods that return a value instead of `void` or `this`. `list..removeAt(0)` returns the `list`, not the removed element!
:::

---

## 3. Records inside Collections

Dart Records pair naturally with collections to create lightweight, type-safe tuples without writing custom classes.

```dart
// List of records
final List<(String name, int score)> leaderboard = [
  ('Alice', 95),
  ('Bob', 88),
  ('Charlie', 92),
];

// Sort list of records by score descending
leaderboard.sort((a, b) => b.score.compareTo(a.score));

for (final (name, score) in leaderboard) {
  print('$name: $score');
}
```

### Map with Record Keys or Values

```dart
// Key is a record representing 2D grid coordinates
final grid = <(int x, int y), String>{
  (0, 0): 'Start',
  (0, 1): 'Wall',
  (1, 1): 'Treasure',
};

print(grid[(1, 1)]); // Treasure
```

---

## 4. Pattern Matching & Destructuring Collections

Dart 3 introduced pattern matching, allowing direct destructuring of lists and maps.

### List Pattern Matching

```dart
final numbers = [1, 2, 3];

// Destructuring exact length
final [first, second, third] = numbers;
print('$first, $second, $third'); // 1, 2, 3

// Rest elements (...)
final [head, ...tail] = [10, 20, 30, 40];
print('Head: $head, Tail: $tail'); // Head: 10, Tail: [20, 30, 40]

// Matching specific positions with sub-patterns
final [a, _, c, ...rest] = [1, 99, 3, 4, 5, 6];
print('$a, $c, $rest'); // 1, 3, [4, 5, 6]
```

### Map Pattern Matching

```dart
final json = {'type': 'user', 'name': 'Alice', 'id': 42};

// Destructuring map keys
if (json case {'type': 'user', 'name': String name, 'id': int id}) {
  print('User $name has ID $id');
}
```

---

## 5. Switch Patterns with Collections

Use `switch` statements and expressions to parse complex structured data:

```dart
String processCommand(List<String> args) {
  return switch (args) {
    [] => 'No command provided',
    ['help'] => 'Displaying help info',
    ['user', 'get', final id] => 'Fetching user $id',
    ['user', 'delete', final id] => 'Deleting user $id',
    ['config', ...final options] => 'Configuring with options: $options',
    _ => 'Unknown command',
  };
}

void main() {
  print(processCommand([])); // No command provided
  print(processCommand(['user', 'get', '42'])); // Fetching user 42
  print(processCommand(['config', '--verbose', '--debug'])); // Configuring with options: [--verbose, --debug]
}
```

---

## Summary

- Use `...` and `...?` for clean, immutable composition of collections.
- Use `..` to apply multiple mutations fluently.
- Combine **Records** with `List` and `Map` for quick structured data without class boilerplate.
- Leverage **Dart 3 pattern matching** (`[a, ...rest]`) for elegant collection parsing and validation.
