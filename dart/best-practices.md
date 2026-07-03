---
sidebar_position: 22
title: Best Practices
description: Coding guidelines, naming conventions, performance optimization, and common pitfalls in Dart.
---

This chapter distills the Dart style guide, effective patterns, common pitfalls, and hard-won lessons into actionable rules. Follow these and your code will be readable, maintainable, and fast.

---

## Naming Conventions

```dart
// ✅ lowerCamelCase — variables, parameters, local functions
var userName = 'Alice';
int itemCount = 0;
void fetchUserData() {}
void process({required String inputData}) {}

// ✅ UpperCamelCase — classes, enums, typedefs, extensions, mixins
class UserRepository {}
enum ConnectionState { connecting, connected, disconnected }
typedef JsonMap = Map<String, dynamic>;
extension StringExt on String {}
mixin Loggable {}

// ✅ lowercase_with_underscores — file names, library names
// user_repository.dart     ✅
// UserRepository.dart      ❌
// userrepository.dart      ❌

// ✅ lowerCamelCase for constants (Dart style — NOT SCREAMING_SNAKE_CASE)
const maxRetries = 3;
const defaultTimeout = Duration(seconds: 30);
const pi = 3.14159265358979;

// SCREAMING_SNAKE_CASE is accepted but not idiomatic Dart
const MAX_RETRIES = 3; // works, but not recommended

// ✅ Prefix private names with _
class Counter {
  int _count = 0;           // private field
  void _reset() {}          // private method
  int get count => _count;  // public getter
}

// ✅ Meaningful, pronounceable names
// Bad:
var d = DateTime.now();
var usrNm = '';
int n = items.length;
// Good:
var now = DateTime.now();
var userName = '';
int itemCount = items.length;

// ✅ Boolean names should read as yes/no questions
bool isLoading = false;
bool hasError = false;
bool canSubmit = true;
bool shouldRetry = false;
// Not: loading, error, submit, retry (ambiguous)
```

---

## Variables & Types

```dart
// ✅ Prefer final — signal that a variable won't be reassigned
final name = 'Alice';         // infer type
final items = <String>[];     // final reference, mutable contents
final today = DateTime.now(); // runtime value — final is fine

// ✅ Use const for compile-time constants
const maxPageSize = 100;
const appName = 'MyApp';
const defaultPadding = EdgeInsets.all(16);

// ✅ Annotate types when inference isn't obvious
final Map<String, List<int>> groupedData = {};   // clear
var grouped = <String, List<int>>{};              // also fine

// ✅ Avoid dynamic — use generics or sealed classes instead
// Bad:
dynamic parseResponse(String json) => jsonDecode(json);
// Good:
Map<String, dynamic> parseResponse(String json) =>
    jsonDecode(json) as Map<String, dynamic>;

// ✅ Let the type system do the work — avoid unnecessary casts
// Bad:
Object obj = items[0];
String name = obj as String;  // fragile at runtime
// Good:
if (obj is String) { print(obj.length); }  // promoted, safe

// ✅ Use specific collection types
List<int>          ids   = [];   // not List
Map<String, User>  users = {};   // not Map
Set<String>        tags  = {};   // not Set
```

---

## Functions & Methods

```dart
// ✅ Keep functions short and focused — one job per function
// Bad: 80-line function that fetches, parses, validates, saves, notifies
// Good: 5 small functions composed together

// ✅ Prefer named parameters for 3+ parameters or when order is ambiguous
// Bad:
createButton('Submit', true, false, Colors.blue, 14.0);
// Good:
createButton(
  label: 'Submit',
  isPrimary: true,
  isDisabled: false,
  color: Colors.blue,
  fontSize: 14.0,
);

// ✅ Use => for simple one-expression functions
String greet(String name) => 'Hello, $name!';
bool isEven(int n) => n % 2 == 0;

// ✅ Avoid positional parameters when order could be confused
// Bad: setRange(10, 20, 5) — is that (start, end, step) or (min, max, default)?
// Good: setRange(start: 10, end: 20, step: 5)

// ✅ Mark truly required named params with required
void createUser({
  required String name,       // must provide
  required String email,      // must provide
  int age = 0,                // optional with default
  String? bio,                // optional, can be null
}) {}

// ✅ Avoid boolean parameters — use enums instead
// Bad:
void connect(String host, bool secure) {}
connect('api.example.com', true);  // what does true mean?
// Good:
enum ConnectionMode { secure, plain }
void connect(String host, ConnectionMode mode) {}
connect('api.example.com', ConnectionMode.secure);

// ✅ Return early — avoid deep nesting
// Bad:
String process(String? input) {
  if (input != null) {
    if (input.isNotEmpty) {
      if (input.length < 100) {
        return input.trim().toUpperCase();
      }
    }
  }
  return '';
}
// Good:
String process(String? input) {
  if (input == null || input.isEmpty) return '';
  if (input.length >= 100) return '';
  return input.trim().toUpperCase();
}
```

