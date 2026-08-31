---
slug: dart-3-records-pattern-matching-and-sealed-classes
title: Dart 3 Records, Pattern Matching, and Sealed Classes
authors: [admin]
tags: [dart, dart3, records, pattern-matching, sealed-classes, switch-expressions, class-modifiers, language-features, type-safety]
---

# Dart 3 Records, Pattern Matching, and Sealed Classes

> Discover how Dart 3 introduces records, pattern matching, and sealed classes to make your code more expressive, type-safe, and maintainable. Learn how these language features simplify complex logic, reduce boilerplate, and enable modern application architecture.

{/* truncate */}

---

## Table of Contents

- Introduction
- What's New in Dart 3?
- Why These Features Matter
- Understanding Records
- Named vs Positional Records
- Record Destructuring
- Pattern Matching
- Variable Patterns
- Object Patterns
- List Patterns
- Map Patterns
- Switch Expressions
- Exhaustive Pattern Matching
- Sealed Classes
- Modeling Application State
- Combining Records and Patterns
- Flutter Use Cases
- Performance Considerations
- Best Practices
- Common Mistakes
- Production Checklist
- Conclusion

---

# Introduction

Dart has evolved significantly since its early releases, but **Dart 3** represents one of the largest language improvements in its history.

Rather than simply adding syntax sugar, Dart 3 introduces features that fundamentally improve how developers model data and express business logic.

The three headline features are:

- Records
- Pattern Matching
- Sealed Classes

Together, they eliminate entire categories of boilerplate while making code easier to read, safer to refactor, and more difficult to misuse.

If you've used Kotlin, Swift, Rust, or modern C#, many of these ideas will feel familiar—but Dart integrates them naturally into Flutter development.

---

# What's New in Dart 3?

Dart 3 introduces several modern language capabilities, including:

- Records
- Pattern Matching
- Switch Expressions
- Destructuring
- Sealed Classes
- Class Modifiers
- Exhaustive Type Checking

These features work together rather than independently.

---

# Why These Features Matter

Before Dart 3, developers often created tiny model classes simply to return multiple values.

Example:

```dart
class UserLocation {
  final User user;
  final Location location;

  UserLocation(this.user, this.location);
}
```

Or relied on:

```dart
Map<String, dynamic>
```

Neither approach was ideal.

Records eliminate unnecessary classes.

Pattern matching simplifies conditional logic.

Sealed classes improve type safety.

Together they produce cleaner, more maintainable applications.

---

# Understanding Records

Records are immutable objects designed to group multiple values.

Instead of creating a dedicated class:

```dart
class Point {
  final int x;
  final int y;

  Point(this.x, this.y);
}
```

You can simply write:

```dart
(int, int)
```

Returning a record:

```dart
(String, int) getUser() {
  return ("Alice", 30);
}
```

Using it:

```dart
final user = getUser();

print(user.$1);
print(user.$2);
```

---

# Named Records

Named fields improve readability.

```dart
({String name, int age})
```

Example:

```dart
({String name, int age}) user() {
  return (
    name: "Alice",
    age: 30,
  );
}
```

Access:

```dart
final data = user();

print(data.name);
print(data.age);
```

Named records are generally preferred in production code.

---

# Mixed Records

Records can mix positional and named values.

```dart
(int, int, {String label})
```

Example:

```dart
(
  120,
  240,
  label: "Screen"
)
```

---

# Record Equality

Unlike ordinary objects, records compare by value.

```dart
final a = (1, 2);

final b = (1, 2);

print(a == b);
```

Output:

```text
true
```

No custom equality implementation is required.

---

# Record Destructuring

Destructuring extracts values directly.

Instead of:

```dart
final user = getUser();

final name = user.$1;
final age = user.$2;
```

Use:

```dart
final (name, age) = getUser();
```

Cleaner.

More expressive.

Less boilerplate.

---

Named records:

```dart
final (
  :name,
  :age,
) = user();
```

---

# Pattern Matching

Pattern matching allows values to be inspected and destructured simultaneously.

Example:

```dart
switch (shape) {
  case Circle(radius: final r):
    print(r);

  case Rectangle(
    width: final w,
    height: final h,
  ):
    print(w * h);
}
```

Notice how matching and variable extraction happen together.

---

# Variable Patterns

Simple destructuring:

```dart
final (x, y) = (10, 20);

print(x);
print(y);
```

No intermediate variables required.

---

# List Patterns

Lists can be matched directly.

```dart
switch (numbers) {
  case [1, 2]:
    print("Two numbers");

  case [1, _, _]:
    print("Three values");

  default:
    print("Other");
}
```

---

# Rest Patterns

Capture remaining values.

```dart
switch (numbers) {
  case [1, ...rest]:
    print(rest);
}
```

Useful for parsers.

---

# Map Patterns

Pattern matching also supports maps.

```dart
switch (json) {
  case {
    "name": String name,
    "age": int age,
  }:
    print(name);
}
```

No manual casting.

---

# Object Patterns

Objects become easier to inspect.

```dart
switch (user) {
  case User(
    name: final name,
    age: final age,
  ):
    print(name);
}
```

---

# Switch Expressions

Switch is now an expression.

