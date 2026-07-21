---
title: LinkedHashSet<E>
sidebar_position: 13
description: Complete guide to Dart's LinkedHashSet<E> — the default Set implementation that preserves insertion order while guaranteeing uniqueness with O(1) average operations.
---

# `LinkedHashSet<E>`

`LinkedHashSet<E>` is the **default** `Set` implementation in Dart. When you write `var s = {'a', 'b', 'c'}`, you get a `LinkedHashSet`. It combines a hash table for O(1) operations with a doubly-linked list to maintain **insertion order**.

---

## When to Use

✅ Use `LinkedHashSet<E>` when you need:
- Unique elements with **predictable insertion-order** iteration
- Fast O(1) membership testing
- The general-purpose set (almost all use cases)
- Ordered deduplication

❌ Don't use `LinkedHashSet<E>` when you need:
- Maximum speed (no ordering overhead) → use `HashSet`
- Sorted elements → use `SplayTreeSet`
- Index-based access → use `List<E>`

---

## Key Insight: Default Set

```dart
var s = {'a', 'b', 'c'};

import 'dart:collection';
print(s is LinkedHashSet); // true
```

The `Set` literal and `Set()` factory both create `LinkedHashSet`.

---

## Import

```dart
import 'dart:collection'; // needed for explicit LinkedHashSet type
```

---

## Constructors

### `LinkedHashSet()` (default)

Creates empty, using `==` and `hashCode`.

```dart
import 'dart:collection';

var s = LinkedHashSet<String>();
s.add('banana');
s.add('apple');
s.add('cherry');
s.add('apple'); // duplicate — ignored

print(s.toList()); // [banana, apple, cherry] — insertion order preserved!
```

### `LinkedHashSet({equals, hashCode, isValidKey})`

Custom equality — identical signature to `HashSet`.

```dart
import 'dart:collection';

var caseInsensitive = LinkedHashSet<String>(
  equals: (a, b) => a.toLowerCase() == b.toLowerCase(),
  hashCode: (s) => s.toLowerCase().hashCode,
);

caseInsensitive.add('Alice');
caseInsensitive.add('ALICE'); // duplicate (case-insensitive)
caseInsensitive.add('Bob');
caseInsensitive.add('alice'); // duplicate

print(caseInsensitive.toList()); // [Alice, Bob]
// Insertion order preserved; duplicates removed
```

### `LinkedHashSet.identity()`

Uses `identical()` for comparison, insertion order preserved.

### `LinkedHashSet.of(Iterable<E> elements)`

Creates from an iterable preserving insertion order and removing duplicates.

```dart
var s = LinkedHashSet.of(['c', 'a', 'b', 'a', 'c']);
print(s.toList()); // [c, a, b]
```

### `LinkedHashSet.from(Iterable elements)`

Like `.of()` but accepts `Iterable<dynamic>`.

---

## Insertion Order Guarantee

The defining feature:

```dart
var s = <String>{};
s.add('banana');
s.add('apple');
s.add('cherry');
s.add('banana'); // duplicate — keeps original position

print(s.toList()); // [banana, apple, cherry] — always

// Removing and re-adding changes position
s.remove('banana');
s.add('banana');
print(s.toList()); // [apple, cherry, banana]
```

---

## Methods

`LinkedHashSet` implements the full `Set<E>` interface. See [Set\<E\>](./set) for complete method documentation.

Key methods summary:

| Method | Description | Complexity |
|--------|-------------|-----------|
| `add(E)` | Add element; returns `true` if new | O(1) avg |
| `remove(Object?)` | Remove element | O(1) avg |
| `contains(Object?)` | Membership test | O(1) avg |
| `union(Set)` | New set: this ∪ other | O(n + m) |
| `intersection(Set)` | New set: this ∩ other | O(min(n,m)) |
| `difference(Set)` | New set: this − other | O(n) |
| `addAll(Iterable)` | Add multiple | O(k) |
| `removeAll(Iterable)` | Remove multiple | O(k) |
| `retainAll(Iterable)` | Keep only common | O(n) |
| `removeWhere(test)` | Remove matching | O(n) |
| `retainWhere(test)` | Keep matching | O(n) |
| `clear()` | Remove all | O(n) |
| `toList()` | Materialize in insertion order | O(n) |

---

## Real-World Examples

### Example 1: Ordered Search History

```dart
import 'dart:collection';

class SearchHistory {
  final int maxEntries;
  final LinkedHashSet<String> _history = LinkedHashSet();

  SearchHistory({this.maxEntries = 20});

  void search(String query) {
    // Move to most recent if already exists
    _history.remove(query);
    _history.add(query);

    // Trim oldest if over limit
    while (_history.length > maxEntries) {
      _history.remove(_history.first);
    }
  }

  List<String> get recentQueries => _history.toList().reversed.toList();

  bool hasSearched(String query) => _history.contains(query);
}

void main() {
  var history = SearchHistory(maxEntries: 5);
  history.search('flutter');
  history.search('dart collections');
  history.search('riverpod');
  history.search('flutter');  // moves to end
  history.search('async dart');
  history.search('null safety');

  print(history.recentQueries);
  // [null safety, async dart, flutter, riverpod, dart collections]
}
```

### Example 2: Ordered Tag System