---

## Null Safety

```dart
// ✅ Use ? honestly — don't make things nullable out of laziness
// Bad: String? name; // but you always set it before use
// Good: late String name; // or just: String name = '';

// ✅ Provide defaults rather than propagating nulls
String displayName(String? name) => name?.trim().isNotEmpty == true
    ? name!
    : 'Anonymous';

// ✅ Use null-aware operators to stay concise
String? city = user.address?.city;
int length = text?.length ?? 0;
user.callback?.call();

// ✅ Prefer ?. chains over nested null checks
// Bad:
String? city;
if (user != null && user.address != null) {
  city = user.address!.city;
}
// Good:
String? city = user?.address?.city;

// ✅ Use ! only at the boundary where you KNOW it's non-null
// and comment why
final controller = TextEditingController();
// Safe: we just assigned it above
final text = controller.text; // no ! needed — not nullable

// ✅ Convert nullable to non-nullable at the earliest safe point
Future<void> loadUser(int? id) async {
  final userId = id ?? (throw ArgumentError.notNull('id'));
  // userId is non-nullable from here on
  final user = await repo.findById(userId);
}
```

---

## Async Best Practices

```dart
// ✅ Always await Futures — unawaited futures hide bugs
// Bad:
void saveData() async {
  database.save(data);   // ← no await! errors are lost silently
  print('saved');        // ← this runs before save finishes!
}
// Good:
Future<void> saveData() async {
  await database.save(data);
  print('saved');
}

// ✅ Mark fire-and-forget intentionally
import 'package:meta/meta.dart';
unawaited(analytics.track('page_view'));  // explicit, documented

// ✅ Catch errors where you can act on them
Future<void> loadProfile() async {
  try {
    _state = await fetchProfile();
  } on NetworkException {
    showOfflineMessage();
  } catch (e, stack) {
    logger.error('Profile load failed', e, stack);
    showGenericError();
  }
}

// ✅ Use Future.wait for parallel work — don't await sequentially if independent
// Bad (4 seconds if each takes 1s):
final a = await fetchA();
final b = await fetchB();
final c = await fetchC();
final d = await fetchD();
// Good (1 second total):
final [a, b, c, d] = await Future.wait([fetchA(), fetchB(), fetchC(), fetchD()]);

// ✅ Handle stream errors — always provide onError
stream.listen(
  onData,
  onError: (e) => logger.error(e),  // missing this = silent failure
  cancelOnError: false,              // usually you want to keep listening
);

// ✅ Cancel subscriptions to avoid memory leaks
class MyWidget extends StatefulWidget { ... }
class _MyWidgetState extends State<MyWidget> {
  StreamSubscription? _sub;

  @override
  void initState() {
    super.initState();
    _sub = myStream.listen(onData);
  }

  @override
  void dispose() {
    _sub?.cancel();   // ← always cancel!
    super.dispose();
  }
}
```

---

## Immutability

```dart
// ✅ Prefer immutable data — easier to reason about, no aliasing bugs
class User {
  final String id;
  final String name;
  final String email;

  const User({required this.id, required this.name, required this.email});

  // Immutable update via copyWith
  User copyWith({String? id, String? name, String? email}) => User(
    id:    id    ?? this.id,
    name:  name  ?? this.name,
    email: email ?? this.email,
  );

  @override
  bool operator ==(Object o) =>
      o is User && id == o.id && name == o.name && email == o.email;

  @override
  int get hashCode => Object.hash(id, name, email);

  @override
  String toString() => 'User($id, $name, $email)';
}

// ✅ Return unmodifiable views from getters
class Store {
  final _items = <Item>[];

  List<Item> get items => List.unmodifiable(_items);  // ✅ safe
  // List<Item> get items => _items;  // ❌ caller can mutate your list!
}

// ✅ Prefer const constructors
const user = User(id: '1', name: 'Alice', email: 'a@b.com');
const padding = EdgeInsets.all(16);
```

