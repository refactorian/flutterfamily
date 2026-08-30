---
slug: hydratedbloc-persistent-event-driven-state-flutter
title: "Persistent Event-Driven State in Flutter: A Complete Guide to HydratedBloc"
authors: [admin]
tags: [flutter, dart, bloc, cubit, state-management]
---

State management becomes significantly more interesting once an application needs to remember what happened before it was closed.

A simple theme preference might only require a single boolean. But real applications often have considerably more complicated state:

- Shopping carts containing multiple products.
- Todo lists containing many items.
- Multi-step workflows.
- Offline queues.
- User preferences with multiple fields.
- Draft forms.
- Recently viewed content.
- Local application configuration.
- State that can only be reached through a sequence of business events.

For these scenarios, simply storing a few primitive values is not enough. The application needs to preserve a **complex state model** while continuing to process state changes through well-defined business events.

{/* truncate */}

This is where `HydratedBloc` becomes particularly useful.

The `hydrated_bloc` package extends the Bloc architecture with automatic state persistence and restoration. It provides a storage abstraction and a built-in `HydratedStorage` implementation, allowing Bloc and Cubit state to survive application restarts.

---

# Traditional Bloc vs. HydratedBloc

A traditional `Bloc` follows an event-driven architecture:

```text
UI
 │
 │ Event
 ▼
Bloc
 │
 │ State
 ▼
UI
```

For example:

```dart
bloc.add(
  AddItem(product),
);
```

The Bloc receives the event, executes its business logic, and emits a new state.

This separation is one of the biggest advantages of Bloc: presentation code doesn't need to know *how* the state changes.

However, traditional Bloc state generally exists only in memory.

When the application terminates:

```text
Memory
   ↓
Application closes
   ↓
Bloc destroyed
   ↓
State lost
```

When the application launches again, the Bloc starts from its initial state.

---

## HydratedBloc Adds Persistence

`HydratedBloc` keeps the same event-driven architecture while adding persistence:

```text
                         ┌─────────────────────┐
                         │ Hydrated Storage    │
                         └──────────▲──────────┘
                                    │
                                    │ fromJson()
                                    │
UI ── Event ──► HydratedBloc ── State ──► UI
                    │
                    │ toJson()
                    ▼
              Persistent State
```

The application still sends events:

```dart
bloc.add(AddItem(product));
bloc.add(RemoveItem(productId));
bloc.add(ClearCart());
```

The Bloc still contains the business logic.

The difference is that the resulting state is automatically serialized and persisted.

When the application starts again, the persisted representation is restored through `fromJson()`.

---

# HydratedBloc vs. HydratedCubit

Both `HydratedCubit` and `HydratedBloc` provide state persistence.

The important difference is **how state transitions are expressed**.

A Cubit exposes methods:

```dart
themeCubit.toggleTheme();
themeCubit.setLanguage('en');
```

A Bloc exposes events:

```dart
themeBloc.add(ToggleTheme());
themeBloc.add(LanguageChanged('en'));
```

For relatively straightforward state transitions, `HydratedCubit` is often simpler.

For more complex domains, `HydratedBloc` can provide a clearer separation:

```text
UI
 ↓
Events
 ↓
Bloc
 ↓
Business Logic
 ↓
State
```

This is particularly useful when:

- There are many possible state-changing operations.
- The same business operation can originate from multiple UI components.
- Events need to be logged or observed.
- Business logic is complex.
- You want a clear command/event boundary.
- You want to decouple UI actions from state transitions.
- Event concurrency needs to be controlled.
- The application follows a larger feature-driven or domain-oriented architecture.

The Bloc package itself is designed around separating presentation from business logic, which also improves testability and reusability.

A useful rule of thumb is:

```text
Simple state transitions
        ↓
HydratedCubit

Complex event-driven business logic
        ↓
HydratedBloc
```

This isn't a strict rule. A simple application can use Bloc everywhere, and a complex application can still use Cubit for small state holders.

The important thing is choosing the abstraction that makes the business logic easiest to understand and maintain.

---

# Setting Up HydratedBloc

## Dependencies

The current stable `hydrated_bloc` release is `11.0.0` at the time of writing.

A typical Flutter project can use:

```yaml
dependencies:
  flutter:
    sdk: flutter

  flutter_bloc: ^9.2.1
  hydrated_bloc: ^11.0.0
  path_provider: ^2.1.5
```

Then run:

```bash
flutter pub get
```

> Always verify the latest compatible versions for your Flutter/Dart SDK before publishing. Package versions evolve independently.

---

# Initializing HydratedStorage

Hydrated Bloc needs a storage implementation before hydrated Blocs are created.

The official package supports web and native platforms. Its current setup pattern uses `HydratedStorageDirectory.web` for web and a platform directory for other platforms.

A production-friendly `main.dart` can look like this:

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = await HydratedStorage.build(
    storageDirectory: kIsWeb
        ? HydratedStorageDirectory.web
        : HydratedStorageDirectory(
            (await getApplicationDocumentsDirectory()).path,
          ),
  );

  HydratedBloc.storage = storage;

  runApp(const MyApp());
}
```

There are three important pieces here.

## `WidgetsFlutterBinding.ensureInitialized()`

Because storage initialization is asynchronous and uses platform APIs, initialize Flutter's bindings before calling `runApp()`:

```dart
WidgetsFlutterBinding.ensureInitialized();
```

## `kIsWeb`

Web storage doesn't use the same filesystem directory mechanism as Android, iOS, macOS, Windows, or Linux.

Therefore:

```dart
kIsWeb
    ? HydratedStorageDirectory.web
    : HydratedStorageDirectory(...)
