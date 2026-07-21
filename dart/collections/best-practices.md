---
title: Best Practices
sidebar_position: 24
description: Production guidelines and expert recommendations for writing clean, performant, and maintainable Dart collection code.
---

# Collections Best Practices

Follow these professional recommendations to ensure your Dart and Flutter collection code remains robust, clean, and performant.

---

## 1. Immutability & Safety Guidelines

### Prefer `final` and `const`
Always mark collection variables `final` unless you explicitly intend to rebind the variable reference. Use `const` for literals known at compile time.

```dart
// Good
final items = <String>[];
const defaultOptions = {'debug': false, 'timeout': 30};

// Avoid
var list = [1, 2, 3];
```

### Encapsulate Internal Mutable Collections
Expose read-only views via `UnmodifiableListView` or `UnmodifiableMapView` rather than returning raw mutable internal state.

```dart
import 'dart:collection';

class OrderManager {
  final List<Order> _orders = [];

  // Expose read-only view
  List<Order> get orders => UnmodifiableListView(_orders);
}
```

---

## 2. API & Typing Guidelines

### Accept Intersecting Abstract Interfaces (`Iterable`, `Set`, `Map`)
In function parameters, accept `Iterable<T>` or `Set<T>` rather than requiring concrete `List<T>` when indexing is not required.

```dart
// Good: Flexible parameter type
double calculateAverage(Iterable<num> numbers) {
  if (numbers.isEmpty) return 0;
  final total = numbers.reduce((a, b) => a + b);
  return total / numbers.length;
}

// Avoid: Overly restrictive parameter requirement
double calculateAverageList(List<num> numbers) { ... }
```

---

## 3. Performance Guidelines

### Use `isEmpty` and `isNotEmpty` over `.length`
Checking `isEmpty` is $O(1)$ on all collection and lazy iterable implementations. `.length` on a lazy iterable can trigger full $O(n)$ traversal.

```dart
// Good
if (myIterable.isEmpty) { ... }

// Avoid
if (myIterable.length == 0) { ... }
```

### Materialize Lazy Iterables Once
Do not chain or evaluate lazy iterables multiple times inside loops. Materialize with `.toList()` or `.toSet()` once.

```dart
// Good
final evenNumbers = numbers.where((n) => n.isEven).toList();
print(evenNumbers.length);
print(evenNumbers.first);

// Avoid
final lazyEvens = numbers.where((n) => n.isEven);
print(lazyEvens.length); // Evaluates where()
print(lazyEvens.first);  // Re-evaluates where()
```

---

## 4. Modern Language Features Guidelines

### Prefer Collection Literals over Imperative Loops
Use spread `...`, collection `if`, and collection `for` to build collections declaratively.

```dart
// Good (Declarative)
final navItems = [
  'Home',
  if (user.isAdmin) 'Admin Dashboard',
  for (final item in dynamicCategories) item.name,
];

// Avoid (Imperative mutation)
final navItems = ['Home'];
if (user.isAdmin) {
  navItems.add('Admin Dashboard');
}
for (final item in dynamicCategories) {
  navItems.add(item.name);
}
```

---

## Best Practices Checklist Summary

| Guideline | Purpose |
|---|---|
| Use `const` for static literal lists/maps | Zero runtime allocation cost |
| Return `UnmodifiableListView` from getters | Protects internal state from unexpected external mutation |
| Accept `Iterable<T>` in function arguments | Maximizes API flexibility for callers |
| Prefer `isEmpty` over `length == 0` | Avoids $O(n)$ traversal on lazy sequences |
| Use `Set` for frequent `contains()` checks | Drops lookup complexity from $O(n)$ to $O(1)$ |
| Use declarative `if`/`for`/`...` in collection literals | Produces clean, readable code |
