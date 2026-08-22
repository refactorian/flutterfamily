---
sidebar_position: 1
title: Concepts & Architecture
description: Understand Flutter's declarative programming paradigm, Ephemeral vs. App state, and core architectural patterns.
---

# Concepts & Architecture

To write clean Flutter applications, you must understand the fundamental principles behind Flutter's rendering and data systems.

---

## 1. The Declarative Paradigm

Unlike imperative frameworks (where you manually update UI elements like `textView.setText("Hello")`), Flutter is **declarative**. 

In Flutter, you do not modify widgets directly. Instead, you change the **state**, and Flutter rebuilds the user interface from scratch.

$$UI = f(State)$$

Where:
* **$State$**: The data representing your application's current condition.
* **$f$**: Your widget tree build methods.
* **$UI$**: The actual layout rendered on the screen.

```mermaid
graph LR
    State --> f[Widget Tree Build]
    f --> UI[Screen Rendering]
    
    style State fill:#4f46e5,color:#fff
    style UI fill:#0891b2,color:#fff
```

When state changes, Flutter detects which parts of the widget tree need updating and redraws them. This makes UI development simpler, as you only need to describe how the UI should look for any given state.

---

## 2. Ephemeral vs. App State

State is generally divided into two types: **Ephemeral (Local) State** and **App (Global) State**.

```mermaid
graph TD
    State[State] --> Ephemeral[Ephemeral State]
    State --> App[App State]
    
    Ephemeral --> EphemeralEx["• PageView active index<br>• Switch toggled on/off<br>• TextBox text input<br>• Animation state"]
    App --> AppEx["• User authentication token<br>• Shopping cart contents<br>• Global app settings<br>• Cached API responses"]
    
    style Ephemeral fill:#0284c7,color:#fff
    style App fill:#059669,color:#fff
```

### Ephemeral State
* **Definition**: State that lives inside a single widget and doesn't need to be shared or accessed elsewhere.
* **Examples**: Current index of a `TabController`, whether a checkbox is checked, or if an accordion panel is expanded.
* **Primary Tool**: `setState()` inside a `StatefulWidget`.

### App State
* **Definition**: State that is shared across multiple parts of the application or needs to persist between sessions.
* **Examples**: Shopping cart items, user profile credentials, global theme configurations.
* **Primary Tools**: `InheritedWidget`, BLoc, Riverpod, Provider, GetX.

---

## 3. Unidirectional Data Flow (UDF)

In a well-designed Flutter architecture, data flows in one direction:
1. **Events/User Actions** flow **up** (from UI to state controllers).
2. **State updates** flow **down** (from state controllers to UI).

```mermaid
sequenceDiagram
    participant UI as Widget (View)
    participant State as State Controller (Logic)
    
    UI->>State: Trigger Action / Event (e.g. click Button)
    Note over State: Process Logic & Mutate State
    State->>UI: Propagate New State / Trigger Rebuild
```

### Why Unidirectional Flow?
* **Predictability**: You always know what event triggered a state change.
* **Testability**: You can test business logic (inputs to outputs) without rendering widgets.
* **Separation of Concerns**: UI widgets only handle presentation, while state classes only handle data.