```

keeps the initialization platform-aware.

## Registering the Storage

Finally:

```dart
HydratedBloc.storage = storage;
```

registers the global storage implementation.

After that, `HydratedBloc` and `HydratedCubit` instances can use it automatically.

---

# Building a Persistent Shopping Cart

Let's build a complete example.

Instead of using a trivial counter, we'll create a shopping cart because it demonstrates the things that make `HydratedBloc` useful:

- Multiple events.
- Complex state.
- Nested model objects.
- Lists.
- Immutable state updates.
- JSON serialization.
- State restoration.
- Production-oriented validation.
- Event-driven business logic.

Our architecture will be:

```text
lib/
├── main.dart
├── models/
│   └── cart_item.dart
├── bloc/
│   ├── cart_bloc.dart
│   ├── cart_event.dart
│   └── cart_state.dart
└── pages/
    └── cart_page.dart
```

For the tutorial, we'll eventually combine the files into a runnable example, but keeping these responsibilities separate is a better production structure.

---

# Step 1: Create the Cart Item Model

Our cart item needs:

- An ID.
- Product name.
- Price.
- Quantity.

Create `cart_item.dart`:

```dart
class CartItem {
  final String id;
  final String name;
  final double price;
  final int quantity;

  const CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
  });

  CartItem copyWith({
    String? id,
    String? name,
    double? price,
    int? quantity,
  }) {
    return CartItem(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'quantity': quantity,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final name = json['name'];
    final price = json['price'];
    final quantity = json['quantity'];

    if (id is! String ||
        name is! String ||
        price is! num ||
        quantity is! int ||
        quantity < 1) {
      throw const FormatException(
        'Invalid cart item data.',
      );
    }

    return CartItem(
      id: id,
      name: name,
      price: price.toDouble(),
      quantity: quantity,
    );
  }

  double get total => price * quantity;
}
```

There are two important design decisions here.

First, the model is immutable.

Second, serialization belongs to the model:

```dart
Map<String, dynamic> toJson()
```

and:

```dart
factory CartItem.fromJson(...)
```

This keeps the Bloc from becoming responsible for the internal representation of every nested model.

---

# Step 2: Define Cart Events

Now we need to define what can happen to the cart.

Create `cart_event.dart`:

```dart
sealed class CartEvent {
  const CartEvent();
}

final class AddItem extends CartEvent {
  final CartItem item;

  const AddItem(this.item);
}

final class RemoveItem extends CartEvent {
  final String itemId;

  const RemoveItem(this.itemId);
}

final class ClearCart extends CartEvent {
  const ClearCart();
}
```

You'll also need:

```dart
import '../models/cart_item.dart';
```

at the top of the file.

The complete file is therefore:

```dart
import '../models/cart_item.dart';

sealed class CartEvent {
  const CartEvent();
}

final class AddItem extends CartEvent {
  final CartItem item;

  const AddItem(this.item);
}

final class RemoveItem extends CartEvent {
  final String itemId;

  const RemoveItem(this.itemId);
}

final class ClearCart extends CartEvent {
  const ClearCart();
}
```

This gives the cart a clear event API:

```dart
AddItem(...)
RemoveItem(...)
ClearCart()
```

The UI doesn't need to know how the cart is internally modified.

---

# Step 3: Define the Cart State

Now create `cart_state.dart`.

The state will contain the complete cart:

```dart
import '../models/cart_item.dart';

class CartState {
  final List<CartItem> items;

  const CartState({
    this.items = const [],
  });

  CartState copyWith({
    List<CartItem>? items,
  }) {
    return CartState(
      items: List.unmodifiable(
        items ?? this.items,
      ),
    );
  }

  double get total {
    return items.fold(
      0,
      (sum, item) => sum + item.total,
    );
  }

  int get itemCount {
    return items.fold(
      0,
      (sum, item) => sum + item.quantity,
    );
  }

  bool get isEmpty => items.isEmpty;
}
```

The state now provides useful derived properties:

```dart
state.total
state.itemCount
state.isEmpty
```

These values don't need to be persisted separately because they can be calculated from the persisted items.

That's an important principle:

> Persist the source of truth, not values that can be derived from it.

For example, don't persist:

```json
{
  "items": [...],
  "itemCount": 4,
  "total": 59.99
}
```

when `itemCount` and `total` can be calculated from `items`.

---

# Step 4: Create the HydratedBloc

Now we can create the main component.

Create `cart_bloc.dart`:

```dart
import 'package:hydrated_bloc/hydrated_bloc.dart';

import '../models/cart_item.dart';
import 'cart_event.dart';
import 'cart_state.dart';

class CartBloc extends HydratedBloc<CartEvent, CartState> {
  CartBloc() : super(const CartState()) {
    on<AddItem>(_onAddItem);
    on<RemoveItem>(_onRemoveItem);
    on<ClearCart>(_onClearCart);
  }

  void _onAddItem(
    AddItem event,
    Emitter<CartState> emit,
  ) {
    final items = [...state.items];

    final existingIndex = items.indexWhere(
      (item) => item.id == event.item.id,
    );

    if (existingIndex == -1) {
      items.add(event.item);
    } else {
      final existing = items[existingIndex];

      items[existingIndex] = existing.copyWith(
        quantity: existing.quantity + event.item.quantity,
      );
    }

    emit(
      state.copyWith(
        items: items,
      ),
    );
  }

  void _onRemoveItem(
    RemoveItem event,
    Emitter<CartState> emit,
  ) {
    final items = state.items
        .where((item) => item.id != event.itemId)
        .toList();

    emit(
      state.copyWith(
        items: items,
      ),
    );
  }

  void _onClearCart(
    ClearCart event,
    Emitter<CartState> emit,
  ) {
    emit(const CartState());
  }

