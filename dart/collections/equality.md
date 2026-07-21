---
title: Collection Equality
sidebar_position: 19
description: Understanding collection equality in Dart — reference equality vs structural equality, package:collection equality classes (ListEquality, SetEquality, MapEquality, DeepCollectionEquality).
---

# Collection Equality

In Dart, collections compare by **identity (reference equality)** by default, **not** by content (structural equality). This guide explains why `[1, 2] != [1, 2]` and how to perform deep structural comparisons accurately.

---

## 1. Default Equality Behavior (Reference Equality)

By default, Dart collections use the `identical()` check when evaluated with `==`:

```dart
final listA = [1, 2, 3];
final listB = [1, 2, 3];

print(listA == listB); // FALSE! Different references in memory.

final listC = listA;
print(listA == listC); // TRUE! Same reference.
```

The same applies to `Set` and `Map`:

```dart
print({'a': 1} == {'a': 1}); // FALSE
print({1, 2, 3} == {1, 2, 3}); // FALSE
```

:::info Exception: `const` Collections
Compile-time constant (`const`) collections are **canonicalized**. Identical `const` collection literals evaluate to the exact same instance:

```dart
print(const [1, 2] == const [1, 2]); // TRUE! (Same constant instance)
```
:::

---

## 2. Structural Equality with `package:collection`

To compare collections by their contents, use the `package:collection` package.

```yaml
# pubspec.yaml
dependencies:
  collection: ^1.18.0
```

### Shallow Equality Helpers

```dart
import 'package:collection/collection.dart';

// List equality
final listEq = ListEquality();
print(listEq.equals([1, 2, 3], [1, 2, 3])); // TRUE

// Set equality (ignores element order)
final setEq = SetEquality();
print(setEq.equals({3, 2, 1}, {1, 2, 3})); // TRUE

// Map equality
final mapEq = MapEquality();
print(mapEq.equals({'a': 1}, {'a': 1})); // TRUE
```

---

## 3. Deep Structural Equality (`DeepCollectionEquality`)

When collections contain nested lists, maps, or sets, shallow equality is insufficient. Use `DeepCollectionEquality`:

```dart
import 'package:collection/collection.dart';

final deepEq = DeepCollectionEquality();

final nestedA = {
  'user': 'Alice',
  'tags': ['flutter', 'dart'],
  'settings': {'dark': true}
};

final nestedB = {
  'user': 'Alice',
  'tags': ['flutter', 'dart'],
  'settings': {'dark': true}
};

print(deepEq.equals(nestedA, nestedB)); // TRUE!
```

---

## 4. Custom Class Integration (Overriding `==` & `hashCode`)

When using custom classes inside collections or using collections inside data objects, override `==` and `hashCode` using `ListEquality` or `DeepCollectionEquality`:

```dart
import 'package:collection/collection.dart';

class UserGroup {
  final String id;
  final List<String> memberIds;

  UserGroup(this.id, this.memberIds);

  static const _listEquality = ListEquality<String>();

  @override
  bool operator ==(Object other) =>
      identical(this, other) ||
      other is UserGroup &&
          runtimeType == other.runtimeType &&
          id == other.id &&
          _listEquality.equals(memberIds, other.memberIds);

  @override
  int get hashCode => id.hashCode ^ _listEquality.hash(memberIds);
}

void main() {
  final group1 = UserGroup('admin', ['u1', 'u2']);
  final group2 = UserGroup('admin', ['u1', 'u2']);

  print(group1 == group2); // TRUE
}
```

---

## Summary of Equality Types

| Comparison Method | Description | Example Use Case |
|---|---|---|
| `==` (Default) | Reference equality (`identical`) | Checking if two references point to the same list |
| `const` check | Canonicalized instance match | Comparing constant configurations |
| `ListEquality()` | Shallow equality for lists | Comparing simple `List<int>` |
| `SetEquality()` | Unordered element equality | Comparing `Set<String>` |
| `MapEquality()` | Key-value pair equality | Comparing simple JSON maps |
| `DeepCollectionEquality()` | Recursive deep equality | Comparing complex nested API responses |
