---
slug: dart-async-await-gotchas-zones-microtasks-error-handling
title: "Async/Await Gotchas in Dart: Unhandled Errors, Zone Traps, and Microtasks vs Event Queue"
authors: [admin]
tags: [dart, async, performance, architecture, flutter, best-practices]
---

# Async/Await Gotchas in Dart: Unhandled Errors, Zone Traps, and Microtasks vs Event Queue

Dart's `async`/`await` syntax makes asynchronous code look deceptively like simple synchronous code. On the surface, placing `await` in front of a `Future` suspends execution cleanly until a result or error is produced.

However, beneath this clean syntactic sugar lies the **Dart Event Loop** and a complex concurrency subsystem. When developers treat `async`/`await` as a magical black box, they encounter some of the hardest-to-debug issues in Dart and Flutter applications:

- **Unhandled Zone Errors:** Exceptions that bypass local `try/catch` blocks and silently crash crash-reporting pipelines or kill background workers.
- **Event Queue Starvation:** Microtasks that monopolize the CPU, causing UI freezes and dropped frames.
- **The `Future.wait` Error Trap:** First-rejection crashes that leave remaining asynchronous tasks dangling with unhandled errors.
- **Ghost Execution:** Destroyed widgets or disposed services whose unfinished background `Future`s continue running and mutating invalid memory.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                            The Dart Event Loop                              │
│                                                                             │
│                   ┌───────────────────────────────────────┐                 │
│                   │        Current Execution Stack        │                 │
│                   └───────────────────┬───────────────────┘                 │
│                                       │ stack empty                         │
│                                       ▼                                     │
│                   ┌───────────────────────────────────────┐                 │
│                   │           Microtask Queue             │◄── scheduleMicrotask()
│                   │        [ M1, M2, M3, M4 ... ]         │    Future.microtask()
│                   └───────────────────┬───────────────────┘                 │
│                                       │ drained completely                  │
│                                       ▼                                     │
│                   ┌───────────────────────────────────────┐                 │
│                   │              Event Queue              │◄── Timers, I/O,
│                   │        [ E1, E2, E3, E4 ... ]         │    Gestures, Ports
│                   └───────────────────┬───────────────────┘                 │
│                                       │ process 1 event                     │
│                                       ▼                                     │
│                             Execute Event Handler                           │
└─────────────────────────────────────────────────────────────────────────────┘
```

{/* truncate */}

In this comprehensive guide, we will dismantle Dart's asynchronous runtime mechanics, analyze edge cases, and establish production-grade patterns for error handling, queue scheduling, and operation cancellation:

1. **The Mechanics of Asynchronous Execution:** Synchronous start vs. asynchronous resumption and event loop scheduling.
2. **Microtasks vs. Event Queue:** `scheduleMicrotask`, `Timer.run`, priority queues, and avoiding starvation bugs.
3. **Unhandled Asynchronous Errors & Zone Traps:** Why `try/catch` fails around unawaited futures, how `Zone` error boundaries work, and modern Flutter error handling.
4. **`Future.wait` & Error Aggregation:** The eager-error trap and building a robust `Future.waitSettled()`.
5. **Asynchronous Cancellation Patterns:** Solving ghost execution using `CancellationToken`, `CancelableOperation`, and generation counters.
6. **Common Async Anti-Patterns in the Wild:** `forEach` with async callbacks, re-entrancy across `await` boundaries, and `FutureOr<T>` gotchas.
7. **Production Cheat Sheet & Decision Matrix:** Key rules and mental models.

---

## 1. The Mechanics of Asynchronous Execution

To debug asynchronous issues, you must first understand what actually happens when an `async` function is invoked.

### Rule #1: `async` Functions Start Synchronously

An `async` function does **not** defer its execution to the next turn of the event loop when called. **It executes synchronously on the current call stack until it encounters the first `await` keyword.**

```dart
void main() {
  print('1. Main Start');
  doSomethingAsync();
  print('3. Main End');
}