```dart
import 'dart:collection';

class Post {
  final String title;
  final LinkedHashSet<String> tags;

  Post(this.title, Iterable<String> tags)
      : tags = LinkedHashSet.of(tags);

  void addTag(String tag) => tags.add(tag);
  void removeTag(String tag) => tags.remove(tag);

  bool hasTag(String tag) => tags.contains(tag);

  // Tags in order they were added
  List<String> get orderedTags => tags.toList();
}

void main() {
  var post = Post('Dart Collections', ['dart', 'programming', 'tutorial']);
  post.addTag('flutter');
  post.addTag('dart'); // duplicate — ignored

  print(post.orderedTags); // [dart, programming, tutorial, flutter]
  print(post.hasTag('flutter')); // true
}
```

### Example 3: Processing Queue (Unique, Ordered)

```dart
import 'dart:collection';

class UniqueJobQueue {
  final LinkedHashSet<String> _pending = LinkedHashSet();
  final LinkedHashSet<String> _processing = LinkedHashSet();

  void enqueue(String jobId) => _pending.add(jobId);

  String? dequeue() {
    if (_pending.isEmpty) return null;
    final job = _pending.first;
    _pending.remove(job);
    _processing.add(job);
    return job;
  }

  void complete(String jobId) => _processing.remove(jobId);

  bool isQueued(String jobId) => _pending.contains(jobId);
  bool isProcessing(String jobId) => _processing.contains(jobId);

  List<String> get pendingJobs => _pending.toList();
}
```

### Example 4: Recently Visited Files

```dart
import 'dart:collection';

class RecentFiles {
  final int maxFiles;
  final LinkedHashSet<String> _files = LinkedHashSet();

  RecentFiles({this.maxFiles = 10});

  void open(String filePath) {
    _files.remove(filePath); // remove if exists
    _files.add(filePath);    // re-add at end (most recent)
    if (_files.length > maxFiles) {
      _files.remove(_files.first); // remove oldest
    }
  }

  List<String> get mostRecentFirst => _files.toList().reversed.toList();
  List<String> get oldest => _files.toList();
}
```

### Example 5: Feature Flags (Ordered)

```dart
import 'dart:collection';

class FeatureFlags {
  final LinkedHashSet<String> _enabled = LinkedHashSet();

  void enable(String feature) => _enabled.add(feature);
  void disable(String feature) => _enabled.remove(feature);
  bool isEnabled(String feature) => _enabled.contains(feature);

  // All enabled features in activation order
  List<String> get enabledFeatures => _enabled.toList();

  // Features enabled in both flag sets
  Set<String> commonWith(FeatureFlags other) =>
      _enabled.intersection(other._enabled);
}
```

---

## Flutter Example: Multi-Select with Order

```dart
import 'dart:collection';

class MultiSelectWidget extends StatefulWidget {
  final List<String> options;
  const MultiSelectWidget({required this.options, super.key});

  @override
  State<MultiSelectWidget> createState() => _MultiSelectWidgetState();
}

class _MultiSelectWidgetState extends State<MultiSelectWidget> {
  // LinkedHashSet preserves selection order
  final LinkedHashSet<String> _selected = LinkedHashSet();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        ...widget.options.map((option) => CheckboxListTile(
              title: Text(option),
              value: _selected.contains(option),
              onChanged: (checked) => setState(() =>
                  checked! ? _selected.add(option) : _selected.remove(option)),
            )),
        const Divider(),
        Text(
          'Selected (in order): ${_selected.join(', ')}',
          style: const TextStyle(fontWeight: FontWeight.bold),
        ),
      ],
    );
  }
}
```

---

## Performance Comparison

| Operation | `LinkedHashSet` | `HashSet` | `SplayTreeSet` |
|-----------|----------------|---------|---------------|
| `add()` | O(1) avg | O(1) avg | O(log n) |
| `remove()` | O(1) avg | O(1) avg | O(log n) |
| `contains()` | O(1) avg | O(1) avg | O(log n) |
| Iteration | O(n), insertion order | O(n), random | O(n), sorted |
| Memory | Medium | Lowest | Highest |

---

## Common Mistakes

### ❌ Expecting `first` to be the "smallest" element

```dart
var s = <String>{'banana', 'apple', 'cherry'};
print(s.first); // 'banana' — insertion order, NOT alphabetical!

// ✅ For sorted first:
print(s.toList()..sort()..first); // 'apple'
// Or use SplayTreeSet
```

### ❌ Thinking update changes position

```dart
var s = <String>{'a', 'b', 'c'};
s.add('a'); // No-op — 'a' stays at its original position
print(s.toList()); // [a, b, c]

// To move to end:
s.remove('a');
s.add('a');
print(s.toList()); // [b, c, a]
```

---

## Best Practices

- **Use `LinkedHashSet` (the default `Set` literal) for virtually all set use cases**.
- **Exploit insertion order** for features like search history, recently viewed, and ordered tags.
- **Switch to `HashSet`** only when you've profiled and need the raw speed.
- **Switch to `SplayTreeSet`** when you need elements in sorted order.

---

**Previous:** [HashSet\<E\>](./hashset)  
**Next:** [SplayTreeSet\<E\>](./splay-tree-set)  
**Related:** [Set\<E\>](./set) · [HashSet\<E\>](./hashset) · [SplayTreeSet\<E\>](./splay-tree-set)