---

## Code Organization

```dart
// ✅ One class per file (generally)
// user.dart        → class User
// user_service.dart → class UserService
// user_repository.dart → abstract class UserRepository

// ✅ Organize imports: dart: → package: → relative
import 'dart:async';
import 'dart:convert';

import 'package:flutter/material.dart';
import 'package:http/http.dart' as http;

import '../models/user.dart';
import '../services/auth_service.dart';
import 'utils.dart';

// ✅ Barrel files for clean public API
// lib/models/models.dart
export 'user.dart';
export 'product.dart';
export 'order.dart';

// Consumer:
import 'package:my_app/models/models.dart'; // one import for all models

// ✅ Separate concerns — don't mix UI, business logic, and data access
// ❌ Bad: StatefulWidget that also calls the API and writes to SQLite
// ✅ Good:
//   Widget     → display only
//   ViewModel  → UI state + user actions
//   Service    → business logic
//   Repository → data access (API / DB)
```

---

## Performance

```dart
// ✅ const constructors everywhere — Flutter skips rebuilding them
const Text('Hello')
const SizedBox(height: 16)
const EdgeInsets.symmetric(horizontal: 16)

// ✅ StringBuffer for repeated concatenation
// Bad — O(n²):
var s = '';
for (var i = 0; i < 10000; i++) s += '$i,';
// Good — O(n):
final buf = StringBuffer();
for (var i = 0; i < 10000; i++) buf.write('$i,');
final s = buf.toString();

// ✅ lazy final for expensive-to-compute values (computed once)
class Document {
  final String rawContent;
  Document(this.rawContent);

  late final wordCount = rawContent.split(RegExp(r'\s+')).length;
  late final List<String> lines = rawContent.split('\n');
}

// ✅ whereType<T>() instead of where + cast
var mixed = <Object>[1, 'a', 2, 'b', 3];
var ints = mixed.whereType<int>().toList(); // [1, 2, 3]

// ✅ Avoid unnecessary work in frequently called code
// Bad — allocates a new list on every call to getNames():
List<String> get names => users.map((u) => u.name).toList();
// Good:
late final names = users.map((u) => u.name).toList();
```

---

## Testing Best Practices

```dart
// ✅ Test structure: Arrange → Act → Assert
test('User.copyWith updates name', () {
  // Arrange
  final user = User(id: '1', name: 'Alice', email: 'a@b.com');

  // Act
  final updated = user.copyWith(name: 'Bob');

  // Assert
  expect(updated.name, 'Bob');
  expect(updated.id, '1');      // unchanged
  expect(updated.email, 'a@b.com'); // unchanged
});

// ✅ Use descriptive test names
// Bad:  test('test1', ...)
// Good: test('fetchUser returns null when id does not exist', ...)

// ✅ Test one thing per test
// Bad: one test that creates a user, edits it, deletes it, and checks count
// Good: separate tests for each behaviour

// ✅ Group related tests
group('UserRepository', () {
  late UserRepository repo;

  setUp(() => repo = MockUserRepository());

  test('findById returns null for unknown id', () async {
    expect(await repo.findById(999), isNull);
  });

  test('save persists the user', () async {
    final user = User(id: '1', name: 'Alice', email: 'a@b.com');
    await repo.save(user);
    expect(await repo.findById('1'), user);
  });
});

// ✅ Use dependency injection for testability
class OrderService {
  final OrderRepository _repo;
  final PaymentGateway _payment;
  final NotificationService _notify;

  // All dependencies injected — easy to mock in tests
  OrderService(this._repo, this._payment, this._notify);
}

// ✅ Test edge cases explicitly
test('truncate handles empty string', () => expect(''.truncate(10), ''));
test('truncate handles string shorter than max', () =>
    expect('hi'.truncate(10), 'hi'));
test('truncate handles exact length', () =>
    expect('hello'.truncate(5), 'hello'));
test('truncate truncates longer strings', () =>
    expect('hello world'.truncate(8), 'hello...'));
```

---

## Documentation