Future<void> doSomethingAsync() async {
  print('2. Inside doSomethingAsync (Synchronous!)'); // Runs immediately!
  await Future.delayed(Duration.zero);
  print('4. Resumed after await');
}

// Console Output:
// 1. Main Start
// 2. Inside doSomethingAsync (Synchronous!)
// 3. Main End
// 4. Resumed after await
```

```text
Call Stack:
[ main() ] ──► [ doSomethingAsync() prints '2' ] ──► hits [ await ] (returns uncompleted Future)
     │
     └──► [ main() prints '3' ] ──► (stack empty) ──► Event Loop resumes [ doSomethingAsync() prints '4' ]
```

### Rule #2: `await` Always Yields Execution

Even if the value being awaited is an already completed `Future` or a synchronous primitive, the `await` keyword **always** suspends execution and schedules the remainder of the function as a microtask on the event loop:

```dart
void main() {
  print('A');
  checkImmediateAwait();
  print('C');
}

Future<void> checkImmediateAwait() async {
  // Awaiting an already-completed Future:
  await Future.value(42); 
  print('B'); // Does NOT execute synchronously!
}

// Console Output:
// A
// C
// B
```

---

## 2. Microtasks vs. Event Queue: Priority & Starvation

Dart's event loop coordinates two distinct queues: the **Microtask Queue** and the **Event Queue**.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                           Event Scheduling Priority                         │
├────────────────────────────┬────────────────────────────┬───────────────────┤
│ Queue                      │ Triggered By               │ Priority          │
├────────────────────────────┼────────────────────────────┼───────────────────┤
│ **Microtask Queue**        │ `scheduleMicrotask()`,     │ **Highest**       │
│                            │ `Future.microtask()`,      │ Drains completely │
│                            │ `await` resumptions        │ before next event │
├────────────────────────────┼────────────────────────────┼───────────────────┤
│ **Event Queue**            │ `Timer.run()`,             │ **Standard**      │
│                            │ `Future.delayed()`,        │ Processes one     │
│                            │ I/O, Gestures, Ports       │ event per cycle   │
└────────────────────────────┴────────────────────────────┴───────────────────┘
```

### Execution Ordering Trace Puzzle

Consider this classic ordering challenge:

```dart
import 'dart:async';

void main() {
  print('1. Sync Start');

  Timer.run(() => print('2. Event Queue: Timer.run'));

  Future.delayed(Duration.zero, () => print('3. Event Queue: Future.delayed'));

  scheduleMicrotask(() => print('4. Microtask 1'));

  Future.microtask(() => print('5. Microtask 2'));

  Future(() => print('6. Event Queue: Future() constructor'));

  print('7. Sync End');
}
```

#### Step-by-Step Resolution:
1. **Synchronous code executes:** Prints `1. Sync Start` and `7. Sync End`.
2. As synchronous lines run:
   - `Timer.run()` registers an entry in the **Event Queue**.
   - `Future.delayed(Duration.zero)` registers an entry in the **Event Queue**.
   - `scheduleMicrotask()` enqueues an entry in the **Microtask Queue**.
   - `Future.microtask()` enqueues an entry in the **Microtask Queue**.
   - `Future(...)` is a convenience constructor that schedules on the **Event Queue**.
3. **Synchronous stack empties:** The engine drains the **Microtask Queue** first (`4. Microtask 1`, then `5. Microtask 2`).
4. **Microtask queue is now empty:** The engine pulls the first item from the **Event Queue** (`2. Event Queue: Timer.run`), then `3. Event Queue: Future.delayed`, then `6. Event Queue: Future() constructor`.

```text
Output:
1. Sync Start
7. Sync End
4. Microtask 1
5. Microtask 2
2. Event Queue: Timer.run
3. Event Queue: Future.delayed
6. Event Queue: Future() constructor
```

### The Microtask Starvation Trap

Because Dart promises to **drain the entire Microtask Queue before processing even a single item from the Event Queue**, an unbroken chain of microtasks will completely starve the event loop. 

When starved, timers cannot fire, network I/O cannot be read, user touch gestures are ignored, and Flutter cannot render a single frame:

