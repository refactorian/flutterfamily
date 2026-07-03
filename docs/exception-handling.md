---
sidebar_position: 16
title: Exception Handling
description: try/catch/finally, built-in exceptions, custom exceptions, throwing, rethrow, and the Result pattern in Dart.
---

Dart distinguishes between **Exceptions** (expected, recoverable problems) and **Errors** (programming mistakes that should not be caught in production). Understanding that distinction is the foundation of good error handling.

---

## Exceptions vs Errors

```
Throwable
├── Exception                ← Expected problems — catch and handle
│   ├── FormatException
│   ├── IOException
│   ├── HttpException
│   └── (your custom exceptions)
│
└── Error                    ← Programming bugs — do NOT catch in production
    ├── AssertionError
    ├── TypeError
    ├── RangeError
    ├── ArgumentError
    ├── StateError
    ├── NullThrownError
    ├── StackOverflowError
    ├── OutOfMemoryError
    └── LateInitializationError
```

> **Rule:** Catch `Exception` subclasses. Let `Error` subclasses crash — they indicate a bug that needs fixing, not a runtime condition to handle.

---

## try / catch / finally

```dart
// Basic structure
try {
  var n = int.parse('abc');       // throws FormatException
  print(n);
} catch (e) {
  print('Error: $e');             // FormatException: Invalid radix-10 number
} finally {
  print('Always runs');           // cleanup: close files, release resources
}

// Access the stack trace
try {
  riskyCall();
} catch (e, stackTrace) {
  print('Error: $e');
  print('Stack:\n$stackTrace');   // full stack trace
}

// on — catch a specific type only
try {
  var data = await http.get(uri);
  return jsonDecode(data.body);
} on FormatException {
  // Bad JSON — no variable needed
  return {};
} on SocketException catch (e) {
  // No internet
  throw NetworkException('No connection: ${e.message}');
} on HttpException catch (e) {
  throw NetworkException('HTTP error: ${e.message}');
} catch (e, stack) {
  // Catch-all for anything unexpected
  logger.error('Unhandled error', e, stack);
  rethrow;         // re-throw preserving the original stack trace
} finally {
  progressIndicator.hide();   // always clean up
}
```

### Order matters — most specific first

```dart
// ✅ Correct: specific → general
try { ... }
on AuthException catch (e)    { ... }  // most specific
on NetworkException catch (e) { ... }
on AppException catch (e)     { ... }  // catch all AppExceptions
catch (e)                     { ... }  // catch absolutely anything

// ❌ Wrong: general before specific (AuthException never reached)
try { ... }
on AppException catch (e)    { ... }   // catches AuthException too!
on AuthException catch (e)   { ... }   // ← unreachable
```

---

## Built-in Exception Types

```dart
// dart:core
FormatException('Expected int, got "abc"')  // parsing / format errors
ArgumentError('age must be >= 0')           // bad argument values
ArgumentError.value(-1, 'age', 'must be >= 0') // with param name + value
ArgumentError.notNull('config')             // argument was null
RangeError('index must be 0..9')            // value outside valid range
RangeError.range(idx, 0, list.length - 1)  // with bounds
RangeError.index(idx, list)                 // index into collection
StateError('Iterator already exhausted')    // object in wrong state
UnsupportedError('Cannot add to fixed-length list')
UnimplementedError('subclass must implement area()')
ConcurrentModificationError()               // modified collection during iteration
CyclicInitializationError()                 // circular static initializer

// dart:io
SocketException('Connection refused')       // network
FileSystemException('No such file', path)   // file I/O
ProcessException('git', args, message, 1)   // subprocess
HttpException('404 Not Found', uri: uri)    // HTTP
TlsException('Handshake failed')            // TLS/SSL

// dart:async
TimeoutException('Exceeded 5s', Duration(seconds: 5))

// Trigger common ones in practice
void examples() {
  [1, 2, 3][10];                   // RangeError: index out of range
  null as String;                  // TypeError: null is not String
  int.parse('abc');                // FormatException
  throw StateError('bad state');   // manual StateError
}
```