```dart
/// A user account in the system.
///
/// Instances are immutable. Use [copyWith] to create modified copies.
///
/// Example:
/// ```dart
/// final user = User(id: '1', name: 'Alice', email: 'alice@example.com');
/// final renamed = user.copyWith(name: 'Alicia');
/// ```
class User {
  /// The user's unique identifier. Never null or empty.
  final String id;

  /// The display name. May contain unicode characters.
  final String name;

  /// The user's primary email address.
  final String email;

  const User({required this.id, required this.name, required this.email});

  /// Returns a copy of this user with the given fields replaced.
  ///
  /// Fields that are not provided are copied from this instance.
  User copyWith({String? id, String? name, String? email}) => User(
    id:    id    ?? this.id,
    name:  name  ?? this.name,
    email: email ?? this.email,
  );
}

// ✅ Document the WHY, not the WHAT
// Bad:
/// Increments the counter by 1.
void increment() => _count++;

// Good (when it's not obvious):
/// Increments the counter. Listeners are NOT notified immediately;
/// call [flush] to propagate changes, or use [incrementAndNotify].
void increment() => _count++;
```

---

## Common Pitfalls

```dart
// ⚠️ 1. Modifying a collection while iterating it
var list = [1, 2, 3, 4, 5];
for (var item in list) {
  if (item.isEven) list.remove(item); // ❌ ConcurrentModificationError
}
list.removeWhere((n) => n.isEven); // ✅

// ⚠️ 2. Missing await on a Future
Future<String> load() async => 'data';
var result = load();  // ❌ result is Future<String>
var result = await load(); // ✅

// ⚠️ 3. Using ! on a nullable that might actually be null
String? name = getNameOrNull();
print(name!.length); // ❌ throws if null
print(name?.length ?? 0); // ✅

// ⚠️ 4. Comparing doubles with ==
print(0.1 + 0.2 == 0.3);   // ❌ false! (floating point)
print((0.1 + 0.2 - 0.3).abs() < 1e-10); // ✅

// ⚠️ 5. Not closing StreamControllers
final controller = StreamController<int>();
// ... use it ...
await controller.close(); // ✅ always close when done

// ⚠️ 6. setState after dispose in Flutter
Future<void> _load() async {
  final data = await fetchData();
  setState(() => _data = data); // ❌ might be disposed by now
}
Future<void> _load() async {
  final data = await fetchData();
  if (mounted) setState(() => _data = data); // ✅

// ⚠️ 7. Shadowing outer variables
var value = 'outer';
void fn() {
  var value = 'inner'; // shadows outer — easy to miss
  print(value);        // inner
}

// ⚠️ 8. Shared mutable state across isolates (not possible — Dart prevents this)
// Isolates communicate via messages only — all data is copied or transferred

// ⚠️ 9. int / double division surprise
print(7 / 2);    // 3.5   (always double)
print(7 ~/ 2);   // 3     (integer division)
print(7 % 2);    // 1     (remainder)

// ⚠️ 10. Empty {} is a Map, not a Set
var m = {};             // Map<dynamic, dynamic> ❌ probably not what you want
var s = <String>{};     // Set<String> ✅
var m2 = <String, int>{}; // Map<String, int> ✅
```

---

## The dart analyze & dart fix Workflow

```bash
# Run analysis
dart analyze

# Common lint rules to enable (analysis_options.yaml)
# include: package:flutter_lints/flutter.yaml  ← start here

# Auto-fix many issues
dart fix --apply

# Format all code
dart format .

# Check before committing (add to CI)
dart analyze && dart test && dart format --output=none --set-exit-if-changed .
```

```yaml
# analysis_options.yaml — recommended settings
include: package:flutter_lints/flutter.yaml

linter:
  rules:
    # Style
    prefer_single_quotes: true
    prefer_final_locals: true
    prefer_final_fields: true
    prefer_const_constructors: true
    prefer_const_declarations: true
    unnecessary_const: true
    avoid_print: true              # use logger instead

    # Safety
    avoid_dynamic_calls: true
    avoid_type_to_string: true
    cancel_subscriptions: true
    close_sinks: true
    unawaited_futures: true

    # Design
    avoid_positional_boolean_parameters: true
    prefer_named_parameters_for_booleans: true  # not available yet, but aim for it

analyzer:
  errors:
    missing_required_param: error
    dead_code: warning
    unused_import: warning
  exclude:
    - '**/*.g.dart'
    - '**/*.freezed.dart'
```