```dart
// ❌ DANGEROUS: Event Queue Starvation
void recursiveMicrotask(int iteration) {
  if (iteration > 1000000) return;
  
  scheduleMicrotask(() {
    // Heavy work scheduled in microtask queue
    recursiveMicrotask(iteration + 1);
  });
}

void main() {
  // This timer will NEVER execute as long as the microtask queue has tasks!
  Timer(const Duration(milliseconds: 10), () {
    print('Timer fired!'); // Blocked indefinitely!
  });

  recursiveMicrotask(0);
}
```

> [!CAUTION]
> Never schedule continuous or iterative background calculations via `scheduleMicrotask()` or `Future.microtask()`. If you need to yield execution to allow UI rendering and touch events to process between calculation chunks, yield through the Event Queue with `await Future.delayed(Duration.zero)` or offload the calculation entirely to an **Isolate**.

---

## 3. Unhandled Asynchronous Errors & Zone Traps

One of the most dangerous misconceptions in Dart is that a synchronous `try/catch` block will catch any error thrown inside its syntactic scope.

### The Unawaited Future Escape Trap

```dart
// ❌ WRONG: try/catch does NOT catch errors from unawaited Futures!
void initiateUpload() {
  try {
    uploadTelemetryData(); // Function returns an unawaited Future!
  } catch (e) {
    print('Caught upload error: $e'); // NEVER REACHED!
  }
}

Future<void> uploadTelemetryData() async {
  await Future.delayed(const Duration(milliseconds: 50));
  throw const SocketException('Connection reset by peer');
}
```

#### Why did this happen?
When `initiateUpload()` calls `uploadTelemetryData()`, the function executes up to the `await` and immediately returns an uncompleted `Future`. `initiateUpload()` exits its `try/catch` block synchronously. 

Fifty milliseconds later, the delayed timer completes, the exception is thrown inside the event loop, and because nobody is awaiting the `Future` or attached an `.catchError()`, the exception escapes into the **Zone error handler**, crashing the app or triggering an unhandled exception alert!

```dart
// ✅ CORRECT APPROACH 1: Await the Future inside try/catch
Future<void> initiateUploadCorrectly() async {
  try {
    await uploadTelemetryData();
  } catch (e) {
    print('Successfully caught error: $e');
  }
}

// ✅ CORRECT APPROACH 2: Attach .catchError() or unawaited with error logging
import 'dart:async';

void initiateFireAndForget() {
  unawaited(
    uploadTelemetryData().catchError((error, stackTrace) {
      print('Caught and logged fire-and-forget error: $error');
    }),
  );
}
```

---

### What are Zones? (`dart:async`)

A **`Zone`** represents an asynchronous execution context in Dart. Zones maintain contextual state (zone-local values) and intercept asynchronous lifecycle hooks, including:
- Timer creation and scheduling.
- Microtask queueing.
- Uncaught asynchronous error handling.

Every Dart program starts inside the default **Root Zone** (`Zone.root`). When you create a child zone, all asynchronous callbacks registered within that zone remember the zone in which they were created.

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                                 Zone Hierarchy                              │
│                                                                             │
│  Zone.root (Global Default Execution Context)                               │
│  │                                                                          │
│  └──► Child Zone A (Created via runZonedGuarded)                            │
│       ├── Custom Error Handler: (error, stack) => LogToCrashlytics(error)   │
│       ├── Zone-Local Key: #requestId = "REQ-8902"                           │
│       │                                                                     │
│       └──► Child Zone B (Sub-task Context)                                  │
│            └── Zone-Local Key: #userId = "USER-42"                          │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Passing Context via Zone-Local Values

Zone-local values provide a clean mechanism to attach request context (like Trace IDs or Authentication Tokens) throughout an asynchronous call stack without passing extra arguments to every function:

```dart
import 'dart:async';

final requestIdKey = Object();

void main() {
  // Run request pipeline in a scoped zone with a unique Request ID
  runZoned(
    () {
      processOrder();
    },
    zoneValues: {requestIdKey: 'REQ-ABC-12345'},
  );
}

void processOrder() async {
  await Future.delayed(const Duration(milliseconds: 20));
  saveToDatabase();
}

void saveToDatabase() {
  // Read zone-local value anywhere deep in the async call stack
  final currentRequestId = Zone.current[requestIdKey];
  print('Saving order under Request ID: $currentRequestId');
}
```

