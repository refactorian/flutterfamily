---
sidebar_position: 15
title: Futures & Async/Await
description: Future, async/await, parallel execution, Streams, StreamController, Completer, and Isolates in Dart.
---

Dart is **single-threaded** — but that doesn't mean it can only do one thing at a time. Dart's event loop, Futures, Streams, and Isolates let you write highly concurrent code that stays responsive and readable.

---

## The Event Loop & Microtask Queue

Understanding the execution model prevents subtle bugs:

```
┌────────────────────────────────────────────────────────┐
│                    Dart Event Loop                     │
│                                                        │
│   ┌──────────────────┐    ┌────────────────────────┐   │
│   │  Microtask Queue │    │     Event Queue        │   │
│   │  (higher prio.)  │    │  (I/O, timers, etc.)   │   │
│   │                  │    │                        │   │
│   │ Future.value()   │    │ File read complete     │   │
│   │ scheduleMicrotask│    │ Timer fires            │   │
│   │ then() callbacks │    │ Stream event           │   │
│   └────────┬─────────┘    └───────────┬────────────┘   │
│            │ drained first            │ processed next │
│            └──────────────────────────┘                │
└────────────────────────────────────────────────────────┘
```

```dart
import 'dart:async';

void main() {
  print('1 — sync start');

  // Microtask — runs before any event queue items
  scheduleMicrotask(() => print('3 — microtask'));

  // Future.value — resolved Future, callback goes to microtask queue
  Future.value(42).then((_) => print('4 — Future.value callback'));

  // Timer — goes to event queue
  Timer.run(() => print('5 — Timer.run (event queue)'));

  print('2 — sync end');
}
// Output — always in this order:
// 1 — sync start
// 2 — sync end
// 3 — microtask
// 4 — Future.value callback
// 5 — Timer.run (event queue)
```

> **Key rule:** Microtasks run to completion before any event queue item. Never block the microtask queue with long loops or you'll freeze the UI.

---

## Future\<T\>

A `Future<T>` represents a value that will be available **at some point** — either a result (`T`) or an error.

```dart
// States a Future can be in:
// 1. Uncompleted — hasn't produced a value yet
// 2. Completed with a value — success
// 3. Completed with an error — failure

// Creating Futures
Future<String>  success = Future.value('hello');          // already completed
Future<String>  failure = Future.error(Exception('oops')); // already failed
Future<int>     delayed = Future.delayed(                  // completes after 1s
    const Duration(seconds: 1), () => 42);

// Callback-style chaining (older style — async/await is preferred)
Future<String> result = fetchUser(1);
result
    .then((user) => print('Got: $user'))
    .catchError((e) => print('Error: $e'))
    .whenComplete(() => print('Always runs'));

// Transforming with then()
Future<int> nameLength = fetchName()
    .then((name) => name.length);  // Future<String> → Future<int>
```

---

## async / await

`async`/`await` is syntactic sugar over Futures — far more readable:

```dart
// Marks a function as async → always returns Future<T>
Future<String> fetchUserName(int id) async {
  // await unwraps the Future — execution pauses HERE, not the whole thread
  var response = await http.get(Uri.parse('/users/$id'));
  var json = jsonDecode(response.body) as Map<String, dynamic>;
  return json['name'] as String;  // automatically wrapped in Future<String>
}

// void async — fire-and-forget (be careful)
Future<void> logEvent(String event) async {
  await analytics.record(event);
}

// async in main
Future<void> main() async {
  var name = await fetchUserName(1);
  print('Hello, $name!');
}

// What async/await compiles to (approximately):
Future<String> fetchUserName(int id) {
  return http.get(Uri.parse('/users/$id')).then((response) {
    var json = jsonDecode(response.body) as Map<String, dynamic>;
    return json['name'] as String;
  });
}
```

---

## Error Handling

```dart
// try/catch with await — exactly like synchronous code
Future<void> loadData() async {
  try {
    var data = await fetchFromApi();
    await saveToDatabase(data);
    print('Done: ${data.length} items');
  } on SocketException catch (e) {
    print('Network error: ${e.message}');
  } on TimeoutException {
    print('Request timed out');
  } on FormatException catch (e) {
    print('Bad data: $e');
  } catch (e, stack) {
    logger.error('Unexpected error', e, stack);
    rethrow;
  } finally {
    hideLoadingSpinner(); // always runs
  }
}

// Safe wrapper — return null on failure
Future<T?> tryFetch<T>(Future<T> Function() fn) async {
  try { return await fn(); }
  catch (_) { return null; }
}

var user = await tryFetch(() => fetchUser(1));
```

