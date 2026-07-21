---
title: Common Collection Patterns
sidebar_position: 22
description: Essential patterns for Dart collections — shopping carts, task schedulers, graph traversal, caches, deduplication, grouping, and pagination.
---

# Common Collection Patterns

Practical, real-world patterns for solving recurring programming problems with Dart collections.

---

## 1. Deduplication

### Preserving Order
```dart
final rawItems = ['apple', 'banana', 'apple', 'cherry', 'banana'];
final uniquePreserved = rawItems.toSet().toList(); 
// ['apple', 'banana', 'cherry']
```

### Deduplicating Custom Objects by Key
```dart
class User {
  final int id;
  final String name;
  User(this.id, this.name);
}

final users = [
  User(1, 'Alice'),
  User(2, 'Bob'),
  User(1, 'Alice Duplicate'),
];

final uniqueUsers = {
  for (final user in users) user.id: user
}.values.toList();
```

---

## 2. Dynamic Grouping (`Map<K, List<V>>`)

Group items by a specific attribute:

```dart
class Product {
  final String category;
  final String name;
  final double price;
  Product(this.category, this.name, this.price);
}

final products = [
  Product('Electronics', 'Laptop', 999.99),
  Product('Electronics', 'Phone', 699.99),
  Product('Books', 'Dart Guide', 29.99),
];

final Map<String, List<Product>> categoryMap = {};
for (final p in products) {
  categoryMap.putIfAbsent(p.category, () => []).add(p);
}
```

---

## 3. Frequency Counter

Count occurrences of elements:

```dart
final votes = ['Alice', 'Bob', 'Alice', 'Charlie', 'Alice', 'Bob'];

final Map<String, int> counts = {};
for (final vote in votes) {
  counts.update(vote, (c) => c + 1, ifAbsent: () => 1);
}
// {Alice: 3, Bob: 2, Charlie: 1}
```

---

## 4. Sliding Window / Pagination

### Array Chunking (Pagination)
```dart
List<List<T>> paginate<T>(List<T> items, int pageSize) {
  return [
    for (var i = 0; i < items.length; i += pageSize)
      items.sublist(i, (i + pageSize).clamp(0, items.length))
  ];
}
```

---

## 5. Breadth-First Search (BFS) using Queue

```dart
import 'dart:collection';

List<T> bfs<T>(T start, Map<T, List<T>> adjacencyList) {
  final visited = <T>{start};
  final queue = Queue<T>()..add(start);
  final result = <T>[];

  while (queue.isNotEmpty) {
    final current = queue.removeFirst();
    result.add(current);

    for (final neighbor in adjacencyList[current] ?? []) {
      if (visited.add(neighbor)) {
        queue.add(neighbor);
      }
    }
  }
  return result;
}
```

---

## 6. Depth-First Search (DFS) using Stack (Queue)

```dart
import 'dart:collection';

List<T> dfs<T>(T start, Map<T, List<T>> adjacencyList) {
  final visited = <T>{};
  final stack = Queue<T>()..addLast(start);
  final result = <T>[];

  while (stack.isNotEmpty) {
    final current = stack.removeLast();
    if (visited.add(current)) {
      result.add(current);
      for (final neighbor in (adjacencyList[current] ?? []).reversed) {
        if (!visited.contains(neighbor)) {
          stack.addLast(neighbor);
        }
      }
    }
  }
  return result;
}
```

---

## Summary

These common patterns form the foundation for complex algorithms and production application features in Dart and Flutter.
