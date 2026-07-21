---
title: SplayTreeSet<E>
sidebar_position: 14
description: Complete guide to Dart's SplayTreeSet<E> — a sorted set backed by a splay tree. Covers constructors, custom comparators, range queries, and comparison with other set types.
---

# `SplayTreeSet<E>`

`SplayTreeSet<E>` is a `Set` implementation backed by a **splay tree** — a self-adjusting binary search tree. Elements are always maintained in **sorted order** according to a comparator. It combines uniqueness, sorted iteration, and efficient range operations.

---

## When to Use

✅ Use `SplayTreeSet<E>` when you need:
- Unique elements in **sorted order**
- `first` / `last` to always be the min / max element
- Range queries — efficiently find elements between two values
- Nearest-element lookups (`firstAfter`, `lastBefore`)
- A sorted data structure that automatically stays ordered

❌ Don't use `SplayTreeSet<E>` when you need:
- O(1) operations → use `HashSet` or `LinkedHashSet`
- Insertion-order iteration → use `LinkedHashSet`
- Index-based access → use a sorted `List`

---

## Import

```dart
import 'dart:collection';
```

---

## Constructors

### `SplayTreeSet()` (default)

Uses the natural `Comparable` order.

```dart
import 'dart:collection';

var s = SplayTreeSet<int>();
s.addAll([5, 1, 3, 2, 4, 1, 2]); // duplicates ignored
print(s.toList()); // [1, 2, 3, 4, 5] — always sorted!

var words = SplayTreeSet<String>()..addAll(['banana', 'apple', 'cherry', 'avocado']);
print(words.toList()); // [apple, avocado, banana, cherry]
```

### `SplayTreeSet(int Function(E a, E b) compare)`

With a **custom comparator**:

```dart
import 'dart:collection';

// Descending order
var desc = SplayTreeSet<int>((a, b) => b.compareTo(a));
desc.addAll([3, 1, 4, 1, 5, 9, 2, 6]);
print(desc.toList()); // [9, 6, 5, 4, 3, 2, 1]

// By string length, then alphabetically
var byLength = SplayTreeSet<String>((a, b) {
  final len = a.length.compareTo(b.length);
  return len != 0 ? len : a.compareTo(b);
});
byLength.addAll(['banana', 'fig', 'apple', 'kiwi', 'cherry', 'plum']);
print(byLength.toList()); // [fig, kiwi, plum, apple, banana, cherry]
```

### `SplayTreeSet.of(Iterable<E> elements, [int Function(E,E)? compare])`

Creates from an iterable. Duplicates removed, elements sorted.

```dart
var s = SplayTreeSet.of([5, 3, 1, 4, 2, 3, 1]);
print(s.toList()); // [1, 2, 3, 4, 5]
```

### `SplayTreeSet.from(Iterable elements, [int Function(dynamic,dynamic)? compare])`

Like `.of()` but accepts `Iterable<dynamic>`.

---

## Key Properties

| Property | Description |
|----------|-------------|
| `first` | Smallest element (according to comparator) |
| `last` | Largest element |
| `single` | Only element; throws if 0 or 2+ |
| `length` | Number of elements |
| `isEmpty` / `isNotEmpty` | Emptiness check |

---

## Methods — Complete Reference

### Standard Set Methods (Inherited)

All [Set\<E\>](./set) methods apply: `add()`, `remove()`, `contains()`, `union()`, `intersection()`, `difference()`, `addAll()`, `removeAll()`, `retainAll()`, `removeWhere()`, `retainWhere()`, `clear()`, `toList()`, `toSet()`, `any()`, `every()`, etc.

### SplayTreeSet-Specific Methods

#### `firstAfter(E element)` → `E?`

Returns the smallest element **strictly greater than** `element`.

```dart
import 'dart:collection';

var s = SplayTreeSet.of([10, 20, 30, 40, 50]);
print(s.firstAfter(25)); // 30
print(s.firstAfter(50)); // null (nothing after max)
print(s.firstAfter(10)); // 20
```

#### `lastBefore(E element)` → `E?`

Returns the largest element **strictly less than** `element`.

```dart
print(s.lastBefore(25)); // 20
print(s.lastBefore(10)); // null (nothing before min)
print(s.lastBefore(50)); // 40
```

---

## Sorted Iteration

Elements always come out sorted — no need to call `.sort()`:

