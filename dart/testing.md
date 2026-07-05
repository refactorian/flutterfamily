---
sidebar_position: 25
title: Testing in Dart
description: Master Dart testing with unit tests, mocks, async testing, and test organization using the test and mockito packages.
---

Testing is not optional — it's how you prove your code works today and *keeps* working tomorrow. Dart has a first-class testing ecosystem built around the `test` package, with Flutter layering widget and integration tests on top.

---

## Setup

Add the `test` package to your `pubspec.yaml`:

```yaml
dev_dependencies:
  test: ^1.25.0
  mockito: ^5.4.4
  build_runner: ^2.4.0   # needed for mockito code generation
```

```bash
dart pub get

# Run all tests
dart test

# Run a specific file
dart test test/user_test.dart

# Run tests whose name contains a word
dart test --name "returns null"

# Run with verbose output
dart test --reporter expanded

# Flutter projects
flutter test
flutter test test/widget_test.dart
```

File layout convention:

```
my_app/
├── lib/
│   └── src/
│       ├── user.dart
│       └── user_service.dart
└── test/
    ├── user_test.dart          ← mirrors lib/src/user.dart
    ├── user_service_test.dart
    └── helpers/
        └── test_helpers.dart   ← shared test utilities
```

---

## The Basics — `test` and `expect`

```dart
import 'package:test/test.dart';

void main() {
  test('string length is correct', () {
    expect('hello'.length, 5);
  });

  test('list contains an item', () {
    final items = ['apple', 'banana', 'cherry'];
    expect(items, contains('banana'));
  });

  test('addition works', () {
    expect(2 + 2, equals(4));
  });
}
```

Every test file needs a `main()` function. Each `test()` call:
- Takes a description (what it verifies) and a callback
- Passes if no exception is thrown
- Fails if `expect()` doesn't match, or any exception is thrown

---

## Matchers — The Full Toolkit

Matchers make failures readable. Instead of `expect(result == 42, true)`, write `expect(result, 42)` — Dart prints a clear diff on failure.

```dart
import 'package:test/test.dart';

void main() {
  // ── Equality ────────────────────────────────────────────────────────
  expect(value, equals(42));          // deep equality — prefer this
  expect(value, 42);                  // shorthand — same as equals(42)
  expect(value, same(otherRef));      // reference identity (identical)
  expect(value, isNot(equals(0)));    // negation

  // ── Null / Boolean ──────────────────────────────────────────────────
  expect(value, isNull);
  expect(value, isNotNull);
  expect(flag, isTrue);
  expect(flag, isFalse);

  // ── Type ────────────────────────────────────────────────────────────
  expect(value, isA<String>());       // type check
  expect(value, isA<int>());
  expect(value, isNot(isA<double>()));

  // ── Numbers ─────────────────────────────────────────────────────────
  expect(value, greaterThan(5));
  expect(value, lessThan(10));
  expect(value, greaterThanOrEqualTo(5));
  expect(value, lessThanOrEqualTo(10));
  expect(value, inInclusiveRange(1, 10));   // 1 <= value <= 10
  expect(3.14, closeTo(3.14159, 0.01));     // floating-point comparison

  // ── Strings ─────────────────────────────────────────────────────────
  expect(text, contains('hello'));
  expect(text, startsWith('He'));
  expect(text, endsWith('!'));
  expect(text, matches(RegExp(r'^\d{4}-\d{2}-\d{2}$')));
  expect(text, isEmpty);
  expect(text, isNotEmpty);
  expect(text, hasLength(5));

  // ── Collections ─────────────────────────────────────────────────────
  expect(list, isEmpty);
  expect(list, isNotEmpty);
  expect(list, hasLength(3));
  expect(list, contains(42));
  expect(list, containsAll([1, 2, 3]));        // all present, any order
  expect(list, containsAllInOrder([1, 2, 3])); // all present, same order
  expect(list, equals([1, 2, 3]));             // exact match
  expect(list, everyElement(greaterThan(0)));  // all elements pass matcher
  expect(list, anyElement(greaterThan(5)));    // at least one passes
  expect(map,  containsPair('key', 'value'));

  // ── Exceptions ──────────────────────────────────────────────────────
  expect(() => int.parse('abc'), throwsA(isA<FormatException>()));
  expect(() => throw ArgumentError('bad'), throwsArgumentError);
  expect(() => throw StateError('bad'), throwsStateError);
  expect(() => someList[-1], throwsRangeError);
  expect(() => null!, throwsA(isA<TypeError>()));

  // Match exception + message
  expect(
    () => throw ArgumentError('must be positive'),
    throwsA(
      isA<ArgumentError>().having(
        (e) => e.message,        // extract a property
        'message',               // property description
        contains('positive'),    // matcher for that property
      ),
    ),
  );
}
```

