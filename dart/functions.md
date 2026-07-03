---
sidebar_position: 4
title: Functions
description: Named, anonymous, arrow, optional/named params, closures, generators, and first-class functions in Dart.
---

---

## Basic Functions

```dart
// Standard function declaration
int add(int a, int b) {
  return a + b;
}

// Void function (no return value)
void greet(String name) {
  print('Hello, $name!');
}

// Calling functions
print(add(2, 3));   // 5
greet('Dart');      // Hello, Dart!
```

---

## Arrow Functions (Expression Body)

When the body is a single expression, use `=>`:

```dart
// Arrow syntax — implicit return
int add(int a, int b) => a + b;
void greet(String name) => print('Hello, $name!');
bool isEven(int n) => n % 2 == 0;
String shout(String s) => s.toUpperCase() + '!';

// Works great with lambdas too
var square = (int x) => x * x;
print(square(5)); // 25
```

---

## Optional Parameters

### Positional Optional Parameters `[]`

```dart
// Optional positional — use []
String greet(String name, [String greeting = 'Hello']) {
  return '$greeting, $name!';
}

print(greet('Alice'));         // Hello, Alice!
print(greet('Bob', 'Hi'));     // Hi, Bob!

// Multiple optional params
void log(String msg, [String level = 'INFO', bool timestamp = false]) {
  var time = timestamp ? '[${DateTime.now()}] ' : '';
  print('$time[$level] $msg');
}

log('App started');                          // [INFO] App started
log('Warning!', 'WARN');                     // [WARN] Warning!
log('Error!', 'ERROR', true);               // [timestamp] [ERROR] Error!
```

### Named Parameters `{}`

```dart
// Named parameters — use {}
// Required by default? No — they're optional unless marked required
void createUser({
  required String name,    // ← required keyword makes it mandatory
  int age = 0,
  String? email,           // nullable = truly optional
}) {
  print('Name: $name, Age: $age, Email: ${email ?? 'N/A'}');
}

// Call with names (order doesn't matter!)
createUser(name: 'Alice');
createUser(name: 'Bob', age: 25);
createUser(name: 'Carol', age: 30, email: 'carol@example.com');

// This is how Flutter works!
Container(
  width: 100,
  height: 100,
  color: Colors.blue,
  child: Text('Hi'),
)
```

---

## Default Parameter Values

```dart
// Simple defaults
void connect({
  String host = 'localhost',
  int port = 8080,
  bool secure = false,
}) {
  print('${secure ? 'https' : 'http'}://$host:$port');
}

connect();                          // http://localhost:8080
connect(port: 443, secure: true);   // https://localhost:443
```

---

## First-Class Functions

In Dart, functions are objects and can be:
- Assigned to variables
- Passed as arguments
- Returned from other functions

```dart
// Assign to variable
var sayHi = (String name) => 'Hi, $name!';
print(sayHi('Dart'));  // Hi, Dart!

// Pass as argument
void applyTwice(int Function(int) fn, int value) {
  print(fn(fn(value)));
}
applyTwice((x) => x * 2, 3);  // 12  (3 * 2 = 6, 6 * 2 = 12)

// Return a function
Function makeAdder(int n) => (int x) => x + n;
var add5 = makeAdder(5);
print(add5(3));  // 8
print(add5(10)); // 15

// Store functions in collections
var ops = <String, int Function(int, int)>{
  'add': (a, b) => a + b,
  'sub': (a, b) => a - b,
  'mul': (a, b) => a * b,
};
print(ops['add']!(3, 4));  // 7
```

---

## Anonymous Functions (Lambdas)

```dart
// Anonymous function with block body
var multiply = (int a, int b) {
  return a * b;
};

// Anonymous function with arrow body
var divide = (double a, double b) => a / b;

// Used inline — very common with collections
var numbers = [1, 2, 3, 4, 5];

// forEach
numbers.forEach((n) => print(n));

// map — transform each element
var doubled = numbers.map((n) => n * 2).toList();
print(doubled);  // [2, 4, 6, 8, 10]

// where — filter
var evens = numbers.where((n) => n.isEven).toList();
print(evens);   // [2, 4]

// reduce — combine
var sum = numbers.reduce((acc, n) => acc + n);
print(sum);  // 15
```

---

## Closures

A closure is a function that captures variables from its enclosing scope:

```dart
// Counter closure
Function makeCounter() {
  int count = 0;  // captured in closure
  return () {
    count++;
    return count;
  };
}

var counter = makeCounter();
print(counter()); // 1
print(counter()); // 2
print(counter()); // 3

var counter2 = makeCounter(); // independent counter
print(counter2()); // 1

// Closures capture the variable itself (not a copy)
var callbacks = <void Function()>[];
for (var i = 0; i < 3; i++) {
  var captured = i;  // capture current value
  callbacks.add(() => print(captured));
}
callbacks[0](); // 0
callbacks[1](); // 1
callbacks[2](); // 2
```

