---
sidebar_position: 20
title: Libraries & Packages
description: Imports, aliases, pubspec.yaml configuration, package management, and creating custom libraries in Dart.
---

---

## Importing Libraries

```dart
// Dart core libraries
import 'dart:core';       // always imported (String, int, List, etc.)
import 'dart:math';       // sqrt, pow, Random, pi, e
import 'dart:convert';    // jsonEncode, jsonDecode, base64, utf8
import 'dart:io';         // File, Directory, HttpClient (not in Flutter web)
import 'dart:async';      // Future, Stream, Timer, Completer
import 'dart:collection'; // Queue, LinkedHashMap, SplayTreeMap, etc.
import 'dart:typed_data'; // Uint8List, ByteData (binary data)

// External packages
import 'package:http/http.dart' as http;
import 'package:shared_preferences/shared_preferences.dart';

// Your own files
import 'utils/string_utils.dart';
import '../models/user.dart';
```

---

## Import Modifiers

```dart
// Alias to avoid name conflicts
import 'dart:math' as math;
import 'package:vector_math/vector_math.dart' as vec;

math.sqrt(16);   // 4.0
vec.Vector2(1, 2);

// Show — only import specific names
import 'dart:math' show sqrt, pi, Random;
// Now can use sqrt, pi, Random without prefix

// Hide — import everything EXCEPT specific names
import 'package:flutter/material.dart' hide Colors;
import 'my_colors.dart'; // my own Colors class
```

---

## pubspec.yaml

```yaml
name: my_flutter_app
description: A Flutter application
version: 1.2.0+3    # semver + build number

environment:
  sdk: '>=3.0.0 <4.0.0'
  flutter: '>=3.10.0'

dependencies:
  flutter:
    sdk: flutter

  # Popular packages (check pub.dev for latest versions)
  http: ^1.1.0               # HTTP requests
  provider: ^6.1.0           # State management
  go_router: ^12.0.0         # Routing
  shared_preferences: ^2.2.0  # Local key-value storage
  sqflite: ^2.3.0            # SQLite database
  dio: ^5.3.0                # Advanced HTTP client
  freezed_annotation: ^2.4.0 # Immutable classes
  json_annotation: ^4.8.0    # JSON serialization
  riverpod: ^2.4.0           # State management (alternative)

dev_dependencies:
  flutter_test:
    sdk: flutter
  flutter_lints: ^3.0.0      # Lint rules
  build_runner: ^2.4.0       # Code generation
  freezed: ^2.4.0            # Code generator for freezed
  json_serializable: ^6.7.0  # Code generator for JSON

flutter:
  uses-material-design: true
  assets:
    - assets/images/
    - assets/fonts/
  fonts:
    - family: Roboto
      fonts:
        - asset: assets/fonts/Roboto-Regular.ttf
```

```bash
# Commands
dart pub get          # install dependencies
dart pub upgrade      # upgrade all to latest
dart pub outdated     # show outdated packages
dart pub add http     # add a package
dart pub remove http  # remove a package

# Flutter equivalent
flutter pub get
flutter pub upgrade
```

---

## Creating Your Own Libraries

```dart
// lib/src/utils.dart — private implementation
String _formatName(String name) => name.trim().capitalize();

// lib/models/user.dart
part of 'user_library.dart'; // part of a library

// lib/user_library.dart — the library
library user_library;

part 'user_model.dart';

class UserRepository { }

// lib/my_package.dart — the public API
library;

export 'src/string_utils.dart';
export 'src/date_utils.dart';
export 'models/user.dart' hide InternalUser;
export 'models/product.dart' show Product, ProductStatus;
```

---

## Useful pub.dev Packages

| Package | Purpose |
|---------|---------|
| `http` | Simple HTTP requests |
| `dio` | Advanced HTTP with interceptors |
| `provider` / `riverpod` | State management |
| `go_router` | Declarative routing |
| `freezed` | Immutable data classes |
| `json_serializable` | JSON codegen |
| `shared_preferences` | Simple local storage |
| `sqflite` | SQLite for mobile |
| `hive` | Fast local NoSQL DB |
| `get_it` | Dependency injection |
| `mockito` | Mocking for tests |
| `bloc` | Business Logic Component pattern |
| `intl` | Internationalization |
| `path_provider` | Find file system paths |
| `image_picker` | Pick from camera/gallery |
