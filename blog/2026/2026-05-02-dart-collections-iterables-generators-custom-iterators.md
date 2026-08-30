---
slug: dart-collections-iterables-generators-custom-iterators
title: "Dart Collections Mastery: Iterables, Generators, Lazy Evaluation, and Custom Iterators"
authors: [admin]
tags: [dart, dart3, language-features, architecture]
---

# Dart Collections Mastery: Iterables, Generators, Lazy Evaluation, and Custom Iterators

Collections are the backbone of virtually every Dart and Flutter application.

Most developers are intimately familiar with standard collections like `List`, `Set`, and `Map`. However, treating every data collection as an eager, in-memory `List` is one of the most common causes of high memory consumption, frame drops, and architectural rigidity.

Dart's collection hierarchy is built on a powerful, lazy foundation: **`Iterable<T>`** and **`Iterator<T>`**.

Understanding how lazy evaluation works, how to craft custom iterators, when to leverage `sync*` vs `async*` generators, and how to compose functional transformations (`expand`, `fold`, `reduce`) allows you to write high-performance pipelines that process millions of records with near-zero memory overhead.

{/* truncate */}

This comprehensive guide takes you deep into the mechanics of Dart collections, from writing custom iterators and generators from scratch to transducer patterns and avoiding insidious lazy memory leaks.

---

## 1. Eager Collections vs. Lazy Iterables

The fundamental distinction in Dart collection design is between **eager** data structures and **lazy** sequences:

```text
Eager Evaluation (List, Set):
  [ 1, 2, 3, 4, 5 ] ──► map(x * 2) ──► Allocates [ 2, 4, 6, 8, 10 ] in memory immediately!

Lazy Evaluation (Iterable, Generators):
  ( 1, 2, 3, 4, 5 ) ──► map(x * 2) ──► Yields values ONE BY ONE on demand (Zero extra memory!)
```

### The Cost of Eager Evaluation

Consider processing a list of 100,000 transactions:

```dart
// ❌ EAGER: Allocates 3 separate lists in memory!
final rawData = List.generate(100000, (i) => i);

final validTransactions = rawData
    .where((x) => x.isEven)     // 1. Allocates filtered list
    .map((x) => 'Tx #$x')       // 2. Allocates mapped list
    .take(5)                    // 3. Allocates slice
    .toList();
```

In the eager pipeline, `.where()` and `.map()` iterate across all 100,000 items, creating intermediate heap allocations even though we only needed the first 5 elements!

### The Power of Lazy Evaluation

By keeping the operations lazy until consumption:

```dart
// ✅ LAZY: Evaluates only 10 elements total to find the first 5 even items!
final validTransactions = rawData
    .where((x) => x.isEven)
    .map((x) => 'Tx #$x')
    .take(5)
    .toList(); // Materializes only 5 items!
```

Dart sets up a **pipeline of deferred computations**. The predicate in `.where()` and the transform in `.map()` only execute when the terminal `.take(5)` pulls values through the iterator.

---

## 2. Under the Hood: The `Iterable<T>` and `Iterator<T>` Contract

Every `for-in` loop in Dart is syntactic sugar over the `Iterable<T>` and `Iterator<T>` interfaces defined in `dart:core`.

```dart
abstract class Iterable<E> {
  Iterator<E> get iterator;
  // ... map, where, fold, etc.
}

abstract class Iterator<E> {
  bool moveNext();
  E get current;
}
```

When you write:

```dart
for (final item in collection) {
  print(item);
}
```

The Dart compiler desugars the loop into the following manual iterator loop:

```dart
final iterator = collection.iterator;

while (iterator.moveNext()) {
  final item = iterator.current;
  print(item);
}
```

```text
┌─────────────────────────────────────────────────────────────┐
│                    Iterator State Machine                   │
│                                                             │
│  [ Initial State ]                                          │
│         │                                                   │
│         │ moveNext() == true                                │
│         ▼                                                   │
│  [ current: Item 1 ] ──► moveNext() == true ──► [ Item 2 ]  │
│                                                       │     │
│                                 moveNext() == false   │     │
│                                                       ▼     │
│                                               [ Exhausted ] │
└─────────────────────────────────────────────────────────────┘
```

---

## 3. Building a Custom `Iterable<T>` and `Iterator<T>`

Let's build a custom `DateRange` sequence from scratch that yields dates one day at a time without storing an array of dates in memory.

### Step 1: Implement the `Iterator<DateTime>`

