---
sidebar_position: 15
title: Futures & Async/Await
description: Future, async/await, parallel execution, Streams, StreamController, Completer, and Isolates in Dart.
---

Dart is **single-threaded** with an event loop. Async code is non-blocking — the app stays responsive while waiting for I/O.

---

## The Event Loop

```
   Main thread
   ─────────────────────────────────────────────────────►
   [sync code] → [event loop] → [callback] → [event loop] → ...

   Dart processes one microtask/event at a time.
   While awaiting, control returns to the event loop.
   Other callbacks can run between awaits.
```

---

## Future

A `Future<T>` represents a value available sometime in the future.

```dart
// Create a completed Future
Future<String> done = Future.value('hello');
Future<void> voidFuture = Future.value();

// Create a delayed Future
Future<int> delayed = Future.delayed(
  Duration(seconds: 2),
  () => 42,
);

// Create a failed Future
Future<String> failed = Future.error(Exception('Something went wrong'));

// Then / catchError / whenComplete (callback style — less common now)
Future<String> result = fetchUser(1);
result
  .then((user) => print('Got: $user'))
  .catchError((e) => print('Error: $e'))
  .whenComplete(() => print('Always runs'));
```

---

## async / await

The modern, readable way to work with Futures:

```dart
// Mark function as async → it returns a Future
Future<String> fetchUser(int id) async {
  // await pauses execution here until Future completes
  var response = await http.get(Uri.parse('https://api.example.com/users/$id'));
  var json = jsonDecode(response.body);
  return json['name'] as String;
}

// Calling an async function
Future<void> main() async {
  print('Fetching...');
  var name = await fetchUser(1);  // wait for result
  print('Got: $name');
  print('Done!');
}

// Output (in order — even though async):
// Fetching...
// Got: Alice
// Done!
```

---

## Error Handling with Async

```dart
Future<String> riskyFetch() async {
  throw Exception('Network error!');
}

// Option 1: try/catch
Future<void> main() async {
  try {
    var result = await riskyFetch();
    print(result);
  } catch (e) {
    print('Caught: $e');
  } finally {
    print('Cleanup');
  }
}

// Option 2: .catchError (callback style)
riskyFetch()
    .then(print)
    .catchError((e) => print('Error: $e'));

// Option 3: Handle at call site
Future<String?> safeRetch() async {
  try {
    return await riskyFetch();
  } catch (_) {
    return null;
  }
}
```

---

## Parallel Execution

```dart
// Sequential — slow (waits for each)
Future<void> sequential() async {
  var a = await fetchA(); // 2 seconds
  var b = await fetchB(); // 2 seconds
  // Total: 4 seconds
  print('$a, $b');
}

// Parallel — fast (all run at once)
Future<void> parallel() async {
  var futures = await Future.wait([
    fetchA(), // starts immediately
    fetchB(), // starts immediately
  ]); // waits for BOTH
  // Total: 2 seconds (max of the two)
  print('${futures[0]}, ${futures[1]}');
}

// More explicit parallel
Future<void> explicitParallel() async {
  var futureA = fetchA(); // start immediately
  var futureB = fetchB(); // start immediately

  var a = await futureA; // wait for A
  var b = await futureB; // wait for B (probably already done)
  print('$a, $b');
}

// Wait for first completed
Future<void> race() async {
  var fastest = await Future.any([
    fetchFromServer1(),
    fetchFromServer2(),
    fetchFromServer3(),
  ]);
  print('Fastest: $fastest');
}
```

---

## Future Methods

```dart
// Future.value — already completed
var f = Future.value(42);

// Future.error — already failed
var e = Future.error(Exception('oops'));

// Future.delayed
var d = Future.delayed(Duration(seconds: 1), () => 'done');

// Future.wait — parallel, all must succeed
var results = await Future.wait([f1, f2, f3]);

// Future.any — first to complete wins
var first = await Future.any([slow, fast, fastest]);

// Future.forEach — sequential async loop
await Future.forEach(items, (item) async {
  await processItem(item);
});

// .then — transform result
var upper = await fetchName().then((s) => s.toUpperCase());

// .timeout — fail if takes too long
try {
  var result = await slowFetch().timeout(
    Duration(seconds: 5),
    onTimeout: () => 'default',
  );
} on TimeoutException catch (e) {
  print('Timed out!');
}
```

---

## Streams

A `Stream<T>` is a sequence of async events over time.

