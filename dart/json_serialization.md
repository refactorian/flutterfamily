---
sidebar_position: 26
title: JSON & Serialization
description: Parse and encode JSON in Dart using dart:convert, manual fromJson/toJson, json_serializable code generation, and immutable models with freezed.
---

Almost every Dart app talks to an API. This chapter covers the complete journey: from manually writing `fromJson`/`toJson`, to generating them automatically with `json_serializable`, to full immutable models with `freezed`.

---

## The Core Problem

```dart
// What an API returns — untyped, error-prone
Map<String, dynamic> raw = {
  'id': 1,
  'name': 'Alice',
  'email': 'alice@example.com',
  'is_active': true,
  'created_at': '2024-01-15T10:30:00.000Z',
  'address': {
    'city': 'Dhaka',
    'country': 'Bangladesh',
  },
  'tags': ['admin', 'verified'],
};

// Without serialization — fragile, no IDE help
var name = raw['name'];          // dynamic — could be anything
var city = raw['address']['city']; // ❌ crashes if address is null

// With serialization — typed, safe, documented
User user = User.fromJson(raw);
print(user.name);                // String — IDE knows the type
print(user.address?.city);       // String? — null safety enforced
```

---

## `dart:convert` — The Foundation

Everything builds on `dart:convert`:

```dart
import 'dart:convert';

// Encode Dart object → JSON string
Map<String, dynamic> data = {'name': 'Alice', 'age': 30};
String json = jsonEncode(data);
print(json); // {"name":"Alice","age":30}

// Decode JSON string → Dart object
String raw = '{"name":"Alice","age":30}';
Map<String, dynamic> parsed = jsonDecode(raw) as Map<String, dynamic>;
print(parsed['name']); // Alice

// Decode a JSON array
String rawList = '[{"id":1},{"id":2}]';
List<dynamic> list = jsonDecode(rawList) as List<dynamic>;
// Cast each element:
List<Map<String, dynamic>> typed =
    list.map((e) => e as Map<String, dynamic>).toList();

// Pretty-print JSON (for logging / debugging)
const encoder = JsonEncoder.withIndent('  ');
print(encoder.convert(data));
// {
//   "name": "Alice",
//   "age": 30
// }

// Handle invalid JSON safely
String? parseJsonSafely(String raw) {
  try {
    return jsonDecode(raw).toString();
  } on FormatException catch (e) {
    print('Invalid JSON: ${e.message}');
    return null;
  }
}
```

### Supported JSON types

```dart
// JSON        → Dart
// string      → String
// number      → int or double
// boolean     → bool
// null        → null
// array       → List<dynamic>
// object      → Map<String, dynamic>

// Types that are NOT directly JSON-serializable:
// DateTime, Uri, Enum, custom classes — must convert manually
```

---

## Manual Serialization — `fromJson` / `toJson`

The foundational pattern. Write it yourself — no packages needed:

