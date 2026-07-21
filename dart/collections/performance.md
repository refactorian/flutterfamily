---
title: Performance & Complexity
sidebar_position: 21
description: Comprehensive Big-O time and space complexity reference table for every Dart collection type and operation.
---

# Performance & Complexity

This document provides a comprehensive Big-O reference for time and space complexity across all Dart collection types.

---

## 1. Master Time Complexity Table

| Collection Type | Access `[i]` | Lookup (`contains`) | Insert (Front) | Insert (Back) | Insert (Middle) | Remove (Front) | Remove (Back) | Remove (Middle) |
|---|---|---|---|---|---|---|---|---|
| **`List` (Growable)** | O(1) | O(n) | O(n) | O(1)* | O(n) | O(n) | O(1) | O(n) |
| **`List` (Fixed)** | O(1) | O(n) | N/A | N/A | N/A | N/A | N/A | N/A |
| **`Set` (`LinkedHashSet`)** | N/A | O(1)* | N/A | O(1)* | N/A | N/A | O(1)* | O(1)* |
| **`HashSet`** | N/A | O(1)* | N/A | O(1)* | N/A | N/A | O(1)* | O(1)* |
| **`SplayTreeSet`** | N/A | O(log n)* | N/A | O(log n)* | N/A | N/A | O(log n)* | O(log n)* |
| **`Map` (`LinkedHashMap`)**| N/A | O(1)* (by key) | N/A | O(1)* | N/A | N/A | O(1)* | O(1)* |
| **`HashMap`** | N/A | O(1)* (by key) | N/A | O(1)* | N/A | N/A | O(1)* | O(1)* |
| **`SplayTreeMap`** | N/A | O(log n)* (key)| N/A | O(log n)* | N/A | N/A | O(log n)* | O(log n)* |
| **`Queue` (`ListQueue`)** | N/A | O(n) | O(1)* | O(1)* | N/A | O(1) | O(1) | O(n) |
| **`DoubleLinkedQueue`** | N/A | O(n) | O(1) | O(1) | O(1)** | O(1) | O(1) | O(1)** |
| **`LinkedList`** | N/A | O(n) | O(1) | O(1) | O(1)** | O(1) | O(1) | O(1)** |

\* *Amortized runtime.*  
\*\* *Requires existing node/entry reference.*

---

## 2. Space Complexity & Overhead

| Collection Type | Space Overhead per Element | Memory Layout | Notes |
|---|---|---|---|
| **`List`** | Minimal (Contiguous Array) | Flat memory block | May allocate 1.5x–2x capacity buffer for growth |
| **`HashSet`** | Medium | Hash Table + Buckets | Table size dynamically scales |
| **`LinkedHashSet`** | Medium-High | Hash Table + Doubly-linked Pointers | Maintains insertion order pointers |
| **`SplayTreeSet`** | High | Binary Search Tree Nodes | Left, Right, Parent pointers per node |
| **`Queue` (`ListQueue`)**| Low | Ring Buffer Array | Contiguous memory with head/tail pointers |
| **`LinkedList`** | High | Doubly-linked Node Objects | Requires element class to extend `LinkedListEntry` |

---

## 3. Performance Gotchas in Dart

### Gotcha 1: `List.removeAt(0)` is O(n)
Removing from index 0 shifts every remaining item left. Use `Queue` if doing frequent front removals.

### Gotcha 2: Lazy `Iterable` Re-evaluations
Iterating over a lazy `where()` or `map()` repeatedly evaluates the transform function every single time.
```dart
final lazyIterable = hugeList.where((x) => expensiveTest(x));

// Runs expensiveTest twice for every item!
print(lazyIterable.length);
print(lazyIterable.first);

// Fix: Materialize to a concrete List first
final concreteList = lazyIterable.toList();
```

### Gotcha 3: Map / Set Hash Collisions
If `hashCode` is poorly implemented (e.g., returning constant `1`), operations degrade from O(1) to O(n).

---

**Previous:** [Choosing the Right Collection](./choosing)  
**Next:** [Common Collection Patterns](./patterns)  
**Related:** [Choosing the Right Collection](./choosing) · [Best Practices](./best-practices)
