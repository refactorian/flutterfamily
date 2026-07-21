---
title: HashSet<E>
sidebar_position: 12
description: Complete guide to Dart's HashSet<E> — the fastest unordered set backed by a hash table. Covers constructors, custom equality, performance, and when to prefer over the default Set.
---

# `HashSet<E>`

`HashSet<E>` is a `Set` implementation backed by a **hash table** with **no guaranteed iteration order**. It provides the fastest average-case performance for membership tests, insertions, and removals — at the cost of unpredictable iteration order.

---

## When to Use

✅ Use `HashSet<E>` when you need:
- Maximum performance for `contains()`, `add()`, and `remove()`
- Uniqueness without caring about order
- High-volume membership testing (millions of elements)
- Custom equality semantics (case-insensitive, by field, etc.)

❌ Don't use `HashSet<E>` when you need:
- Predictable iteration order → use `LinkedHashSet` (default `{}`)
- Sorted elements → use `SplayTreeSet`
- Index-based access → use `List<E>`

---

## Import

```dart
import 'dart:collection';
```

---

## Constructors

### `HashSet()`

Creates an empty HashSet using `==` and `hashCode`.

```dart
import 'dart:collection';

var hs = HashSet<int>();
hs.add(3);
hs.add(1);
hs.add(4);
hs.add(1); // duplicate — ignored
print(hs.length); // 3
// iteration order is NOT guaranteed
```

### `HashSet({equals, hashCode, isValidKey})`

Creates with **custom equality**. The most powerful constructor.

```dart
import 'dart:collection';

// Case-insensitive string set
var caseInsensitive = HashSet<String>(
  equals: (a, b) => a.toLowerCase() == b.toLowerCase(),
  hashCode: (s) => s.toLowerCase().hashCode,
);

caseInsensitive.add('Alice');
caseInsensitive.add('alice'); // treated as duplicate
caseInsensitive.add('ALICE'); // treated as duplicate
print(caseInsensitive.length); // 1
print(caseInsensitive.contains('ALICE')); // true
```

### `HashSet.identity()`

Elements are compared by **identity** (`identical()`), not by `==`.

```dart
var hs = HashSet<List<int>>.identity();
var l1 = [1, 2, 3];
var l2 = [1, 2, 3]; // same content, different object
hs.add(l1);
hs.add(l2); // NOT a duplicate (different reference)
print(hs.length); // 2
```

### `HashSet.of(Iterable<E> elements)`

Creates a HashSet from an iterable.

```dart
var hs = HashSet.of([1, 2, 2, 3, 3, 3]);
print(hs.length); // 3
```

### `HashSet.from(Iterable elements)`

Like `.of()` but accepts `Iterable<dynamic>`.

---

## Methods

`HashSet` implements the full `Set<E>` interface. See [Set\<E\>](./set) for the complete method reference. Key operations:

| Method | Description | Complexity |
|--------|-------------|-----------|
| `add(E)` | Add element | O(1) avg |
| `remove(Object?)` | Remove element | O(1) avg |
| `contains(Object?)` | Membership test | O(1) avg |
| `addAll(Iterable)` | Add multiple | O(k) |
| `removeAll(Iterable)` | Remove multiple | O(k) |
| `union(Set)` | New set: this ∪ other | O(n + m) |
| `intersection(Set)` | New set: this ∩ other | O(n) |
| `difference(Set)` | New set: this − other | O(n) |
| `retainAll(Iterable)` | Keep intersection in place | O(n) |
| `retainWhere(test)` | Keep matching in place | O(n) |
| `removeWhere(test)` | Remove matching | O(n) |
| `clear()` | Remove all | O(n) |
| `length` | Count | O(1) |

---

## Performance & Complexity

| Operation | `HashSet` | `LinkedHashSet` | `SplayTreeSet` |
|-----------|----------|----------------|---------------|
| `add()` | O(1) avg | O(1) avg | O(log n) |
| `remove()` | O(1) avg | O(1) avg | O(log n) |
| `contains()` | O(1) avg | O(1) avg | O(log n) |
| Iteration | O(n) | O(n) | O(n) |
| Order | None ❌ | Insertion ✅ | Sorted ✅ |
| Memory | Lowest | Medium | Highest |

:::tip
`HashSet` is the fastest set for pure membership testing. If you iterate frequently or need order, switch to `LinkedHashSet`.
:::

---

## Real-World Examples

### Example 1: Visited URLs (Web Crawler)

```dart
import 'dart:collection';

class WebCrawler {
  final HashSet<String> _visited = HashSet();
  final Queue<String> _queue = Queue();

  WebCrawler(String startUrl) {
    _queue.add(startUrl);
    _visited.add(startUrl);
  }

  void crawl() {
    while (_queue.isNotEmpty) {
      final url = _queue.removeFirst();
      print('Crawling: $url');
      for (final link in _extractLinks(url)) {
        if (_visited.add(link)) { // add() returns true if new
          _queue.add(link);
        }
      }
    }
  }

  List<String> _extractLinks(String url) => []; // placeholder
}
```