---

## `group` — Organising Tests

Use `group()` to namespace related tests. Groups can be nested:

```dart
import 'package:test/test.dart';
import 'package:my_app/src/user.dart';

void main() {
  group('User', () {
    group('constructor', () {
      test('sets name correctly', () {
        final user = User(id: '1', name: 'Alice', email: 'a@b.com');
        expect(user.name, 'Alice');
      });

      test('sets email correctly', () {
        final user = User(id: '1', name: 'Alice', email: 'a@b.com');
        expect(user.email, 'a@b.com');
      });
    });

    group('copyWith', () {
      late User original;

      // setUp runs before EACH test in this group
      setUp(() {
        original = User(id: '1', name: 'Alice', email: 'a@b.com');
      });

      test('updates name, leaves other fields unchanged', () {
        final updated = original.copyWith(name: 'Bob');
        expect(updated.name,  'Bob');
        expect(updated.id,    '1');       // unchanged
        expect(updated.email, 'a@b.com'); // unchanged
      });

      test('updates email, leaves other fields unchanged', () {
        final updated = original.copyWith(email: 'bob@b.com');
        expect(updated.email, 'bob@b.com');
        expect(updated.name,  'Alice');   // unchanged
      });

      test('returns equal object when nothing changed', () {
        final copy = original.copyWith();
        expect(copy, equals(original));
      });
    });
  });
}
```

### Lifecycle Hooks

```dart
group('DatabaseService', () {
  late Database db;

  // Runs once before all tests in the group
  setUpAll(() async {
    db = await Database.openInMemory();
  });

  // Runs before EACH test
  setUp(() async {
    await db.clear();   // fresh state for every test
  });

  // Runs after EACH test
  tearDown(() async {
    // cleanup if needed
  });

  // Runs once after all tests in the group
  tearDownAll(() async {
    await db.close();
  });

  test('insert and retrieve', () async {
    await db.insert({'id': 1, 'name': 'Alice'});
    final result = await db.findById(1);
    expect(result?['name'], 'Alice');
  });
});
```

---

## Testing Async Code

```dart
import 'package:test/test.dart';

Future<String> fetchGreeting(String name) async {
  await Future.delayed(const Duration(milliseconds: 10));
  return 'Hello, $name!';
}

Future<int> failingFetch() async {
  throw Exception('Network error');
}

void main() {
  // ── async test — just mark the callback async
  test('fetchGreeting returns correct string', () async {
    final result = await fetchGreeting('Dart');
    expect(result, 'Hello, Dart!');
  });

  // ── test that a Future throws
  test('failingFetch throws Exception', () async {
    expect(
      () async => await failingFetch(),
      throwsA(isA<Exception>()),
    );
  });

  // ── expectLater — for Futures and Streams
  test('future completes with a value', () {
    expectLater(fetchGreeting('World'), completion('Hello, World!'));
  });

  test('future throws', () {
    expectLater(failingFetch(), throwsA(isA<Exception>()));
  });
}
```

### Testing Streams

