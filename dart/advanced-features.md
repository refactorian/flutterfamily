---
sidebar_position: 21
title: Advanced Features
description: Callable classes, custom annotations, operator overloading, isolates, zones, and late final patterns in Dart.
---

This chapter covers the features that separate intermediate Dart developers from advanced ones: callable classes, typedefs, metadata, `noSuchMethod`, Zones, Isolates, and more.

---

## Callable Classes

A class that defines a `call()` method can be invoked like a function. This lets objects behave as functions while still carrying state and type information.

```dart
// Basic callable
class Adder {
  final int amount;
  Adder(this.amount);

  int call(int value) => value + amount;
}

var add5  = Adder(5);
var add10 = Adder(10);
print(add5(3));    // 8
print(add10(3));   // 13

// They're objects — you can store them, pass them, compose them
List<Adder> pipeline = [Adder(1), Adder(2), Adder(3)];
var result = pipeline.fold(0, (acc, adder) => adder(acc));
print(result); // 6  (0 → 1 → 3 → 6)

// Useful for dependency injection / strategy pattern
class Validator<T> {
  final String message;
  final bool Function(T) _check;

  const Validator(this.message, this._check);

  bool call(T value) => _check(value);

  // Combine validators
  Validator<T> and(Validator<T> other) => Validator(
    '$message and ${other.message}',
    (v) => this(v) && other(v),
  );
}

final isNotEmpty = Validator<String>('must not be empty', (s) => s.isNotEmpty);
final isEmail    = Validator<String>('must be an email', (s) => s.contains('@'));
final validEmail = isNotEmpty.and(isEmail);

print(validEmail(''));              // false
print(validEmail('bad'));           // false
print(validEmail('good@email.com')); // true

// vs passing raw functions
void validate(String value, bool Function(String) check) { }
validate('test', validEmail);  // ✅ callable class works as a function
```

---

## typedefs (Function Type Aliases)

`typedef` creates a named alias for a type — most often used for function signatures and complex generic types.

```dart
// Function type aliases
typedef VoidCallback    = void Function();
typedef Callback<T>     = void Function(T value);
typedef Predicate<T>    = bool Function(T value);
typedef Transformer<T, R> = R Function(T input);
typedef Comparator<T>   = int Function(T a, T b);
typedef Builder<T>      = T Function();
typedef AsyncCallback   = Future<void> Function();
typedef Middleware<T>   = Future<T> Function(T value, Future<T> Function(T) next);

// Using typedefs
Predicate<int> isPositive = (n) => n > 0;
Predicate<String> hasContent = (s) => s.trim().isNotEmpty;
Transformer<String, int> toLength = (s) => s.length;

void process<T>(List<T> items, Predicate<T> filter, Callback<T> action) {
  for (var item in items) {
    if (filter(item)) action(item);
  }
}

process([1, -2, 3, -4, 5], isPositive, print);
// 1  3  5

// Non-function typedefs (Dart 2.13+)
typedef JsonMap      = Map<String, dynamic>;
typedef StringList   = List<String>;
typedef Id           = int;
typedef Cache<T>     = Map<String, T>;

JsonMap toJson() => {'key': 'value'};
Cache<User> userCache = {};

// Typedef for records (Dart 3)
typedef Point = (double x, double y);
typedef Named<T> = ({String name, T value});

Point origin = (0.0, 0.0);
Named<int> score = (name: 'Alice', value: 95);
```

---

## Metadata / Annotations

Annotations are metadata attached to declarations. They are evaluated at compile time and available at runtime via reflection (or used by code generators like `build_runner`).