```dart
class Address {
  final String city;
  final String country;

  const Address({required this.city, required this.country});

  // Deserialize — JSON Map → Dart object
  factory Address.fromJson(Map<String, dynamic> json) => Address(
        city:    json['city']    as String,
        country: json['country'] as String,
      );

  // Serialize — Dart object → JSON Map
  Map<String, dynamic> toJson() => {
        'city':    city,
        'country': country,
      };

  @override
  String toString() => 'Address($city, $country)';
}

class User {
  final int id;
  final String name;
  final String email;
  final bool isActive;
  final DateTime createdAt;
  final Address? address;
  final List<String> tags;

  const User({
    required this.id,
    required this.name,
    required this.email,
    required this.isActive,
    required this.createdAt,
    this.address,
    this.tags = const [],
  });

  factory User.fromJson(Map<String, dynamic> json) => User(
        id:        json['id']         as int,
        name:      json['name']       as String,
        email:     json['email']      as String,
        isActive:  json['is_active']  as bool? ?? false,

        // DateTime needs manual parsing
        createdAt: DateTime.parse(json['created_at'] as String),

        // Nested object — null-safe
        address: json['address'] == null
            ? null
            : Address.fromJson(json['address'] as Map<String, dynamic>),

        // List of primitives
        tags: (json['tags'] as List<dynamic>?)
                ?.map((e) => e as String)
                .toList() ??
            [],
      );

  Map<String, dynamic> toJson() => {
        'id':         id,
        'name':       name,
        'email':      email,
        'is_active':  isActive,
        'created_at': createdAt.toIso8601String(),
        if (address != null) 'address': address!.toJson(),
        'tags':       tags,
      };

  // Immutable update
  User copyWith({
    int? id,
    String? name,
    String? email,
    bool? isActive,
    DateTime? createdAt,
    Address? address,
    List<String>? tags,
  }) =>
      User(
        id:        id        ?? this.id,
        name:      name      ?? this.name,
        email:     email     ?? this.email,
        isActive:  isActive  ?? this.isActive,
        createdAt: createdAt ?? this.createdAt,
        address:   address   ?? this.address,
        tags:      tags      ?? this.tags,
      );

  @override
  bool operator ==(Object other) =>
      other is User && id == other.id && email == other.email;

  @override
  int get hashCode => Object.hash(id, email);

  @override
  String toString() => 'User($id, $name)';
}

// Usage
void main() {
  final json = {
    'id': 1,
    'name': 'Alice',
    'email': 'alice@example.com',
    'is_active': true,
    'created_at': '2024-01-15T10:30:00.000Z',
    'address': {'city': 'Dhaka', 'country': 'Bangladesh'},
    'tags': ['admin', 'verified'],
  };

  final user = User.fromJson(json);
  print(user.name);           // Alice
  print(user.address?.city);  // Dhaka
  print(user.tags);           // [admin, verified]

  // Round-trip: object → JSON → object
  final encoded = jsonEncode(user.toJson());
  final decoded = User.fromJson(jsonDecode(encoded) as Map<String, dynamic>);
  print(user == decoded);     // true
}
```

---

## Handling Lists of Objects

```dart
// Decode a JSON array into a typed List
String responseBody = '[{"id":1,"name":"Alice"},{"id":2,"name":"Bob"}]';

List<User> parseUserList(String json) {
  final list = jsonDecode(json) as List<dynamic>;
  return list
      .map((item) => User.fromJson(item as Map<String, dynamic>))
      .toList();
}

// Generic helper — reusable for any type
List<T> parseList<T>(String json, T Function(Map<String, dynamic>) fromJson) {
  final list = jsonDecode(json) as List<dynamic>;
  return list.map((e) => fromJson(e as Map<String, dynamic>)).toList();
}

// Usage
final users    = parseList(responseBody, User.fromJson);
final products = parseList(productJson,  Product.fromJson);
```

---

## Enums in JSON

```dart
enum UserRole { admin, editor, viewer, guest }

// ── Option 1: by name (simplest)
UserRole roleFromJson(String s) => UserRole.values.byName(s);
String   roleToJson(UserRole r) => r.name;
// JSON: "admin" ↔ UserRole.admin

// ── Option 2: custom API values (when API uses different strings)
enum OrderStatus {
  pending('PENDING'),
  processing('IN_PROGRESS'),
  shipped('SHIPPED'),
  cancelled('CANCELLED');

  final String apiValue;
  const OrderStatus(this.apiValue);

  static OrderStatus fromJson(String value) => values.firstWhere(
        (s) => s.apiValue == value,
        orElse: () => throw FormatException('Unknown status: $value'),
      );

  String toJson() => apiValue;
}
// JSON: "IN_PROGRESS" ↔ OrderStatus.processing

// ── Option 3: integer codes
enum Priority { low, medium, high, critical }

Priority priorityFromJson(int code) => switch (code) {
      0 => Priority.low,
      1 => Priority.medium,
      2 => Priority.high,
      3 => Priority.critical,
      _ => throw FormatException('Unknown priority: $code'),
    };

int priorityToJson(Priority p) => p.index;
// JSON: 2 ↔ Priority.high
```

---

## Safe Parsing — Defensive Patterns

APIs are unpredictable. Always code defensively:

