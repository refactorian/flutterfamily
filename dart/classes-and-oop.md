---
sidebar_position: 7
title: Classes & OOP
description: Classes, objects, inheritance, interfaces, abstract classes, sealed classes, and object equality in Dart.
---

Dart is a **pure OOP language** — everything is an object. But Dart's class system is deliberately lean: single inheritance, implicit interfaces, and modifiers introduced in Dart 3 that let you be precise about how your types may be used.

---

## Defining a Class

```dart
class BankAccount {
  // Fields
  final String owner;
  double _balance;          // private to the library

  // Constructor
  BankAccount(this.owner, [this._balance = 0.0]);

  // Getter — computed property
  double get balance => _balance;

  // Methods
  void deposit(double amount) {
    if (amount <= 0) throw ArgumentError('Amount must be positive');
    _balance += amount;
  }

  bool withdraw(double amount) {
    if (amount > _balance) return false;
    _balance -= amount;
    return true;
  }

  @override
  String toString() => 'BankAccount($owner, \$$_balance)';
}

var acc = BankAccount('Alice', 500.0);
acc.deposit(100);
print(acc.balance);  // 600.0
print(acc);          // BankAccount(Alice, $600.0)
```

---

## Instance Variables — Access & Visibility

```dart
class Person {
  // ── Public ────────────────────────────────────────────────────────
  String name;                   // readable + writable externally

  // ── Private to the library (file) ────────────────────────────────
  int _age;                      // _ prefix = private convention
  // Accessible within the same .dart file, not from other files

  // ── Final — assigned once (in constructor / initializer) ─────────
  final String id;               // can't be reassigned after init

  // ── Late — guaranteed non-null, assigned before first use ─────────
  late String email;             // set before accessing or LateInitializationError

  // ── Late final — lazy, computed once ─────────────────────────────
  late final String initials = name.split(' ').map((w) => w[0]).join();

  Person(this.name, this._age, this.id);

  // Expose private state safely
  int get age => _age;
  set age(int v) {
    if (v < 0 || v > 150) throw RangeError.range(v, 0, 150, 'age');
    _age = v;
  }
}
```

> **Dart privacy is library-level, not class-level.** Two classes in the same file can freely access each other's `_` members.

---

## Inheritance

```dart
class Animal {
  final String name;
  Animal(this.name);

  void breathe() => print('$name breathes');
  String get sound => '...';

  void speak() => print('$name says: ${sound}');

  @override
  String toString() => 'Animal($name)';
}

class Dog extends Animal {
  final String breed;

  Dog(String name, this.breed) : super(name);

  @override
  String get sound => 'Woof';

  void fetch(String item) => print('$name fetches the $item!');
}

class GuideDog extends Dog {
  final String owner;

  GuideDog(String name, this.owner) : super(name, 'Labrador');

  @override
  String get sound => 'Woof (softly)';

  void guide() => print('$name guides $owner safely');
}

void main() {
  var guide = GuideDog('Buddy', 'Alice');
  guide.speak();        // Buddy says: Woof (softly)   ← overridden 2 levels up
  guide.breathe();      // Buddy breathes               ← inherited from Animal
  guide.fetch('ball');  // Buddy fetches the ball!      ← inherited from Dog
  guide.guide();        // Buddy guides Alice safely    ← own method

  // Type hierarchy
  print(guide is GuideDog); // true
  print(guide is Dog);      // true  ← is-a relationships chain up
  print(guide is Animal);   // true
}
```

### `super` — calling up the hierarchy

```dart
class Shape {
  final String color;
  Shape(this.color);
  void draw() => print('Drawing a $color shape');
}

class Circle extends Shape {
  final double radius;
  Circle(String color, this.radius) : super(color);  // super constructor

  @override
  void draw() {
    super.draw();                        // call parent's draw()
    print('  (it is a circle with r=$radius)');
  }
}
```

---

## Abstract Classes

Abstract classes define **contracts** — what a type *must* do, not how:

```dart
abstract class Repository<T, ID> {
  // Abstract — subclasses must implement
  Future<T?> findById(ID id);
  Future<List<T>> findAll();
  Future<T> save(T entity);
  Future<void> deleteById(ID id);

  // Concrete — provided to all subclasses for free
  Future<bool> exists(ID id) async => await findById(id) != null;

  Future<List<T>> saveAll(List<T> entities) =>
      Future.wait(entities.map(save));
}

// Multiple concrete implementations of the same contract
class ApiUserRepository extends Repository<User, int> {
  final http.Client _client;
  ApiUserRepository(this._client);

  @override
  Future<User?> findById(int id) async {
    final resp = await _client.get(Uri.parse('/users/$id'));
    if (resp.statusCode == 404) return null;
    return User.fromJson(jsonDecode(resp.body));
  }
  // ...
}

class InMemoryUserRepository extends Repository<User, int> {
  final _store = <int, User>{};

  @override
  Future<User?> findById(int id) async => _store[id];

  @override
  Future<T> save(User entity) async {
    _store[entity.id] = entity;
    return entity;
  }
  // ...
}
```

---

## Interfaces — `implements`

In Dart, **every class implicitly defines an interface**. No `interface` keyword needed:

```dart
// Define interfaces as abstract classes
abstract class Printable  { void print_();  }
abstract class Exportable { Future<void> exportTo(String path); }
abstract class Searchable { List<String> search(String query); }

// Implement multiple interfaces
class Document implements Printable, Exportable, Searchable {
  final String title;
  final String content;
  Document(this.title, this.content);

  @override void print_() => print('=== $title ===\n$content');

  @override Future<void> exportTo(String path) async {
    await File(path).writeAsString('$title\n$content');
  }

  @override List<String> search(String query) =>
      content.split('\n').where((l) => l.contains(query)).toList();
}

// Polymorphism through interfaces
void printAll(List<Printable> items) {
  for (final item in items) item.print_();
}
```

### `extends` vs `implements` vs `with` — decision guide

```
You want to...                               Use...
─────────────────────────────────────────────────────────────────
Reuse a parent's implementation               extends
Guarantee your class has a certain API        implements
Share behaviour across unrelated classes      with (mixin)
Do all three for the same class               extends + implements + with
```

```dart
// All three at once (legal and useful)
class SuperClass extends Base with LoggableMixin implements Serializable {
  // ...
}
```

---

## Composition Over Inheritance

Inheritance is often overused. **Composition** is more flexible:

```dart
// ❌ Inheritance — rigid, breaks encapsulation
class Stack<T> extends List<T> {
  // exposes add(), remove(), sort()... we don't want those on a stack!
}

// ✅ Composition — precise, controlled
class Stack<T> {
  final _items = <T>[];       // List is an implementation detail

  void push(T item) => _items.add(item);
  T pop() => _items.removeLast();
  T peek() => _items.last;
  bool get isEmpty => _items.isEmpty;
  int get size => _items.length;
}

// Another example — prefer having over being
class Logger { void log(String msg) => print('[LOG] $msg'); }
class ApiService { void call() {} }

// ❌ Inherit Logger just to get logging
class BadUserService extends Logger { }

// ✅ Inject Logger as a dependency
class UserService {
  final ApiService _api;
  final Logger _log;
  UserService(this._api, this._log);

  Future<User> getUser(int id) async {
    _log.log('Fetching user $id');
    return _api.call();
  }
}
```

---

## Object Equality

```dart
class Money {
  final int cents;
  final String currency;
  const Money(this.cents, this.currency);

  // == checks value, not identity
  @override
  bool operator ==(Object other) =>
      other is Money && cents == other.cents && currency == other.currency;

  // hashCode MUST be consistent with ==
  // Equal objects must have equal hashCodes
  @override
  int get hashCode => Object.hash(cents, currency);
  // Older style: cents.hashCode ^ currency.hashCode

  @override
  String toString() => '${(cents / 100).toStringAsFixed(2)} $currency';
}

void main() {
  final a = Money(999, 'USD');
  final b = Money(999, 'USD');
  final c = Money(500, 'USD');

  print(a == b);            // true  — same value
  print(identical(a, b));   // false — different objects
  print(a == c);            // false

  // Safe as Map keys and Set members
  final prices = {a: 'item 1', b: 'item 2'};  // only 1 entry — a and b are equal
  print(prices.length);     // 1

  final set = {a, b, c};
  print(set.length);        // 2  — a and b deduplicated
}
```

---

## Sealed Classes (Dart 3)

Sealed classes restrict subclassing to the **same library**, enabling exhaustive switch:

```dart
// lib/result.dart
sealed class Result<T> {
  const Result();

  // Convenience methods on the sealed base
  bool get isOk  => this is Ok<T>;
  bool get isErr => this is Err<T>;

  T getOrElse(T fallback) => switch (this) {
    Ok(value: var v) => v,
    Err()            => fallback,
  };

  Result<R> map<R>(R Function(T) transform) => switch (this) {
    Ok(value: var v) => Ok(transform(v)),
    Err(message: var m) => Err(m),
  };
}

final class Ok<T>  extends Result<T> {
  final T value;
  const Ok(this.value);
}

final class Err<T> extends Result<T> {
  final String message;
  const Err(this.message);
}

// Usage — exhaustive, compiler-enforced
Future<Result<User>> fetchUser(int id) async {
  try {
    return Ok(await api.getUser(id));
  } catch (e) {
    return Err('Failed: $e');
  }
}

void display(Result<User> result) {
  switch (result) {
    case Ok(value: var user):
      print('Welcome, ${user.name}!');
    case Err(message: var msg):
      print('Error: $msg');
    // No default needed — sealed class is exhaustive
  }
}
```

---

## Class Modifiers (Dart 3)

Use modifiers to express **design intent** and enforce API boundaries:

```dart
// abstract — cannot be instantiated directly
abstract class Validator<T> {
  bool validate(T value);
  String get errorMessage;
}

// final — cannot be extended OR implemented outside this library
// Great for value types you don't want tampered with
final class Email {
  final String value;
  Email._(this.value);
  factory Email(String s) {
    if (!s.contains('@')) throw FormatException('Invalid email: $s');
    return Email._(s);
  }
}

// base — can be extended but NOT implemented
// Guarantees your mixin / super-class logic always runs
base class Service {
  void log(String msg) => print('[${runtimeType}] $msg');
  // Subclasses inherit log(), but can't be stubbed out entirely
}

// interface — can be implemented but NOT extended
// Lets you swap implementations without inheriting behaviour
interface class DataSource {
  List<Map> query(String sql) => throw UnimplementedError();
}

// sealed — only subclassable within the same library
// Perfect for algebraic data types / discriminated unions
sealed class Token {}
final class NumberToken extends Token { final double value; NumberToken(this.value); }
final class OpToken    extends Token { final String op;    OpToken(this.op); }
final class EofToken   extends Token { const EofToken(); }

// mixin class — usable both as a mixin and as a standalone class
mixin class Observable {
  final _listeners = <void Function()>[];
  void addListener(void Function() fn) => _listeners.add(fn);
  void notifyListeners() { for (final fn in _listeners) fn(); }
}
```

### Modifier decision table

| Modifier | Extend? | Implement? | Instantiate? | Use When |
|----------|---------|-----------|-------------|----------|
| *(none)* | ✅ | ✅ | ✅ | General purpose class |
| `abstract` | ✅ | ✅ | ❌ | Base class / contract |
| `final` | ❌ | ❌ | ✅ | Value type, security boundary |
| `base` | ✅ | ❌ | ✅ | Shared logic that must run |
| `interface` | ❌ | ✅ | ✅ | Pure API contract |
| `sealed` | ✅ (same lib) | ✅ (same lib) | ❌ | Discriminated union / ADT |
| `mixin class` | ✅ | ✅ | ✅ | Behaviour that can be mixed or instantiated |

---

## `Object` and Its Members

Every Dart object inherits from `Object`:

```dart
// The Object interface — inherited by everything
abstract class Object {
  bool operator ==(Object other);   // override for value equality
  int get hashCode;                 // override alongside ==
  String toString();                // override for readable output
  Type get runtimeType;             // the actual runtime type
  dynamic noSuchMethod(Invocation); // called on missing member
}

// runtimeType at runtime
Object x = 'hello';
print(x.runtimeType); // String — the actual type, not the declared type

// Distinguish value equality from identity
var a = [1, 2, 3];
var b = a;
var c = [1, 2, 3];
print(a == b);          // true  — same object
print(a == c);          // false — different objects (List doesn't override ==)
print(identical(a, b)); // true  — same reference
print(identical(a, c)); // false
```

---

## Summary

| Concept | Syntax | Key Point |
|---------|--------|-----------|
| Class | `class Foo { }` | Everything is an object |
| Private | `_name` | Library-level, not class-level |
| Extend | `class B extends A` | Single inheritance, `super` available |
| Implement | `class B implements A` | Must re-implement entire public API |
| Abstract | `abstract class A` | Can't instantiate, defines contract |
| Sealed | `sealed class A` | Subclass only in same library |
| Final class | `final class A` | No extending or implementing |
| Base class | `base class A` | Extend yes, implement no |
| Interface class | `interface class A` | Implement yes, extend no |
| Equality | `operator ==` + `hashCode` | Always override together |
| Composition | Field + delegation | Prefer over deep inheritance |
