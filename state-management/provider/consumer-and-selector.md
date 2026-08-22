---
sidebar_position: 3
title: Consumer vs Selector
description: Optimize performance in Provider by understanding the difference between Consumer and Selector widgets.
---

# Consumer vs Selector

When building complex UIs with the `provider` package, optimizing rebuilds is crucial to maintaining 60 FPS (or 120 FPS). Provider offers two key widgets to consume data: **Consumer** and **Selector**.

---

## 1. Consumer Widget

The `Consumer` widget is a simple builder widget that retrieves data and executes its builder whenever the provided class calls `notifyListeners()`.

```dart
Consumer<CartModel>(
  builder: (context, cart, child) {
    return Text('Total Price: \$${cart.totalPrice}');
  },
)
```

### The child Optimization
If your widget contains expensive layouts that do not depend on the state, you can pass them as a static child to prevent rebuilds of that sub-tree:

```dart
Consumer<CartModel>(
  builder: (context, cart, child) {
    return Column(
      children: [
        Text('Total Price: \$${cart.totalPrice}'),
        child!, // This sub-tree never rebuilds when CartModel changes
      ],
    );
  },
  child: const ExpensiveStaticWidget(), // Passed here
)
```

---

## 2. Selector Widget

`Selector` works similarly to `Consumer`, but with a filtering aspect. It allows you to select a specific nested property from your model. The builder function will **only** trigger if that specific property changes.

```dart
Selector<CartModel, int>(
  // 1. Select the specific property to watch (returns an int)
  selector: (context, cart) => cart.itemCount,
  // 2. Build UI using the selected property value
  builder: (context, itemCount, child) {
    return Text('Items in cart: $itemCount');
  },
)
```

In the example above, if `CartModel` updates other properties (such as changing the payment details or shipping address) but the `itemCount` remains the same, this widget **does not rebuild**.

---

## 3. Comparison Summary

| Feature | Consumer | Selector |
|---|---|---|
| **Subscribes To** | Entire provided class state. | A specific aspect / property of the state. |
| **Triggers Rebuild** | Whenever `notifyListeners()` is called. | Only when the selected value changes. |
| **Complexity** | Low / Very simple syntax. | Medium / Requires defining selector functions. |
| **Primary Use Case** | When most of the widget relies on the model. | When only a single variable is needed from a large model. |