---

### Modern Flutter Error Boundaries: `PlatformDispatcher` vs. `runZonedGuarded`

Historically, Flutter apps wrapped their `main()` entry point inside `runZonedGuarded` to catch global asynchronous errors:

```dart
// ⚠️ LEGACY APPROACH (Pre-Flutter 3.3)
void main() {
  runZonedGuarded(() async {
    WidgetsFlutterBinding.ensureInitialized();
    runApp(const MyApp());
  }, (error, stack) {
    FirebaseCrashlytics.instance.recordError(error, stack);
  });
}
```

In modern Flutter (Flutter 3.3+), the Flutter Framework and Dart runtime unified asynchronous error routing through **`PlatformDispatcher.instance.onError`**. 

Using `runZonedGuarded` around `ensureInitialized()` creates separate zone boundaries that can break platform channel bindings and engine initialization.

#### The Modern Production Standard:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';

void main() {
  WidgetsFlutterBinding.ensureInitialized();

  // 1. Catch synchronous Flutter framework errors (widget build, layout, render errors)
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    // Report to Crash Reporting Service
    debugPrint('[FlutterError] Caught: ${details.exceptionAsString()}');
  };

  // 2. Catch all asynchronous and unhandled Dart runtime errors
  PlatformDispatcher.instance.onError = (Object error, StackTrace stack) {
    debugPrint('[PlatformDispatcher] Caught unhandled async error: $error');
    // Return true to indicate the error was handled and prevent app termination
    return true; 
  };

  runApp(const MyApp());
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return const MaterialApp(
      home: Scaffold(body: Center(child: Text('Error Boundary Active'))),
    );
  }
}
```

---

## 4. `Future.wait` & Error Aggregation

`Future.wait()` executes a list of futures concurrently and returns a single `Future` that completes with a list of values once all input futures have finished.

### The Dangling Error Trap with `eagerError`

By default, `Future.wait(futures, eagerError: false)` waits for **all** futures to complete before reporting any errors. If any future throws an error, `Future.wait` completes with the first error.

If you pass `eagerError: true`, `Future.wait` completes **immediately** when the first error occurs:

```dart
void main() async {
  try {
    await Future.wait([
      taskA(), // Fails at 100ms
      taskB(), // Fails at 300ms
      taskC(), // Completes at 500ms
    ], eagerError: true);
  } catch (e) {
    print('Caught eager error: $e');
  }
}

Future<String> taskA() async {
  await Future.delayed(const Duration(milliseconds: 100));
  throw Exception('Task A Failed');
}

Future<String> taskB() async {
  await Future.delayed(const Duration(milliseconds: 300));
  throw Exception('Task B Failed');
}

Future<String> taskC() async {
  await Future.delayed(const Duration(milliseconds: 500));
  return 'Task C OK';
}
```

```text
Time Line:
0ms ───────────────────────────────────────────────────────────────────────────►
        100ms: taskA throws ──► Future.wait immediately completes with Error A!
                 │
                 └──► try/catch catches Error A.
        300ms: taskB throws! ──► 💥 UNCAUGHT ASYNC EXCEPTION in Zone! 
                                (Because Future.wait is no longer listening to taskB!)
```

> [!WARNING]
> When `eagerError: true` is enabled on `Future.wait`, if a secondary future throws an error *after* the first failure, that subsequent error has no listener and becomes an **unhandled asynchronous exception**!

---

### The Solution: Building `Future.waitSettled()`

To safely inspect all concurrent tasks without losing errors or crashing on subsequent failures, we implement a `waitSettled` combinator (equivalent to JavaScript's `Promise.allSettled`):

```dart
// future_settled.dart
import 'dart:async';

/// Represents the completed state of an asynchronous operation.
sealed class AsyncResult<T> {
  const AsyncResult();
}