```dart
// Helper to safely cast a field with a fallback
T? castOrNull<T>(dynamic value) => value is T ? value : null;

factory User.fromJson(Map<String, dynamic> json) {
  // ✅ Safe int — API might send "1" instead of 1
  final rawId = json['id'];
  final id = rawId is int
      ? rawId
      : int.tryParse(rawId?.toString() ?? '') ?? 0;

  // ✅ Safe String with fallback
  final name = json['name'] as String? ?? 'Unknown';

  // ✅ Safe bool — API might send 0/1 instead of true/false
  final rawActive = json['is_active'];
  final isActive  = rawActive is bool
      ? rawActive
      : rawActive == 1 || rawActive == '1' || rawActive == 'true';

  // ✅ Safe DateTime — null or bad format
  final rawDate  = json['created_at'] as String?;
  final createdAt = rawDate != null
      ? DateTime.tryParse(rawDate) ?? DateTime.now()
      : DateTime.now();

  // ✅ Safe nested object
  final rawAddress = json['address'];
  final address = rawAddress is Map<String, dynamic>
      ? Address.fromJson(rawAddress)
      : null;

  // ✅ Safe list with type filtering
  final rawTags = json['tags'];
  final tags = rawTags is List
      ? rawTags.whereType<String>().toList()
      : <String>[];

  return User(
    id: id, name: name, email: json['email'] as String? ?? '',
    isActive: isActive, createdAt: createdAt,
    address: address, tags: tags,
  );
}
```

---

## Code Generation with `json_serializable`

For large projects, writing `fromJson`/`toJson` by hand gets tedious. `json_serializable` generates them:

### Setup

```yaml
# pubspec.yaml
dependencies:
  json_annotation: ^4.9.0

dev_dependencies:
  build_runner: ^2.4.0
  json_serializable: ^6.8.0
```

### Annotate your class

```dart
// lib/src/models/user.dart
import 'package:json_annotation/json_annotation.dart';

// Links to the generated file
part 'user.g.dart';

@JsonSerializable(
  explicitToJson: true,   // serialize nested objects too (not just their toString)
  includeIfNull: false,   // omit null fields from toJson output
)
class User {
  final int    id;
  final String name;

  // Map JSON key 'is_active' to Dart field 'isActive'
  @JsonKey(name: 'is_active')
  final bool isActive;

  // Custom DateTime parsing/formatting
  @JsonKey(
    name: 'created_at',
    fromJson: _dateFromJson,
    toJson:   _dateToJson,
  )
  final DateTime createdAt;

  // Provide a default when field is missing
  @JsonKey(defaultValue: [])
  final List<String> tags;

  // Exclude a field from serialization entirely
  @JsonKey(includeFromJson: false, includeToJson: false)
  final bool isDirty;

  final Address? address;

  const User({
    required this.id,
    required this.name,
    required this.isActive,
    required this.createdAt,
    this.tags    = const [],
    this.address,
    this.isDirty = false,
  });

  // Generated — do not write these by hand
  factory User.fromJson(Map<String, dynamic> json) => _$UserFromJson(json);
  Map<String, dynamic> toJson() => _$UserToJson(this);

  // Custom converters used by @JsonKey
  static DateTime _dateFromJson(String s) => DateTime.parse(s);
  static String   _dateToJson(DateTime d)  => d.toIso8601String();
}

@JsonSerializable()
class Address {
  final String city;
  final String country;

  const Address({required this.city, required this.country});

  factory Address.fromJson(Map<String, dynamic> json) => _$AddressFromJson(json);
  Map<String, dynamic> toJson() => _$AddressToJson(this);
}
```

### Generate

```bash
# Generate once
dart run build_runner build

# Watch for changes and regenerate automatically (during development)
dart run build_runner watch

# Flutter
flutter pub run build_runner build --delete-conflicting-outputs
```

This creates `user.g.dart` containing `_$UserFromJson` and `_$UserToJson`. **Never edit `.g.dart` files** — they are always overwritten.

### Common `@JsonKey` options

```dart
@JsonKey(name: 'user_name')          // different JSON key
@JsonKey(defaultValue: 0)            // fallback when field missing
@JsonKey(required: true)             // throw if field missing
@JsonKey(ignore: true)               // skip this field entirely
@JsonKey(includeToJson: false)       // only read, never write
@JsonKey(includeFromJson: false)     // only write, never read
@JsonKey(fromJson: parseDate, toJson: formatDate) // custom converter
@JsonKey(unknownEnumValue: Status.unknown) // safe enum fallback
```

---

## Full Immutable Models with `freezed`

`freezed` combines immutability, `copyWith`, `==`, `toString`, union types, and JSON all in one annotation. It's the most popular pattern in Flutter apps:

### Setup

```yaml
dependencies:
  freezed_annotation: ^2.4.0
  json_annotation:    ^4.9.0

dev_dependencies:
  build_runner:     ^2.4.0
  freezed:          ^2.5.0
  json_serializable: ^6.8.0
```