### Example 2: Bloom Filter Approximation

```dart
import 'dart:collection';

// Fast "definitely not in set" check using HashSet
class SpamFilter {
  final HashSet<int> _knownSpamHashes = HashSet();

  void learnSpam(String message) {
    _knownSpamHashes.add(message.hashCode);
  }

  bool isPossiblySpam(String message) =>
      _knownSpamHashes.contains(message.hashCode);
}
```

### Example 3: Unique Permissions

```dart
import 'dart:collection';

class AccessControl {
  final Map<String, HashSet<String>> _userPermissions = {};

  void grantPermission(String user, String permission) {
    _userPermissions
        .putIfAbsent(user, () => HashSet())
        .add(permission);
  }

  void revokePermission(String user, String permission) {
    _userPermissions[user]?.remove(permission);
  }

  bool hasPermission(String user, String permission) =>
      _userPermissions[user]?.contains(permission) ?? false;

  Set<String> commonPermissions(String user1, String user2) {
    final p1 = _userPermissions[user1] ?? HashSet<String>();
    final p2 = _userPermissions[user2] ?? HashSet<String>();
    return p1.intersection(p2);
  }
}
```

### Example 4: Duplicate Detection

```dart
import 'dart:collection';

// Detect duplicate records in a large dataset
List<T> removeDuplicates<T>(List<T> items) {
  final seen = HashSet<T>();
  return items.where((item) => seen.add(item)).toList();
}

// Custom deduplication by field
List<Map<String, dynamic>> deduplicateById(List<Map<String, dynamic>> items) {
  final seenIds = HashSet<int>();
  return items.where((item) => seenIds.add(item['id'] as int)).toList();
}

void main() {
  var data = [
    {'id': 1, 'name': 'Alice'},
    {'id': 2, 'name': 'Bob'},
    {'id': 1, 'name': 'Alice (duplicate)'},
    {'id': 3, 'name': 'Carol'},
  ];
  var unique = deduplicateById(data);
  print(unique.length); // 3
}
```

### Example 5: Set Operations on Large Datasets

```dart
import 'dart:collection';

// Find users who have both viewed AND purchased (conversion)
Set<int> findConverted(List<int> viewers, List<int> purchasers) {
  final viewerSet = HashSet.of(viewers);
  return HashSet.of(purchasers).intersection(viewerSet);
}

// Find users to re-target: viewed but didn't purchase
Set<int> findRetargets(List<int> viewers, List<int> purchasers) {
  final purchaserSet = HashSet.of(purchasers);
  return HashSet.of(viewers).difference(purchaserSet);
}

void main() {
  var viewers   = [1, 2, 3, 4, 5, 6, 7, 8];
  var purchasers = [3, 5, 7, 9, 10];
  print('Converted: ${findConverted(viewers, purchasers)}');  // {3, 5, 7}
  print('Retargets: ${findRetargets(viewers, purchasers)}');  // {1, 2, 4, 6, 8}
}
```

---

## Common Mistakes

### ❌ Depending on iteration order

```dart
import 'dart:collection';
var hs = HashSet.of([3, 1, 4, 1, 5, 9, 2, 6]);
for (var n in hs) print(n); // ❌ order is undefined and may change

// ✅ Sort if you need order
hs.toList()..sort()..forEach(print);
```

### ❌ Missing `hashCode` override when using custom objects

```dart
class Tag {
  final String name;
  Tag(this.name);
  @override bool operator ==(Object other) => other is Tag && name == other.name;
  // ❌ forgot hashCode! HashSet will treat equal objects as different
}

class TagFixed {
  final String name;
  TagFixed(this.name);
  @override bool operator ==(Object other) => other is TagFixed && name == other.name;
  @override int get hashCode => name.hashCode; // ✅
}
```

### ❌ Using `{}` expecting a HashSet

```dart
var s = {'a', 'b', 'c'}; // This is a LinkedHashSet, not HashSet
import 'dart:collection';
var hs = HashSet.of(['a', 'b', 'c']); // ✅ explicit HashSet
```

---

## Best Practices

- **Use `HashSet` for large-scale membership tests** where order is irrelevant.
- **Always override `hashCode` and `==` together** in custom key classes.
- **Use custom `equals`/`hashCode` constructors** for non-standard equality.
- **Prefer the default `Set` (`LinkedHashSet`)** for most cases — only reach for `HashSet` when you need the performance edge.

---

**Previous:** [SplayTreeMap\<K,V\>](./splay-tree-map)  
**Next:** [LinkedHashSet\<E\>](./linked-hashset)  
**Related:** [Set\<E\>](./set) · [LinkedHashSet\<E\>](./linked-hashset) · [SplayTreeSet\<E\>](./splay-tree-set)
