---
sidebar_position: 1
title: Introduction to BLoc
description: Welcome to the BLoc (Business Logic Component) section. Learn the fundamentals of reactive state management.
---

# Introduction to BLoc

**BLoc (Business Logic Component)** is a popular state management library for Flutter that helps implement the BLoc design pattern. BLoc leverages **Streams** and **Reactive Programming** to decouple the presentation layer from the business logic.

---

## 1. Core Philosophy

The primary objective of BLoc is to make code predictable, testable, and reusable by enforcing a strict separation of concerns.

```mermaid
graph LR
    UI[Widget / View] -->|Dispatch Event| BLoc[BLoc Class]
    BLoc -->|Emit New State| UI
    
    style UI fill:#4f46e5,color:#fff
    style BLoc fill:#0891b2,color:#fff
```

* **Events**: The inputs to a BLoc (typically user actions like button presses, text input changes, or lifecycle updates).
* **States**: The outputs of a BLoc (representing the updated state of the application to render in the UI).
* **BLoc Class**: The brain that transforms incoming Events into outgoing States using stream operations.

---

## 2. Upcoming Topics

This section is a work-in-progress. In future updates, we will add detailed guides and complete code examples for the following topics:

### ⚡ Cubit: Simplified State Management
A `Cubit` is a simpler version of `Bloc`. Instead of dispatching events, you invoke standard methods (functions) to trigger state transitions. Ideal for simpler pages and states.

### 🧩 Core Bloc Widgets
Detailed APIs and usage patterns for Flutter-specific widgets:
- `BlocProvider`: Provides a Bloc to its children (Dependency Injection).
- `BlocBuilder`: Rebuilds widgets in response to state changes.
- `BlocListener`: Invokes side-effects (navigation, dialogs, snackbars) exactly once per state transition.
- `BlocConsumer`: Combines builder and listener.

### 🧪 Advanced Event Transformations
Using `RxDart` with custom event transformers. Learn how to optimize network/search requests using `debounceTime`, `distinctUnique`, and `restartable` stream operators.

### 🛠️ Testing Blocs
Step-by-step guides for writing unit tests using the `bloc_test` library to verify states are emitted in the correct order.

### 🏛️ Real-World Clean Architecture
Integrating BLoc with repository layers, dependency injection (using `get_it`), and domain layers.
