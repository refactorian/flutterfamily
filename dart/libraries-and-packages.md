---
sidebar_position: 20
title: Libraries & Packages
description: Imports, aliases, pubspec.yaml configuration, package management, and creating custom libraries in Dart.
---

Understanding how Dart organizes and shares code is essential for any real project. This chapter covers everything from `import` syntax to building your own packages.

---

## Dart's Library System

A **library** in Dart is simply a file (or a collection of files with `part`/`part of`). Every `.dart` file is a library by default.

```
Project structure
─────────────────────────────────────
my_app/
├── bin/
│   └── main.dart          ← executable entry point
├── lib/
│   ├── my_app.dart        ← main public API (barrel file)
│   ├── src/               ← private implementation
│   │   ├── auth.dart
│   │   ├── database.dart
│   │   └── utils.dart
│   └── models/
│       ├── user.dart
│       └── product.dart
├── test/
│   ├── auth_test.dart
│   └── user_test.dart
└── pubspec.yaml
```

> Files under `lib/src/` are **private by convention** — consumers of your package shouldn't import them directly, even though Dart doesn't enforce it technically (only `_` prefix makes things truly private within a file).

---

## Importing Libraries

```dart
// ── Dart SDK built-ins ─────────────────────────────────────────────
import 'dart:core';        // always auto-imported: String, int, List, etc.
import 'dart:math';        // sqrt, pow, Random, pi, e, sin, cos
import 'dart:convert';     // jsonEncode, jsonDecode, base64, utf8, latin1
import 'dart:async';       // Future, Stream, Timer, Completer, Zone
import 'dart:io';          // File, Directory, HttpClient, Platform, Process
                           // ⚠️  Not available in Flutter web builds
import 'dart:isolate';     // Isolate, SendPort, ReceivePort
import 'dart:collection';  // Queue, LinkedHashMap, SplayTreeMap, HashMap
import 'dart:typed_data';  // Uint8List, ByteData, Int32List — binary data
import 'dart:developer';   // log(), Timeline, inspect() — debugging tools
import 'dart:ffi';         // Foreign Function Interface — call C code
import 'dart:html';        // DOM API — web only (not available on native)

// ── External packages ───────────────────────────────────────────────
import 'package:http/http.dart';                 // HTTP client
import 'package:flutter/material.dart';          // Flutter Material
import 'package:shared_preferences/shared_preferences.dart';

// ── Your own files ──────────────────────────────────────────────────
import 'utils/string_utils.dart';    // relative — from current file
import '../models/user.dart';        // relative with ../ for parent dir
import 'package:my_app/models/user.dart'; // absolute package path
```

---

## Import Modifiers

### Prefix alias (`as`)

```dart
// Avoid name collisions with as
import 'dart:math' as math;
import 'dart:io' as io;
import 'package:vector_math/vector_math.dart' as vec;

math.sqrt(16);         // 4.0
math.pi;               // 3.14159...
io.File('data.txt');
vec.Vector2(1.0, 2.0);

// Useful when two packages export the same name
import 'package:http/http.dart'     as http;
import 'package:dio/dio.dart'       as dio;
// Now: http.get() vs dio.Dio()
```

### Show — import only specific names

```dart
import 'dart:math' show sqrt, pi, Random, pow;
// sqrt(16);  pi;  Random().nextInt(10);   ← all fine
// sin(x);    // ❌ not imported

import 'package:flutter/material.dart' show StatelessWidget, Widget, BuildContext;
```

### Hide — import everything except specific names

```dart
import 'dart:math' hide Rectangle;     // math has a Rectangle — hide it
import 'dart:ui'   hide Color;         // use your own Color class
import 'my_colors.dart';               // my Color class — no conflict
```

---

## Conditional Imports

Import different libraries depending on the platform:

```dart
// Platform-adaptive imports — common pattern for cross-platform packages
import 'storage_stub.dart'
    if (dart.library.io)   'storage_io.dart'
    if (dart.library.html) 'storage_web.dart';

// This imports:
// On native (mobile/desktop): storage_io.dart   — uses dart:io File
// On web:                     storage_web.dart  — uses dart:html localStorage
// Otherwise (tests/other):    storage_stub.dart — no-op / mock

// The stub must define the same public API
// storage_stub.dart:
abstract class Storage {
  Future<String?> read(String key);
  Future<void> write(String key, String value);
}
```