  @override
  CartState? fromJson(Map<String, dynamic> json) {
    try {
      final rawItems = json['items'];

      if (rawItems is! List) {
        return const CartState();
      }

      final items = rawItems
          .map(
            (item) => CartItem.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      return CartState(
        items: items,
      );
    } catch (_) {
      return const CartState();
    }
  }

  @override
  Map<String, dynamic>? toJson(CartState state) {
    return {
      'items': state.items
          .map((item) => item.toJson())
          .toList(),
    };
  }

  @override
  String get storagePrefix => 'cart_bloc_v1';
}
```

This is the heart of the implementation.

---

# Understanding the Event Handlers

The first handler is:

```dart
on<AddItem>(_onAddItem);
```

When the application dispatches:

```dart
context.read<CartBloc>().add(
  AddItem(
    CartItem(
      id: 'coffee',
      name: 'Coffee',
      price: 4.99,
      quantity: 1,
    ),
  ),
);
```

the Bloc receives the event and executes:

```dart
_onAddItem(...)
```

The handler checks whether the product already exists.

If it doesn't:

```dart
items.add(event.item);
```

If it does:

```dart
items[existingIndex] = existing.copyWith(
  quantity: existing.quantity + event.item.quantity,
);
```

Then a new immutable state is emitted:

```dart
emit(
  state.copyWith(
    items: items,
  ),
);
```

Because this is a `HydratedBloc`, the new state is automatically serialized.

---

# Understanding `toJson()`

Our state contains a list of custom objects:

```dart
List<CartItem>
```

Hydrated Bloc expects the state to be represented as:

```dart
Map<String, dynamic>
```

So we explicitly map every item:

```dart
@override
Map<String, dynamic>? toJson(CartState state) {
  return {
    'items': state.items
        .map((item) => item.toJson())
        .toList(),
  };
}
```

A cart containing two items might therefore become conceptually:

```json
{
  "items": [
    {
      "id": "coffee",
      "name": "Coffee",
      "price": 4.99,
      "quantity": 2
    },
    {
      "id": "book",
      "name": "Flutter Book",
      "price": 29.99,
      "quantity": 1
    }
  ]
}
```

The nested objects are now ordinary JSON-compatible maps.

---

# Understanding `fromJson()`

Restoration works in the opposite direction.

Hydrated Bloc gives us:

```dart
Map<String, dynamic>
```

and we need to recreate:

```text
Map
 ↓
List
 ↓
CartItem
 ↓
CartState
```

Our implementation begins with validation:

```dart
final rawItems = json['items'];

if (rawItems is! List) {
  return const CartState();
}
```

Then each item is reconstructed:

```dart
final items = rawItems
    .map(
      (item) => CartItem.fromJson(
        Map<String, dynamic>.from(item as Map),
      ),
    )
    .toList();
```

Finally:

```dart
return CartState(
  items: items,
);
```

The persisted representation has now become a normal application state again.

---

# Why Explicit Nested Serialization Matters

When dealing with nested models, it is important that your serialized representation actually contains JSON-compatible data.

This:

```dart
{
  'items': state.items
      .map((item) => item.toJson())
      .toList(),
}
```

is preferable to relying on arbitrary object instances being stored as part of the state representation.

The storage boundary should be explicit:

```text
CartState
   ↓
CartItem
   ↓
Map<String, dynamic>
   ↓
Hydrated Storage
```

This also makes serialization easy to unit-test independently from persistence.

---

# Step 5: Add the Flutter UI

Now let's connect the Bloc to Flutter.

Create `cart_page.dart`:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import '../bloc/cart_bloc.dart';
import '../bloc/cart_event.dart';
import '../bloc/cart_state.dart';
import '../models/cart_item.dart';

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
        actions: [
          BlocBuilder<CartBloc, CartState>(
            builder: (context, state) {
              if (state.isEmpty) {
                return const SizedBox.shrink();
              }

              return IconButton(
                tooltip: 'Clear cart',
                onPressed: () {
                  context.read<CartBloc>().add(
                    const ClearCart(),
                  );
                },
                icon: const Icon(Icons.delete_sweep),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.isEmpty) {
            return const Center(
              child: Text(
                'Your cart is empty.',
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: state.items.length,
                  itemBuilder: (context, index) {
                    final item = state.items[index];

                    return ListTile(
                      title: Text(item.name),
                      subtitle: Text(
                        '\$${item.price.toStringAsFixed(2)} '
                        '× ${item.quantity}',
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '\$${item.total.toStringAsFixed(2)}',
                          ),
                          IconButton(
                            tooltip: 'Remove item',
                            onPressed: () {
                              context.read<CartBloc>().add(
                                RemoveItem(item.id),
                              );
                            },
                            icon: const Icon(
                              Icons.remove_circle_outline,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total: '
                        '\$${state.total.toStringAsFixed(2)}',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge,
                      ),
                      FilledButton(
                        onPressed: () {
                          context.read<CartBloc>().add(
                                AddItem(
                                  const CartItem(
                                    id: 'coffee',
                                    name: 'Coffee',
                                    price: 4.99,
                                    quantity: 1,
                                  ),
                                ),
                              );
                        },
                        child: const Text(
                          'Add Coffee',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

Notice what the UI does **not** do.

It doesn't:

```dart
SharedPreferences.setString(...)
```

It doesn't:

```dart
HydratedBloc.storage.write(...)
```

It doesn't manually load the cart.

It simply dispatches events:

```dart
context.read<CartBloc>().add(
  AddItem(...),
);
```

or:

```dart
context.read<CartBloc>().add(
  RemoveItem(item.id),
);
```

The Bloc owns the state transition.

---

# Step 6: Provide the Bloc

Now create the root application:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

import 'bloc/cart_bloc.dart';
import 'pages/cart_page.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HydratedBloc Cart',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
        ),
        useMaterial3: true,
      ),
      home: BlocProvider(
        create: (_) => CartBloc(),
        child: const CartPage(),
      ),
    );
  }
}
```

The `CartBloc` is created here:

```dart
BlocProvider(
  create: (_) => CartBloc(),
  child: const CartPage(),
)
```

Because the global Hydrated storage was initialized before `runApp()`, the Bloc can immediately attempt to restore its previous state.

---

# Complete Runnable Example

For convenience, here is the complete example in one `main.dart` file.

```dart
import 'package:flutter/foundation.dart';
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = await HydratedStorage.build(
    storageDirectory: kIsWeb
        ? HydratedStorageDirectory.web
        : HydratedStorageDirectory(
            (await getApplicationDocumentsDirectory()).path,
          ),
  );

  HydratedBloc.storage = storage;

  runApp(const MyApp());
}

class CartItem {
  final String id;
  final String name;
  final double price;
  final int quantity;

  const CartItem({
    required this.id,
    required this.name,
    required this.price,
    required this.quantity,
  });

  CartItem copyWith({
    String? id,
    String? name,
    double? price,
    int? quantity,
  }) {
    return CartItem(
      id: id ?? this.id,
      name: name ?? this.name,
      price: price ?? this.price,
      quantity: quantity ?? this.quantity,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'price': price,
      'quantity': quantity,
    };
  }

  factory CartItem.fromJson(Map<String, dynamic> json) {
    final id = json['id'];
    final name = json['name'];
    final price = json['price'];
    final quantity = json['quantity'];

    if (id is! String ||
        name is! String ||
        price is! num ||
        quantity is! int ||
        quantity < 1) {
      throw const FormatException(
        'Invalid cart item data.',
      );
    }

    return CartItem(
      id: id,
      name: name,
      price: price.toDouble(),
      quantity: quantity,
    );
  }

  double get total => price * quantity;
}

sealed class CartEvent {
  const CartEvent();
}

final class AddItem extends CartEvent {
  final CartItem item;

  const AddItem(this.item);
}

final class RemoveItem extends CartEvent {
  final String itemId;

  const RemoveItem(this.itemId);
}

final class ClearCart extends CartEvent {
  const ClearCart();
}

class CartState {
  final List<CartItem> items;

  const CartState({
    this.items = const [],
  });

  CartState copyWith({
    List<CartItem>? items,
  }) {
    return CartState(
      items: List.unmodifiable(
        items ?? this.items,
      ),
    );
  }

  double get total {
    return items.fold(
      0,
      (sum, item) => sum + item.total,
    );
  }

  int get itemCount {
    return items.fold(
      0,
      (sum, item) => sum + item.quantity,
    );
  }

  bool get isEmpty => items.isEmpty;
}

class CartBloc extends HydratedBloc<CartEvent, CartState> {
  CartBloc() : super(const CartState()) {
    on<AddItem>(_onAddItem);
    on<RemoveItem>(_onRemoveItem);
    on<ClearCart>(_onClearCart);
  }

  void _onAddItem(
    AddItem event,
    Emitter<CartState> emit,
  ) {
    final items = [...state.items];

    final existingIndex = items.indexWhere(
      (item) => item.id == event.item.id,
    );

    if (existingIndex == -1) {
      items.add(event.item);
    } else {
      final existing = items[existingIndex];

      items[existingIndex] = existing.copyWith(
        quantity: existing.quantity + event.item.quantity,
      );
    }

    emit(
      state.copyWith(
        items: items,
      ),
    );
  }

  void _onRemoveItem(
    RemoveItem event,
    Emitter<CartState> emit,
  ) {
    final items = state.items
        .where((item) => item.id != event.itemId)
        .toList();

    emit(
      state.copyWith(
        items: items,
      ),
    );
  }

  void _onClearCart(
    ClearCart event,
    Emitter<CartState> emit,
  ) {
    emit(const CartState());
  }

  @override
  CartState? fromJson(Map<String, dynamic> json) {
    try {
      final rawItems = json['items'];

      if (rawItems is! List) {
        return const CartState();
      }

      final items = rawItems
          .map(
            (item) => CartItem.fromJson(
              Map<String, dynamic>.from(item as Map),
            ),
          )
          .toList();

      return CartState(
        items: items,
      );
    } catch (_) {
      return const CartState();
    }
  }

  @override
  Map<String, dynamic>? toJson(CartState state) {
    return {
      'items': state.items
          .map((item) => item.toJson())
          .toList(),
    };
  }

  @override
  String get storagePrefix => 'cart_bloc_v1';
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      debugShowCheckedModeBanner: false,
      title: 'HydratedBloc Cart',
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: Colors.blue,
        ),
        useMaterial3: true,
      ),
      home: BlocProvider(
        create: (_) => CartBloc(),
        child: const CartPage(),
      ),
    );
  }
}

class CartPage extends StatelessWidget {
  const CartPage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('Shopping Cart'),
        actions: [
          BlocBuilder<CartBloc, CartState>(
            builder: (context, state) {
              if (state.isEmpty) {
                return const SizedBox.shrink();
              }

              return IconButton(
                tooltip: 'Clear cart',
                onPressed: () {
                  context.read<CartBloc>().add(
                    const ClearCart(),
                  );
                },
                icon: const Icon(Icons.delete_sweep),
              );
            },
          ),
        ],
      ),
      body: BlocBuilder<CartBloc, CartState>(
        builder: (context, state) {
          if (state.isEmpty) {
            return Center(
              child: FilledButton(
                onPressed: () {
                  context.read<CartBloc>().add(
                    const AddItem(
                      CartItem(
                        id: 'coffee',
                        name: 'Coffee',
                        price: 4.99,
                        quantity: 1,
                      ),
                    ),
                  );
                },
                child: const Text(
                  'Add Coffee',
                ),
              ),
            );
          }

          return Column(
            children: [
              Expanded(
                child: ListView.builder(
                  itemCount: state.items.length,
                  itemBuilder: (context, index) {
                    final item = state.items[index];

                    return ListTile(
                      title: Text(item.name),
                      subtitle: Text(
                        '\$${item.price.toStringAsFixed(2)} '
                        '× ${item.quantity}',
                      ),
                      trailing: Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          Text(
                            '\$${item.total.toStringAsFixed(2)}',
                          ),
                          IconButton(
                            tooltip: 'Remove item',
                            onPressed: () {
                              context.read<CartBloc>().add(
                                RemoveItem(item.id),
                              );
                            },
                            icon: const Icon(
                              Icons.remove_circle_outline,
                            ),
                          ),
                        ],
                      ),
                    );
                  },
                ),
              ),
              SafeArea(
                child: Padding(
                  padding: const EdgeInsets.all(16),
                  child: Row(
                    mainAxisAlignment:
                        MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Total: '
                        '\$${state.total.toStringAsFixed(2)}',
                        style: Theme.of(context)
                            .textTheme
                            .titleLarge,
                      ),
                      FilledButton(
                        onPressed: () {
                          context.read<CartBloc>().add(
                                const AddItem(
                                  CartItem(
                                    id: 'coffee',
                                    name: 'Coffee',
                                    price: 4.99,
                                    quantity: 1,
                                  ),
                                ),
                              );
                        },
                        child: const Text(
                          'Add Coffee',
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

---

# What Happens During an App Restart?

Suppose the user adds:

```text
Coffee × 2
Flutter Book × 1
```

The in-memory state is approximately:

```text
CartState
 └── items
      ├── Coffee × 2
      └── Flutter Book × 1
```

HydratedBloc serializes it:

```json
{
  "items": [
    {
      "id": "coffee",
      "name": "Coffee",
      "price": 4.99,
      "quantity": 2
    },
    {
      "id": "book",
      "name": "Flutter Book",
      "price": 29.99,
      "quantity": 1
    }
  ]
}
```

The application closes.

Later:

```text
Application starts
        ↓
HydratedStorage initialized
        ↓
CartBloc created
        ↓
Persisted state read
        ↓
fromJson()
        ↓
CartState reconstructed
        ↓
BlocBuilder receives restored state
        ↓
Cart displayed
```

The user sees their previous cart without the application having to manually query storage from the UI.

---

# Advanced Topic: Stable `storagePrefix`

One subtle but important production concern is the storage key.

Hydrated Bloc uses `storagePrefix` to determine the namespace used for a Bloc or Cubit's persisted state.

The default is based on `runtimeType`, but the official documentation warns that this isn't resilient to obfuscation or minification. This is particularly relevant for web applications, where generated runtime names can change between builds.

That's why our example explicitly uses:

```dart
@override
String get storagePrefix => 'cart_bloc_v1';
```

This is better than relying entirely on:

```text
runtimeType
```

for long-lived production state.

A stable prefix makes the persistence contract explicit.

---

# State Schema Versioning

Consider your first release.

Your state is:

```json
{
  "items": [...]
}
```

Later, you change the model.

Perhaps you rename:

```text
price
```

to:

```text
unitPrice
```

or introduce:

```text
discount
```

Now older installations may still contain the previous representation.

This is a fundamental problem with persisted state:

> Your application code changes, but stored data can outlive the code that created it.

---

# Using `storagePrefix` as a Schema Boundary

One simple migration strategy is to deliberately change the storage prefix:

```dart
@override
String get storagePrefix => 'cart_bloc_v2';
```

The old:

```text
cart_bloc_v1
```

and new:

```text
cart_bloc_v2
```

represent different persistence namespaces.

If the new Bloc doesn't understand the old schema, this is a clean way to invalidate the previous persisted state.

Conceptually:

```text
Application v1
     ↓
cart_bloc_v1
     ↓
App update
     ↓
Application v2
     ↓
cart_bloc_v2
```

The application starts with the new schema rather than trying to deserialize incompatible data.

This approach is particularly useful when the persisted state is disposable, such as:

- A cart that can be reconstructed.
- A local UI preference.
- A temporary offline cache.
- A small local cache.

---

# When You Actually Need Migration

Changing the prefix isn't always the best solution.

Suppose the state contains valuable offline data that you cannot simply discard.

Then you may want to preserve the same storage namespace and make `fromJson()` backwards-compatible.

For example:

```dart
@override
CartState? fromJson(Map<String, dynamic> json) {
  try {
    final version = json['version'];

    if (version == 1) {
      return _fromVersion1(json);
    }

    if (version == 2) {
      return _fromVersion2(json);
    }

    return const CartState();
  } catch (_) {
    return const CartState();
  }
}
```

You could also include an explicit version in `toJson()`:

```dart
@override
Map<String, dynamic>? toJson(CartState state) {
  return {
    'version': 2,
    'items': state.items
        .map((item) => item.toJson())
        .toList(),
  };
}
```

This creates a much more explicit persistence contract:

```text
Stored State
    │
    ├── version 1 → migrate
    │
    ├── version 2 → restore
    │
    └── unknown   → discard/fallback
```

For production applications, think about persisted state as a data format that needs compatibility—not just an implementation detail.

---

# Choosing Between Prefix Changes and Migrations

A useful strategy is:

| Situation | Recommended approach |
|---|---|
| Data is disposable | Change `storagePrefix` |
| State is small and easy to recreate | Change prefix |
| Data is valuable offline state | Implement migration |
| Schema changed completely | New prefix may be simpler |
| Small backward-compatible change | Keep prefix and support old fields |
| Large multi-version application | Explicit schema versioning |

Don't over-engineer migrations for data that can safely be regenerated.

But don't casually discard valuable offline state either.

---

# Handling Invalid Persisted State

Persistent storage should always be considered untrusted from the perspective of your current application code.

This is why this is dangerous:

```dart
final items = (json['items'] as List)
    .map(...)
    .toList();
```

If the stored data is malformed, this can throw.

Instead:

```dart
@override
CartState? fromJson(Map<String, dynamic> json) {
  try {
    final rawItems = json['items'];

    if (rawItems is! List) {
      return const CartState();
    }

    final items = rawItems
        .map(
          (item) => CartItem.fromJson(
            Map<String, dynamic>.from(item as Map),
          ),
        )
        .toList();

    return CartState(items: items);
  } catch (_) {
    return const CartState();
  }
}
```

This gives your application a safe recovery path.

For production applications, consider logging the exception rather than silently swallowing it:

```dart
catch (error, stackTrace) {
  // Send to your application's logging/crash-reporting system.
  return const CartState();
}
```

Don't expose sensitive persisted data in logs.

---

# Hydration Errors

Hydrated Bloc also provides mechanisms for handling hydration failures.

The package documentation describes a custom `onError` callback when using the hydrated mixin, which can control behavior after hydration errors.

For most application-level state, however, defensive `fromJson()` implementations are the first line of defense.

The principle is:

```text
Bad persisted state
       ↓
Don't crash the application
       ↓
Recover to a valid state
       ↓
Continue normally
```

---

# Testing HydratedBloc

Persistence should be tested separately from your UI.

There are really three things worth testing:

1. Event-driven state transitions.
2. JSON serialization/deserialization.
3. Restoration from storage.

The current `hydrated_bloc` documentation recommends stubbing the `Storage` implementation with `mocktail` for tests. It does **not** currently provide a public `MockHydratedStorage` helper as part of `hydrated_bloc`; instead, the recommended pattern is to create your own `MockStorage` implementing `Storage`.

This distinction matters because many older tutorials refer to helpers such as `mockHydratedStorage` or `MockHydratedStorage`. For current `hydrated_bloc`, prefer the package's documented `Storage` + `mocktail` approach.

---

# Test Dependencies

Add:

```yaml
dev_dependencies:
  flutter_test:
    sdk: flutter

