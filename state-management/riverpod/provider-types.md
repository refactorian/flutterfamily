---
sidebar_position: 2
title: Provider Types
description: Learn about the primary types of Providers in Riverpod, including Provider, FutureProvider, and NotifierProvider.
---

# Riverpod Provider Types

In Riverpod, states are declared inside **Providers**. Riverpod offers several types of providers, each designed to manage specific kinds of data and side-effects.

---

## 1. Simple Provider

`Provider` is the most basic provider type. It is read-only and is typically used to cache simple values, configurations, or inject business services (like repository classes).

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// Declare a global read-only provider
final configProvider = Provider<Map<String, String>>((ref) {
  return {
    'apiUrl': 'https://api.flutterfamily.com',
    'timeout': '3000',
  };
});
```

---

## 2. NotifierProvider & Notifier

`NotifierProvider` is the modern standard for managing mutable states that do not involve asynchronous operations. It replaces the legacy `StateNotifierProvider` and `StateProvider`.

### Define the Notifier
```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

// 1. Extend Notifier and define the state type (e.g. List<String>)
class TodoListNotifier extends Notifier<List<String>> {
  // Must override the build method to define initial state
  @override
  List<String> build() {
    return [];
  }

  void addTodo(String todo) {
    // Re-assign state to a new immutable list to trigger UI updates
    state = [...state, todo];
  }
}

// 2. Expose the notifier via NotifierProvider
final todoListProvider = NotifierProvider<TodoListNotifier, List<String>>(() {
  return TodoListNotifier();
});
```

---

## 3. FutureProvider & AsyncNotifier

For dealing with asynchronous data fetching (such as API queries or file loading), Riverpod provides async-focused providers.

### FutureProvider (Read-only async data)
Useful for reading static asynchronously loaded resources (e.g. loading settings from disk).

```dart
final weatherProvider = FutureProvider<String>((ref) async {
  await Future.delayed(const Duration(seconds: 2));
  return 'Sunny, 24°C';
});
```

### AsyncNotifierProvider (Mutable async data)
The modern standard for managing async operations where users can interact and mutate the remote data source.

```dart
import 'package:flutter_riverpod/flutter_riverpod.dart';

class AsyncTodoListNotifier extends AsyncNotifier<List<String>> {
  @override
  Future<List<String>> build() async {
    // Fetch data asynchronously from a backend API
    return ['Todo item from backend API'];
  }

  Future<void> addTodo(String todo) async {
    state = const AsyncValue.loading();
    state = await AsyncValue.guard(() async {
      // Simulate posting todo to network API
      await Future.delayed(const Duration(seconds: 1));
      return [...state.value ?? [], todo];
    });
  }
}

final asyncTodoProvider = AsyncNotifierProvider<AsyncTodoListNotifier, List<String>>(() {
  return AsyncTodoListNotifier();
});
```