---

## Custom Exceptions

### Simple

```dart
class AppException implements Exception {
  final String message;
  final String? code;

  const AppException(this.message, {this.code});

  @override
  String toString() =>
      'AppException${code != null ? ' [$code]' : ''}: $message';
}
```

### Hierarchy (recommended for larger apps)

```dart
// Base
class AppException implements Exception {
  final String message;
  final int? statusCode;
  final Object? cause;

  const AppException(this.message, {this.statusCode, this.cause});

  @override
  String toString() => '${runtimeType}($statusCode): $message';
}

// Network layer
class NetworkException extends AppException {
  const NetworkException(String msg, {Object? cause})
      : super(msg, statusCode: 503, cause: cause);
}

class TimeoutException extends NetworkException {
  const TimeoutException(String url)
      : super('Request timed out: $url');
}

// HTTP layer
class HttpResponseException extends AppException {
  HttpResponseException(int statusCode, String body)
      : super(body, statusCode: statusCode);
}

class NotFoundException extends HttpResponseException {
  NotFoundException(String resource)
      : super(404, '$resource not found');
}

class UnauthorizedException extends HttpResponseException {
  UnauthorizedException() : super(401, 'Authentication required');
}

class ForbiddenException extends HttpResponseException {
  ForbiddenException() : super(403, 'Access denied');
}

// Domain layer
class ValidationException extends AppException {
  final List<String> errors;

  ValidationException(this.errors)
      : super('Validation failed: ${errors.join(', ')}');
}

// Usage
try {
  await apiClient.post('/users', body);
} on UnauthorizedException {
  navigateToLogin();
} on ValidationException catch (e) {
  showFieldErrors(e.errors);
} on NetworkException catch (e) {
  showRetryDialog(e.message);
} on AppException catch (e) {
  showGenericError(e.message);
}
```

---

## Throwing Exceptions

```dart
// Basic throw
throw Exception('Something went wrong');
throw FormatException('Invalid email format', input);
throw ArgumentError.value(age, 'age', 'Must be non-negative');

// Throw in expression context (arrow functions, ternaries)
String orThrow(String? s) =>
    s?.isNotEmpty == true ? s! : throw ArgumentError('Required');

T requireNonNull<T>(T? value, String name) =>
    value ?? (throw ArgumentError.notNull(name));

// rethrow — preserve the original stack trace
Future<User> fetchUser(int id) async {
  try {
    return await api.getUser(id);
  } catch (e) {
    logger.error('fetchUser($id) failed', e);
    rethrow;   // ← NOT: throw e;  (that would reset the stack trace)
  }
}

// Wrapping exceptions — add context
Future<User> getUser(int id) async {
  try {
    return await db.findUser(id);
  } on DatabaseException catch (e) {
    throw NotFoundException('User $id', cause: e);
  }
}
```

---

## Async Exception Handling

Exceptions in async code propagate through Futures just like synchronous exceptions:

```dart
// await unwraps the Future AND re-throws any exception
Future<void> main() async {
  try {
    var user = await fetchUser(1);   // exception here...
    print(user.name);
  } catch (e) {
    print('Caught: $e');             // ...is caught here ✅
  }
}

// Unhandled Future exceptions — attach error handlers!
// ❌ Fire-and-forget with no error handler — exception is silently lost
someAsyncOperation();

// ✅ Always handle or return
await someAsyncOperation();
// or
someAsyncOperation().catchError((e) => logger.error(e));
// or
unawaited(someAsyncOperation()); // explicit fire-and-forget (import 'package:meta/meta.dart')

// Future.wait — if ANY future fails, the whole thing fails
try {
  var results = await Future.wait([fetchA(), fetchB(), fetchC()]);
} catch (e) {
  // One of them failed — others may have succeeded
}

// eagerError: false — collect all results/errors
var results = await Future.wait(
  [fetchA(), fetchB(), fetchC()],
  eagerError: false,          // wait for all even if some fail
);
```