```dart
Stream<int> countStream(int max) async* {
  for (var i = 1; i <= max; i++) {
    await Future.delayed(const Duration(milliseconds: 5));
    yield i;
  }
}

Stream<int> errorStream() async* {
  yield 1;
  throw StateError('stream error');
}

void main() {
  test('stream emits values in order', () {
    expectLater(
      countStream(4),
      emitsInOrder([1, 2, 3, 4, emitsDone]),
    );
  });

  test('stream emits specific values', () {
    expectLater(
      countStream(5),
      emitsInOrder([1, 2, 3, 4, 5]),
    );
  });

  test('stream emits an error then closes', () {
    expectLater(
      errorStream(),
      emitsInOrder([
        1,
        emitsError(isA<StateError>()),
      ]),
    );
  });

  test('stream contains a value anywhere', () {
    expectLater(countStream(10), emitsThrough(5));
  });

  // Collect stream to list and inspect
  test('stream produces correct list', () async {
    final values = await countStream(3).toList();
    expect(values, [1, 2, 3]);
  });
}
```

---

## Mocking with `mockito`

Mocks replace real dependencies with controlled fakes — so you test your code in isolation, not the network or database.

### Step 1 — Annotate and generate

```dart
// test/user_service_test.dart
import 'package:mockito/annotations.dart';
import 'package:mockito/mockito.dart';
import 'package:test/test.dart';
import 'package:my_app/src/user_repository.dart';
import 'package:my_app/src/user_service.dart';

// This annotation tells build_runner to generate MockUserRepository
@GenerateMocks([UserRepository])
import 'user_service_test.mocks.dart'; // generated file

void main() { /* ... */ }
```

```bash
# Generate the mock classes
dart run build_runner build
# Creates: test/user_service_test.mocks.dart
```

### Step 2 — Write the class under test

```dart
// lib/src/user_repository.dart
abstract class UserRepository {
  Future<User?> findById(String id);
  Future<List<User>> findAll();
  Future<void> save(User user);
  Future<void> delete(String id);
}

// lib/src/user_service.dart
class UserService {
  final UserRepository _repo;
  UserService(this._repo);

  Future<User> getUser(String id) async {
    final user = await _repo.findById(id);
    if (user == null) throw ArgumentError('User not found: $id');
    return user;
  }

  Future<List<User>> getActiveUsers() async {
    final all = await _repo.findAll();
    return all.where((u) => u.isActive).toList();
  }
}
```

### Step 3 — Use the mock in tests

```dart
@GenerateMocks([UserRepository])
import 'user_service_test.mocks.dart';

void main() {
  late MockUserRepository mockRepo;
  late UserService service;

  setUp(() {
    mockRepo = MockUserRepository();
    service  = UserService(mockRepo);
  });

  group('UserService.getUser', () {
    test('returns user when found', () async {
      final user = User(id: '1', name: 'Alice', email: 'a@b.com', isActive: true);

      // Arrange — define what the mock returns
      when(mockRepo.findById('1')).thenAnswer((_) async => user);

      // Act
      final result = await service.getUser('1');

      // Assert
      expect(result.name, 'Alice');

      // Verify the mock was called with the right argument
      verify(mockRepo.findById('1')).called(1);
    });

    test('throws ArgumentError when user not found', () async {
      when(mockRepo.findById('999')).thenAnswer((_) async => null);

      expect(
        () async => await service.getUser('999'),
        throwsA(
          isA<ArgumentError>().having(
            (e) => e.message,
            'message',
            contains('999'),
          ),
        ),
      );
    });

    test('propagates repository exceptions', () async {
      when(mockRepo.findById(any))
          .thenThrow(Exception('DB connection lost'));

      expect(
        () async => await service.getUser('1'),
        throwsA(isA<Exception>()),
      );
    });
  });

  group('UserService.getActiveUsers', () {
    test('returns only active users', () async {
      final users = [
        User(id: '1', name: 'Alice', email: 'a@b.com', isActive: true),
        User(id: '2', name: 'Bob',   email: 'b@b.com', isActive: false),
        User(id: '3', name: 'Carol', email: 'c@b.com', isActive: true),
      ];
      when(mockRepo.findAll()).thenAnswer((_) async => users);

      final active = await service.getActiveUsers();

      expect(active, hasLength(2));
      expect(active.map((u) => u.name), containsAll(['Alice', 'Carol']));
      verifyNever(mockRepo.findById(any)); // findById was never called
    });
  });
}
```