Instead of:

```dart
String color;

switch(status) {
  case 200:
    color = "green";
    break;

  default:
    color = "red";
}
```

Use:

```dart
final color = switch (status) {
  200 => "green",
  _ => "red",
};
```

Less code.

No mutable variables.

---

# Guard Clauses

Patterns support conditions.

```dart
switch(user) {
  case User(age: >=18):
    print("Adult");

  case User():
    print("Minor");
}
```

---

# Sealed Classes

One of Dart 3's most powerful additions.

A sealed class restricts inheritance to the current library.

Example:

```dart
sealed class LoginState {}
```

Subclasses:

```dart
class Loading extends LoginState {}

class Success extends LoginState {}

class Error extends LoginState {
  final String message;

  Error(this.message);
}
```

No external code can create additional subclasses.

---

# Exhaustive Checking

Because the compiler knows every subclass, it ensures every case is handled.

```dart
switch(state) {
  case Loading():
  case Success():
  case Error():
}
```

Forget one?

The compiler warns you.

This eliminates many runtime bugs.

---

# Modeling Application State

Sealed classes are perfect for Flutter state management.

```dart
sealed class UserState {}

class Initial extends UserState {}

class Loading extends UserState {}

class Loaded extends UserState {
  final User user;

  Loaded(this.user);
}

class Error extends UserState {
  final String message;

  Error(this.message);
}
```

UI becomes straightforward.

```dart
switch(state) {
  case Initial():
  case Loading():
  case Loaded(user: final user):
  case Error(message: final message):
}
```

No nullable fields.

No boolean flags.

No impossible states.

---

# Combining Records and Patterns

Records and patterns complement each other beautifully.

Returning multiple values:

```dart
(String, int) user() {
  return ("Alice", 30);
}
```

Destructuring:

```dart
final (name, age) = user();
```

Pattern matching:

```dart
switch(user()) {
  case ("Alice", final age):
    print(age);
}
```

Elegant and concise.

---

# Flutter Use Cases

These features integrate naturally into Flutter.

Examples include:

- Authentication states
- API responses
- Navigation
- Form validation
- Search filters
- Shopping carts
- Media players
- Payment flows

Rather than juggling nullable values, developers can model explicit application states.

---

# Performance Considerations

These language features are designed for efficiency.

Benefits include:

- Fewer temporary classes
- Less boilerplate
- Strong compile-time optimization
- Better type inference
- Safer refactoring
- Reduced runtime checks

In most cases, readability improves without sacrificing performance.

---

# Best Practices

## Prefer Named Records

Instead of:

```dart
(String, int)
```

Prefer:

```dart
({String name, int age})
```

Named fields improve readability.

---

## Use Sealed Classes for Finite States

Authentication.

Network requests.

Media playback.

Order processing.

These all have a known number of states.

Model them with sealed classes.

---

## Avoid Large Records

Records should group related values.

If a record contains ten fields, consider creating a dedicated model instead.

---

## Prefer Pattern Matching

Instead of nested:

```dart
if

else if

else
```

Use:

```dart
switch
```

Pattern matching is usually clearer.

---

## Keep Business Logic Immutable

Records are immutable by design.

Combine them with immutable models for safer applications.

---

# Common Mistakes

### Using Records as Domain Models

Records are ideal for temporary grouped values.

Business entities should still be represented by dedicated classes.

---

### Overusing Positional Fields

This:

```dart
(String, String, int, bool)
```

is difficult to understand.

Prefer named records.

---

### Ignoring Exhaustiveness

If the compiler warns about a missing case, fix it.

Don't silence the warning.

---

### Creating Deep Pattern Trees

Pattern matching should improve readability—not reduce it.

Break large expressions into smaller functions when appropriate.

---

# Production Checklist

## Records

- ✅ Prefer named records
- ✅ Use records for temporary grouped values
- ✅ Avoid oversized records

## Pattern Matching

- ✅ Prefer switch expressions
- ✅ Use destructuring
- ✅ Leverage object patterns
- ✅ Handle all cases

## Sealed Classes

- ✅ Model finite application states
- ✅ Keep subclasses immutable
- ✅ Use exhaustive switching

## Flutter

- ✅ Replace boolean state flags
- ✅ Improve UI state modeling
- ✅ Reduce nullable properties
- ✅ Simplify asynchronous workflows

---

# Conclusion

Dart 3 marks a significant milestone in the language's evolution. Records, pattern matching, and sealed classes are more than convenience features—they encourage a more declarative, expressive, and type-safe style of programming.

Records simplify returning and handling multiple values without creating unnecessary model classes. Pattern matching replaces verbose conditional logic with concise, readable expressions that combine type checking and data extraction. Sealed classes enable the compiler to enforce exhaustive handling of finite states, reducing runtime errors and making complex workflows easier to reason about.

For Flutter developers, these features are especially valuable. They lead to cleaner state management, more maintainable architectures, and user interfaces that accurately reflect application state with less boilerplate.

As you adopt Dart 3, look for opportunities to replace ad hoc data structures with records, simplify branching logic through pattern matching, and model finite workflows using sealed classes. The result is code that is easier to read, safer to refactor, and better prepared for long-term growth.