```dart
// ── Built-in annotations ──────────────────────────────────────────────
@override          // must override a superclass member
@deprecated        // simple deprecation marker
@Deprecated('Use newMethod() instead. Will be removed in v3.0.')
@pragma('vm:entry-point')   // tell AOT compiler not to tree-shake this
@pragma('dart2js:noInline') // web compiler directive

// ── Custom annotations ────────────────────────────────────────────────
// Annotations are const constructors
class ApiEndpoint {
  final String path;
  final String method;
  const ApiEndpoint(this.path, {this.method = 'GET'});
}

class Cached {
  final Duration ttl;
  const Cached({this.ttl = const Duration(minutes: 5)});
}

class Inject {
  const Inject();
}

// Apply annotations
@ApiEndpoint('/users', method: 'GET')
@Cached(ttl: Duration(minutes: 10))
Future<List<User>> getUsers() async { ... }

@ApiEndpoint('/users', method: 'POST')
Future<User> createUser(@Inject() UserService service, User user) async { ... }

// ── Code generation annotations ───────────────────────────────────────
// These drive build_runner to generate code:

@JsonSerializable(explicitToJson: true)
class UserProfile {
  final String id;
  final String name;
  @JsonKey(name: 'profile_picture_url')
  final String? avatarUrl;

  const UserProfile({required this.id, required this.name, this.avatarUrl});

  factory UserProfile.fromJson(Map<String, dynamic> json) =>
      _$UserProfileFromJson(json);

  Map<String, dynamic> toJson() => _$UserProfileToJson(this);
}

// Run: dart run build_runner build
// Generates: user_profile.g.dart  with _$UserProfileFromJson/_$UserProfileToJson

@freezed
class Counter with _$Counter {
  const factory Counter({
    @Default(0) int value,
    @Default(false) bool isLoading,
  }) = _Counter;
}
// Generates: copyWith, ==, hashCode, toString, fromJson, toJson
```

---

## `noSuchMethod`

Called when a method or property that doesn't exist is accessed. Useful for **proxies**, **dynamic dispatch**, and **mock frameworks**.

```dart
// Basic noSuchMethod
class DynamicProxy {
  @override
  dynamic noSuchMethod(Invocation invocation) {
    print('Called: ${invocation.memberName}');
    print('  positional args: ${invocation.positionalArguments}');
    print('  named args: ${invocation.namedArguments}');

    if (invocation.isGetter) return null;
    if (invocation.isMethod) return null;
    super.noSuchMethod(invocation); // throws NoSuchMethodError
  }
}

// Use with dynamic to bypass static checks
dynamic d = DynamicProxy();
d.anything();          // Called: Symbol("anything")
d.someProperty;        // Called: Symbol("someProperty")
d.compute(1, x: 2);   // With arguments

// Real-world: simple mock / stub for testing
class MockUserRepository implements UserRepository {
  final _calls = <String, List<dynamic>>{};

  @override
  dynamic noSuchMethod(Invocation inv) {
    final name = inv.memberName.toString();
    _calls[name] = inv.positionalArguments;
    return Future.value(null); // default return
  }

  bool wasCalled(String methodName) => _calls.containsKey(methodName);
  List<dynamic>? argsFor(String methodName) => _calls[methodName];
}

// For @override to work without implementing all members:
// (note: proper mocking should use the mockito package)
```

---

## Isolates — True Parallelism

Dart is single-threaded, but **Isolates** run in separate threads with their own memory heap. They communicate only through message passing — no shared mutable state.