  bloc_test: ^10.0.0
  mocktail: ^1.0.4
```

Use versions compatible with the versions selected by your project's dependency solver.

---

# Create a Mock Storage

Create:

```dart
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:mocktail/mocktail.dart';

class MockStorage extends Mock implements Storage {}
```

Then configure it:

```dart
import 'package:flutter_test/flutter_test.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  late Storage storage;

  setUp(() {
    storage = MockStorage();

    when(
      () => storage.write(
        any(),
        any<dynamic>(),
      ),
    ).thenAnswer((_) async {});

    HydratedBloc.storage = storage;
  });

  tearDown(() async {
    await HydratedBloc.storage.clear();
  });
}
```

The official package documentation recommends this general pattern for unit tests.

---

# Testing Cart Events

A normal Bloc test can verify that events produce the expected states.

```dart
import 'package:bloc_test/bloc_test.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:mocktail/mocktail.dart';

void main() {
  late Storage storage;

  const coffee = CartItem(
    id: 'coffee',
    name: 'Coffee',
    price: 4.99,
    quantity: 1,
  );

  setUp(() {
    storage = MockStorage();

    when(
      () => storage.write(
        any(),
        any<dynamic>(),
      ),
    ).thenAnswer((_) async {});

    HydratedBloc.storage = storage;
  });

  tearDown(() async {
    await HydratedBloc.storage.clear();
  });

  blocTest<CartBloc, CartState>(
    'adds an item to the cart',
    build: CartBloc.new,
    act: (bloc) => bloc.add(
      const AddItem(coffee),
    ),
    expect: () => [
      const CartState(
        items: [
          coffee,
        ],
      ),
    ],
  );

  blocTest<CartBloc, CartState>(
    'removes an item from the cart',
    build: () => CartBloc(),
    seed: () => const CartState(
      items: [
        coffee,
      ],
    ),
    act: (bloc) => bloc.add(
      const RemoveItem('coffee'),
    ),
    expect: () => [
      const CartState(),
    ],
  );

  blocTest<CartBloc, CartState>(
    'clears the cart',
    build: () => CartBloc(),
    seed: () => const CartState(
      items: [
        coffee,
      ],
    ),
    act: (bloc) => bloc.add(
      const ClearCart(),
    ),
    expect: () => [
      const CartState(),
    ],
  );
}
```

One important detail: if your production `CartState` uses immutable collections and custom equality, you should implement value equality appropriately—for example with `Equatable` or another immutable-state approach—so tests and UI rebuild behavior remain predictable.

For a concise tutorial, the example above keeps the model simple.

---

# Testing `toJson()` and `fromJson()`

Serialization deserves its own tests.

```dart
test(
  'serializes and deserializes cart state',
  () {
    const state = CartState(
      items: [
        CartItem(
          id: 'coffee',
          name: 'Coffee',
          price: 4.99,
          quantity: 2,
        ),
      ],
    );

    final bloc = CartBloc();

    final json = bloc.toJson(state);
    final restored = bloc.fromJson(json!);

    expect(restored?.items.length, 1);
    expect(restored?.items.first.id, 'coffee');
    expect(restored?.items.first.quantity, 2);
    expect(restored?.items.first.price, 4.99);

    bloc.close();
  },
);
```

This test verifies the persistence boundary without depending on a real filesystem.

That's valuable because serialization bugs are often subtle.

For example:

```text
CartState
 ↓