---

## Global Error Handling with Zones

Use `runZonedGuarded` to catch **all** unhandled errors in a section of code — ideal for top-level app setup:

```dart
import 'dart:async';

void main() {
  runZonedGuarded(
    () async {
      // Your entire app runs in this zone
      WidgetsFlutterBinding.ensureInitialized();
      await setupDependencies();
      runApp(const MyApp());
    },
    (error, stackTrace) {
      // Catch ANYTHING that escapes try/catch
      FirebaseCrashlytics.instance.recordError(error, stackTrace);
      print('Unhandled error: $error');
    },
  );
}

// Flutter-specific: also catch Flutter framework errors
void main() {
  FlutterError.onError = (FlutterErrorDetails details) {
    FlutterError.presentError(details);
    crashlytics.recordFlutterFatalError(details);
  };

  PlatformDispatcher.instance.onError = (error, stack) {
    crashlytics.recordError(error, stack, fatal: true);
    return true;
  };

  runApp(const MyApp());
}
```

---

## The Result Pattern (Functional Error Handling)

An alternative to exceptions — model errors as values instead of throwing:

```dart
// Define Result type
sealed class Result<T> {
  const Result();

  // Convenience constructors
  factory Result.ok(T value) = Ok<T>;
  factory Result.err(String message, [Object? cause]) = Err<T>;

  // Functional methods
  R when<R>({
    required R Function(T value) ok,
    required R Function(String error) err,
  }) => switch (this) {
    Ok(value: var v) => ok(v),
    Err(message: var m) => err(m),
  };

  T? get valueOrNull   => this is Ok<T> ? (this as Ok<T>).value : null;
  String? get errorOrNull => this is Err<T> ? (this as Err<T>).message : null;
  bool get isOk  => this is Ok<T>;
  bool get isErr => this is Err<T>;
}

class Ok<T>  extends Result<T> {
  final T value;
  const Ok(this.value);
}

class Err<T> extends Result<T> {
  final String message;
  final Object? cause;
  const Err(this.message, [this.cause]);
}

// Usage — errors become first-class values, no try/catch at call sites
Future<Result<User>> fetchUser(int id) async {
  try {
    var data = await api.get('/users/$id');
    return Result.ok(User.fromJson(data));
  } on NetworkException catch (e) {
    return Result.err('Network error', e);
  } on FormatException catch (e) {
    return Result.err('Invalid user data', e);
  }
}

// At call site — pattern match instead of try/catch
Future<void> loadProfile(int id) async {
  var result = await fetchUser(id);
  switch (result) {
    case Ok(value: var user):
      setState(() => _user = user);
    case Err(message: var msg):
      showError(msg);
  }

  // Or functional style
  result.when(
    ok:  (user) => setState(() => _user = user),
    err: (msg)  => showError(msg),
  );
}
```

---

## When to Use What

| Situation | Approach |
|-----------|----------|
| Recoverable runtime condition (network, parse) | `throw Exception` subclass |
| Programming bug (bad argument, invariant) | `throw ArgumentError` / `assert` |
| Function that might not find a result | Return `T?` (nullable) |
| Multiple error types at call site | Custom exception hierarchy |
| Functional pipelines / no side effects | `Result<T>` sealed type |
| Unhandled errors across entire app | `runZonedGuarded` / `FlutterError.onError` |
| Log and re-throw | `rethrow` (never `throw e`) |

---

## Summary

```dart
// The full pattern
try {
  var result = await riskyOperation();
  return result;
} on SpecificException catch (e) {      // most specific first
  handle(e);
} on BroaderException catch (e, stack) { // broader
  logger.log(e, stack);
  rethrow;
} catch (e, stack) {                     // catch-all
  crashlytics.record(e, stack);
  rethrow;
} finally {
  cleanup();                             // always runs
}
```