```dart
import 'dart:isolate';

// ── Simple: Isolate.run (Dart 2.19+) ─────────────────────────────────
// Best for one-shot heavy computation
Future<List<int>> findPrimes(int upTo) async {
  return await Isolate.run(() {
    // This runs in a separate thread
    final primes = <int>[];
    for (var n = 2; n <= upTo; n++) {
      if (_isPrime(n)) primes.add(n);
    }
    return primes;
  });
}

bool _isPrime(int n) {
  if (n < 2) return false;
  for (var i = 2; i * i <= n; i++) {
    if (n % i == 0) return false;
  }
  return true;
}

// Usage
void main() async {
  print('Finding primes...');
  final primes = await findPrimes(10000);
  print('Found ${primes.length} primes up to 10000');
  // Main thread was free the whole time!
}

// ── Complex: long-lived Isolate with bidirectional communication ───────
void workerIsolate(SendPort mainSendPort) {
  // Create a port for receiving messages from main
  final workerReceivePort = ReceivePort();
  // Send our receive port to main so it can talk to us
  mainSendPort.send(workerReceivePort.sendPort);

  workerReceivePort.listen((message) {
    if (message is int) {
      // Do the heavy work
      final result = _isPrime(message);
      mainSendPort.send((number: message, isPrime: result));
    } else if (message == 'shutdown') {
      workerReceivePort.close();
    }
  });
}

Future<void> main() async {
  final mainReceivePort = ReceivePort();
  final isolate = await Isolate.spawn(workerIsolate, mainReceivePort.sendPort);

  // Get the worker's send port
  final workerSendPort = await mainReceivePort.first as SendPort;

  // Set up response listener
  final responses = ReceivePort();
  workerSendPort.send(17); // Check if 17 is prime

  // Listen for responses
  final sub = responses.listen((msg) {
    if (msg is ({int number, bool isPrime})) {
      print('${msg.number} is prime: ${msg.isPrime}');
    }
  });

  workerSendPort.send('shutdown');
  await sub.cancel();
  isolate.kill(priority: Isolate.immediate);
}

// ── In Flutter: use compute() ──────────────────────────────────────────
import 'package:flutter/foundation.dart';

// compute() is just a convenient wrapper around Isolate.run
Future<Uint8List> compressImageInBackground(Uint8List imageBytes) {
  return compute(_compressImage, imageBytes);
}

Uint8List _compressImage(Uint8List bytes) {
  // Top-level or static function — required for compute()
  return processImage(bytes);
}
```

---

## Zones

A `Zone` is an execution context that can intercept async operations, catch unhandled errors, and inject context-local values.

```dart
import 'dart:async';

// ── Global error catching ─────────────────────────────────────────────
void main() {
  runZonedGuarded(
    () async {
      // Every async operation in here is wrapped in this zone
      runApp(const MyApp());
    },
    (Object error, StackTrace stack) {
      // Catches unhandled errors from ANYWHERE in the zone
      FirebaseCrashlytics.instance.recordError(error, stack);
    },
  );
}

// ── Zone-local values (zone.fork with values) ─────────────────────────
final requestIdKey = Object(); // unique key

Future<void> handleRequest(String requestId) async {
  await runZoned(
    () async {
      await processRequest();
    },
    zoneValues: {requestIdKey: requestId},
  );
}

String? get currentRequestId =>
    Zone.current[requestIdKey] as String?;

// ── Overriding zone behavior ──────────────────────────────────────────
// Override scheduleMicrotask, print, Timer, etc.
void main() {
  final zone = Zone.current.fork(
    specification: ZoneSpecification(
      print: (self, parent, zone, line) {
        // Redirect all print() calls to a logger
        myLogger.info(line);
        // parent.print(zone, line); // also forward to actual print
      },
      scheduleMicrotask: (self, parent, zone, fn) {
        // Wrap every microtask
        parent.scheduleMicrotask(zone, () {
          try {
            fn();
          } catch (e) {
            // handle microtask errors
          }
        });
      },
    ),
  );
  zone.run(() {
    print('This goes to myLogger!');
    runApp(const MyApp());
  });
}

// ── Practical: request-scoped logging ────────────────────────────────
Future<Response> handleHttpRequest(Request request) {
  return runZoned(
    () => _handle(request),
    zoneValues: {#requestId: request.id, #startTime: DateTime.now()},
  );
}

void log(String msg) {
  final id = Zone.current[#requestId];
  final elapsed = DateTime.now().difference(Zone.current[#startTime] as DateTime);
  print('[$id +${elapsed.inMs}ms] $msg');
}
```

---

## `dart:developer` — Debug Tools