```dart
// Create a stream
Stream<int> countStream(int max) async* {
  for (var i = 1; i <= max; i++) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// Listen to a stream
Future<void> main() async {
  // Option 1: await for
  await for (var n in countStream(5)) {
    print(n); // 1, 2, 3, 4, 5 (one per second)
  }

  // Option 2: .listen()
  countStream(5).listen(
    (n) => print(n),
    onError: (e) => print('Error: $e'),
    onDone: () => print('Done!'),
    cancelOnError: false,
  );
}
```

### Stream Types

```dart
// Single-subscription (default) — one listener at a time
var singleStream = Stream.fromIterable([1, 2, 3]);

// Broadcast — multiple listeners
var controller = StreamController<int>.broadcast();
controller.stream.listen((n) => print('Listener 1: $n'));
controller.stream.listen((n) => print('Listener 2: $n'));
controller.add(42); // both listeners receive 42

// Common stream sources
Stream.fromIterable([1, 2, 3, 4])
Stream.fromFuture(fetchData())
Stream.value(42)
Stream.error(Exception('oops'))
Stream.periodic(Duration(seconds: 1), (i) => i) // ticks every second
```

### Stream Operators

```dart
var stream = Stream.fromIterable([1, 2, 3, 4, 5, 6]);

// map, where, take, skip, expand — same as List but async
stream.map((n) => n * 2)
stream.where((n) => n.isEven)
stream.take(3)
stream.skip(2)

// Collect to list
var list = await stream.toList();
var set = await stream.toSet();
var first = await stream.first;
var last = await stream.last;
var count = await stream.length;
var any = await stream.any((n) => n > 3);
var every = await stream.every((n) => n > 0);

// forEach on stream
await stream.forEach((n) => print(n));
```

---

## StreamController

```dart
import 'dart:async';

// Create a stream you can push values to
var controller = StreamController<String>();

// Push values
controller.add('Hello');
controller.add('World');
controller.addError(Exception('oops'));
controller.close(); // signal completion

// Listen
controller.stream.listen(
  (msg) => print(msg),
  onError: (e) => print('Error: $e'),
  onDone: () => print('Stream closed'),
);
```

---

## Completer

Manually resolve a Future:

```dart
import 'dart:async';

class Cache {
  final _completer = Completer<String>();
  late final Future<String> value = _completer.future;

  void setValue(String v) => _completer.complete(v);
  void setError(Object e) => _completer.completeError(e);
}

var cache = Cache();
cache.value.then(print);  // waiting...
cache.setValue('hello');  // prints hello
```

---

## Async Patterns

```dart
// Retry logic
Future<T> retry<T>(
  Future<T> Function() fn, {
  int maxAttempts = 3,
  Duration delay = const Duration(seconds: 1),
}) async {
  for (var attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (e) {
      if (attempt == maxAttempts) rethrow;
      await Future.delayed(delay * attempt); // exponential backoff
    }
  }
  throw StateError('Should not reach here');
}

// Debounce
Timer? _debounceTimer;
void onTextChanged(String text) {
  _debounceTimer?.cancel();
  _debounceTimer = Timer(Duration(milliseconds: 300), () {
    searchApi(text);
  });
}
```

---

## Isolates (True Parallelism)

Dart is single-threaded, but **Isolates** provide true parallelism for CPU-heavy work:

```dart
import 'dart:isolate';

// Run heavy computation in isolate
Future<int> computeInIsolate(int n) async {
  return Isolate.run(() => heavyComputation(n));
}

int heavyComputation(int n) {
  // This runs in a separate thread!
  var result = 0;
  for (var i = 0; i < n; i++) result += i;
  return result;
}

// In Flutter, use compute() from flutter/foundation.dart
import 'package:flutter/foundation.dart';
var result = await compute(heavyComputation, 1000000);
```

---

## Summary

| Concept | Syntax / Usage |
|---------|----------------|
| Async function | `Future<T> fn() async { ... }` |
| Await result | `var x = await future;` |
| Error handling | `try { await fn(); } catch (e) { }` |
| Parallel execution | `await Future.wait([f1, f2])` |
| Stream creation | `Stream<T> fn() async* { yield value; }` |
| Stream consumption | `await for (var x in stream)` |
| Push stream | `StreamController<T>` |
| Manual future | `Completer<T>` |
| Heavy computation | `await Isolate.run(() => ...)` |
