---
sidebar_position: 1
title: Introduction to Provider
description: Welcome to the Provider section. Learn the fundamentals of this popular wrapper around InheritedWidget.
---

# Introduction to Provider

**Provider** is one of the most widely adopted and recommended state management solutions in the Flutter ecosystem. Developed as a clean wrapper around `InheritedWidget`, it simplifies data sharing, object lifetimes, and state updates.

---

## 1. Core Philosophy

Instead of writing verbose boilerplate for custom `InheritedWidget` wrapper classes, Provider encapsulates this logic so you can easily expose state models to any widget down the tree.

* **Exposing State**: Declaring a provider class at the parent level.
* **Consuming State**: Reading data reactively inside child widgets.
* **Lifecycle Management**: Automatically calling `dispose()` on state controllers when they are removed from the tree.

---

## 2. Upcoming Topics

This section is a work-in-progress. In future updates, we will add detailed guides and complete code examples for the following topics:

### ⚡ ChangeNotifier & ChangeNotifierProvider
The standard combination for mutable state. Create models subclassing `ChangeNotifier`, call `notifyListeners()`, and bind them to the UI tree via `ChangeNotifierProvider`.

### 🧩 Context API Extensions
How to access data within widgets using short context API methods:
- `context.watch<T>()`: Listens to changes in `T`, rebuilding the widget when they occur.
- `context.read<T>()`: Accesses `T` without subscribing to changes (ideal for callbacks and button clicks).
- `context.select<T, R>()`: Listening to a specific sub-property of `T` to prevent unnecessary rebuilds.

### 👥 MultiProvider
How to combine multiple providers at the root of your application in a readable, non-nested format.

### 🎯 Selector vs Consumer
Detailed comparisons of consumer widgets to optimize performance:
- `Consumer`: Rebuilds whenever any property of the provided state changes.
- `Selector`: Rebuilds only if a specific sub-state change criteria is met.

### ⛓️ ProxyProvider
Creating dependent state models. Learn how to instantiate providers that require data from other upstream providers (e.g. feeding an authentication token into an API client service provider).