final class SuccessResult<T> extends AsyncResult<T> {
  final T value;
  const SuccessResult(this.value);

  @override
  String toString() => 'SuccessResult($value)';
}

final class FailureResult<T> extends AsyncResult<T> {
  final Object error;
  final StackTrace stackTrace;
  const FailureResult(this.error, this.stackTrace);

  @override
  String toString() => 'FailureResult($error)';
}

/// Awaits all futures to settle, capturing both successes and errors safely.
Future<List<AsyncResult<T>>> waitSettled<T>(Iterable<Future<T>> futures) {
  final wrappedFutures = futures.map((future) async {
    try {
      final value = await future;
      return SuccessResult<T>(value);
    } catch (error, stackTrace) {
      return FailureResult<T>(error, stackTrace);
    }
  });

  return Future.wait(wrappedFutures);
}
```

#### Running `waitSettled()`:

```dart
void main() async {
  final results = await waitSettled<String>([
    taskA(), // Throws at 100ms
    taskB(), // Throws at 300ms
    taskC(), // Returns "Task C OK" at 500ms
  ]);

  for (final (index, result) in results.indexed) {
    switch (result) {
      case SuccessResult(:final value):
        print('Task $index succeeded: $value');
      case FailureResult(:final error):
        print('Task $index failed gracefully: $error');
    }
  }
}

// Console Output:
// Task 0 failed gracefully: Exception: Task A Failed
// Task 1 failed gracefully: Exception: Task B Failed
// Task 2 succeeded: Task C OK
```

---

## 5. Asynchronous Cancellation Patterns

In Dart, once a `Future` is instantiated, **its underlying work cannot be cancelled from the outside**. The async computation will run to completion.

If a user navigates away from a screen while an HTTP request or heavy calculation is in flight, the completed future will return to a disposed widget, causing crashes or memory leaks (**Ghost Execution**).

```text
┌─────────────────────────────────────────────────────────────────────────────┐
│                          Ghost Execution Problem                            │
│                                                                             │
│  User Opens Profile Screen ──► Initiates fetchUserProfile() (3000ms)        │
│          │                                                                  │
│          ▼ User Pops Screen (1000ms)                                        │
│  ProfileScreen.dispose() called                                             │
│          │                                                                  │
│          ▼ Network Completes (3000ms)                                       │
│  setState() invoked on unmounted element! ──► 💥 Flutter Framework Error!  │
└─────────────────────────────────────────────────────────────────────────────┘
```

---

### Pattern 1: Generation Counter Pattern (Lightweight)

For Flutter `StatefulWidget`s or controllers without third-party dependencies, a **generation counter** or request ID is the most lightweight defense against stale asynchronous responses:

```dart
class UserProfileWidget extends StatefulWidget {
  final UserService userService;
  const UserProfileWidget({super.key, required this.userService});

  @override
  State<UserProfileWidget> createState() => _UserProfileWidgetState();
}

class _UserProfileWidgetState extends State<UserProfileWidget> {
  UserProfile? _profile;
  bool _isLoading = false;
  
  // Incremented on every new request or widget disposal
  int _requestGeneration = 0;

  void _loadUserData() async {
    final currentGen = ++_requestGeneration;

    setState(() => _isLoading = true);

    try {
      final data = await widget.userService.fetchProfile();

      // Check if this callback belongs to the latest active request AND widget is mounted
      if (currentGen == _requestGeneration && mounted) {
        setState(() {
          _profile = data;
          _isLoading = false;
        });
      }
    } catch (e) {
      if (currentGen == _requestGeneration && mounted) {
        setState(() => _isLoading = false);
      }
    }
  }

  @override
  void dispose() {
    _requestGeneration++; // Invalidate any in-flight asynchronous operations
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) return const CircularProgressIndicator();
    return Text(_profile?.name ?? 'No data');
  }
}
```

---

### Pattern 2: Explicit `CancellationToken`

For service layers, repositories, and network engines, pass an explicit `CancellationToken`:

```dart
// cancellation_token.dart
class CancellationToken {
  bool _isCancelled = false;
  final List<void Function()> _listeners = [];