---

## Deferred Loading (Lazy Imports)

Load a library only when it's first used — reduces initial load time in web apps:

```dart
import 'package:some_big_library/charts.dart' deferred as charts;

Future<void> showChart() async {
  await charts.loadLibrary();   // download/initialize the library
  var chart = charts.LineChart(data: myData);
  // now safe to use
}

// In Flutter: useful for features not needed on startup
import 'heavy_feature.dart' deferred as heavy;

ElevatedButton(
  onPressed: () async {
    await heavy.loadLibrary();  // loads lazily on first press
    heavy.openFeature();
  },
  child: const Text('Open Feature'),
)
```

---

## Exporting — Building a Public API

```dart
// lib/my_package.dart — the barrel/entry file consumers import

// Export everything from a file
export 'src/models/user.dart';
export 'src/models/product.dart';

// Export only specific symbols
export 'src/auth.dart' show AuthService, AuthException;

// Export everything except internal symbols
export 'src/database.dart' hide DatabaseConfig, _ConnectionPool;

// Re-export with a prefix (Dart doesn't support this directly,
// but you can import+export in one library)

// Export with conditions (same as import conditions)
export 'src/platform/storage_stub.dart'
    if (dart.library.io)   'src/platform/storage_io.dart'
    if (dart.library.html) 'src/platform/storage_web.dart';
```

### The `part` / `part of` system (older style)

```dart
// lib/my_library.dart
library my_library;

part 'src/utils.dart';    // becomes part of this library
part 'src/models.dart';

// lib/src/utils.dart
part of 'my_library.dart'; // required — links back

// Both files share the same library scope:
// private _symbols in my_library.dart are visible in utils.dart
// Mostly used in generated code — prefer export for hand-written code
```

---

## pubspec.yaml — Project Manifest

```yaml
name: my_flutter_app
description: A clean Flutter application
version: 1.0.0+1           # version: semver  +  build number

# Minimum Dart/Flutter SDK
environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.10.0'

# Runtime dependencies
dependencies:
  flutter:
    sdk: flutter

  # Networking
  http: ^1.2.0             # Simple HTTP
  dio: ^5.4.0              # Advanced HTTP — interceptors, FormData, etc.

  # State management
  flutter_riverpod: ^2.5.0
  # OR: provider, bloc, get — choose one

  # Navigation
  go_router: ^13.0.0

  # Local storage
  shared_preferences: ^2.2.0   # simple key-value
  sqflite: ^2.3.0              # SQLite
  hive_flutter: ^1.1.0         # fast NoSQL

  # Utilities
  freezed_annotation: ^2.4.0   # immutable data classes
  json_annotation: ^4.8.0      # JSON serialization
  intl: ^0.19.0                # i18n, date/number formatting
  path_provider: ^2.1.0        # find device paths
  get_it: ^7.6.0               # dependency injection

  # From a git repo (not pub.dev)
  some_package:
    git:
      url: https://github.com/user/some_package.git
      ref: main                # branch / tag / commit

  # From a local path (monorepo / development)
  shared_ui:
    path: ../shared_ui

# Development-only dependencies (not included in app build)
dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^4.0.0       # recommended lint rules
  build_runner: ^2.4.0        # code generation runner
  freezed: ^2.4.0             # generates copyWith, ==, toString
  json_serializable: ^6.7.0   # generates fromJson / toJson
  mockito: ^5.4.0             # mock generation for tests
  very_good_analysis: ^6.0.0  # stricter lints (optional)

# Flutter-specific configuration
flutter:
  uses-material-design: true

  assets:
    - assets/images/logo.png
    - assets/images/          # include whole directory
    - assets/data/config.json

  fonts:
    - family: Inter
      fonts:
        - asset: assets/fonts/Inter-Regular.ttf
        - asset: assets/fonts/Inter-Bold.ttf
          weight: 700
        - asset: assets/fonts/Inter-Italic.ttf
          style: italic
```

---

## pub Commands