---

## Parallel Execution

```dart
// ── Sequential — each waits for the previous (total = sum of times) ───
Future<void> sequential() async {
  var user    = await fetchUser();      // 300ms
  var posts   = await fetchPosts();     // 400ms
  var friends = await fetchFriends();   // 250ms
  // total: ~950ms
}

// ── Parallel — all start together (total = max of times) ────────────
Future<void> parallel() async {
  var results = await Future.wait([
    fetchUser(),      // 300ms ─┐
    fetchPosts(),     // 400ms  ├─ all run at once
    fetchFriends(),   // 250ms ─┘
  ]); // total: ~400ms
  var user    = results[0] as User;
  var posts   = results[1] as List<Post>;
  var friends = results[2] as List<User>;
}

// ── Dart 3 — parallel wait on a record of Futures ────────────────────
Future<void> parallelTyped() async {
  // .wait extension on a record of Futures — fully typed!
  var (user, posts, friends) = await (
    fetchUser(),     // Future<User>
    fetchPosts(),    // Future<List<Post>>
    fetchFriends(),  // Future<List<User>>
  ).wait;
  // user is User, posts is List<Post>, friends is List<User> — no cast needed
}

// ── eagerError — control failure behaviour ────────────────────────────
// Default (eagerError: true): fail fast — reject as soon as any Future fails
await Future.wait([f1, f2, f3]);

// eagerError: false — wait for ALL, then collect results and errors
var results = await Future.wait(
  [fetchA(), fetchB(), fetchC()],
  eagerError: false,
);

// ── Future.any — race: take the first to complete ─────────────────────
var fastest = await Future.any([
  fetchFromServer1(),   // whichever responds
  fetchFromServer2(),   // first wins
  fetchFromServer3(),
]);

// ── Controlled concurrency — N at a time ──────────────────────────────
Future<List<T>> batchedWait<T>(
  List<Future<T> Function()> tasks, {
  int concurrency = 5,
}) async {
  final results = <T>[];
  for (var i = 0; i < tasks.length; i += concurrency) {
    final batch = tasks
        .sublist(i, (i + concurrency).clamp(0, tasks.length))
        .map((fn) => fn())
        .toList();
    results.addAll(await Future.wait(batch));
  }
  return results;
}
```

---

## Useful Future Combinators

```dart
// Sequential async processing
await Future.forEach(items, (item) async {
  await processItem(item);
});

// Timeout — fail if too slow
try {
  var result = await heavyRequest().timeout(
    const Duration(seconds: 10),
    onTimeout: () => throw TimeoutException('Request took too long'),
  );
} on TimeoutException catch (e) {
  print(e.message);
}

// Retry with exponential backoff
Future<T> withRetry<T>(
  Future<T> Function() task, {
  int maxAttempts = 3,
  Duration baseDelay = const Duration(milliseconds: 500),
}) async {
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await task();
    } catch (e) {
      if (attempt == maxAttempts) rethrow;
      final delay = baseDelay * (1 << (attempt - 1)); // 500ms, 1s, 2s ...
      print('Attempt $attempt failed, retrying in ${delay.inMilliseconds}ms');
      await Future.delayed(delay);
    }
  }
  throw StateError('Unreachable');
}

// Usage
var data = await withRetry(() => fetchData(), maxAttempts: 3);
```

---

## Streams

A `Stream<T>` is an **asynchronous sequence** of values over time — like a Future that delivers multiple values.

```dart
// ── Creating streams ──────────────────────────────────────────────────
Stream<int> countTo(int n) async* {
  for (var i = 1; i <= n; i++) {
    await Future.delayed(const Duration(milliseconds: 500));
    yield i;   // emit one value
  }
}

// From existing data
Stream.fromIterable([1, 2, 3, 4, 5])
Stream.fromFuture(fetchData())
Stream.value(42)
Stream.error(Exception('oops'))
Stream.periodic(const Duration(seconds: 1), (i) => i)  // tick every second
Stream.empty<int>()

// ── Consuming streams ─────────────────────────────────────────────────

// await for — reads one event at a time, most readable
await for (var n in countTo(5)) {
  print(n);          // 1  2  3  4  5
}
print('Done!');      // only after stream ends

// .listen() — callback style, returns a subscription
final sub = stream.listen(
  (data) => handleData(data),    // each event
  onError: (e) => handleError(e), // errors
  onDone: () => print('Done'),    // stream closed
  cancelOnError: false,           // keep going after error
);

// Cancel the subscription (critical for cleanup!)
await sub.cancel();
```