  bool get isCancelled => _isCancelled;

  void cancel() {
    if (_isCancelled) return;
    _isCancelled = true;
    for (final listener in _listeners) {
      listener();
    }
    _listeners.clear();
  }

  void throwIfCancelled() {
    if (_isCancelled) {
      throw const OperationCancelledException('The operation was cancelled.');
    }
  }

  void onCancelled(void Function() callback) {
    if (_isCancelled) {
      callback();
    } else {
      _listeners.add(callback);
    }
  }
}

class OperationCancelledException implements Exception {
  final String message;
  const OperationCancelledException(this.message);

  @override
  String toString() => 'OperationCancelledException: $message';
}
```

#### Utilizing the Token in Long-Running Workflows:

```dart
class FileProcessor {
  Future<void> processLargeFiles(
    List<String> paths, {
    CancellationToken? token,
  }) async {
    for (final path in paths) {
      // 1. Check for cancellation before starting next unit of work
      token?.throwIfCancelled();

      await _compressSingleFile(path);

      // 2. Check for cancellation after async completion
      token?.throwIfCancelled();
    }
  }

  Future<void> _compressSingleFile(String path) async {
    await Future.delayed(const Duration(milliseconds: 100));
  }
}
```

---

### Pattern 3: `CancelableOperation` (`package:async`)

Dart's official `package:async` provides `CancelableOperation`. It wraps a standard `Future` and suppresses its results or errors if cancelled before completion:

```dart
import 'package:async/async.dart';

void main() async {
  final operation = CancelableOperation.fromFuture(
    fetchNetworkReport(),
    onCancel: () => print('Underlying operation cancelled.'),
  );

  // Attach listener
  operation.value.then(
    (value) => print('Received: $value'),
    onError: (err) => print('Error: $err'),
  );

  // Cancel operation before it completes (at 200ms)
  await Future.delayed(const Duration(milliseconds: 100));
  await operation.cancel();
  print('Operation was cancelled. Listener will not fire.');
}

Future<String> fetchNetworkReport() async {
  await Future.delayed(const Duration(milliseconds: 200));
  return 'Full Analytics Report';
}
```

---

## 6. Common Async Anti-Patterns in the Wild

### Anti-Pattern 1: Async Callbacks in `Iterable.forEach()`

`Iterable.forEach` takes a `void Function(T)` callback. It completely ignores return values and **does not await asynchronous closures**:

```dart
// ❌ WRONG: forEach fires all operations concurrently without awaiting!
Future<void> saveAllItems(List<Item> items) async {
  items.forEach((item) async {
    await database.insert(item); // Unawaited!
  });
  print('Done!'); // Prints immediately BEFORE items are inserted!
}

// ✅ CORRECT APPROACH 1: Sequential processing with standard for-in
Future<void> saveAllItemsSequential(List<Item> items) async {
  for (final item in items) {
    await database.insert(item);
  }
  print('All items saved sequentially.');
}

// ✅ CORRECT APPROACH 2: Concurrent processing with Future.wait
Future<void> saveAllItemsConcurrent(List<Item> items) async {
  await Future.wait(items.map((item) => database.insert(item)));
  print('All items saved in parallel.');
}
```

---

### Anti-Pattern 2: Re-Entrancy & Race Conditions Across `await`

Because Dart is single-threaded, synchronous blocks of code cannot be interrupted. However, **as soon as you call `await`, other events can run on the main thread and mutate state before your function resumes!**

```dart
class BankAccount {
  double balance = 100.0;

  // ❌ VULNERABLE TO RACE CONDITIONS / RE-ENTRANCY
  Future<bool> withdraw(double amount) async {
    if (balance >= amount) {
      // 💥 CRITICAL GAP: As soon as execution yields to async validation,
      // a second withdraw() call can pass the balance check!
      await performFraudCheck();

      balance -= amount; // Balance can now drop below zero!
      return true;
    }
    return false;
  }

