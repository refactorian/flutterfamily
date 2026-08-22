---
sidebar_position: 3
title: Bloc Widgets
description: Learn how to integrate BLoc and Cubit into the Flutter widget tree using BlocBuilder, BlocListener, and BlocProvider.
---

# Bloc Widgets

To connect your `Bloc` or `Cubit` logic to Flutter's UI layout tree, the `flutter_bloc` package provides several specialized widgets. 

---

## 1. BlocProvider

`BlocProvider` is a dependency injection widget used to provide an instance of a Bloc or Cubit to its children in the widget subtree. It also handles automatic resource disposal when the widget is removed from the tree.

```dart
BlocProvider(
  create: (BuildContext context) => CounterCubit(),
  child: const CounterPage(),
)
```

### Accessing the Instance
Underneath `BlocProvider`, descendants can look up the provided instance using:

```dart
// Option A: Via context extension (preferred)
final counterCubit = context.read<CounterCubit>();

// Option B: Via static helper
final counterCubit = BlocProvider.of<CounterCubit>(context);
```

---

## 2. BlocBuilder

`BlocBuilder` handles building the widget tree in response to new states. It takes a builder function which is called whenever a new state is emitted.

```dart
BlocBuilder<CounterCubit, int>(
  builder: (context, state) {
    return Text('Count: $state');
  },
)
```

### buildWhen Condition
To prevent unnecessary rebuilds, you can define a `buildWhen` condition. The widget will only rebuild if the condition evaluates to `true`:

```dart
BlocBuilder<CounterCubit, int>(
  buildWhen: (previousState, currentState) {
    // Only rebuild if the state value is an even number
    return currentState % 2 == 0;
  },
  builder: (context, state) {
    return Text('Even Count: $state');
  },
)
```

---

## 3. BlocListener

Unlike `BlocBuilder` (which expects a Widget to be returned for rendering), `BlocListener` is designed for executing side-effects exactly once per state transition (e.g. showing a SnackBar, popping a dialog, or navigating).

```dart
BlocListener<CounterCubit, int>(
  listener: (context, state) {
    if (state == 10) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Target reached!')),
      );
    }
  },
  child: const CounterPageContent(),
)
```

### listenWhen Condition
Similar to `buildWhen`, you can filter when to run side effects using `listenWhen`:

```dart
listenWhen: (previous, current) {
  return current == 10;
}
```

---

## 4. BlocConsumer

If you need to both rebuild the UI and trigger side-effects in response to state transitions, `BlocConsumer` combines both into a single widget:

```dart
BlocConsumer<CounterCubit, int>(
  listener: (context, state) {
    if (state == 10) {
      Navigator.pushNamed(context, '/success');
    }
  },
  builder: (context, state) {
    return Text('Count: $state');
  },
)
```
