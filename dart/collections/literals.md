---
title: Collection Literals
sidebar_position: 16
description: Complete guide to Dart collection literals — list, set, and map syntax, collection if, collection for, spread operator, null-aware spread, and nested collections.
---

# Collection Literals

Dart has rich **literal syntax** for creating collections inline. Beyond the basic `[...]`, `{...}`, syntax, Dart supports `collection if`, `collection for`, the spread operator `...`, and null-aware spread `...?` — all directly inside literals.

---

## Basic Literals

### List Literal

```dart
// Inferred type: List<int>
var nums = [1, 2, 3, 4, 5];

// Explicit type
List<String> names = ['Alice', 'Bob', 'Carol'];
var typed = <double>[1.0, 2.5, 3.14];

// Empty list
var empty = <String>[];
List<int> emptyNums = [];
```

### Set Literal

```dart
// Inferred type: Set<int>
var primes = {2, 3, 5, 7, 11};

// Explicit type
Set<String> fruits = {'apple', 'banana', 'cherry'};
var typed = <String>{'red', 'green', 'blue'};

// ⚠️ CRITICAL: empty {} is a Map, NOT a Set!
var emptyMap = {};        // Map<dynamic, dynamic>
var emptySet = <int>{};  // Set<int> ✅
```

### Map Literal

```dart
// Inferred type: Map<String, int>
var scores = {'Alice': 90, 'Bob': 85, 'Carol': 92};

// Explicit type
Map<String, dynamic> config = {
  'host': 'localhost',
  'port': 8080,
  'debug': true,
};

// Empty map
var empty = <String, int>{};
Map<String, String> headers = {};
```

### Type Inference Rules

```dart
var a = [1, 2, 3];        // List<int>
var b = [1, 2.5, 3];      // List<num>  (widened)
var c = [1, 'hello'];     // List<Object> (widened)
var d = <int>[1, 2, 3];   // List<int>  (explicit)
```

---

## Spread Operator (`...`)

The spread operator inserts **all elements** of an iterable into a collection literal.

### Spreading Lists

```dart
var a = [1, 2, 3];
var b = [4, 5, 6];

// Combine two lists
var combined = [...a, ...b];
print(combined); // [1, 2, 3, 4, 5, 6]

// Add elements around a spread
var extended = [0, ...a, ...b, 7, 8];
print(extended); // [0, 1, 2, 3, 4, 5, 6, 7, 8]

// Spread in the middle
var inserted = [1, 2, ...[10, 20, 30], 3, 4];
print(inserted); // [1, 2, 10, 20, 30, 3, 4]
```

### Spreading into Sets

```dart
var setA = {1, 2, 3};
var setB = {3, 4, 5};

// Union via spread (creates a new Set)
var union = <int>{...setA, ...setB};
print(union); // {1, 2, 3, 4, 5}
```

### Spreading into Maps

```dart
var defaults = {'color': 'blue', 'size': 'medium'};
var overrides = {'color': 'red', 'weight': 'bold'};

// Later spreads override earlier ones for duplicate keys
var merged = {...defaults, ...overrides};
print(merged); // {color: red, size: medium, weight: bold}
```

### Shallow vs Deep Copy

```dart
var original = [1, 2, 3];
var copy = [...original];

copy.add(4);
print(original); // [1, 2, 3] — original unchanged

// NOTE: spread is a shallow copy
var nested = [[1, 2], [3, 4]];
var shallowCopy = [...nested];
shallowCopy[0].add(99); // mutates the inner list!
print(nested); // [[1, 2, 99], [3, 4]]
```

---

## Null-Aware Spread (`...?`)

Spreads `null` safely — if the value is `null`, nothing is inserted.

```dart
List<int>? maybeList = null;

// ❌ Without null-aware: throws if null
// var bad = [0, ...maybeList, 9];

// ✅ With null-aware: null means "insert nothing"
var safe = [0, ...?maybeList, 9];
print(safe); // [0, 9]

// Conditional data from an API
List<String>? extraFeatures = fetchFeaturesOrNull();
var allFeatures = [
  'feature_a',
  'feature_b',
  ...?extraFeatures, // only added if not null
];
```

```dart
// Practical: optional items based on conditions
String? userRole = getUserRole(); // might be null

Map<String, dynamic> payload = {
  'action': 'update',
  'timestamp': DateTime.now().toIso8601String(),
  ...?(userRole != null ? {'role': userRole} : null),
};
```

---

## `collection if`

Conditionally include elements in a collection literal.

### Basic `if`

```dart
bool isLoggedIn = true;
bool isPremium = false;

var menuItems = [
  'Home',
  'Explore',
  if (isLoggedIn) 'Profile',
  if (isLoggedIn) 'Settings',
  if (isPremium) 'Premium Content',
  'Help',
];
print(menuItems);
// [Home, Explore, Profile, Settings, Help]
```

### `if-else`

```dart
bool isDarkMode = true;

var themeConfig = {
  'mode': if (isDarkMode) 'dark' else 'light',
  'background': if (isDarkMode) '#1a1a1a' else '#ffffff',
  'text': if (isDarkMode) '#e2e8f0' else '#1a202c',
};
```

### Nested `if`

```dart
bool hasAdmin = true;
bool hasModerator = false;
bool hasBasic = true;

var permissions = [
  if (hasAdmin) ...[
    'read', 'write', 'delete', 'admin',
  ] else if (hasModerator) ...[
    'read', 'write', 'moderate',
  ] else if (hasBasic) ...[
    'read',
  ],
];
```

### `if` in Sets and Maps

