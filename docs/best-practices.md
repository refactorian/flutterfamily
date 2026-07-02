---
sidebar_position: 22
title: Best Practices
description: Coding guidelines, naming conventions, performance optimization, and common pitfalls in Dart.
---

---

## Code Style

```dart
// ✅ Use lowerCamelCase for variables, functions, parameters
var myVariable = 'hello';
void myFunction() {}
void process({required String inputData}) {}

// ✅ Use UpperCamelCase for classes, enums, typedefs
class UserRepository {}
enum AppState { loading, ready }
typedef JsonMap = Map<String, dynamic>;

// ✅ Use lowercase_with_underscores for files and libraries
// user_repository.dart, string_utils.dart, my_app.dart

// ✅ Use SCREAMING_SNAKE_CASE for constants (optional — camelCase also fine)
const int MAX_RETRY_COUNT = 3;
const maxRetryCount = 3; // also fine in Dart

// ✅ Prefer final over var when not reassigning
final name = 'Alice';        // better than: var name = 'Alice';
final items = <String>[];    // list is final (can't reassign), but contents mutable

// ✅ Use const for compile-time values
const pi = 3.14159;
const defaultTimeout = Duration(seconds: 30);
```

---

## Null Safety Best Practices

```dart
// ✅ Avoid ! unless you're 100% sure
// Bad:
String text = maybeNull!;  // might throw

// Good:
String text = maybeNull ?? 'default';
// Or:
if (maybeNull != null) {
  String text = maybeNull; // promoted
}

// ✅ Use late only when necessary
class Widget {
  late final controller = TextEditingController(); // lazy init — OK
  // Don't use late just to avoid null

  late String name; // ❌ risky if forgotten to assign
  String? name;     // ✅ more honest about nullability
}

// ✅ Return nullable from functions that might not find something
User? findUser(int id) => users.firstWhereOrNull((u) => u.id == id);
// Better than returning null-User sentinel or throwing
```

---

## Performance Tips

```dart
// ✅ Prefer const constructors when possible
const padding = EdgeInsets.all(16);    // ✅ compile-time constant
var padding = EdgeInsets.all(16);      // ❌ new object every time

// ✅ Use StringBuffer for many concatenations
// Bad:
var result = '';
for (var i = 0; i < 1000; i++) result += '$i, '; // O(n²)

// Good:
var buffer = StringBuffer();
for (var i = 0; i < 1000; i++) buffer.write('$i, '); // O(n)
var result = buffer.toString();

// ✅ Lazy computation with getters
class Report {
  final List<Sale> sales;
  Report(this.sales);

  // Only computed once, when first accessed... actually no, computed each call
  double get total => sales.fold(0, (s, sale) => s + sale.amount);

  // Cache with late final
  late final double cachedTotal =
      sales.fold(0, (s, sale) => s + sale.amount); // computed once
}

// ✅ Use whereType instead of where + cast
var items = <Object>[1, 'hello', 2, 'world', 3];
var numbers = items.whereType<int>().toList(); // [1, 2, 3]

// ✅ Avoid excessive rebuilds in Flutter — use const widgets
```

---

## Design Patterns in Dart

```dart
// Repository pattern
abstract class UserRepository {
  Future<User?> findById(int id);
  Future<List<User>> findAll();
  Future<User> save(User user);
  Future<void> delete(int id);
}

class ApiUserRepository implements UserRepository {
  @override
  Future<User?> findById(int id) async {
    // fetch from API
  }
}

class MockUserRepository implements UserRepository {
  final _users = <int, User>{};

  @override
  Future<User?> findById(int id) async => _users[id];
}

// Dependency injection via constructor
class UserService {
  final UserRepository _repository;
  UserService(this._repository); // inject the dependency

  Future<User?> getUser(int id) => _repository.findById(id);
}

// Observable/reactive with ValueNotifier (Flutter)
class CounterViewModel extends ChangeNotifier {
  int _count = 0;
  int get count => _count;

  void increment() {
    _count++;
    notifyListeners(); // trigger rebuild
  }
}
```

---

## Common Pitfalls

```dart
// ⚠️ 1. Modifying a list while iterating
var list = [1, 2, 3, 4, 5];
// DON'T:
for (var item in list) {
  if (item.isEven) list.remove(item); // ConcurrentModificationError!
}
// DO:
list.removeWhere((item) => item.isEven);

// ⚠️ 2. Forgetting await
Future<String> fetchData() async => 'data';
// DON'T:
var result = fetchData(); // result is Future<String>, not String!
// DO:
var result = await fetchData();

// ⚠️ 3. Using dynamic to avoid types
// DON'T: dynamic json = response.body; json.name.toString()
// DO: parse explicitly
Map<String, dynamic> json = jsonDecode(response.body);
String name = json['name'] as String;

// ⚠️ 4. Creating objects in build() method (Flutter)
// DON'T: return Container(decoration: BoxDecoration(image: DecorationImage(...)))
// on every rebuild — creates new objects every frame
// DO: move to a field or use const

// ⚠️ 5. Not handling stream errors
stream.listen((data) => process(data)); // missing error handler!
stream.listen(
  (data) => process(data),
  onError: (e) => handleError(e),
);
```
