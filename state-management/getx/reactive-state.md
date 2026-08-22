---
sidebar_position: 2
title: Reactive State
description: Learn how to manage reactive states in GetX using the .obs extension and Obx widgets without calling setState.
---

# GetX Reactive State

One of GetX's primary features is its **Reactive (Rx) State Management**. It allows you to build completely reactive user interfaces without using Streams, StreamControllers, ChangeNotifiers, or calling `setState()`.

---

## 1. Declaring Reactive Variables

To make any variable reactive, you append `.obs` to it:

```dart
final name = ''.obs;
final count = 0.obs;
final isDark = false.obs;
final items = <String>[].obs;
```

When you mutate the value of these variables, GetX automatically triggers updates in the UI widgets that are actively listening to them.

```dart
// Mutate values normally
count.value++;
name.value = 'Flutter Family';
```

---

## 2. Displaying Rx Values with `Obx`

To display reactive variables in the UI, wrap your target widget in an `Obx` (Observer) widget. GetX will automatically track which reactive variables are accessed inside the builder function and redraw the widget only when those specific variables mutate.

```dart
import 'package:flutter/material.dart';
import 'package:get/get.dart';

class CounterController extends GetxController {
  var count = 0.obs;

  void increment() => count++;
}

class CounterScreen extends StatelessWidget {
  const CounterScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // Instantiate controller
    final controller = Get.put(CounterController());

    return Scaffold(
      appBar: AppBar(title: const Text('GetX Counter')),
      body: Center(
        child: Obx(() {
          // Obx automatically listens to changes in controller.count
          return Text(
            'Clicks: ${controller.count}',
            style: Theme.of(context).textTheme.headlineMedium,
          );
        }),
      ),
      floatingActionButton: FloatingActionButton(
        onPressed: controller.increment,
        child: const Icon(Icons.add),
      ),
    );
  }
}
```

---

## 3. Advantages of Reactive Programming in GetX

* **No boilerplate**: You do not need to create event classes, state classes, or call custom notifier functions.
* **Granular Rebuilds**: If a variable does not change its value, the widget using it will not rebuild. GetX checks for value equality under the hood before triggering rendering updates.
* **Simple syntax**: Code is readable and concise, minimizing the amount of code needed to write logic.
