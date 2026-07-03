---
sidebar_position: 19
title: Mixins
description: Reusing code across multiple class hierarchies with mixins, the 'on' clause, and mixin classes in Dart.
---

A mixin is a way to reuse a class's code in **multiple class hierarchies**. Unlike inheritance (which gives you one parent), you can mix in as many mixins as you want. They're Dart's answer to the question: *"What do you do when two unrelated classes need the same behaviour?"*

---

## The Problem Mixins Solve

```dart
// Suppose you have:
class Animal   { void breathe() {} }
class Machine  { void start() {} }

// And you want:
// - Robot:  Machine + Loggable + Serializable
// - Dog:    Animal  + Loggable + Trainable
// - Server: Machine + Loggable + Configurable

// With inheritance alone you're stuck — Dart has single inheritance.
// With mixins, you compose behaviour freely:

class Robot  extends Machine  with Loggable, Serializable {}
class Dog    extends Animal   with Loggable, Trainable {}
class Server extends Machine  with Loggable, Configurable {}
```

---

## Declaring a Mixin

```dart
// Basic mixin — no superclass constraint
mixin Loggable {
  // Mixins can have instance variables
  final _logs = <String>[];
  bool logEnabled = true;

  void log(String message) {
    if (!logEnabled) return;
    final entry = '[${DateTime.now().toIso8601String()}] $message';
    _logs.add(entry);
    print(entry);
  }

  List<String> get logs => List.unmodifiable(_logs);
  void clearLogs() => _logs.clear();
}

mixin Serializable {
  // Abstract method — the class MUST implement this
  Map<String, dynamic> toJson();

  // Concrete method — provided for free
  String toJsonString() => jsonEncode(toJson());

  @override
  String toString() => toJsonString();
}

mixin Disposable {
  bool _disposed = false;
  bool get isDisposed => _disposed;

  // Abstract — subclass decides what to release
  void onDispose();

  void dispose() {
    if (_disposed) return;
    onDispose();
    _disposed = true;
  }
}
```

---

## Using Mixins

```dart
class User with Loggable, Serializable, Disposable {
  final String name;
  final String email;

  User(this.name, this.email);

  @override
  Map<String, dynamic> toJson() => {'name': name, 'email': email};

  @override
  void onDispose() => log('User $name disposed');
}

void main() {
  var user = User('Alice', 'alice@example.com');
  user.log('User created');
  print(user.toJsonString());  // {"name":"Alice","email":"alice@example.com"}
  user.dispose();              // [timestamp] User Alice disposed
  print(user.isDisposed);     // true
}
```

---

## The `on` Clause — Restricting Mixin Usage

The `on` clause means: *"This mixin can only be applied to classes that extend/implement X."* This lets the mixin call methods defined on X.

```dart
class Animal {
  final String name;
  Animal(this.name);
  void breathe() => print('$name breathes');
  void move() => print('$name moves');
}

// Can only be applied to Animal subclasses
mixin Swimming on Animal {
  int swimSpeed = 5; // km/h

  void swim() {
    breathe();       // ✅ can call Animal's method via 'on' clause
    move();
    print('$name swims at ${swimSpeed}km/h');
  }

  void dive(int meters) => print('$name dives $meters meters');
}

mixin Flying on Animal {
  int wingSpan = 0; // cm

  void fly() {
    breathe();
    print('$name flies with ${wingSpan}cm wingspan');
  }
  void soar() => print('$name soars on thermals');
}

mixin Running on Animal {
  int runSpeed = 10;
  void run() { breathe(); print('$name runs at ${runSpeed}km/h'); }
}

// Apply the restricted mixins
class Fish extends Animal with Swimming {
  Fish(String name) : super(name);
}

class Duck extends Animal with Swimming, Flying, Running {
  Duck(String name) : super(name) { wingSpan = 60; swimSpeed = 3; runSpeed = 4; }
}

class Horse extends Animal with Running {
  Horse(String name) : super(name) { runSpeed = 70; }
}

var duck = Duck('Donald');
duck.swim();   // Donald breathes \n Donald moves \n Donald swims at 3km/h
duck.fly();    // Donald breathes \n Donald flies with 60cm wingspan
duck.run();    // Donald breathes \n Donald runs at 4km/h
```

---

## Mixin Linearization (Method Resolution Order)

When multiple mixins define the same method, Dart uses **linearization** — the *last* mixin in the `with` list wins, unless it calls `super` to chain through.

```dart
class Base {
  String greet() => 'Base';
}

mixin MixinA on Base {
  @override
  String greet() => 'A → ${super.greet()}';
}

mixin MixinB on Base {
  @override
  String greet() => 'B → ${super.greet()}';
}

mixin MixinC on Base {
  @override
  String greet() => 'C → ${super.greet()}';
}

class MyClass extends Base with MixinA, MixinB, MixinC {
  // MRO (right to left through with clause):
  // MyClass → MixinC → MixinB → MixinA → Base
}

print(MyClass().greet()); // C → B → A → Base

// The effective class hierarchy is:
//   Base
//     ↑
//   MixinA (applied first as a new anonymous class)
//     ↑
//   MixinB
//     ↑
//   MixinC
//     ↑
//   MyClass
```

> **Key rule:** Mixins are applied left-to-right, but method calls chain right-to-left through `super`. The rightmost mixin gets the first call.

---

## Abstract Methods in Mixins

Mixins can declare abstract methods that the *applying class* must implement:

