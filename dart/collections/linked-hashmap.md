---
title: LinkedHashMap<K, V>
sidebar_position: 10
description: Complete guide to Dart's LinkedHashMap<K,V> — the default Map implementation that preserves insertion order. Covers constructors, use cases, and comparison with HashMap.
---

# `LinkedHashMap<K, V>`

`LinkedHashMap<K, V>` is the **default** implementation behind every `Map` literal (`{}`) in Dart. It combines a hash table for O(1) lookup with a doubly-linked list that maintains **insertion order**. When you write `var map = {'a': 1, 'b': 2}`, you are creating a `LinkedHashMap`.

---

## When to Use

✅ Use `LinkedHashMap<K, V>` when you need:
- Predictable iteration order (insertion order)
- Fast O(1) average lookup, insert, and delete
- Most general-purpose key-value use cases
- Ordered JSON-like structures

❌ Don't use `LinkedHashMap<K, V>` when you need:
- Maximum raw speed with no ordering requirement → use `HashMap`
- Sorted keys → use `SplayTreeMap`

---

## Key Insight: Default Map

```dart
// These are all LinkedHashMaps:
var map1 = {'a': 1, 'b': 2, 'c': 3};
var map2 = Map<String, int>();
var map3 = <String, int>{};

// Verify:
import 'dart:collection';
print(map1 is LinkedHashMap); // true
```

---

## Import

```dart
import 'dart:collection';
```

---

## Constructors

### `LinkedHashMap()` (default)

Creates an empty LinkedHashMap using `==` and `hashCode`.

```dart
import 'dart:collection';
var map = LinkedHashMap<String, int>();
map['a'] = 1;
map['b'] = 2;
map['c'] = 3;
print(map); // {a: 1, b: 2, c: 3} — insertion order preserved!
```

### `LinkedHashMap({equals, hashCode, isValidKey})`

With custom equality functions — same signature as `HashMap`.

```dart
import 'dart:collection';

// Case-insensitive, insertion-ordered map
var map = LinkedHashMap<String, int>(
  equals: (a, b) => a.toLowerCase() == b.toLowerCase(),
  hashCode: (k) => k.toLowerCase().hashCode,
);

map['Alice'] = 30;
map['BOB'] = 25;
print(map['alice']); // 30
print(map['bob']);   // 25
```

### `LinkedHashMap.identity()`

Keys compared by identity, insertion order preserved.

### `LinkedHashMap.of(Map<K, V> other)`

Creates a copy preserving insertion order.

```dart
var original = {'first': 1, 'second': 2, 'third': 3};
var copy = LinkedHashMap.of(original);
print(copy.keys.toList()); // [first, second, third]
```

### `LinkedHashMap.from(Map other)`

Like `.of()` but accepts `Map<dynamic, dynamic>`.

### `LinkedHashMap.fromEntries(Iterable<MapEntry<K,V>> entries)`

```dart
var map = LinkedHashMap.fromEntries([
  MapEntry('x', 10),
  MapEntry('y', 20),
  MapEntry('z', 30),
]);
print(map.keys.toList()); // [x, y, z]
```

### `LinkedHashMap.fromIterables(Iterable<K> keys, Iterable<V> values)`

```dart
var map = LinkedHashMap.fromIterables(['a', 'b', 'c'], [1, 2, 3]);
```

---

## Insertion Order Guarantee

The defining feature of `LinkedHashMap` is that iteration always reflects insertion order:

```dart
import 'dart:collection';

var map = LinkedHashMap<String, int>();
map['banana'] = 2;
map['apple'] = 1;
map['cherry'] = 3;

// Always iterates in insertion order
print(map.keys.toList()); // [banana, apple, cherry]

// Updating an existing key does NOT change its position
map['apple'] = 99;
print(map.keys.toList()); // [banana, apple, cherry] — apple stays in place
```

### Comparison with HashMap (No Order)

```dart
import 'dart:collection';

var linked = LinkedHashMap.of({'banana': 2, 'apple': 1, 'cherry': 3});
var hash   = HashMap.of({'banana': 2, 'apple': 1, 'cherry': 3});

print(linked.keys.toList()); // [banana, apple, cherry] — always
print(hash.keys.toList());   // unpredictable — could be any order
```

---

## Methods

`LinkedHashMap` implements the full `Map<K, V>` interface. All methods from [Map\<K,V\>](./map) apply. The only unique behavior is the **iteration order guarantee**.

---

## Performance & Complexity

| Operation | Complexity | Notes |
|-----------|-----------|-------|
| `[key]` read | O(1) avg | Hash-based lookup |
| `[key] =` write | O(1) avg | Hash + linked list update |
| `remove()` | O(1) avg | Hash + linked list removal |
| `containsKey()` | O(1) avg | |
| `containsValue()` | O(n) | Linear scan |
| Iteration | O(n) | Linked list traversal (insertion order) |
| Memory | Higher than `HashMap` | Extra linked list per entry |

---

## Real-World Examples

### Example 1: Ordered Configuration

```dart
import 'dart:collection';

// Configuration where order matters (e.g., HTTP headers, CSS props)
var headers = LinkedHashMap<String, String>();
headers['Content-Type'] = 'application/json';
headers['Authorization'] = 'Bearer token123';
headers['Accept'] = 'application/json';
headers['X-Request-ID'] = 'abc-123';

// Iterate in insertion order — predictable for debugging/logging
for (var entry in headers.entries) {
  print('${entry.key}: ${entry.value}');
}
```