```dart
import 'dart:developer';

// log() — structured logging (visible in DevTools)
log('User logged in', name: 'auth', level: 800);
log('Error!', name: 'api', error: e, stackTrace: st, level: 1000);

// Timeline events — visible in Flutter DevTools Performance tab
Timeline.startSync('Heavy computation');
final result = heavyCompute();
Timeline.finishSync();

// Named timeline events
Timeline.timeSync('json parse', () => jsonDecode(rawJson));

// debugger() — programmatic breakpoint (pauses in DevTools)
void suspiciousFunction() {
  debugger(when: someCondition, message: 'suspiciousFunction hit');
  doThing();
}

// inspect() — pin a value in DevTools inspector
inspect(myComplexObject);

// postEvent() — emit custom events to DevTools extensions
postEvent('my_ext.eventType', {'key': 'value'});
```

---

## `dart:mirrors` (Reflection)

> ⚠️ **Not available in Flutter** (AOT compilation doesn't support mirrors). Available in server-side Dart only. Prefer code generation (`build_runner`) for most reflection-like tasks.

```dart
import 'dart:mirrors';

class Dog {
  String name;
  int age;
  Dog(this.name, this.age);
  void bark() => print('$name: Woof!');
}

void reflectExample() {
  var dog = Dog('Rex', 3);
  var mirror = reflect(dog);

  // Read a field by name
  var name = mirror.getField(#name).reflectee;
  print(name);  // Rex

  // Call a method by name
  mirror.invoke(#bark, []);  // Rex: Woof!

  // Set a field
  mirror.setField(#age, 4);
  print(dog.age);  // 4

  // Inspect the class
  var classMirror = reflectClass(Dog);
  classMirror.declarations.forEach((sym, decl) {
    print('$sym: ${decl.runtimeType}');
  });
}
```

---

## The `extension type` (Dart 3) — Zero-Cost Wrappers

Extension types wrap an existing type with a new interface — **at zero runtime cost** (no boxing, no allocation).

```dart
// Without extension type: mix up IDs accidentally
void getUser(int userId) { }
void getProduct(int productId) { }
getUser(productId);  // ❌ compiles fine but logically wrong!

// With extension type: type-safe IDs
extension type UserId(int id) implements int {
  bool get isValid => id > 0;
  UserId next() => UserId(id + 1);
}

extension type ProductId(int id) implements int {
  bool get isValid => id > 0;
}

void getUser(UserId id) { }
void getProduct(ProductId id) { }

var uid = UserId(42);
var pid = ProductId(42);
getUser(uid);   // ✅
// getUser(pid);  // ❌ compile error — wrong type!
// getUser(42);   // ❌ compile error — must be UserId

// Extension types with methods
extension type Celsius(double temp) {
  Celsius operator +(Celsius other) => Celsius(temp + other.temp);
  Fahrenheit toFahrenheit() => Fahrenheit(temp * 9/5 + 32);
  bool get isFreezingOrBelow => temp <= 0;
}

extension type Fahrenheit(double temp) {
  Celsius toCelsius() => Celsius((temp - 32) * 5/9);
}

var boiling = Celsius(100);
print(boiling.toFahrenheit().temp); // 212.0
// Can't accidentally add Celsius to Fahrenheit!
```

---

## Summary

| Feature | Use Case |
|---------|----------|
| Callable class | Object that acts as a function; carries state |
| `typedef` | Name complex function / type signatures |
| Annotations | Metadata for tools, codegen, documentation |
| `noSuchMethod` | Dynamic dispatch, proxies, simple mocks |
| `Isolate.run` | One-off CPU-heavy work in background thread |
| `Isolate.spawn` | Long-lived background worker with messaging |
| `runZonedGuarded` | Global error catching for a block of code |
| Zone values | Request-scoped context (like thread-local storage) |
| `dart:developer` | Structured logging, DevTools integration |
| `dart:mirrors` | Runtime reflection (server only, not Flutter) |
| Extension type | Zero-cost typed wrapper around an existing type |