toJson()
 ↓
Map
 ↓
fromJson()
 ↓
CartState
```

should preserve the important information.

---

# Testing Actual Hydration

The most useful persistence test is restoring state from mocked storage.

Suppose the stored JSON is:

```dart
final cachedState = {
  'items': [
    {
      'id': 'coffee',
      'name': 'Coffee',
      'price': 4.99,
      'quantity': 2,
    },
  ],
};
```

Configure the mock:

```dart
when(
  () => storage.read('cart_bloc_v1'),
).thenReturn(cachedState);
```

Then create the Bloc:

```dart
final bloc = CartBloc();

expect(bloc.state.items.length, 1);
expect(bloc.state.items.first.name, 'Coffee');
expect(bloc.state.items.first.quantity, 2);

await bloc.close();
```

The exact storage key must match your `storagePrefix`.

The official documentation also demonstrates stubbing `storage.read()` to return cached state when testing hydration.

---

# Testing the Persistence Write

You can also verify that a state transition results in a storage write:

```dart
blocTest<CartBloc, CartState>(
  'persists state after adding an item',
  build: CartBloc.new,
  act: (bloc) => bloc.add(
    const AddItem(
      CartItem(
        id: 'coffee',
        name: 'Coffee',
        price: 4.99,
        quantity: 1,
      ),
    ),
  ),
  expect: () => [
    const CartState(
      items: [
        CartItem(
          id: 'coffee',
          name: 'Coffee',
          price: 4.99,
          quantity: 1,
        ),
      ],
    ),
  ],
  verify: (_) {
    verify(
      () => storage.write(
        'cart_bloc_v1',
        any<dynamic>(),
      ),
    ).called(1);
  },
);
```

This tests an important property:

```text
Event
 ↓