### Example 2: LRU Cache with Insertion Order

```dart
import 'dart:collection';

class LRUCache<K, V> {
  final int capacity;
  final LinkedHashMap<K, V> _map;

  LRUCache(this.capacity)
      : _map = LinkedHashMap(
          equals: (a, b) => a == b,
          hashCode: (k) => k.hashCode,
        );

  V? get(K key) {
    if (!_map.containsKey(key)) return null;
    final value = _map.remove(key)!; // remove and re-add to move to end
    _map[key] = value;
    return value;
  }

  void put(K key, V value) {
    _map.remove(key); // remove if exists (to re-insert at end)
    if (_map.length >= capacity) {
      _map.remove(_map.keys.first); // evict oldest (first = LRU)
    }
    _map[key] = value;
  }

  @override
  String toString() => _map.toString();
}

void main() {
  var cache = LRUCache<int, String>(3);
  cache.put(1, 'one');
  cache.put(2, 'two');
  cache.put(3, 'three');
  cache.get(1);          // access 1 → moves to MRU end
  cache.put(4, 'four'); // evicts 2 (LRU)
  print(cache.get(2));  // null (evicted)
  print(cache.get(1));  // one
  print(cache);         // {3: three, 1: one, 4: four}
}
```

### Example 3: Ordered JSON Serialization

```dart
import 'dart:collection';
import 'dart:convert';

// LinkedHashMap preserves field order in JSON output
var user = LinkedHashMap<String, dynamic>.from({
  'id': 1,
  'name': 'Alice',
  'email': 'alice@example.com',
  'role': 'admin',
});

// JSON output preserves the insertion order
print(jsonEncode(user));
// {"id":1,"name":"Alice","email":"alice@example.com","role":"admin"}
```

### Example 4: Ordered Menu Items

```dart
import 'dart:collection';

// Navigation menu where order matters
final Map<String, String> navMenu = LinkedHashMap.fromIterables(
  ['home', 'products', 'about', 'contact'],
  ['/', '/products', '/about', '/contact'],
);

// Renders in exact insertion order
navMenu.forEach((label, route) {
  print('$label → $route');
});
// home → /
// products → /products
// about → /about
// contact → /contact
```

### Example 5: Grouping with Preserved Order

```dart
import 'dart:collection';

// Group items while preserving first-seen order of groups
List<String> words = ['apple', 'ant', 'banana', 'cherry', 'avocado', 'blueberry'];

var byFirstLetter = LinkedHashMap<String, List<String>>();
for (var word in words) {
  byFirstLetter.putIfAbsent(word[0], () => []).add(word);
}

// Groups appear in the order their first element was encountered
print(byFirstLetter);
// {a: [apple, ant, avocado], b: [banana, blueberry], c: [cherry]}
```

---

## Flutter Example: Ordered Tab Bar

```dart
import 'dart:collection';

class TabScreen extends StatefulWidget {
  const TabScreen({super.key});

  @override
  State<TabScreen> createState() => _TabScreenState();
}

class _TabScreenState extends State<TabScreen> {
  // Order matters for tab rendering
  final Map<String, Widget> tabs = LinkedHashMap.fromIterables(
    ['Home', 'Explore', 'Cart', 'Profile'],
    [HomeView(), ExploreView(), CartView(), ProfileView()],
  );

  int _selectedIndex = 0;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: tabs.values.elementAt(_selectedIndex),
      bottomNavigationBar: BottomNavigationBar(
        currentIndex: _selectedIndex,
        onTap: (i) => setState(() => _selectedIndex = i),
        items: tabs.keys.map((label) => BottomNavigationBarItem(
          icon: const Icon(Icons.circle),
          label: label,
        )).toList(),
      ),
    );
  }
}
```

---

## Common Mistakes

### ❌ Expecting `HashMap` to have insertion order

```dart
import 'dart:collection';

// ❌ HashMap does NOT preserve order
var map = HashMap.of({'b': 2, 'a': 1, 'c': 3});
map.keys.toList(); // order unpredictable!

// ✅ LinkedHashMap preserves order
var map = LinkedHashMap.of({'b': 2, 'a': 1, 'c': 3});
map.keys.toList(); // [b, a, c]
```

### ❌ Thinking update changes position

```dart
var map = <String, int>{'a': 1, 'b': 2, 'c': 3};
map['a'] = 99;
print(map.keys.first); // 'a' — update does NOT move to end

// To move to end: remove then re-insert
map.remove('a');
map['a'] = 99;
print(map.keys.last); // 'a' — now at end
```

---

## Best Practices

- **Use `LinkedHashMap` (via `{}` literal) for most Map use cases** — it's the safe, predictable default.
- **Exploit insertion-order for LRU caches** — remove and re-insert the accessed key to move it to the "most recent" end.
- **When serializing to JSON**, use `LinkedHashMap` to control field order.
- **Switch to `HashMap`** only when you've profiled and determined that iteration order overhead is a bottleneck.

---

**Previous:** [HashMap\<K,V\>](./hashmap)  
**Next:** [SplayTreeMap\<K,V\>](./splay-tree-map)  
**Related:** [HashMap\<K,V\>](./hashmap) · [Map\<K,V\>](./map) · [Choosing the Right Collection](./choosing)
