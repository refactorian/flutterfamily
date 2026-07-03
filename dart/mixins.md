---
sidebar_position: 19
title: Mixins
description: Reusing code across multiple class hierarchies with mixins, the 'on' clause, and mixin classes in Dart.
---

Mixins let you reuse code across multiple class hierarchies without inheritance.

---

## Basic Mixin

```dart
// Define a mixin
mixin Serializable {
  Map<String, dynamic> toJson();

  String toJsonString() => jsonEncode(toJson());

  @override
  String toString() => toJsonString();
}

mixin Timestamped {
  DateTime createdAt = DateTime.now();
  DateTime? updatedAt;

  void markUpdated() => updatedAt = DateTime.now();
}

mixin Validatable {
  List<String> validate(); // subclass implements this

  bool get isValid => validate().isEmpty;
  void throwIfInvalid() {
    var errors = validate();
    if (errors.isNotEmpty) throw ValidationError(errors);
  }
}

// Combine mixins with 'with' keyword
class User with Serializable, Timestamped, Validatable {
  String name;
  String email;

  User(this.name, this.email);

  @override
  Map<String, dynamic> toJson() => {'name': name, 'email': email};

  @override
  List<String> validate() => [
    if (name.isEmpty) 'Name is required',
    if (!email.contains('@')) 'Invalid email',
  ];
}

var user = User('Alice', 'alice@example.com');
print(user.isValid);      // true
print(user.toJsonString()); // {"name":"Alice","email":"alice@example.com"}
print(user.createdAt);    // current time
```

---

## Mixin with `on` Clause

Restrict which classes can use the mixin:

```dart
class Animal {
  void breathe() => print('Breathe');
}

// This mixin can ONLY be used on Animal subclasses
mixin Swimming on Animal {
  void swim() {
    breathe(); // can call Animal methods
    print('Swimming...');
  }
}

mixin Flying on Animal {
  void fly() {
    breathe();
    print('Flying...');
  }
}

class Fish extends Animal with Swimming {
  // ✅ Animal subclass — can use Swimming
}

// class Car with Swimming { } // ❌ Car doesn't extend Animal

class Duck extends Animal with Swimming, Flying {
  // ✅ Can have both!
}

var duck = Duck();
duck.swim();  // Breathe \n Swimming...
duck.fly();   // Breathe \n Flying...
```

---

## Mixin Class (Dart 3)

```dart
// mixin class can be used as both a mixin and a standalone class
mixin class Logger {
  final _logs = <String>[];

  void log(String message) {
    _logs.add('[${DateTime.now()}] $message');
    print(message);
  }

  List<String> get logs => List.unmodifiable(_logs);
}

// Used as a standalone class
var logger = Logger();
logger.log('Hello!');

// Used as a mixin
class ApiService with Logger {
  Future<void> fetchData() async {
    log('Fetching data...');
    // ...
    log('Done!');
  }
}
```

---

## Mixins vs Other Patterns

| Pattern | When to Use |
|---------|-------------|
| **Mixin** | Share behavior across unrelated classes |
| **Inheritance** | "is-a" relationship, single hierarchy |
| **Interface (implements)** | Define a contract |
| **Composition** | Has-a relationship (prefer over inheritance) |
| **Extension** | Add methods to existing/external types |