```dart
class DateRangeIterator implements Iterator<DateTime> {
  final DateTime end;
  final Duration step;
  DateTime? _current;
  bool _isFirst = true;

  DateRangeIterator(DateTime start, this.end, {this.step = const Duration(days: 1)})
      : _current = start;

  @override
  DateTime get current {
    if (_current == null) {
      throw StateError('No current element. Call moveNext() first.');
    }
    return _current!;
  }

  @override
  bool moveNext() {
    if (_isFirst) {
      _isFirst = false;
      return _current!.isBefore(end) || _current!.isAtSameMomentAs(end);
    }

    final next = _current!.add(step);
    if (next.isAfter(end)) {
      return false;
    }

    _current = next;
    return true;
  }
}
```

### Step 2: Implement the `Iterable<DateTime>`

Extend `Iterable<DateTime>` so our class inherits all 40+ built-in collection methods (`map`, `where`, `first`, `take`, `toList`, etc.):

```dart
class DateRange extends Iterable<DateTime> {
  final DateTime start;
  final DateTime end;
  final Duration step;

  DateRange({
    required this.start,
    required this.end,
    this.step = const Duration(days: 1),
  }) : assert(!start.isAfter(end), 'Start date must be before end date.');

  @override
  Iterator<DateTime> get iterator => DateRangeIterator(start, end, step: step);
}
```

Usage:

```dart
void main() {
  final start = DateTime(2026, 1, 1);
  final end = DateTime(2026, 1, 5);

  final week = DateRange(start: start, end: end);

  // Directly usable in standard for-in loops:
  for (final date in week) {
    print(date.toIso8601String().substring(0, 10));
  }

  // Inherits all functional methods automatically:
  final formatted = week.map((d) => '${d.day}/${d.month}').toList();
  print(formatted); // ['1/1', '2/1', '3/1', '4/1', '5/1']
}
```

---

## 4. Synchronous vs. Asynchronous Generators: `sync*` vs. `async*`

Writing custom `Iterator` classes involves managing internal state machines. Dart provides **generator functions** to create sequences declaratively using the `yield` keyword.

| Feature | `sync*` (Synchronous Generator) | `async*` (Asynchronous Generator) |
| :--- | :--- | :--- |
| **Return Type** | `Iterable<T>` | `Stream<T>` |
| **Execution** | On-demand (pull-based, blocks caller thread) | Asynchronous events (push/pull-based) |
| **Yield Keyword** | `yield value;` | `yield value;` |
| **Delegation** | `yield* anotherIterable;` | `yield* anotherStream;` |
| **Use Case** | Slicing, mathematical series, chunking | WebSockets, file streaming, sensor feeds |

### The `sync*` Generator: Fibonacci Series

```dart
Iterable<int> fibonacci(int maxCount) sync* {
  var a = 0;
  var b = 1;
  var count = 0;

  while (count < maxCount) {
    yield a;
    final next = a + b;
    a = b;
    b = next;
    count++;
  }
}

void main() {
  final fibs = fibonacci(8).toList();
  print(fibs); // [0, 1, 1, 2, 3, 5, 8, 13]
}
```

### Delegation with `yield*`

`yield*` transfers control to another `Iterable` or `Stream` without writing a manual nested `for` loop:

```dart
Iterable<int> countUpAndDown(int n) sync* {
  // Yield numbers from 1 to n
  for (var i = 1; i <= n; i++) {
    yield i;
  }

  // Delegate directly to another iterable sequence:
  yield* Iterable.generate(n - 1, (i) => n - 1 - i);
}

void main() {
  print(countUpAndDown(4).toList()); // [1, 2, 3, 4, 3, 2, 1]
}
```

### The `async*` Generator: Streaming Ticker

```dart
Stream<int> countdown(int from) async* {
  for (var i = from; i >= 0; i--) {
    await Future.delayed(const Duration(seconds: 1));
    yield i;
  }
}

void main() async {
  await for (final second in countdown(3)) {
    print('T-minus: $second');
  }
  print('Liftoff! 🚀');
}
```

---

## 5. Advanced Iterable Transformations: `expand()`, `fold()`, and `reduce()`

### 1. `expand()` (Flattening & 1-to-Many Mapping)

`expand()` maps each element to an `Iterable` and flattens the resulting sequences into a single sequence:

```dart
class Department {
  final String name;
  final List<String> employees;

  const Department(this.name, this.employees);
}

void main() {
  final departments = [
    const Department('Engineering', ['Alice', 'Bob']),
    const Department('Design', ['Charlie']),
    const Department('Marketing', ['Diana', 'Evan']),
  ];

  // Flatten all employees across departments in one clean pass:
  final allEmployees = departments.expand((dept) => dept.employees).toList();
  print(allEmployees); // ['Alice', 'Bob', 'Charlie', 'Diana', 'Evan']

  // Duplicate each number N times:
  final duplicated = [1, 2, 3].expand((n) => List.filled(n, n)).toList();
  print(duplicated); // [1, 2, 2, 3, 3, 3]
}
```

---

### 2. `fold()` vs. `reduce()`

Both methods aggregate a collection into a single value, but they have critical differences:

```text
┌─────────────────────────────────────────────────────────────┐
│                      reduce() vs fold()                     │
├─────────────────────────────────────────────────────────────┤
│ Method     │ Initial Seed │ Return Type  │ Empty Collection │
├────────────┼──────────────┼──────────────┼──────────────────┤
│ reduce()   │ First Item   │ Same as <T>  │ Throws Error! 💥 │
│ fold<R>()  │ Explicit     │ Flexible <R> │ Returns Seed ✅  │
└─────────────────────────────────────────────────────────────┘
```

#### Why `reduce()` Can Be Dangerous:

```dart
final numbers = <int>[];

// 💥 CRASH: StateError (No element)
// final sum = numbers.reduce((acc, val) => acc + val);
```

#### Why `fold()` Is the Professional Choice:

```dart
// ✅ SAFE: Starts with seed 0, handles empty lists without crashing
final sum = numbers.fold<int>(0, (acc, val) => acc + val);
print(sum); // 0
```

`fold()` can transform collections into completely different types (e.g. converting a list of objects into a grouped `Map`):

```dart
class Order {
  final String category;
  final double amount;

  const Order(this.category, this.amount);
}

void main() {
  final orders = [
    const Order('Electronics', 299.99),
    const Order('Books', 19.99),
    const Order('Electronics', 49.99),
  ];

  // Group and sum totals by category using fold():
  final totalsByCategory = orders.fold<Map<String, double>>(
    {},
    (map, order) {
      map[order.category] = (map[order.category] ?? 0.0) + order.amount;
      return map;
    },
  );

  print(totalsByCategory); // {'Electronics': 349.98, 'Books': 19.99}
}
```

---

## 6. The Transducer & Pipeline Pattern

In complex applications, combining filters, mappers, and aggregators into composable, reusable pipeline functions is known as the **Transducer Pattern**.

```dart
typedef Transformer<T, R> = Iterable<R> Function(Iterable<T> input);

/// Higher-order filter transducer
Transformer<T, T> filter<T>(bool Function(T) predicate) {
  return (input) => input.where(predicate);
}

/// Higher-order map transducer
Transformer<T, R> map<T, R>(R Function(T) transform) {
  return (input) => input.map(transform);
}

/// Pipeline composer
class Pipeline<T> {
  final Iterable<T> _source;

  Pipeline(this._source);

  Pipeline<R> through<R>(Transformer<T, R> transformer) {
    return Pipeline(transformer(_source));
  }

  Iterable<T> get result => _source;
}
```

### Real-World Example: Ingesting Server Event Logs

```dart
class LogEntry {
  final String level;
  final String message;
  final int statusCode;

  const LogEntry(this.level, this.message, this.statusCode);
}

void main() {
  final logs = [
    const LogEntry('INFO', 'User login', 200),
    const LogEntry('ERROR', 'DB Connection failed', 500),
    const LogEntry('WARN', 'Slow disk read', 200),
    const LogEntry('ERROR', 'Payment gateway timeout', 504),
  ];

  // Compose a reusable, fully lazy processing pipeline:
  final criticalErrors = Pipeline(logs)
      .through(filter((log) => log.level == 'ERROR'))
      .through(filter((log) => log.statusCode >= 500))
      .through(map((log) => '[FATAL ${log.statusCode}] ${log.message}'))
      .result
      .toList();

  print(criticalErrors);
  // [
  //   '[FATAL 500] DB Connection failed',
  //   '[FATAL 504] Payment gateway timeout'
  // ]
}
```

---

## 7. Memory Traps & Anti-Patterns with Lazy Iterables

While lazy evaluation is powerful, it introduces several unique bugs if misunderstood.

### Trap 1: Re-Executing Expensive Computations

Because an `Iterable` is a recipe rather than stored data, iterating over it multiple times **re-executes the entire pipeline from scratch**:

```dart
int networkCalls = 0;

Iterable<String> fetchUserNames() sync* {
  networkCalls++;
  yield 'Alice';
  yield 'Bob';
}

void main() {
  final users = fetchUserNames();

  print('Count: ${users.length}'); // Iteration 1 -> networkCalls = 1
  print('First: ${users.first}');  // Iteration 2 -> networkCalls = 2
  print('All: ${users.toList()}'); // Iteration 3 -> networkCalls = 3

  print('Total calls: $networkCalls'); // 3!
}
```

> **Fix:** If an iterable is expensive to generate and you need to access it multiple times, **materialize it once** with `.toList()` or `.toSet()`.

---

### Trap 2: Retaining Large Objects in Lazy Closures

When you create a lazy iterable using a closure (e.g., `source.map((item) => ...)`), the resulting `Iterable` keeps a strong reference to the enclosing scope and the source collection until the iterable is garbage collected.

```dart
class HeavyReportGenerator {
  final List<int> _largePayload = List.filled(5000000, 42); // ~40MB

  Iterable<int> getFirstTen() {
    // ⚠️ TRAP: The returned Iterable retains `this` and `_largePayload` in memory!
    return _largePayload.take(10);
  }
}
```

If another widget stores the `Iterable<int>` long-term, the entire 40MB `_largePayload` cannot be garbage-collected!

> **Fix:** Return an isolated slice or copy: `return _largePayload.take(10).toList();`

---

## 8. Building a Custom `CircularBuffer<T>` (Ring Buffer)

Let's build a production-grade fixed-capacity Ring Buffer that implements `Iterable<T>`:

```dart
import 'dart:collection';

class CircularBuffer<T> extends Iterable<T> {
  final int capacity;
  final List<T?> _buffer;
  int _start = 0;
  int _size = 0;

  CircularBuffer(this.capacity)
      : assert(capacity > 0, 'Capacity must be greater than zero.'),
        _buffer = List<T?>.filled(capacity, null);

  void add(T element) {
    if (_size < capacity) {
      final index = (_start + _size) % capacity;
      _buffer[index] = element;
      _size++;
    } else {
      // Overwrite oldest element and advance start
      _buffer[_start] = element;
      _start = (_start + 1) % capacity;
    }
  }

  @override
  int get length => _size;

  @override
  bool get isEmpty => _size == 0;

  @override
  Iterator<T> get iterator => _CircularBufferIterator(this);
}

class _CircularBufferIterator<T> implements Iterator<T> {
  final CircularBuffer<T> _buffer;
  int _currentIndex = -1;

  _CircularBufferIterator(this._buffer);

  @override
  T get current {
    if (_currentIndex < 0 || _currentIndex >= _buffer._size) {
      throw StateError('No current element.');
    }
    final physicalIndex = (_buffer._start + _currentIndex) % _buffer.capacity;
    return _buffer._buffer[physicalIndex] as T;
  }

  @override
  bool moveNext() {
    if (_currentIndex + 1 < _buffer._size) {
      _currentIndex++;
      return true;
    }
    return false;
  }
}
```

Usage:

```dart
void main() {
  final history = CircularBuffer<String>(3);

  history.add('Page 1');
  history.add('Page 2');
  history.add('Page 3');
  history.add('Page 4'); // Evicts 'Page 1'

  // Seamlessly iterate over latest buffer contents:
  print(history.toList()); // ['Page 2', 'Page 3', 'Page 4']
}
```

---

## 9. Comprehensive Unit Testing Suite

Here is an executable `package:test` test suite validating custom iterators, generators, transducers, and edge cases:

```dart
import 'package:test/test.dart';

void main() {
  group('Custom DateRange Iterator Tests', () {
    test('Generates correct sequence of consecutive days', () {
      final start = DateTime(2026, 1, 1);
      final end = DateTime(2026, 1, 3);
      final range = DateRange(start: start, end: end);

      expect(range.length, equals(3));
      expect(range.map((d) => d.day).toList(), equals([1, 2, 3]));
    });

    test('Throws assertion error if start is after end', () {
      expect(
        () => DateRange(start: DateTime(2026, 2, 1), end: DateTime(2026, 1, 1)),
        throwsA(isA<AssertionError>()),
      );
    });
  });

  group('sync* Generator Tests', () {
    test('fibonacci generator produces accurate sequence', () {
      expect(fibonacci(5).toList(), equals([0, 1, 1, 2, 3]));
    });

    test('countUpAndDown with yield* produces symmetrical sequence', () {
      expect(countUpAndDown(3).toList(), equals([1, 2, 3, 2, 1]));
    });
  });

  group('CircularBuffer Tests', () {
    test('Maintains fixed capacity and evicts oldest items in FIFO order', () {
      final buffer = CircularBuffer<int>(3);
      buffer.add(1);
      buffer.add(2);
      buffer.add(3);
      buffer.add(4);

      expect(buffer.length, equals(3));
      expect(buffer.toList(), equals([2, 3, 4]));
    });

    test('Works with fold, map, and filter', () {
      final buffer = CircularBuffer<int>(3);
      buffer.add(10);
      buffer.add(20);
      buffer.add(30);

      final total = buffer.fold<int>(0, (acc, n) => acc + n);
      expect(total, equals(60));
    });
  });
}

// Helpers for testing
Iterable<int> fibonacci(int maxCount) sync* {
  var a = 0, b = 1, count = 0;
  while (count < maxCount) {
    yield a;
    final next = a + b;
    a = b;
    b = next;
    count++;
  }
}

Iterable<int> countUpAndDown(int n) sync* {
  for (var i = 1; i <= n; i++) {
    yield i;
  }
  yield* Iterable.generate(n - 1, (i) => n - 1 - i);
}

class DateRange extends Iterable<DateTime> {
  final DateTime start;
  final DateTime end;
  DateRange({required this.start, required this.end})
      : assert(!start.isAfter(end));

  @override
  Iterator<DateTime> get iterator => _DateRangeIterator(start, end);
}

class _DateRangeIterator implements Iterator<DateTime> {
  final DateTime end;
  DateTime? _current;
  bool _first = true;
  _DateRangeIterator(DateTime start, this.end) : _current = start;

  @override
  DateTime get current => _current!;

  @override
  bool moveNext() {
    if (_first) {
      _first = false;
      return _current!.isBefore(end) || _current!.isAtSameMomentAs(end);
    }
    final next = _current!.add(const Duration(days: 1));
    if (next.isAfter(end)) return false;
    _current = next;
    return true;
  }
}

class CircularBuffer<T> extends Iterable<T> {
  final int capacity;
  final List<T?> _buf;
  int _start = 0, _size = 0;
  CircularBuffer(this.capacity) : _buf = List<T?>.filled(capacity, null);

  void add(T item) {
    if (_size < capacity) {
      _buf[(_start + _size) % capacity] = item;
      _size++;
    } else {
      _buf[_start] = item;
      _start = (_start + 1) % capacity;
    }
  }

  @override
  int get length => _size;
  @override
  Iterator<T> get iterator => _CBIterator(this);
}

class _CBIterator<T> implements Iterator<T> {
  final CircularBuffer<T> _b;
  int _idx = -1;
  _CBIterator(this._b);
  @override
  T get current => _b._buf[(_b._start + _idx) % _b.capacity] as T;
  @override
  bool moveNext() => (++_idx < _b._size);
}
```

---

## 10. Summary & Architectural Decision Matrix

| Data Structure / Pattern | Evaluation Model | Memory Usage | Re-executable? | Ideal Use Case |
| :--- | :--- | :--- | :--- | :--- |
| **`List<T>`** | Eager (In-memory) | $O(N)$ high | Yes | Random access (`list[i]`), fixed small datasets |
| **`Iterable<T>`** | Lazy (Pull-based) | $O(1)$ minimal | Re-runs pipeline | Data pipelines, filtering, transformations |
| **`sync*` Generator** | Lazy (Pull-based) | $O(1)$ minimal | Re-runs generator | Infinite series, chunking algorithms, trees |
| **`Stream<T>` / `async*`** | Async (Push/Pull) | Event-based | Depends on broadcast | Network events, WebSockets, file streaming |
| **Custom `Iterable<T>`** | Lazy (Pull-based) | $O(1)$ minimal | Re-creates iterator | Domain sequences (Date ranges, Ring Buffers) |

### Key Architectural Guidelines:

1. **Default to Lazy Pipelines:** Chaining `.where()`, `.map()`, and `.take()` saves CPU cycles and prevents intermediate list allocations.
2. **Materialize at the Boundary:** Call `.toList()` or `.toSet()` only when you need random indexing or intend to iterate over results multiple times.
3. **Prefer `fold()` over `reduce()`:** `fold()` allows changing return types and safely handles empty collections with initial seeds.
4. **Use `yield*` for Sequence Composition:** Delegating sequences with `yield*` avoids nested loop overhead.
5. **Beware of Scope Retentions:** Never return a lazy iterator bound to a large transient data structure without slicing or materializing.