```dart
import 'dart:collection';

var scores = SplayTreeSet<int>();
scores.addAll([78, 92, 65, 88, 71, 95, 84]);

// Always sorted
print(scores.toList()); // [65, 71, 78, 84, 88, 92, 95]
print(scores.first);    // 65 (minimum)
print(scores.last);     // 95 (maximum)

// Top-3 scores
var top3 = scores.toList().reversed.take(3).toList();
print(top3); // [95, 92, 88]
```

---

## Range Queries

Efficiently retrieve elements within a range:

```dart
import 'dart:collection';

// Get all elements in [lo, hi] range
Iterable<E> range<E>(SplayTreeSet<E> set, E lo, E hi) sync* {
  var current = set.contains(lo) ? lo : set.firstAfter(lo);
  // Adjust if lo itself exists (firstAfter strictly greater)
  if (set.contains(lo)) {
    yield lo;
    current = set.firstAfter(lo);
  }
  while (current != null) {
    final cmp = (set.toList()[0] as Comparable).compareTo; // workaround
    // simpler approach using the built-in splay BST properties:
    break; // placeholder — see full example below
  }
}

// Practical range extraction
List<int> rangeList(SplayTreeSet<int> set, int lo, int hi) {
  final result = <int>[];
  var cur = set.contains(lo) ? lo : set.firstAfter(lo - 1);
  while (cur != null && cur <= hi) {
    result.add(cur);
    cur = set.firstAfter(cur);
  }
  return result;
}

void main() {
  var s = SplayTreeSet.of([10, 20, 30, 40, 50, 60, 70, 80, 90]);
  print(rangeList(s, 25, 65)); // [30, 40, 50, 60]
}
```

---

## Performance & Complexity

| Operation | `SplayTreeSet` | `LinkedHashSet` | `HashSet` |
|-----------|---------------|----------------|---------|
| `add()` | O(log n) amortized | O(1) avg | O(1) avg |
| `remove()` | O(log n) amortized | O(1) avg | O(1) avg |
| `contains()` | O(log n) amortized | O(1) avg | O(1) avg |
| `first` / `last` | O(log n) | O(n) to sort | O(n) to sort |
| `firstAfter()` | O(log n) | N/A | N/A |
| Sorted iteration | O(n) | O(n log n) | O(n log n) |
| Range query | O(log n + k) | O(n) | O(n) |

---

## Real-World Examples

### Example 1: High Score Board

```dart
import 'dart:collection';

class HighScoreBoard {
  final int maxScores;
  final SplayTreeSet<int> _scores;

  HighScoreBoard({this.maxScores = 10})
      : _scores = SplayTreeSet((a, b) => b.compareTo(a)); // descending

  bool submit(int score) {
    if (_scores.length < maxScores || score > _scores.last) {
      _scores.add(score);
      if (_scores.length > maxScores) {
        _scores.remove(_scores.last); // drop lowest
      }
      return true; // made the board
    }
    return false; // didn't make it
  }

  List<int> get scores => _scores.toList();
  int get topScore => _scores.isEmpty ? 0 : _scores.first;
  int? get lowestOnBoard => _scores.isEmpty ? null : _scores.last;
}

void main() {
  var board = HighScoreBoard(maxScores: 5);
  [1200, 800, 1500, 950, 2000, 1100, 750].forEach((s) {
    if (board.submit(s)) print('$s made the board!');
  });
  print(board.scores); // [2000, 1500, 1200, 1100, 950]
}
```

### Example 2: Ordered Unique Events

```dart
import 'dart:collection';

class EventSet {
  // Events sorted by timestamp
  final SplayTreeSet<DateTime> _times;
  final Map<DateTime, String> _events = {};

  EventSet() : _times = SplayTreeSet((a, b) => a.compareTo(b));

  void add(DateTime time, String description) {
    _times.add(time);
    _events[time] = description;
  }

  // Events between two times
  List<String> between(DateTime from, DateTime to) {
    final result = <String>[];
    var cur = _times.contains(from) ? from : _times.firstAfter(from);
    if (_times.contains(from)) result.add(_events[from]!);
    cur = _times.firstAfter(from);
    while (cur != null && cur.isBefore(to) || (cur != null && cur == to)) {
      result.add(_events[cur]!);
      cur = _times.firstAfter(cur);
    }
    return result;
  }

  String? nextEvent(DateTime after) {
    final key = _times.firstAfter(after);
    return key != null ? _events[key] : null;
  }
}
```