```bash
# Install / sync dependencies
dart pub get
flutter pub get

# Upgrade all packages to latest compatible version
dart pub upgrade

# Upgrade a specific package
dart pub upgrade http

# Check for newer versions (won't change pubspec)
dart pub outdated

# Add a package (updates pubspec.yaml automatically)
dart pub add http
dart pub add --dev mockito       # dev dependency
flutter pub add provider

# Remove a package
dart pub remove http

# Run a pub global tool
dart pub global activate fvm     # install
fvm flutter run                  # use it

# Show dependency tree
dart pub deps

# Publish your own package
dart pub publish --dry-run       # check without publishing
dart pub publish                 # publish to pub.dev
```

---

## Useful pub.dev Packages

### Networking & APIs
| Package | Stars | Purpose |
|---------|-------|---------|
| `http` | ⭐⭐⭐⭐⭐ | Simple HTTP requests |
| `dio` | ⭐⭐⭐⭐⭐ | Advanced HTTP — interceptors, retry, FormData |
| `retrofit` | ⭐⭐⭐⭐ | Type-safe REST client via code gen |
| `graphql_flutter` | ⭐⭐⭐ | GraphQL client |

### State Management
| Package | Stars | Purpose |
|---------|-------|---------|
| `flutter_riverpod` | ⭐⭐⭐⭐⭐ | Modern, testable state management |
| `provider` | ⭐⭐⭐⭐⭐ | Simple InheritedWidget wrapper |
| `flutter_bloc` | ⭐⭐⭐⭐⭐ | BLoC/Cubit pattern |
| `get` / `getx` | ⭐⭐⭐⭐ | Simple, opinionated — routing + state |
| `mobx` | ⭐⭐⭐ | Observable reactive state |

### Data & Storage
| Package | Stars | Purpose |
|---------|-------|---------|
| `sqflite` | ⭐⭐⭐⭐⭐ | SQLite — relational local DB |
| `hive` | ⭐⭐⭐⭐⭐ | Fast local NoSQL (key-value with types) |
| `shared_preferences` | ⭐⭐⭐⭐⭐ | Simple persistent key-value store |
| `isar` | ⭐⭐⭐⭐ | Fast local DB with query language |
| `drift` | ⭐⭐⭐⭐ | Type-safe SQLite with code gen |

### Code Generation & Utilities
| Package | Stars | Purpose |
|---------|-------|---------|
| `freezed` | ⭐⭐⭐⭐⭐ | Immutable classes, unions, copyWith |
| `json_serializable` | ⭐⭐⭐⭐⭐ | fromJson/toJson code gen |
| `built_value` | ⭐⭐⭐⭐ | Immutable values (older alternative to freezed) |
| `equatable` | ⭐⭐⭐⭐ | Value equality without boilerplate |

### Testing
| Package | Stars | Purpose |
|---------|-------|---------|
| `mockito` | ⭐⭐⭐⭐⭐ | Mock generation for unit tests |
| `mocktail` | ⭐⭐⭐⭐ | Mocking without code gen |
| `golden_toolkit` | ⭐⭐⭐⭐ | Golden image (screenshot) tests |
| `patrol` | ⭐⭐⭐ | End-to-end Flutter testing |

---

## Creating and Publishing Your Own Package

```bash
# Create a new package
dart create --template=package my_utils

# Package structure
my_utils/
├── lib/
│   ├── my_utils.dart          ← public API (barrel file)
│   └── src/
│       ├── string_utils.dart  ← private implementation
│       └── date_utils.dart
├── test/
│   └── my_utils_test.dart
├── example/
│   └── main.dart
├── pubspec.yaml
├── README.md
├── CHANGELOG.md
└── LICENSE

# lib/my_utils.dart — barrel file
library my_utils;

export 'src/string_utils.dart';
export 'src/date_utils.dart' hide _InternalHelper;
```

---

## Summary

| Topic | Key Points |
|-------|------------|
| `import 'dart:x'` | Built-in Dart SDK library |
| `import 'package:x/x.dart'` | External or own package |
| `import 'path.dart'` | Relative path in same package |
| `as name` | Alias to avoid name conflicts |
| `show A, B` | Import only named symbols |
| `hide A, B` | Import all except named symbols |
| `deferred as x` | Lazy-load — useful for web |
| `export` | Build a public API from private parts |
| `part` / `part of` | Share library scope (mostly for codegen) |
| Conditional import | Different impl per platform |
| `pubspec.yaml` | Project manifest and dependency list |
| `dart pub get` | Install dependencies |