### Single-Subscription vs Broadcast Streams

```dart
// ── Single-subscription (default) ─────────────────────────────────────
// Only ONE listener at a time. Pauses source when not listening.
var single = Stream.fromIterable([1, 2, 3]);
single.listen(print);
// single.listen(print);  // ❌ StateError: already has a subscriber

// ── Broadcast stream ───────────────────────────────────────────────────
// Multiple listeners. No pause support. Late subscribers miss past events.
var controller = StreamController<int>.broadcast();

controller.stream.listen((n) => print('Listener 1: $n'));
controller.stream.listen((n) => print('Listener 2: $n'));

controller.add(1);   // both listeners receive 1
controller.add(2);   // both listeners receive 2

// Convert single to broadcast
var broadcast = singleStream.asBroadcastStream();

// ── When to use which ─────────────────────────────────────────────────
// Single-subscription: file I/O, HTTP response body, one-time data source
// Broadcast:           UI events, state changes, multiple widgets listening
```

### Stream Operators

```dart
var numbers = Stream.fromIterable([1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);

// Transform — same as List equivalents but async
numbers.map((n) => n * 2)              // [2, 4, 6, 8, ...]
numbers.where((n) => n.isEven)         // [2, 4, 6, 8, 10]
numbers.take(3)                        // [1, 2, 3]
numbers.skip(7)                        // [8, 9, 10]
numbers.takeWhile((n) => n < 5)        // [1, 2, 3, 4]
numbers.skipWhile((n) => n < 5)        // [5, 6, 7, 8, 9, 10]
numbers.expand((n) => [n, n * 10])     // [1, 10, 2, 20, 3, 30, ...]

// Async transformation — each event can itself be async
numbers.asyncMap((n) async {
  await Future.delayed(const Duration(milliseconds: 10));
  return n * 2;
})

// Async expand — one event → stream of events
numbers.asyncExpand((n) async* {
  yield n;
  yield n * 10;
})

// Collect stream into a single value
await numbers.toList()           // List<int>
await numbers.toSet()            // Set<int>
await numbers.first              // int
await numbers.last               // int
await numbers.length             // int
await numbers.isEmpty            // bool
await numbers.any((n) => n > 5)  // bool
await numbers.every((n) => n > 0)// bool
await numbers.contains(5)        // bool
await numbers.reduce((a, b) => a + b)         // int
await numbers.fold(0, (acc, n) => acc + n)    // int
await numbers.join(', ')         // '1, 2, 3, ...'

// Error handling on streams
numbers
    .handleError((e) => print('Error: $e')) // per-error handler
    .listen(print);

// Timeout on stream
numbers
    .timeout(const Duration(seconds: 1), onTimeout: (sink) => sink.close())
    .listen(print);
```

### StreamTransformer

Reusable stream transformations:

```dart
// Custom StreamTransformer
StreamTransformer<T, T> deduplicate<T>() =>
    StreamTransformer.fromHandlers(
      handleData: (data, sink) {
        // Could track last value and only emit if changed
        sink.add(data);
      },
    );

// Debounce transformer
StreamTransformer<T, T> debounce<T>(Duration duration) {
  Timer? timer;
  return StreamTransformer.fromHandlers(
    handleData: (data, sink) {
      timer?.cancel();
      timer = Timer(duration, () => sink.add(data));
    },
    handleDone: (sink) {
      timer?.cancel();
      sink.close();
    },
  );
}

// Usage
textField.onChanged
    .transform(debounce(const Duration(milliseconds: 300)))
    .listen(searchApi);
```

---

## StreamController — Push Streams

Build a stream you control:

```dart
import 'dart:async';

// Single-subscription controller
class DataService {
  final _controller = StreamController<String>();

  Stream<String> get updates => _controller.stream;

  void pushUpdate(String data) {
    if (!_controller.isClosed) _controller.add(data);
  }

  void pushError(Object error) => _controller.addError(error);

  Future<void> close() => _controller.close();
}

// Broadcast controller — multiple UI widgets can listen
class EventBus {
  static final _controller = StreamController<AppEvent>.broadcast();
  static Stream<AppEvent> get events => _controller.stream;
  static void fire(AppEvent event) => _controller.add(event);

  // Subscribe to a specific event type
  static Stream<T> on<T extends AppEvent>() =>
      events.whereType<T>();
}

// Usage
EventBus.on<UserLoginEvent>().listen((e) => print('Logged in: ${e.userId}'));
EventBus.fire(UserLoginEvent('usr_42'));
```

