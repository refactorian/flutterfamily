---
sidebar_position: 21
title: Advanced Features
description: Callable classes, custom annotations, operator overloading, isolates, zones, and late final patterns in Dart.
---

---

## Callable Classes

```dart
// A class with call() method can be invoked like a function
class Multiplier {
  final int factor;
  Multiplier(this.factor);

  int call(int value) => value * factor;
}

var triple = Multiplier(3);
print(triple(5));  // 15 — calls triple.call(5)
print(triple(10)); // 30

// Useful for dependency injection
class Logger {
  void call(String message) => print('[LOG] $message');
}
var log = Logger();
log('Hello!'); // [LOG] Hello!
```

---

## Metadata / Annotations

```dart
// Built-in annotations
@override         // override a parent method
@deprecated       // mark as deprecated
@Deprecated('Use newMethod() instead')
@pragma('vm:entry-point') // prevent tree shaking

// Custom annotations
class Required {
  const Required();
}

class Range {
  final int min, max;
  const Range(this.min, this.max);
}

class UserModel {
  @Required()
  String name;

  @Range(0, 150)
  int age;

  UserModel(this.name, this.age);
}

// Annotations are primarily used by code generators (build_runner)
@JsonSerializable()
class User {
  final String name;
  final int age;
  User(this.name, this.age);
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);
}
```

---

## Operator Overloading (in depth)

```dart
class Money {
  final int cents;
  final String currency;

  const Money(this.cents, [this.currency = 'USD']);

  Money operator +(Money other) {
    assert(currency == other.currency, 'Currency mismatch');
    return Money(cents + other.cents, currency);
  }

  Money operator -(Money other) => Money(cents - other.cents, currency);
  Money operator *(double factor) => Money((cents * factor).round(), currency);

  bool operator <(Money other) => cents < other.cents;
  bool operator >(Money other) => cents > other.cents;

  @override
  bool operator ==(Object other) =>
      other is Money && cents == other.cents && currency == other.currency;

  @override
  int get hashCode => Object.hash(cents, currency);

  @override
  String toString() {
    var dollars = cents ~/ 100;
    var centPart = (cents % 100).toString().padLeft(2, '0');
    return '\$$dollars.$centPart $currency';
  }
}

var price = Money(999);     // $9.99
var tax = Money(80);        // $0.80
var total = price + tax;    // $10.79
print(total);               // $10.79 USD
print(total > Money(1000)); // false
```

---

## Isolates (Deep Dive)

```dart
import 'dart:isolate';

// Simple: Isolate.run for one-off computation
Future<int> heavyWork() async {
  return await Isolate.run(() {
    // Runs in separate isolate (thread)
    var result = 0;
    for (var i = 0; i < 1000000000; i++) result += i;
    return result;
  });
}

// Complex: Isolate with SendPort/ReceivePort for two-way communication
void isolateMain(SendPort sendPort) {
  var receivePort = ReceivePort();
  sendPort.send(receivePort.sendPort); // send our port back

  receivePort.listen((message) {
    // Process message and send result
    var result = processData(message);
    sendPort.send(result);
  });
}

Future<void> main() async {
  var receivePort = ReceivePort();
  var isolate = await Isolate.spawn(isolateMain, receivePort.sendPort);

  var isolateSendPort = await receivePort.first as SendPort;

  // Send work to isolate
  var responsePort = ReceivePort();
  isolateSendPort.send({'work': 'data', 'replyTo': responsePort.sendPort});
  var result = await responsePort.first;

  isolate.kill();
}
```

---

## Zones

```dart
import 'dart:async';

// Zones allow you to intercept async operations
void main() {
  runZonedGuarded(
    () async {
      // Code running in this zone
      throw Exception('Unhandled error');
    },
    (error, stack) {
      // Catch all unhandled errors in this zone
      print('Caught: $error');
      print('Stack: $stack');
    },
  );
}
```

---

## Late Final Initialization Pattern

```dart
class ServiceLocator {
  static final ServiceLocator _instance = ServiceLocator._();
  factory ServiceLocator() => _instance;
  ServiceLocator._();

  late final Database _database;
  late final ApiClient _apiClient;
  bool _initialized = false;

  Future<void> initialize() async {
    assert(!_initialized, 'Already initialized');
    _database = await Database.open('app.db');
    _apiClient = ApiClient(baseUrl: 'https://api.example.com');
    _initialized = true;
  }

  Database get database {
    assert(_initialized, 'Call initialize() first');
    return _database;
  }
}
```
