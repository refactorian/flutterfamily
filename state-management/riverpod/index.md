---
sidebar_position: 1
title: Introduction to Riverpod
description: Welcome to the Riverpod section. Learn the fundamentals of this robust compile-safe caching and state management system.
---

# Introduction to Riverpod

**Riverpod** is a modern reactive state management and caching framework for Flutter. It is designed as a complete redesign of the `Provider` library, addressing common limitations such as `ProviderNotFoundException`, tree dependency, and testability challenges.

---

## 1. Why Riverpod?

Riverpod provides compile-time safety and does not require `BuildContext` to read data, making it highly modular and testable.

* **No ProviderNotFoundException**: Providers are declared globally, meaning they are resolved at compile time.
* **Independent of Widget Tree**: Business logic can exist entirely outside the Flutter framework UI.
* **Easy Caching & Network Binding**: Built-in support for asynchronous operations (`FutureProvider`, `StreamProvider`) with built-in pull-to-refresh capabilities.

---

## 2. Upcoming Topics

This section is a work-in-progress. In future updates, we will add detailed guides and complete code examples for the following topics:

### 🧩 Types of Providers
Understanding when and how to use each provider type:
- `Provider`: For simple, immutable calculations or static configuration.
- `NotifierProvider` & `AsyncNotifierProvider`: The modern standard for mutable synchronous/asynchronous state logic.
- `FutureProvider` & `StreamProvider`: For fetching network data and listening to realtime reactive data channels.

### ⚙️ Riverpod Generator
How to use code generation (`@riverpod` annotations) to automate the boilerplate of provider declarations and handle scoping automatically.

### 🖥️ Consumer Widgets
How to consume providers in the UI using widgets:
- `ConsumerWidget`: A stateless widget with a `WidgetRef` parameter.
- `ConsumerStatefulWidget` & `ConsumerState`: A stateful widget matching the standard lifecycle, with access to `ref` globally.
- `Consumer` builder widget: For fine-grained rebuilding.

### 🛠️ Families & AutoDispose
- `.family`: Allowing you to pass external arguments (e.g. an ID parameter) when instantiating a provider.
- `.autoDispose`: Automatically resetting and disposing of state when the UI stops listening to it.

### 🧪 Unit and Integration Testing
Mocking provider dependencies and testing providers inside standard Dart tests using `ProviderContainer`.