State change
 ↓
HydratedBloc serialization
 ↓
Storage write
```

---

# Production Consideration: Don't Persist Events

One common conceptual mistake is assuming HydratedBloc persists the events themselves.

It doesn't.

You don't want:

```text
AddItem
RemoveItem
AddItem
ClearCart
...
```

to be replayed after an application restart.

HydratedBloc persists the **current state**.

That means the application can restore:

```text
Current CartState
```

without replaying every historical event.

This is an important distinction:

```text
Event history
≠
Persisted state
```

HydratedBloc is primarily a **state persistence mechanism**, not an event-sourcing system.

---

# Production Consideration: Keep Events Ephemeral

Events should generally represent things happening now:

```dart
AddItem(...)
RemoveItem(...)
ClearCart()
```

They aren't database records.

Once processed, their job is finished.

The durable representation should be the resulting state:

```text
Event
   ↓
Business Logic
   ↓
New State
   ↓
Persistence
```

This makes hydration predictable.

---

# Production Consideration: Don't Store Huge State Objects

HydratedBloc is extremely useful, but it shouldn't automatically become your database.

A cart containing a few dozen items is reasonable.

A state containing:

```text
100,000 products
50,000 messages
Large images
Huge API responses
Binary files
Complex relational datasets
```

is a different problem.

For large offline datasets, consider a dedicated database such as SQLite or another appropriate persistence layer.

A good architecture is often:

```text
HydratedBloc
     │
     ├── Small durable UI/application state
     │
     └── Repository
            │
            └── Database / API