---

## Completer — Manual Future Control

```dart
import 'dart:async';

// Manually resolve or reject a Future
class AsyncLock {
  Completer<void>? _completer;

  bool get isLocked => _completer != null;

  Future<void> acquire() async {
    while (_completer != null) {
      await _completer!.future; // wait for current lock
    }
    _completer = Completer<void>();
  }

  void release() {
    final c = _completer;
    _completer = null;
    c?.complete(); // unblock waiting acquirers
  }
}

// One-time initializer pattern
class LazyService {
  final _ready = Completer<void>();
  bool _initialized = false;

  Future<void> get ready => _ready.future;

  Future<void> init() async {
    if (_initialized) return;
    await heavySetup();
    _initialized = true;
    _ready.complete();  // unblock all awaiters
  }
}

var service = LazyService();
service.init(); // start — don't await
// ... later from multiple places ...
await service.ready; // blocks until init() completes
```

---

## async* Generators & yield

```dart
// sync* — lazy Iterable
Iterable<int> fibonacci() sync* {
  var a = 0, b = 1;
  while (true) {
    yield a;
    (a, b) = (b, a + b);
  }
}

print(fibonacci().take(10).toList());
// [0, 1, 1, 2, 3, 5, 8, 13, 21, 34]

// async* — Stream generator
Stream<String> pollApi(String url, Duration interval) async* {
  while (true) {
    try {
      final response = await http.get(Uri.parse(url));
      yield response.body;
    } catch (e) {
      yield* Stream.error(e);  // forward error
    }
    await Future.delayed(interval);
  }
}

// yield* — delegate to another stream/iterable
Stream<int> mergedStream() async* {
  yield* Stream.fromIterable([1, 2, 3]);   // yields 1, 2, 3
  yield* countTo(3);                        // then yields 1, 2, 3 from countTo
  yield 99;                                 // then 99
}
```

---

## Isolates — True Parallelism

Dart is single-threaded per Isolate, but you can spawn more:

```dart
import 'dart:isolate';

// ── Simple: Isolate.run (Dart 2.19+) ─────────────────────────────────
Future<List<int>> primesUpTo(int limit) =>
    Isolate.run(() {
      final primes = <int>[];
      for (var n = 2; n <= limit; n++) {
        if (Iterable.generate(n - 2, (i) => i + 2)
            .every((d) => n % d != 0)) {
          primes.add(n);
        }
      }
      return primes;
    });

// In Flutter: use compute() from package:flutter/foundation.dart
import 'package:flutter/foundation.dart';

Future<Uint8List> encodeImageBackground(Uint8List raw) =>
    compute(encodeJpeg, raw); // top-level or static function required
```

---

## Timer

```dart
import 'dart:async';

// One-shot timer
final timer = Timer(const Duration(seconds: 5), () {
  print('5 seconds elapsed');
});
timer.cancel(); // cancel before it fires

// Repeating timer
final ticker = Timer.periodic(const Duration(seconds: 1), (t) {
  print('Tick ${t.tick}');
  if (t.tick >= 5) t.cancel(); // stop after 5 ticks
});

// Debounce pattern with Timer
class SearchBar {
  Timer? _debounce;

  void onQueryChanged(String query) {
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), () {
      searchApi(query);
    });
  }

  void dispose() => _debounce?.cancel();
}
```

---

## Summary

| Concept | Syntax / Type | Key Point |
|---------|-------------|-----------|
| Single async value | `Future<T>` | Completes once |
| Async function | `Future<T> fn() async { }` | Returns Future |
| Wait for value | `await future` | Pauses current function |
| Parallel wait | `await Future.wait([...])` | All run together |
| Typed parallel | `await (fA, fB).wait` | Dart 3, fully typed |
| Race | `await Future.any([...])` | First wins |
| Timeout | `future.timeout(duration)` | Fail if too slow |
| Async sequence | `Stream<T>` | Zero or more values over time |
| Consume stream | `await for (var x in stream)` | Sequential |
| Listen | `stream.listen(onData, onError:, onDone:)` | Callback |
| Create stream | `Stream<T> fn() async* { yield v; }` | Generator |
| Push stream | `StreamController<T>` | Manual control |
| Manual Future | `Completer<T>` | Resolve programmatically |
| True parallelism | `Isolate.run(() => ...)` | Separate thread |
| Timer | `Timer(duration, callback)` | Delayed / periodic |
| Microtask | `scheduleMicrotask(fn)` | Before next event |