### Simple model

```dart
// lib/src/models/product.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product.freezed.dart';
part 'product.g.dart';

@freezed
class Product with _$Product {
  const factory Product({
    required int    id,
    required String name,
    required double price,
    @Default(true)  bool inStock,
    @Default([])    List<String> images,
    String? description,
  }) = _Product;

  factory Product.fromJson(Map<String, dynamic> json) =>
      _$ProductFromJson(json);
}
```

```bash
dart run build_runner build
```

Generated for free — no boilerplate to write:

```dart
// All of this is auto-generated:
final p = Product(id: 1, name: 'Shoes', price: 49.99);

// copyWith — immutable update
final discounted = p.copyWith(price: 39.99);

// Deep equality
print(p == Product(id: 1, name: 'Shoes', price: 49.99)); // true

// toString
print(p); // Product(id: 1, name: Shoes, price: 49.99, ...)

// JSON
final json = p.toJson();       // Map<String, dynamic>
final back = Product.fromJson(json); // Product
```

### Union types (sealed-like discriminated unions)

`freezed` also generates sealed-style union types — perfect for UI states:

```dart
// lib/src/state/product_state.dart
import 'package:freezed_annotation/freezed_annotation.dart';

part 'product_state.freezed.dart';

@freezed
sealed class ProductState with _$ProductState {
  const factory ProductState.initial()               = ProductInitial;
  const factory ProductState.loading()               = ProductLoading;
  const factory ProductState.loaded(List<Product> products) = ProductLoaded;
  const factory ProductState.error(String message)   = ProductError;
}
```

```dart
// In your widget — exhaustive, no default needed
Widget build(BuildContext context) {
  return switch (state) {
    ProductInitial()              => const SizedBox.shrink(),
    ProductLoading()              => const CircularProgressIndicator(),
    ProductLoaded(:var products)  => ProductList(products: products),
    ProductError(:var message)    => ErrorView(message: message),
  };
}
```

---

## Making HTTP Requests + Parsing

Putting it all together with the `http` package:

```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

class UserApiClient {
  final http.Client _client;
  final String _baseUrl;

  UserApiClient({
    http.Client? client,
    String baseUrl = 'https://api.example.com',
  })  : _client  = client ?? http.Client(),
        _baseUrl = baseUrl;

  // Fetch a single user
  Future<User> getUser(int id) async {
    final uri      = Uri.parse('$_baseUrl/users/$id');
    final response = await _client.get(uri, headers: _headers);

    _checkStatus(response);

    final json = jsonDecode(response.body) as Map<String, dynamic>;
    return User.fromJson(json);
  }

  // Fetch a list of users
  Future<List<User>> getUsers({int page = 1, int limit = 20}) async {
    final uri = Uri.parse('$_baseUrl/users').replace(
      queryParameters: {'page': '$page', 'limit': '$limit'},
    );
    final response = await _client.get(uri, headers: _headers);

    _checkStatus(response);

    final list = jsonDecode(response.body) as List<dynamic>;
    return list
        .map((e) => User.fromJson(e as Map<String, dynamic>))
        .toList();
  }

  // Create a user
  Future<User> createUser(CreateUserRequest request) async {
    final uri      = Uri.parse('$_baseUrl/users');
    final response = await _client.post(
      uri,
      headers: _headers,
      body:    jsonEncode(request.toJson()),
    );

    _checkStatus(response);

    return User.fromJson(
      jsonDecode(response.body) as Map<String, dynamic>,
    );
  }

  // Shared headers
  Map<String, String> get _headers => {
        'Content-Type': 'application/json',
        'Accept':       'application/json',
      };

  // Throw on non-2xx responses
  void _checkStatus(http.Response response) {
    if (response.statusCode >= 200 && response.statusCode < 300) return;

    // Try to parse the error body
    try {
      final body  = jsonDecode(response.body) as Map<String, dynamic>;
      final msg   = body['message'] as String? ?? 'Unknown error';
      throw ApiException(response.statusCode, msg);
    } catch (_) {
      throw ApiException(response.statusCode, response.body);
    }
  }

  void close() => _client.close();
}

class ApiException implements Exception {
  final int    statusCode;
  final String message;
  const ApiException(this.statusCode, this.message);

  @override
  String toString() => 'ApiException($statusCode): $message';
}
```