```

The Bloc controls application state.

The repository controls persistent domain data.

---

# Production Consideration: Sensitive Data

Hydrated storage should not automatically be treated as secure credential storage.

Avoid placing secrets such as:

- Passwords.
- Private keys.
- Long-lived authentication credentials.
- Highly sensitive personal information.

into ordinary hydrated state.

If sensitive credentials need local persistence, use an appropriate secure-storage mechanism and keep the credential lifecycle separate from ordinary application state.

---

# Production Consideration: Logout

Consider a multi-user application.

User A logs in:

```text
User A
 ↓
CartBloc
 ↓
Hydrated state
```

User A logs out.

User B logs in:

```text
User B
 ↓
Same application
 ↓
Same hydrated state?
```

This can become a serious data-isolation problem.

If hydrated state is user-specific, you need an explicit strategy.

One simple approach is to clear hydrated storage during logout:

```dart
await HydratedBloc.storage.clear();
```

However, this clears the global hydrated storage, so don't blindly use it if some persisted state should survive logout—for example, a global theme preference.

Another option is to use user-specific persistence namespaces:

```text
cart_user_123
cart_user_456
```

or move user-specific data into a repository/database layer.

The correct choice depends on your application's architecture.

---

# Production Consideration: Derived State

Avoid persisting redundant values.

Suppose your state has:

```dart
class CartState {
  final List<CartItem> items;

  double get total => ...;
}
```

Persist:

```json
{
  "items": [...]
}
```

not:

```json
{
  "items": [...],
  "total": 39.99
}
```

Why?

Because redundant persisted values can become inconsistent.

For example:

```text
items → changed
total → forgotten
```

Now the persisted state contains conflicting information.

Instead:

```text
Persist source data
       ↓
Calculate derived values
       ↓
Expose to UI
```

This makes state restoration deterministic.

---

# Production Consideration: Stable Storage Contracts

Treat the following as part of your persistence API:

```text
storagePrefix
JSON keys
JSON value types
Model serialization
Schema version
```

Changing:

```dart
'items'
```

to:

```dart
'products'
```

isn't merely a refactor when old state is persisted.

It can affect users who upgrade the application.

Therefore, persisted state deserves the same care you would give to an API response or database schema.

---

# A Practical Architecture

For a production Flutter application, a useful architecture can look like this:

```text
                    Flutter UI
                        │
                        │ Events
                        ▼
                  ┌───────────┐
                  │ CartBloc  │
                  └─────┬─────┘
                        │
                 State transitions
                        │
                        ▼
                  ┌───────────┐
                  │ CartState │
                  └─────┬─────┘
                        │
                  toJson/fromJson
                        │
                        ▼
               ┌─────────────────┐
               │ HydratedStorage │
               └─────────────────┘

                        │
                        │ Larger/remote data
                        ▼
                 ┌─────────────┐
                 │ Repository  │
                 └──────┬──────┘
                        │
              ┌─────────┴─────────┐
              ▼                   ▼
           Database              API
