---
sidebar_position: 3
title: Dependency Injection
description: Manage class dependencies and controller instances context-lessly in GetX using Get.put, Get.lazyPut, and Get.find.
---

# Dependency Injection in GetX

GetX features a powerful dependency injection manager that operates independently of the Flutter widget tree. This allows you to register and locate services and controllers context-lessly from any file in your project.

---

## 1. Exposing Dependencies

GetX provides several methods to inject your controllers, models, or services into memory:

### Get.put()
Instantiates the class synchronously and caches it in memory immediately. Ideal for controllers that are always needed when a screen loads.

```dart
final controller = Get.put(CounterController());
```

### Get.lazyPut()
Caches the builder function of the class. The class is only instantiated when it is retrieved for the first time via `Get.find()`. Ideal for memory optimization.

```dart
Get.lazyPut(() => BigDataService());
```

### Get.putAsync()
Used for asynchronous initializations (e.g. configuring a local database or loading shared preferences).

```dart
await Get.putAsync<SharedPreferences>(() async {
  return await SharedPreferences.getInstance();
});
```

---

## 2. Retrieving Dependencies with `Get.find()`

Once a dependency has been registered, you can find it anywhere in your application using `Get.find()`:

```dart
class AnotherScreen extends StatelessWidget {
  const AnotherScreen({super.key});

  @override
  Widget build(BuildContext context) {
    // 1. Locate the already running counter controller
    final CounterController controller = Get.find();

    return Scaffold(
      body: Center(
        child: ElevatedButton(
          onPressed: controller.increment,
          child: const Text('Increment from Another Screen'),
        ),
      ),
    );
  }
}
```

---

## 3. Difference Summary

| Method | Instantiation Time | Keeps in Memory | Good for |
|---|---|---|---|
| **`Get.put`** | Immediate (Synchronous) | Always (unless manually deleted) | Primary page controllers |
| **`Get.lazyPut`** | On First Use (Lazy) | Cleared when route closes | Resource-heavy classes |
| **`Get.putAsync`** | Asynchronous | Always | Services (DB initialization, API client setups) |
