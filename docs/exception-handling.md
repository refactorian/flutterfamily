---
sidebar_position: 16
title: Exception Handling
description: try/catch/finally, built-in exceptions, custom exceptions, throwing, rethrow, and the Result pattern in Dart.
---

---

## try / catch / finally

```dart
void main() {
  try {
    var result = int.parse('not a number');
    print(result);
  } catch (e) {
    print('Error: $e');  // Error: FormatException: not a number
  } finally {
    print('Always runs'); // cleanup here
  }
}

// Multiple catch clauses with `on`
Future<void> fetchData() async {
  try {
    var response = await http.get(uri);
    if (response.statusCode != 200) throw HttpException('Bad status');
    return jsonDecode(response.body);
  } on SocketException catch (e) {
    print('No internet: $e');
  } on HttpException catch (e) {
    print('HTTP error: $e');
  } on FormatException catch (e) {
    print('Bad JSON: $e');
  } catch (e, stackTrace) {
    // Catch all other errors + stack trace
    print('Unknown error: $e');
    print('Stack: $stackTrace');
  } finally {
    print('Request complete');
  }
}
```

---

## Built-in Exceptions

```dart
// Common Dart exceptions
FormatException('Invalid format')      // parsing errors
RangeError('Index out of range')       // index/range issues
ArgumentError('Bad argument')          // invalid argument
StateError('Object in bad state')      // invalid state
UnsupportedError('Not supported')      // operation not supported
TypeError()                            // type cast failure
AssertionError('Assertion failed')     // assert() failure

// Usage
void divide(int a, int b) {
  if (b == 0) throw ArgumentError.value(b, 'b', 'Cannot be zero');
  return a ~/ b;
}

// From dart:io
SocketException    // network issues
FileSystemException // file I/O issues
HttpException      // HTTP issues
```

---

## Custom Exceptions

```dart
// Simple exception class
class AppException implements Exception {
  final String message;
  final int? code;

  AppException(this.message, [this.code]);

  @override
  String toString() => 'AppException${code != null ? ' [$code]' : ''}: $message';
}

// Exception hierarchy
class NetworkException extends AppException {
  NetworkException(String message) : super(message, 503);
}

class AuthException extends AppException {
  AuthException(String message) : super(message, 401);
}

class NotFoundException extends AppException {
  NotFoundException(String resource)
      : super('$resource not found', 404);
}

// Usage
try {
  await apiCall();
} on AuthException {
  redirectToLogin();
} on NotFoundException catch (e) {
  showNotFound(e.message);
} on NetworkException catch (e) {
  showNetworkError(e.message);
} on AppException catch (e) {
  showError(e.message);
}
```

---

## Throwing Exceptions

```dart
// throw anything — but prefer Exception/Error subclasses
throw Exception('Something went wrong');
throw ArgumentError('Bad input');
throw MyCustomException('specific issue');

// throw in expression context
String validate(String? input) =>
    input?.isNotEmpty == true ? input! : throw ArgumentError('Input required');

// rethrow — re-throw the current exception (preserves stack trace)
try {
  await riskyOperation();
} catch (e) {
  log.error('Operation failed', e);
  rethrow; // re-throw with original stack trace
}
```

---

## Result Pattern (Alternative to Exceptions)

```dart
// Using sealed classes for Result type
sealed class Result<T> {
  const Result();
}

class Ok<T> extends Result<T> {
  final T value;
  const Ok(this.value);
}

class Err<T> extends Result<T> {
  final String message;
  final Object? cause;
  const Err(this.message, [this.cause]);
}

// Usage
Future<Result<User>> fetchUser(int id) async {
  try {
    var data = await api.get('/users/$id');
    return Ok(User.fromJson(data));
  } catch (e) {
    return Err('Failed to fetch user', e);
  }
}

// At call site
var result = await fetchUser(1);
switch (result) {
  case Ok(value: var user):
    print('Welcome ${user.name}');
  case Err(message: var msg):
    print('Error: $msg');
}
```