---

## Higher-Order Functions

Functions that take functions or return functions:

```dart
// Common HOF patterns
List<T> filter<T>(List<T> list, bool Function(T) predicate) {
  return list.where(predicate).toList();
}

List<R> transform<T, R>(List<T> list, R Function(T) mapper) {
  return list.map(mapper).toList();
}

T fold<T>(List<T> list, T initial, T Function(T acc, T item) combiner) {
  return list.fold(initial, combiner);
}

void main() {
  var nums = [1, 2, 3, 4, 5, 6];

  var odds = filter(nums, (n) => n.isOdd);
  print(odds);  // [1, 3, 5]

  var strings = transform(nums, (n) => 'item_$n');
  print(strings);  // [item_1, item_2, ...]

  var total = fold(nums, 0, (acc, n) => acc + n);
  print(total);  // 21
}
```

---

## Function Types

```dart
// Explicit function type declaration
int Function(int, int) adder = (a, b) => a + b;

// As a parameter type
void process(List<int> data, int Function(int) transform) {
  for (var item in data) {
    print(transform(item));
  }
}

// As a return type
String Function(String) makeUpperCaser() => (s) => s.toUpperCase();

// Nullable function type
void Function()? onPressed;
onPressed?.call();  // safe call

// typedef for readability
typedef Predicate<T> = bool Function(T value);
typedef Transformer<T, R> = R Function(T input);
typedef VoidCallback = void Function();

Predicate<int> isPositive = (n) => n > 0;
VoidCallback doNothing = () {};
```

---

## Recursive Functions

```dart
// Factorial
int factorial(int n) => n <= 1 ? 1 : n * factorial(n - 1);
print(factorial(5)); // 120

// Fibonacci
int fib(int n) => n <= 1 ? n : fib(n - 1) + fib(n - 2);
print(fib(10)); // 55

// Memoized Fibonacci (efficient)
final _fibCache = <int, int>{};
int fibMemo(int n) {
  if (n <= 1) return n;
  return _fibCache[n] ??= fibMemo(n - 1) + fibMemo(n - 2);
}
```

---

## Generator Functions

### Synchronous Generators `sync*`

```dart
// sync* returns an Iterable lazily
Iterable<int> range(int start, int end) sync* {
  for (var i = start; i < end; i++) {
    yield i;  // produce one value at a time
  }
}

for (var n in range(0, 5)) {
  print(n);  // 0, 1, 2, 3, 4
}

// Fibonacci sequence as infinite generator
Iterable<int> fibonacci() sync* {
  var a = 0, b = 1;
  while (true) {
    yield a;
    var temp = a + b;
    a = b;
    b = temp;
  }
}

// Take first 10 Fibonacci numbers
fibonacci().take(10).forEach(print);
// 0, 1, 1, 2, 3, 5, 8, 13, 21, 34

// yield* — delegate to another iterable
Iterable<int> combined() sync* {
  yield* range(0, 3);   // yields 0, 1, 2
  yield* range(10, 13); // yields 10, 11, 12
}
```

### Asynchronous Generators `async*`

```dart
// async* returns a Stream
Stream<int> countDown(int from) async* {
  for (var i = from; i >= 0; i--) {
    await Future.delayed(Duration(seconds: 1));
    yield i;
  }
}

// Use await for to listen
await for (var n in countDown(5)) {
  print(n);  // 5, 4, 3, 2, 1, 0 (one per second)
}
```

---

## `main()` Function

```dart
// Basic
void main() {
  print('Hello!');
}

// With command-line arguments
void main(List<String> args) {
  if (args.isEmpty) {
    print('No arguments provided');
  } else {
    print('Arguments: $args');
  }
}
// dart run app.dart hello world
// → Arguments: [hello, world]

// Async main
Future<void> main() async {
  var result = await fetchData();
  print(result);
}
```

---

## Summary

| Feature | Syntax |
|---------|--------|
| Regular function | `ReturnType name(params) { ... }` |
| Arrow function | `ReturnType name(params) => expr;` |
| Named params | `void fn({required String a, int b = 0})` |
| Optional positional | `void fn(String a, [int b = 0])` |
| Anonymous | `(params) => expr` or `(params) { ... }` |
| Function type | `ReturnType Function(ParamTypes)` |
| Sync generator | `Iterable<T> fn() sync* { yield value; }` |
| Async generator | `Stream<T> fn() async* { yield value; }` |