```dart
bool showDebug = false;

Set<String> enabledFeatures = {
  'auth',
  'api',
  if (showDebug) 'debug_panel',
  if (showDebug) 'verbose_logging',
};

Map<String, dynamic> apiOptions = {
  'timeout': 30,
  'retries': 3,
  if (showDebug) 'logLevel': 'verbose',
  if (showDebug) 'traceRequests': true,
};
```

---

## `collection for`

Generate elements using a `for` loop directly inside a collection literal.

### Basic `for`

```dart
// Generate squares
var squares = [for (var i = 1; i <= 5; i++) i * i];
print(squares); // [1, 4, 9, 16, 25]

// Generate strings
var labels = [for (var i = 1; i <= 10; i++) 'Item $i'];
print(labels); // [Item 1, Item 2, ..., Item 10]

// Generate map entries
var indexMap = {for (var i = 0; i < 5; i++) i: 'value_$i'};
print(indexMap); // {0: value_0, 1: value_1, ..., 4: value_4}
```

### `for-in`

```dart
var fruits = ['apple', 'banana', 'cherry'];

// Transform each element
var upperFruits = [for (var f in fruits) f.toUpperCase()];
print(upperFruits); // [APPLE, BANANA, CHERRY]

// Filter + transform
var longFruits = [
  for (var f in fruits)
    if (f.length > 5) f.toUpperCase(),
];
print(longFruits); // [BANANA, CHERRY]

// Map entries from a list
var fruitMap = {for (var f in fruits) f: f.length};
print(fruitMap); // {apple: 5, banana: 6, cherry: 6}
```

### Nested `for`

```dart
// Multiplication table as a list of strings
var table = [
  for (var i = 1; i <= 3; i++)
    for (var j = 1; j <= 3; j++)
      '$i × $j = ${i * j}',
];
print(table);
// [1 × 1 = 1, 1 × 2 = 2, 1 × 3 = 3, 2 × 1 = 2, ...]

// 2D grid
var grid = [
  for (var row = 0; row < 3; row++)
    [for (var col = 0; col < 3; col++) row * 3 + col]
];
print(grid); // [[0,1,2], [3,4,5], [6,7,8]]
```

---

## Combining Everything

```dart
// Complex real-world example: building a navigation menu
bool isLoggedIn = true;
bool isAdmin = false;
List<String> extraItems = ['Help', 'FAQ'];

var navigation = [
  'Home',
  'Products',
  if (isLoggedIn) ...[
    'Profile',
    'Orders',
    if (isAdmin) 'Admin Panel',
  ] else
    'Login',
  for (var item in extraItems) item,
  ...?getPromotionalItems(), // nullable spread
];
```

```dart
// Building a filter query map dynamically
String? nameFilter = 'Alice';
int? minAgeFilter = 18;
int? maxAgeFilter = null;
List<String>? roleFilter = ['admin', 'editor'];

var query = <String, dynamic>{
  'page': 1,
  'limit': 20,
  if (nameFilter != null) 'name': nameFilter,
  if (minAgeFilter != null) 'minAge': minAgeFilter,
  if (maxAgeFilter != null) 'maxAge': maxAgeFilter,
  ...?(roleFilter != null ? {'roles': roleFilter} : null),
};
```

---

## Flutter Examples

### Dynamic Widget List

```dart
@override
Widget build(BuildContext context) {
  return Column(
    children: [
      const Text('Welcome'),
      if (isLoggedIn) ...[
        UserProfile(user: currentUser),
        const Divider(),
      ],
      for (final item in menuItems)
        ListTile(
          title: Text(item.title),
          onTap: () => navigate(item.route),
        ),
      if (!isLoggedIn) const LoginButton(),
    ],
  );
}
```

### Dynamic Tab Items

```dart
List<BottomNavigationBarItem> buildNavItems() => [
  const BottomNavigationBarItem(icon: Icon(Icons.home), label: 'Home'),
  const BottomNavigationBarItem(icon: Icon(Icons.explore), label: 'Explore'),
  if (user.isPremium)
    const BottomNavigationBarItem(icon: Icon(Icons.star), label: 'Premium'),
  const BottomNavigationBarItem(icon: Icon(Icons.person), label: 'Profile'),
];
```

### GridView with Collection For

```dart
GridView.count(
  crossAxisCount: 3,
  children: [
    for (final color in Colors.primaries)
      Container(
        color: color,
        child: Center(child: Text(color.toString())),
      ),
  ],
)
```

---

## Common Mistakes

### ❌ Forgetting `{}` is a Map, not a Set

```dart
var empty = {};      // ❌ Map<dynamic, dynamic>
var emptySet = <int>{}; // ✅ Set<int>
```

### ❌ Spread doesn't deep-copy nested collections

```dart
var original = [[1, 2], [3, 4]];
var copy = [...original]; // shallow!
copy[0].add(99);
print(original[0]); // [1, 2, 99] — mutated!

// ✅ Deep copy
var deep = [for (var list in original) [...list]];
```

### ❌ `collection if` without braces for multi-line expressions

```dart
// ❌ This only conditionally includes 'b', not 'a'
var list = [
  if (condition)
    'a',
    'b', // always included — not part of the if!
];

// ✅ Use spread + list for multiple items
var list = [
  if (condition) ...['a', 'b'],
];
```

---

## Best Practices

- **Use spread `...`** instead of `..addAll()` for combining collections.
- **Use `collection if`** instead of building lists with `if` statements outside the literal.
- **Use `collection for`** instead of `List.generate` for readable transformations.
- **Use `...?` (null-aware spread)** instead of a null check before spreading.
- **Use `const` literals** for compile-time constant collections.
