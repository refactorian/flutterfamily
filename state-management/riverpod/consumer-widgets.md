---
sidebar_position: 3
title: Consumer Widgets
description: Learn how to read provider values in the widget tree using ConsumerWidget, ConsumerStatefulWidget, and the WidgetRef handle.
---

# Consumer Widgets

To read and listen to providers in your Flutter UI, Riverpod replaces standard Flutter widgets with custom subclasses that expose a `WidgetRef` object.

---

## 1. What is WidgetRef?

`WidgetRef` is the primary interface used to interact with providers from the widget tree. It allows you to:
* Read provider values using `ref.watch()`.
* Listen to state transitions using `ref.listen()`.
* Access provider controllers without listening to changes using `ref.read()`.

---

## 2. ConsumerWidget (Stateless replacement)

`ConsumerWidget` is the direct replacement for standard `StatelessWidget`. It overrides `build` to include `WidgetRef ref`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'provider-types.md'; // Assumed provider definitions

class WeatherScreen extends ConsumerWidget {
  const WeatherScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    // Watch provider values reactively (rebuilds widget when data changes)
    final weatherAsync = ref.watch(weatherProvider);

    return Scaffold(
      appBar: AppBar(title: const Text('Weather')),
      body: Center(
        child: weatherAsync.when(
          data: (weather) => Text('Weather: $weather'),
          loading: () => const CircularProgressIndicator(),
          error: (err, stack) => Text('Error: $err'),
        ),
      ),
    );
  }
}
```

---

## 3. ConsumerStatefulWidget (Stateful replacement)

`ConsumerStatefulWidget` and `ConsumerState` are the direct replacements for `StatefulWidget` and `State`. The `ref` object is made globally available as a class property, similar to `widget`.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

class TimerPage extends ConsumerStatefulWidget {
  const TimerPage({super.key});

  @override
  ConsumerState<TimerPage> createState() => _TimerPageState();
}

class _TimerPageState extends ConsumerState<TimerPage> {
  @override
  void initState() {
    super.initState();
    // ref is accessible in lifecycle methods!
    // Always use ref.read (not watch) inside initState
    final config = ref.read(configProvider);
    print('API Url config: ${config['apiUrl']}');
  }

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Center(child: Text('Check your logs')),
    );
  }
}
```

---

## 4. ref.watch vs ref.read vs ref.listen

Understanding the differences between these operations is key to avoiding bugs and optimization issues:

| Method | Where to Use | Purpose | Rebuilds Widget? |
|---|---|---|---|
| **`ref.watch()`** | In widget `build()` methods. | Binds the widget state reactively. | **Yes** (when state changes) |
| **`ref.read()`** | Inside callbacks (clicks, lifecycles). | Reads the value once without observing. | **No** |
| **`ref.listen()`** | Inside `build()` or `initState()`. | Executes side effects (snackbars/navigation). | **No** |

### Example: Using ref.listen for Side Effects
```dart
@override
Widget build(BuildContext context, WidgetRef ref) {
  ref.listen<List<String>>(todoListProvider, (previous, next) {
    if (next.length > (previous?.length ?? 0)) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Todo added!')),
      );
    }
  });

  return const TodoListUI();
}
```