```dart
mixin Cacheable {
  // Abstract — applying class decides the cache key
  String get cacheKey;

  // Concrete — implemented in terms of the abstract method
  final _cache = <String, dynamic>{};

  T? getCached<T>(String field) => _cache['$cacheKey:$field'] as T?;

  void cache(String field, dynamic value) {
    _cache['$cacheKey:$field'] = value;
  }

  void invalidate() => _cache.removeWhere((k, _) => k.startsWith('$cacheKey:'));
}

mixin Validatable {
  // Abstract — class defines its own validation rules
  Map<String, String? Function()> get validators;

  Map<String, String> validate() {
    final errors = <String, String>{};
    validators.forEach((field, check) {
      final error = check();
      if (error != null) errors[field] = error;
    });
    return errors;
  }

  bool get isValid => validate().isEmpty;

  void ensureValid() {
    final errors = validate();
    if (errors.isNotEmpty) {
      throw ArgumentError('Validation failed: $errors');
    }
  }
}

class RegistrationForm with Validatable {
  String name = '';
  String email = '';
  String password = '';

  @override
  Map<String, String? Function()> get validators => {
    'name':     () => name.trim().isEmpty ? 'Name is required' : null,
    'email':    () => !email.contains('@') ? 'Invalid email' : null,
    'password': () => password.length < 8 ? 'Min 8 characters' : null,
  };
}

var form = RegistrationForm()
  ..name = 'Alice'
  ..email = 'alice@example.com'
  ..password = 'secret123';

print(form.isValid);      // true
print(form.validate());   // {}
```

---

## State in Mixins

Mixins **can** have state (instance variables), but be careful — each class that uses the mixin gets its own copy of the state:

```dart
mixin Counter {
  int _count = 0;

  int get count => _count;
  void increment() => _count++;
  void decrement() => _count--;
  void reset() => _count = 0;
}

class ClickTracker with Counter {
  void click() { increment(); print('Clicked ${count}x'); }
}

class PageVisits with Counter {
  void visit(String page) { increment(); print('Page $page: visit #$count'); }
}

var tracker = ClickTracker();
var visits  = PageVisits();

tracker.click();  // Clicked 1x
tracker.click();  // Clicked 2x
visits.visit('/home');   // Page /home: visit #1  ← independent counter
```

---

## `mixin class` (Dart 3)

A `mixin class` can be used **both** as a standalone class and as a mixin:

```dart
mixin class Taggable {
  final _tags = <String>{};

  void addTag(String tag)    => _tags.add(tag);
  void removeTag(String tag) => _tags.remove(tag);
  bool hasTag(String tag)    => _tags.contains(tag);
  Set<String> get tags       => Set.unmodifiable(_tags);

  @override
  String toString() => 'tags: $_tags';
}

// Use as a standalone class
var t = Taggable();
t.addTag('featured');
print(t.tags); // {featured}

// Use as a mixin
class Article with Taggable {
  final String title;
  Article(this.title);
}

var article = Article('Dart 3 Features');
article.addTag('dart');
article.addTag('programming');
print(article.tags); // {dart, programming}
```

---

## Mixins for Cross-Cutting Concerns

Mixins excel at **cross-cutting concerns** — functionality that many unrelated classes need:

```dart
// Performance monitoring
mixin Timed {
  final _timings = <String, Duration>{};

  T timed<T>(String label, T Function() work) {
    final start = DateTime.now();
    final result = work();
    _timings[label] = DateTime.now().difference(start);
    return result;
  }

  Future<T> timedAsync<T>(String label, Future<T> Function() work) async {
    final start = DateTime.now();
    final result = await work();
    _timings[label] = DateTime.now().difference(start);
    return result;
  }

  void printTimings() =>
      _timings.forEach((k, v) => print('  $k: ${v.inMilliseconds}ms'));
}

// Change tracking / dirty checking
mixin Trackable<T> {
  T? _original;
  bool _isDirty = false;

  bool get isDirty => _isDirty;

  void markClean(T currentValue) {
    _original = currentValue;
    _isDirty = false;
  }

  void markDirty() => _isDirty = true;
}

// Lifecycle hooks
mixin Lifecycle {
  bool _initialized = false;

  Future<void> init() async {
    if (_initialized) return;
    await onInit();
    _initialized = true;
  }

  Future<void> onInit();
  Future<void> onDestroy();

  Future<void> destroy() async {
    if (!_initialized) return;
    await onDestroy();
    _initialized = false;
  }
}
```

---

## Mixins vs Other Reuse Patterns

| | Mixin | Inheritance | Extension | Composition |
|--|-------|-------------|-----------|-------------|
| Multiple reuse | ✅ Many | ❌ One parent | ✅ Many | ✅ Many |
| Access `super` | ✅ Yes (with `on`) | ✅ Yes | ❌ No | ❌ No |
| Add state | ✅ Yes | ✅ Yes | ❌ No | ✅ Yes |
| Modify existing type | ❌ No | ❌ No | ✅ Yes | ❌ No |
| `is` relationship | ✅ Yes | ✅ Yes | ❌ No | ❌ No |
| Restrict applicability | ✅ `on` clause | Natural | N/A | N/A |
| Best for | Cross-cutting concerns | "is-a" hierarchies | Augmenting libraries | Complex dependencies |

---

## Summary

```dart
// Declare
mixin MyMixin { }                    // unrestricted
mixin MyMixin on SomeClass { }       // only for SomeClass subclasses
mixin class MyMixin { }              // also usable as standalone class

// Apply
class Foo extends Bar with MixinA, MixinB, MixinC { }
class Foo with MixinA, MixinB { }   // no superclass

// MRO: rightmost mixin's methods called first; super chains left
// Each mixin applied creates an anonymous class in the hierarchy
```