---

## Pagination Pattern

```dart
// Typed wrapper for paginated API responses
class Page<T> {
  final List<T> items;
  final int     total;
  final int     page;
  final int     pageSize;

  const Page({
    required this.items,
    required this.total,
    required this.page,
    required this.pageSize,
  });

  bool get hasNextPage => page * pageSize < total;
  bool get hasPrevPage => page > 1;
  int  get totalPages  => (total / pageSize).ceil();

  factory Page.fromJson(
    Map<String, dynamic> json,
    T Function(Map<String, dynamic>) itemFromJson,
  ) =>
      Page(
        items:    (json['data'] as List<dynamic>)
                    .map((e) => itemFromJson(e as Map<String, dynamic>))
                    .toList(),
        total:    json['total']    as int,
        page:     json['page']     as int,
        pageSize: json['pageSize'] as int,
      );
}

// Usage
final page = Page.fromJson(responseJson, User.fromJson);
print('${page.items.length} of ${page.total} users');
print('Page ${page.page} of ${page.totalPages}');
```

---

## Local Storage — Caching JSON

```dart
import 'dart:convert';
import 'dart:io';

// Simple file-based JSON cache (pure Dart / server)
class JsonFileCache<T> {
  final String path;
  final T Function(Map<String, dynamic>) fromJson;
  final Map<String, dynamic> Function(T) toJson;

  JsonFileCache({
    required this.path,
    required this.fromJson,
    required this.toJson,
  });

  Future<void> write(T value) async {
    final file = File(path);
    await file.writeAsString(jsonEncode(toJson(value)));
  }

  Future<T?> read() async {
    final file = File(path);
    if (!await file.exists()) return null;
    try {
      final raw  = await file.readAsString();
      final json = jsonDecode(raw) as Map<String, dynamic>;
      return fromJson(json);
    } on FormatException {
      return null; // corrupt cache — treat as missing
    }
  }

  Future<void> clear() => File(path).delete();
}

// Flutter: use shared_preferences for simple values
// import 'package:shared_preferences/shared_preferences.dart';
//
// final prefs = await SharedPreferences.getInstance();
// await prefs.setString('user', jsonEncode(user.toJson()));
// final raw = prefs.getString('user');
// if (raw != null) final user = User.fromJson(jsonDecode(raw));
```

---

## Choosing the Right Approach

| Situation | Recommended approach |
|-----------|---------------------|
| 1–3 simple models | Manual `fromJson`/`toJson` |
| Many models, repetitive boilerplate | `json_serializable` + `build_runner` |
| Need immutability + `copyWith` + equality | `freezed` + `json_serializable` |
| Union/sealed types (UI states, Result) | `freezed` |
| Prototyping / quick scripts | Manual |
| Server-side Dart with complex schemas | `json_serializable` or hand-written |

---

## Summary

```dart
// 1. Decode raw JSON string
Map<String, dynamic> json = jsonDecode(rawString) as Map<String, dynamic>;
List<dynamic>        list = jsonDecode(rawString) as List<dynamic>;

// 2. Encode to JSON string
String encoded = jsonEncode(mapOrList);

// 3. Manual fromJson/toJson
factory T.fromJson(Map<String, dynamic> json) => T(field: json['field'] as Type);
Map<String, dynamic> toJson() => {'field': field};

// 4. List of objects
List<T> items = (jsonDecode(s) as List).map((e) => T.fromJson(e as Map<String,dynamic>)).toList();

// 5. Enums
UserRole.values.byName(json['role'] as String)  // from JSON
role.name                                        // to JSON

// 6. DateTime
DateTime.parse(json['created_at'] as String)    // from JSON
date.toIso8601String()                           // to JSON

// 7. Null-safe nested object
address: json['address'] == null
    ? null
    : Address.fromJson(json['address'] as Map<String, dynamic>)

// 8. json_serializable
@JsonSerializable(explicitToJson: true)
class MyModel {
  factory MyModel.fromJson(Map<String, dynamic> j) => _$MyModelFromJson(j);
  Map<String, dynamic> toJson() => _$MyModelToJson(this);
}

// 9. freezed
@freezed
class MyModel with _$MyModel {
  const factory MyModel({required String name}) = _MyModel;
  factory MyModel.fromJson(Map<String, dynamic> j) => _$MyModelFromJson(j);
}
```