### Example 3: Sorted Word Set / Dictionary

```dart
import 'dart:collection';

class Dictionary {
  final SplayTreeSet<String> _words = SplayTreeSet();

  void addWord(String word) => _words.add(word.toLowerCase());

  bool contains(String word) => _words.contains(word.toLowerCase());

  // All words starting with prefix (in alphabetical order)
  List<String> wordsWithPrefix(String prefix) {
    final result = <String>[];
    var cur = _words.firstAfter(prefix.isEmpty ? '' : prefix);

    // Also check if prefix itself is a word
    if (prefix.isNotEmpty && _words.contains(prefix)) result.add(prefix);

    while (cur != null && cur.startsWith(prefix)) {
      result.add(cur);
      cur = _words.firstAfter(cur);
    }
    return result;
  }

  // Alphabetically between two words
  List<String> between(String a, String b) {
    final result = <String>[];
    var cur = _words.firstAfter(a);
    while (cur != null && cur.compareTo(b) <= 0) {
      result.add(cur);
      cur = _words.firstAfter(cur);
    }
    return result;
  }
}

void main() {
  var dict = Dictionary();
  dict.addWord('apple');
  dict.addWord('application');
  dict.addWord('apply');
  dict.addWord('apt');
  dict.addWord('banana');
  dict.addWord('band');

  print(dict.wordsWithPrefix('app')); // [apple, application, apply]
  print(dict.between('apple', 'apt')); // [apple, application, apply, apt]
}
```

### Example 4: Priority Task Set (Unique Tasks by Priority)

```dart
import 'dart:collection';

class PriorityTask implements Comparable<PriorityTask> {
  final int priority;
  final String name;
  PriorityTask(this.priority, this.name);

  @override
  int compareTo(PriorityTask other) {
    final pCmp = other.priority.compareTo(priority); // high priority first
    return pCmp != 0 ? pCmp : name.compareTo(other.name); // then by name
  }

  @override
  bool operator ==(Object other) =>
      other is PriorityTask && priority == other.priority && name == other.name;

  @override
  int get hashCode => Object.hash(priority, name);

  @override
  String toString() => '$name(p$priority)';
}

void main() {
  var tasks = SplayTreeSet<PriorityTask>();
  tasks.add(PriorityTask(3, 'Write tests'));
  tasks.add(PriorityTask(10, 'Fix critical bug'));
  tasks.add(PriorityTask(5, 'Code review'));
  tasks.add(PriorityTask(10, 'Deploy hotfix'));

  // Always sorted highest priority first
  print(tasks.toList());
  // [Fix critical bug(p10), Deploy hotfix(p10), Code review(p5), Write tests(p3)]
}
```

---

## Common Mistakes

### ❌ Using with non-Comparable types and no comparator

```dart
class Point { int x, y; Point(this.x, this.y); }

// ❌ Runtime error — Point doesn't implement Comparable
var s = SplayTreeSet<Point>();
s.add(Point(1, 2)); // throws

// ✅ Provide comparator
var s = SplayTreeSet<Point>((a, b) {
  final xCmp = a.x.compareTo(b.x);
  return xCmp != 0 ? xCmp : a.y.compareTo(b.y);
});
```

### ❌ Inconsistent comparator (not a total order)

```dart
// ❌ If a > b AND b > a, the tree is corrupted
var s = SplayTreeSet<int>((a, b) => 0); // treats all equal → broken!
```

### ❌ Expecting O(1) performance

```dart
// SplayTreeSet is O(log n) — not suitable as a drop-in for HashSet
// when doing millions of contains() calls
```

---

## Best Practices

- **Use `SplayTreeSet` when sorted order matters** — e.g., leaderboards, autocomplete, schedulers.
- **Provide explicit comparators** for non-`Comparable` types or custom ordering.
- **Ensure your comparator is a total order** (antisymmetric, transitive, and total).
- **Pair `firstAfter` / `lastBefore` with iteration** for efficient range queries.
- **Use `first` / `last`** as O(log n) min/max — much faster than sorting a list.

---

**Previous:** [LinkedHashSet\<E\>](./linked-hashset)  
**Next:** [Unmodifiable Collections](./unmodifiable)  
**Related:** [Set\<E\>](./set) · [SplayTreeMap\<K,V\>](./splay-tree-map) · [Choosing the Right Collection](./choosing)