### Common `mockito` operations

```dart
// Stub return values
when(mock.method(arg)).thenReturn(value);          // sync
when(mock.method(arg)).thenAnswer((_) async => v); // async
when(mock.method(arg)).thenThrow(Exception('!'));  // throw

// Argument matchers
when(mock.findById(any)).thenReturn(null);          // any argument
when(mock.findById(argThat(startsWith('usr_')))).thenReturn(user);

// Verify calls
verify(mock.save(user)).called(1);         // called exactly once
verify(mock.findAll()).called(greaterThan(0));
verifyNever(mock.delete(any));             // never called
verifyNoMoreInteractions(mock);            // no other calls

// Capture arguments
final captured = verify(mock.save(captureAny)).captured;
expect((captured.first as User).name, 'Alice');
```

---

## Mocking without Code Generation — `mocktail`

If you prefer not to run `build_runner`, use `mocktail`:

```yaml
dev_dependencies:
  mocktail: ^1.0.4
```

```dart
import 'package:mocktail/mocktail.dart';
import 'package:test/test.dart';

// No annotation needed — just extend Mock
class MockUserRepository extends Mock implements UserRepository {}

void main() {
  late MockUserRepository mockRepo;

  setUp(() {
    mockRepo = MockUserRepository();
    // Register fallback values for custom types used as arguments
    registerFallbackValue(User(id: '', name: '', email: '', isActive: false));
  });

  test('saves user correctly', () async {
    when(() => mockRepo.save(any())).thenAnswer((_) async {});

    await mockRepo.save(User(id: '1', name: 'Alice', email: 'a@b.com', isActive: true));

    verify(() => mockRepo.save(any())).called(1);
  });
}
```

---

## Test Doubles — Fakes vs Mocks

Not every dependency needs a generated mock. A **fake** is a real (but simplified) implementation:

```dart
// Fake — real logic, but in-memory instead of real DB
class FakeUserRepository implements UserRepository {
  final _store = <String, User>{};

  @override
  Future<User?> findById(String id) async => _store[id];

  @override
  Future<List<User>> findAll() async => _store.values.toList();

  @override
  Future<void> save(User user) async => _store[user.id] = user;

  @override
  Future<void> delete(String id) async => _store.remove(id);
}

// Use the fake in tests — no stubbing required
void main() {
  late FakeUserRepository repo;
  late UserService service;

  setUp(() {
    repo    = FakeUserRepository();
    service = UserService(repo);
  });

  test('save and retrieve round-trip', () async {
    final user = User(id: '1', name: 'Alice', email: 'a@b.com', isActive: true);
    await repo.save(user);

    final found = await service.getUser('1');
    expect(found.name, 'Alice');
  });
}
```

| Double type | Description | Use when |
|-------------|-------------|----------|
| **Mock** | Records calls, returns stubbed values | Verifying interactions, isolating dependencies |
| **Fake** | Real logic, simplified (in-memory) | Testing full behaviour without the real infra |
| **Stub** | Returns hardcoded values | Simple read-only dependencies |
| **Spy** | Real object, but records calls | Verifying calls on a real implementation |

---

## Testing Tips & Patterns

### AAA — Arrange, Act, Assert

Every test should follow this structure — it makes failures immediately obvious:

```dart
test('UserService creates user with correct defaults', () async {
  // Arrange — set up data and dependencies
  final repo    = FakeUserRepository();
  final service = UserService(repo);
  final request = CreateUserRequest(name: 'Alice', email: 'a@b.com');

  // Act — call exactly ONE thing
  final user = await service.createUser(request);

  // Assert — check outcomes
  expect(user.name,     'Alice');
  expect(user.isActive, isTrue);
  expect(user.id,       isNotEmpty);
});
```

### One assertion concern per test

```dart
// ❌ Too many unrelated concerns in one test — hard to diagnose failures
test('user test', () async {
  final user = await service.createUser(request);
  expect(user.name, 'Alice');
  expect(user.email, 'a@b.com');
  await service.deactivate(user.id);
  expect((await service.getUser(user.id)).isActive, isFalse);
  await service.delete(user.id);
  expect(await repo.findById(user.id), isNull);
});

// ✅ Separate tests — each failure tells you exactly what broke
test('createUser sets name correctly', () async { /* ... */ });
test('createUser sets email correctly', () async { /* ... */ });
test('deactivate sets isActive to false', () async { /* ... */ });
test('delete removes user from repository', () async { /* ... */ });
```

### Parameterised tests

```dart
void main() {
  // Test the same logic with multiple inputs
  final cases = [
    (input: '',        expected: false, reason: 'empty string'),
    (input: 'no-at',   expected: false, reason: 'missing @'),
    (input: 'a@b',     expected: false, reason: 'missing dot'),
    (input: 'a@b.com', expected: true,  reason: 'valid email'),
    (input: 'a+b@c.io',expected: true,  reason: 'plus sign allowed'),
  ];

  for (final c in cases) {
    test('isEmail: ${c.reason}', () {
      expect(isEmail(c.input), c.expected);
    });
  }
}
```

### Testing exceptions precisely

```dart
test('withdraw throws when balance insufficient', () {
  final account = BankAccount(balance: 50.0);

  expect(
    () => account.withdraw(100.0),
    throwsA(
      isA<InsufficientFundsException>()
          .having((e) => e.requested, 'requested', 100.0)
          .having((e) => e.available, 'available', 50.0),
    ),
  );
});
```

### Tags — skip slow or platform-specific tests

```dart
@Tags(['slow', 'integration'])
import 'package:test/test.dart';

void main() {
  test('slow database test', () async {
    // ...
  }, tags: ['slow']);

  test('mobile only', () async {
    // ...
  }, skip: !Platform.isAndroid && !Platform.isIOS);
}
```

```bash
# Run only fast tests (exclude slow tag)
dart test --exclude-tags slow

# Run only integration tests
dart test --tags integration
```

---

## Code Coverage

```bash
# Collect coverage (requires coverage package)
dart pub global activate coverage
dart test --coverage=coverage/
format_coverage --lcov --in=coverage/ --out=coverage/lcov.info --packages=.dart_tool/package_config.json
genhtml coverage/lcov.info -o coverage/html

# Flutter
flutter test --coverage
genhtml coverage/lcov.info -o coverage/html
open coverage/html/index.html
```

---

## Summary

| Concept | API |
|---------|-----|
| Declare test | `test('description', () { })` |
| Group tests | `group('name', () { })` |
| Assert | `expect(actual, matcher)` |
| Before each | `setUp(() { })` |
| After each | `tearDown(() { })` |
| Before all | `setUpAll(() { })` |
| After all | `tearDownAll(() { })` |
| Async test | `test('...', () async { await ... })` |
| Future matcher | `expectLater(future, completion(v))` |
| Stream matcher | `expectLater(stream, emitsInOrder([...]))` |
| Mock (codegen) | `@GenerateMocks([Dep])` + `mockito` |
| Mock (no codegen)| `class Mock extends Mock implements Dep` + `mocktail` |
| Fake | Real implementation, simplified (in-memory) |
| Skip a test | `test('...', () { }, skip: true)` |
| Test tags | `dart test --tags integration` |