```

This prevents HydratedBloc from becoming a dumping ground for every piece of application data.

---

# HydratedBloc in an Offline-First Application

One particularly useful pattern is combining HydratedBloc with a repository.

For example:

```text
Launch application
       ↓
HydratedBloc restores previous UI/application state
       ↓
UI becomes immediately usable
       ↓
Repository loads fresh data
       ↓
Server response arrives
       ↓
Bloc emits updated state
       ↓
HydratedBloc persists updated state
```

This gives users an experience where previously available information can appear immediately while fresh network data is fetched.

However, don't confuse hydrated state with authoritative server data.

The backend may still be the source of truth.

Hydrated state can simply provide a fast local representation.

---

# HydratedBloc vs. Database

A useful mental model is:

| Requirement | HydratedBloc | Database |
|---|---:|---:|
| Persist small state | Excellent | Good |
| Restore Bloc state | Excellent | Requires integration |
| Event-driven business logic | Excellent | No |
| Large datasets | Poor fit | Excellent |
| Complex queries | Poor fit | Excellent |
| Offline cache | Good for small state | Excellent |
| Relational data | Poor fit | Excellent |
| UI preferences | Excellent | Often unnecessary |
| Authentication secrets | Not recommended | Depends on secure architecture |
| State restoration | Excellent | Requires mapping |

HydratedBloc isn't trying to replace a database.

Its purpose is much narrower and often much more convenient:

> **Persist the state produced by your state-management layer.**

---

# The Complete Lifecycle

Once you understand the architecture, the entire lifecycle becomes simple.

### Application startup

```text
main()
 ↓
HydratedStorage initialized
 ↓
runApp()
```

### Bloc creation

```text
CartBloc()
 ↓
HydratedBloc reads storage
 ↓
fromJson()
 ↓
CartState restored
```

### User interaction

```text
User taps "Add"
 ↓
AddItem event
 ↓
CartBloc
 ↓
New CartState
```

### Persistence

```text
New CartState
 ↓
toJson()
 ↓
HydratedStorage
```

### Application restart

```text
Application closes
 ↓
Application launches
 ↓
Storage read
 ↓
fromJson()
 ↓
CartState restored
```

There is no need to manually orchestrate this lifecycle from your widgets.

---

# Common Mistakes to Avoid

## Mistake 1: Persisting UI Widgets or Controllers

Don't attempt to persist:

```text
TextEditingController
AnimationController
ScrollController
BuildContext
StreamSubscription
FocusNode
```

Persist data, not framework runtime objects.

---

## Mistake 2: Persisting Temporary States

Avoid storing:

```text
isLoading
isSubmitting
isAnimating
hasFocus
isRefreshing
```

unless there is a very specific reason.

These values describe the current runtime rather than durable application state.

---

## Mistake 3: Assuming Stored Data Is Always Valid

Always validate:

```dart
json['items']
```

and nested fields.

The application should be able to recover from incompatible or malformed persisted state.

---

## Mistake 4: Using Runtime Type as Your Long-Term Storage Contract

For production persistence, consider an explicit:

```dart
storagePrefix
```

The official documentation specifically recommends overriding it because `runtimeType` isn't resilient to obfuscation/minification.

---

## Mistake 5: Turning HydratedBloc Into a Database

If your state is becoming enormous, stop and reconsider the architecture.

HydratedBloc is for persisted state.

A database is for persistent data.

Those are related but different responsibilities.

---

# When HydratedBloc Is the Right Choice

Use `HydratedBloc` when you have:

- Complex state transitions.
- Multiple domain events.
- Business logic that benefits from explicit events.
- Small-to-medium state that should survive restarts.
- Offline-friendly application state.
- Local drafts or workflows.
- Persisted user preferences with non-trivial transitions.
- State that can be cleanly serialized to JSON.

For simpler state:

```text
Toggle
Set
Increment
Select
```

`HydratedCubit` may be easier.

For complex event-driven behavior:

```text
Add
Remove
Update
Refresh
Retry
Submit
Cancel
Sync
Clear
```

`HydratedBloc` can provide a cleaner abstraction.

---

# Conclusion

`HydratedBloc` combines two powerful architectural ideas:

```text
Event-driven business logic
+
Persistent application state
```

Traditional Bloc gives you:

```text
Event
 ↓
Business Logic
 ↓
State
 ↓
UI
```

HydratedBloc extends that model:

```text
                       ┌──────────────┐
                       │   Storage    │
                       └──────▲───────┘
                              │
                           fromJson
                              │
Event → HydratedBloc → State ─┘
              │
            toJson
              │
              ▼
           Storage
```

The key is that persistence doesn't change the fundamental Bloc architecture.

You still dispatch events.

You still keep business logic inside the Bloc.

You still emit immutable state.

You still let the UI react to state.

Hydration simply gives that state a lifecycle that extends beyond the current application process.

For production applications, the most important practices are:

1. Initialize `HydratedStorage` before creating hydrated Blocs.
2. Use explicit `toJson()` and `fromJson()` implementations.
3. Validate persisted data defensively.
4. Keep persisted state relatively small.
5. Persist source-of-truth data rather than derived values.
6. Use a stable `storagePrefix`.
7. Treat schema changes as a real migration concern.
8. Keep sensitive credentials out of ordinary hydrated state.
9. Test event transitions separately from serialization.
10. Test restoration using a mocked `Storage`.
11. Use a database/repository layer for large or relational datasets.
12. Treat hydrated state as application state—not as an event log or database.

Once these principles are in place, `HydratedBloc` becomes a powerful tool for building Flutter applications that don't simply react to events—they **remember the state those events produced**, even after the application has been closed and launched again.