  Future<void> performFraudCheck() => Future.delayed(const Duration(milliseconds: 50));
}
```

#### The Fix: Mutex / Asynchronous Lock

```dart
import 'dart:async';

class AsyncLock {
  Completer<void>? _completer;

  Future<void> acquire() async {
    while (_completer != null) {
      await _completer!.future;
    }
    _completer = Completer<void>();
  }

  void release() {
    final completer = _completer;
    _completer = null;
    completer?.complete();
  }

  Future<T> synchronized<T>(Future<T> Function() computation) async {
    await acquire();
    try {
      return await computation();
    } finally {
      release();
    }
  }
}

class SafeBankAccount {
  double balance = 100.0;
  final _lock = AsyncLock();

  Future<bool> withdraw(double amount) => _lock.synchronized(() async {
    if (balance >= amount) {
      await Future.delayed(const Duration(milliseconds: 50));
      balance -= amount;
      return true;
    }
    return false;
  });
}
```

---

### Anti-Pattern 3: The `FutureOr<T>` Optimization Trap

`FutureOr<T>` represents either a synchronous value `T` or an asynchronous `Future<T>`. It is frequently used in caching layers to return immediate values without async overhead.

However, treating `FutureOr<T>` as a plain `T` without checking its runtime type causes unexpected async behavior:

```dart
import 'dart:async';

class CacheRepository {
  final Map<String, String> _memoryCache = {'user_1': 'Alice'};

  FutureOr<String> getUserName(String id) {
    if (_memoryCache.containsKey(id)) {
      return _memoryCache[id]!; // Synchronous String
    }
    return _fetchFromNetwork(id); // Asynchronous Future<String>
  }

  Future<String> _fetchFromNetwork(String id) async {
    await Future.delayed(const Duration(milliseconds: 100));
    return 'Bob';
  }
}

void processUser(CacheRepository repo) {
  final result = repo.getUserName('user_1');

  // If you use pattern matching on FutureOr:
  if (result is Future<String>) {
    result.then((name) => print('Async Name: $name'));
  } else {
    // Fast synchronous path! Zero event loop delays.
    print('Synchronous Cached Name: $result');
  }
}
```

---

## 7. Production Cheat Sheet & Decision Matrix

```text
                               How are you executing your async tasks?
                                                  │
                ┌─────────────────────────────────┴─────────────────────────────────┐
                ▼                                                                   ▼
       Sequential Execution                                               Parallel Execution
        (Order matters / FIFO)                                          (Independent sub-tasks)
                │                                                                   │
    Use standard for-in loop                                                Need all results,
    with await inside body                                                even if some fail?
                                                                                    │
                                                         ┌──────────────────────────┴──────────────────────────┐
                                                         ▼                                                     ▼
                                                        YES                                                    NO
                                                         │                                                     │
                                            Use waitSettled<T>()                                     Use Future.wait()
                                        Captures Success + Failure                               (Default: eagerError: false)
```

### Production Checklist

- [ ] **No `forEach` with `async`:** Always replace `items.forEach((e) async {...})` with `for (final e in items)` or `Future.wait()`.
- [ ] **Handle Unawaited Futures:** Wrap intentionally unawaited futures in `unawaited(future.catchError(...))` to prevent unhandled zone errors.
- [ ] **Error Boundaries:** Use `PlatformDispatcher.instance.onError` for global async error logging instead of legacy `runZonedGuarded` wrappers around `ensureInitialized()`.
- [ ] **Event Queue Health:** Never execute recursive microtask loops; yield to the Event Queue via `Future.delayed(Duration.zero)` or isolates to prevent UI starvation.
- [ ] **Cancellation & Disposed States:** Check `mounted` in Flutter `State` objects after every `await` boundary, or utilize `CancelableOperation` and `CancellationToken`.
- [ ] **Synchronous State Invariants:** Protect shared mutable state spanning across `await` statements with an asynchronous mutex lock to eliminate re-entrancy bugs.

Mastering the event loop, zone error boundaries, and cancellation patterns gives you total control over Dart's concurrency model—ensuring your applications remain responsive, error-resilient, and leak-free.
