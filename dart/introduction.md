---
sidebar_position: 1
title: Introduction to Dart
description: What is Dart, why use it, how to set it up, and your first program.
---

> *"Dart is a client-optimized language for fast apps on any platform."* — dart.dev

---

## What Is Dart?

Dart is a **statically typed, object-oriented** programming language created by Google in 2011. It compiles to native machine code (for mobile/desktop), JavaScript (for web), and runs on the Dart VM (for servers/CLIs).

### Why Dart?

| Feature | Benefit |
|---------|---------|
| **Sound null safety** | Eliminates entire classes of null-pointer bugs |
| **AOT + JIT compilation** | Fast startup (AOT) + hot reload during development (JIT) |
| **Strong typing + inference** | Safety without verbosity |
| **Async-first design** | `async`/`await` built into the language |
| **Flutter's language** | Required for Flutter — the most popular cross-platform UI framework |
| **Familiar syntax** | Feels like Java/Kotlin/Swift — easy to pick up |

---

## Dart vs Other Languages

```
If you know...     Dart will feel like...
──────────────────────────────────────────
Java               Cleaner Java with modern features
Kotlin             Very similar — Dart is simpler in some ways
Swift              Close cousin — similar null safety model
JavaScript         Structured JS with types (and much safer)
Python             More verbose but catches errors at compile time
```

---

## Setting Up

### Option 1 — Install Dart SDK (standalone)

```bash
# macOS (Homebrew)
brew tap dart-lang/dart
brew install dart

# Windows (Chocolatey)
choco install dart-sdk

# Linux (apt)
sudo apt-get update
sudo apt-get install dart

# Verify
dart --version
# Dart SDK version: 3.x.x
```

### Option 2 — Install Flutter (includes Dart)

```bash
# Flutter includes the Dart SDK
# https://flutter.dev/docs/get-started/install
flutter --version
dart --version  # works after installing Flutter
```

### Editor Setup

- **VS Code**: Install the [Dart extension](https://marketplace.visualstudio.com/items?itemName=Dart-Code.dart-code)
- **IntelliJ / Android Studio**: Dart plugin built-in with Flutter plugin
- **Online**: [dartpad.dev](https://dartpad.dev) — no install needed!

---

## Your First Dart Program

```dart
// hello.dart

void main() {
  print('Hello, Dart! 🎯');
}
```

```bash
dart run hello.dart
# Hello, Dart! 🎯
```

### A More Interesting Example

```dart
// greet.dart

void main() {
  var name = 'Flutter Developer';
  var year = DateTime.now().year;

  print('Hello, $name!');
  print('Welcome to Dart in $year.');
  print('2 + 2 = ${2 + 2}');

  // Call a function
  greet(name: 'World', loud: true);
}

void greet({required String name, bool loud = false}) {
  var message = 'Hello, $name!';
  print(loud ? message.toUpperCase() : message);
}
```

---

## Creating a Dart Project

```bash
# Create a new CLI app
dart create my_app
cd my_app

# Project structure:
# my_app/
# ├── bin/
# │   └── my_app.dart    ← entry point
# ├── lib/
# │   └── my_app.dart    ← library code
# ├── test/
# │   └── my_app_test.dart
# └── pubspec.yaml        ← project config & dependencies
```

### pubspec.yaml

```yaml
name: my_app
description: My first Dart app
version: 1.0.0

environment:
  sdk: '>=3.0.0 <4.0.0'

dependencies:
  http: ^1.1.0        # add packages here

dev_dependencies:
  lints: ^3.0.0
  test: ^1.24.0
```

```bash
# Install dependencies
dart pub get

# Run the app
dart run

# Run tests
dart test

# Format code
dart format .

# Analyze for issues
dart analyze
```

---

## How Dart Compiles

```
Source (.dart)
     │
     ├──► JIT (Dart VM)         ← Development: fast hot reload
     │
     ├──► AOT (native binary)   ← Production: fast startup, small size
     │         dart compile exe app.dart
     │
     └──► JavaScript             ← Web: runs in browsers
               dart compile js app.dart
```

---

## Key Language Concepts at a Glance

```dart
// Everything is an object (even int, bool, null)
int x = 42;
x.toString();   // '42'
x.runtimeType;  // int

// Strong type inference
var name = 'Dart';        // inferred as String
var count = 0;            // inferred as int
var ratio = 3.14;         // inferred as double
var active = true;        // inferred as bool

// Sound null safety — nulls must be explicit
String nonNullable = 'hello';   // can NEVER be null
String? nullable = null;        // explicitly nullable

// Functions are first-class objects
var double = (int x) => x * 2;
print(double(5));  // 10

// Async built-in
Future<String> fetchData() async {
  await Future.delayed(Duration(seconds: 1));
  return 'Data loaded!';
}
```

---

## Dart's Type Hierarchy

```
Object
├── num
│   ├── int
│   └── double
├── String
├── bool
├── List<E>
├── Set<E>
├── Map<K, V>
├── Function
├── Symbol
├── Record
└── Null      (only null has type Null)
```

> In Dart, **everything is an object** — even `null`, `42`, and `true`.

---

## Comments

```dart
// Single-line comment

/*
  Multi-line comment
  spans multiple lines
*/

/// Documentation comment (shown in IDE tooltips)
/// Supports [markdown] and references to [ClassName.method].
///
/// Example:
/// ```dart
/// var result = add(1, 2); // 3
/// ```
int add(int a, int b) => a + b;
```

---

## Summary

- Dart is **statically typed**, **null-safe**, and **object-oriented**
- It compiles to native code, JS, or runs on the VM
- It's the language of **Flutter** — learning Dart = learning Flutter
- The `main()` function is the entry point of every program
- Use `dartpad.dev` to experiment without installing anything
