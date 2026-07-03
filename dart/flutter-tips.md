---
sidebar_position: 23
title: Flutter Tips
description: Widgets, state management patterns, safe BuildContext usage, and helper extension methods in Flutter.
---

Flutter is built *on top of* Dart, but writing good Flutter code requires understanding some Flutter-specific patterns that go beyond the language itself. This chapter covers the Dart idioms that matter most when building Flutter apps.

---

## `const` Widgets — The Single Biggest Win

`const` widgets are **never rebuilt**. Flutter skips diffing them entirely. This is the cheapest optimisation you can make.

```dart
// ✅ const widgets — created once, reused
class MyScreen extends StatelessWidget {
  const MyScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return const Scaffold(
      body: Column(
        children: [
          Text('Hello'),            // const — never rebuilt
          SizedBox(height: 16),     // const
          Icon(Icons.star),         // const
          Divider(),                // const
        ],
      ),
    );
  }
}

// ✅ Enable the lint rule
// analysis_options.yaml:
//   prefer_const_constructors: true
//   prefer_const_literals_to_create_immutables: true

// ✅ Use const for widget configuration objects too
Container(
  padding: const EdgeInsets.all(16),       // const
  decoration: const BoxDecoration(          // const
    color: Colors.white,
    borderRadius: BorderRadius.all(Radius.circular(8)),
  ),
  child: const Text('Hello'),
)

// ❌ These cannot be const (depend on runtime data)
Text(user.name)                    // runtime value
Container(color: themeColor)       // runtime value
```

---

## Widget Lifecycle & StatefulWidget

```dart
class DataScreen extends StatefulWidget {
  final String userId;
  const DataScreen({super.key, required this.userId});

  @override
  State<DataScreen> createState() => _DataScreenState();
}

class _DataScreenState extends State<DataScreen> {
  // ── Fields ──────────────────────────────────────────────────────────
  late Future<User> _userFuture;
  final _scrollController = ScrollController();
  StreamSubscription<Event>? _eventSub;

  // ── Lifecycle ────────────────────────────────────────────────────────
  @override
  void initState() {
    super.initState();                    // ← always call first
    _userFuture = _loadUser();
    _eventSub = eventBus.listen(_onEvent);
    _scrollController.addListener(_onScroll);
  }

  @override
  void didChangeDependencies() {
    super.didChangeDependencies();
    // Called when InheritedWidget this depends on changes
    // Safe to call Theme.of(context), MediaQuery.of(context) etc. here
  }

  @override
  void didUpdateWidget(DataScreen oldWidget) {
    super.didUpdateWidget(oldWidget);
    // Called when parent rebuilds with a new widget instance
    if (oldWidget.userId != widget.userId) {
      _userFuture = _loadUser(); // reload when id changes
    }
  }

  @override
  void dispose() {
    _scrollController.dispose();  // ← always dispose controllers
    _eventSub?.cancel();          // ← always cancel subscriptions
    super.dispose();              // ← always call last
  }

  // ── Methods ──────────────────────────────────────────────────────────
  Future<User> _loadUser() => userService.getUser(widget.userId);

  void _onEvent(Event e) {
    if (!mounted) return;       // ← guard after any async gap
    setState(() { /* update */ });
  }

  void _onScroll() {
    if (_scrollController.position.atEdge &&
        _scrollController.position.pixels != 0) {
      _loadMore();
    }
  }

  @override
  Widget build(BuildContext context) {
    return FutureBuilder<User>(
      future: _userFuture,
      builder: (context, snapshot) => switch (snapshot.connectionState) {
        ConnectionState.waiting => const CircularProgressIndicator(),
        ConnectionState.done when snapshot.hasError =>
            Text('Error: ${snapshot.error}'),
        ConnectionState.done => UserCard(user: snapshot.data!),
        _ => const SizedBox.shrink(),
      },
    );
  }
}
```

---

## The `mounted` Guard

After every `await` inside a `State`, the widget may have been disposed. Always check:

```dart
class _MyState extends State<MyWidget> {
  Future<void> _handleTap() async {
    // Start loading
    setState(() => _isLoading = true);

    try {
      final result = await expensiveOperation();   // ← widget might be gone here

      if (!mounted) return;  // ← ALWAYS guard after await
      setState(() {
        _isLoading = false;
        _data = result;
      });
    } catch (e) {
      if (!mounted) return;  // ← guard in catch too
      setState(() => _isLoading = false);
      ScaffoldMessenger.of(context).showSnackBar( // ← context is safe now
        SnackBar(content: Text('Error: $e')),
      );
    }
  }
}
```

---

## Keys — When and Which

Keys tell Flutter which widget corresponds to which element when the tree changes shape:

```dart
// No key needed — widget type + position uniquely identify it
Column(children: [Text('A'), Text('B')]) // fine

// ValueKey — when reordering a list of same-type widgets
ListView(
  children: items.map((item) =>
    ItemTile(key: ValueKey(item.id), item: item), // ✅
  ).toList(),
)

// ObjectKey — when your id is not a value type
ListView(
  children: users.map((u) =>
    UserTile(key: ObjectKey(u), user: u), // unique by object identity
  ).toList(),
)

// GlobalKey — access a widget's State or RenderObject from outside
final _formKey = GlobalKey<FormState>();
Form(key: _formKey, child: ...)
// later:
if (_formKey.currentState!.validate()) { ... }

// UniqueKey — force a widget to be treated as brand new (reset its state)
Image(key: UniqueKey(), url: imageUrl); // re-creates widget on rebuild

// PageStorageKey — persist scroll position across tab switches
ListView(key: const PageStorageKey('feed'), ...)
```

---

## BuildContext Best Practices

```dart
// ✅ Never store BuildContext across async gaps
// Bad:
Future<void> _save() async {
  final ctx = context;          // ❌ context captured, but might be stale
  await saveData();
  Navigator.of(ctx).pop();      // ❌ dangerous
}

// Good:
Future<void> _save() async {
  await saveData();
  if (!mounted) return;          // ✅ guard
  Navigator.of(context).pop();   // ✅ safe
}

// ✅ Access inherited data in build(), not initState()
@override
void initState() {
  super.initState();
  // Theme.of(context); ❌ context not fully set up yet
}

@override
void didChangeDependencies() {
  super.didChangeDependencies();
  final theme = Theme.of(context); // ✅ safe here
}

@override
Widget build(BuildContext context) {
  final theme = Theme.of(context); // ✅ safest
}

// ✅ Extension for ergonomic context access
extension AppContext on BuildContext {
  ThemeData   get theme       => Theme.of(this);
  ColorScheme get colors      => Theme.of(this).colorScheme;
  TextTheme   get textTheme   => Theme.of(this).textTheme;
  double      get screenWidth  => MediaQuery.sizeOf(this).width;
  double      get screenHeight => MediaQuery.sizeOf(this).height;
  bool        get isTablet     => MediaQuery.sizeOf(this).width >= 600;
  bool        get isDark       => Theme.of(this).brightness == Brightness.dark;

  void showSnack(String msg, {bool isError = false}) =>
      ScaffoldMessenger.of(this).showSnackBar(
        SnackBar(
          content: Text(msg),
          backgroundColor: isError ? colors.error : null,
        ),
      );

  Future<T?> push<T>(Widget page) =>
      Navigator.of(this).push<T>(MaterialPageRoute(builder: (_) => page));

  void pop<T>([T? result]) => Navigator.of(this).pop(result);
}
```

---

## Immutable Data Models for Flutter

Flutter's reactive model works best with immutable data and `copyWith`:

```dart
class Todo {
  final String id;
  final String title;
  final bool isDone;
  final DateTime createdAt;

  const Todo({
    required this.id,
    required this.title,
    this.isDone = false,
    required this.createdAt,
  });

  // Factory constructors
  factory Todo.create(String title) => Todo(
    id: DateTime.now().millisecondsSinceEpoch.toString(),
    title: title,
    createdAt: DateTime.now(),
  );

  factory Todo.fromJson(Map<String, dynamic> json) => Todo(
    id:        json['id']         as String,
    title:     json['title']      as String,
    isDone:    json['is_done']    as bool? ?? false,
    createdAt: DateTime.parse(json['created_at'] as String),
  );

  // Serialization
  Map<String, dynamic> toJson() => {
    'id':         id,
    'title':      title,
    'is_done':    isDone,
    'created_at': createdAt.toIso8601String(),
  };

  // Immutable update — returns a new instance
  Todo copyWith({String? id, String? title, bool? isDone, DateTime? createdAt}) =>
      Todo(
        id:        id        ?? this.id,
        title:     title     ?? this.title,
        isDone:    isDone    ?? this.isDone,
        createdAt: createdAt ?? this.createdAt,
      );

  // Value equality — required for setState to detect changes
  @override
  bool operator ==(Object other) =>
      other is Todo &&
      id == other.id &&
      title == other.title &&
      isDone == other.isDone;

  @override
  int get hashCode => Object.hash(id, title, isDone);

  @override
  String toString() => 'Todo($id, "$title", done=$isDone)';
}

// Usage
var todo = Todo.create('Buy groceries');
var done = todo.copyWith(isDone: true);
// original is unchanged — state update triggers rebuild
```

---

## Sealed Classes for UI State

Replace fragile `isLoading` / `errorMessage` / `data` triplets with a single typed state:

```dart
sealed class UiState<T> {
  const UiState();
}
class Idle<T>    extends UiState<T> { const Idle(); }
class Loading<T> extends UiState<T> { const Loading(); }
class Success<T> extends UiState<T> {
  final T data;
  const Success(this.data);
}
class Failure<T> extends UiState<T> {
  final String message;
  final Object? cause;
  const Failure(this.message, [this.cause]);
}

// ViewModel
class UserViewModel extends ChangeNotifier {
  UiState<User> _state = const Idle();
  UiState<User> get state => _state;

  Future<void> load(String id) async {
    _state = const Loading();
    notifyListeners();

    try {
      final user = await userService.getUser(id);
      _state = Success(user);
    } catch (e) {
      _state = Failure('Failed to load user', e);
    } finally {
      notifyListeners();
    }
  }
}

// Widget — exhaustive, no fallthrough bugs
Widget build(BuildContext context) {
  return switch (viewModel.state) {
    Idle()              => const SizedBox.shrink(),
    Loading()           => const Center(child: CircularProgressIndicator()),
    Success(data: var u) => UserCard(user: u),
    Failure(message: var m) => ErrorView(
        message: m,
        onRetry: () => viewModel.load(widget.userId),
      ),
  };
}
```

---

## FutureBuilder & StreamBuilder Patterns

```dart
// ✅ FutureBuilder — for one-shot async data
FutureBuilder<List<Product>>(
  future: _productsFuture,  // ← store in a field, NOT Future.value() in build()
  builder: (context, snapshot) {
    if (snapshot.connectionState == ConnectionState.waiting) {
      return const CircularProgressIndicator();
    }
    if (snapshot.hasError) {
      return Text('Error: ${snapshot.error}');
    }
    final products = snapshot.requireData; // throws if no data
    return ProductList(products: products);
  },
)

// ⚠️ Don't create Futures inside build() — new Future on every rebuild!
// Bad:
FutureBuilder(future: fetchData(), ...) // ← fetchData() called every build
// Good:
class _State extends State<MyWidget> {
  late final _future = fetchData(); // computed once in initState effectively
  ...
  FutureBuilder(future: _future, ...)
}

// ✅ StreamBuilder — for live data
StreamBuilder<List<Message>>(
  stream: chatService.messagesStream(roomId),
  builder: (context, snapshot) => switch (snapshot.connectionState) {
    ConnectionState.none    => const Text('Not connected'),
    ConnectionState.waiting => const CircularProgressIndicator(),
    ConnectionState.active ||
    ConnectionState.done    => snapshot.hasError
        ? Text('Error: ${snapshot.error}')
        : MessageList(messages: snapshot.requireData),
  },
)
```

---

## Widget Composition Over Inheritance

Flutter's motto: **prefer composition over inheritance** for UI.

```dart
// ❌ Don't inherit from widgets to customise them
class MyButton extends ElevatedButton { ... } // fragile, fights the framework

// ✅ Compose small widgets into larger ones
class PrimaryButton extends StatelessWidget {
  final String label;
  final VoidCallback? onPressed;
  final bool isLoading;

  const PrimaryButton({
    super.key,
    required this.label,
    this.onPressed,
    this.isLoading = false,
  });

  @override
  Widget build(BuildContext context) {
    return ElevatedButton(
      onPressed: isLoading ? null : onPressed,
      style: ElevatedButton.styleFrom(
        minimumSize: const Size(double.infinity, 48),
      ),
      child: isLoading
          ? const SizedBox.square(
              dimension: 20,
              child: CircularProgressIndicator(strokeWidth: 2),
            )
          : Text(label),
    );
  }
}

// ✅ Extract repeated widget subtrees
class SectionHeader extends StatelessWidget {
  final String title;
  final Widget? trailing;
  const SectionHeader({super.key, required this.title, this.trailing});

  @override
  Widget build(BuildContext context) {
    return Row(
      children: [
        Text(title, style: context.textTheme.titleMedium),
        const Spacer(),
        if (trailing != null) trailing!,
      ],
    );
  }
}
```

---

## Common Flutter-Dart Patterns

```dart
// ✅ Spread in widget children (cleaner than conditional list building)
Column(
  children: [
    const Header(),
    if (isLoggedIn) const UserCard(),
    ...items.map((item) => ItemTile(item: item)),
    if (items.isEmpty) const EmptyState(),
    const Footer(),
  ],
)

// ✅ Collection-for in children
GridView.count(
  crossAxisCount: 2,
  children: [
    for (final (i, item) in items.indexed)
      ItemCard(item: item, index: i),
  ],
)

// ✅ Null-coalescing for optional callbacks
IconButton(
  onPressed: onPressed ?? () {}, // or just: onPressed: onPressed
  icon: const Icon(Icons.add),
)

// ✅ Cascade for controller setup
final controller = TextEditingController()
  ..text = initialValue
  ..selection = TextSelection.collapsed(offset: initialValue.length);

// ✅ Pattern match on platform
final isIos = switch (Theme.of(context).platform) {
  TargetPlatform.iOS || TargetPlatform.macOS => true,
  _ => false,
};

// ✅ Using records for widget configuration
typedef ButtonConfig = ({String label, IconData icon, VoidCallback onTap});

List<ButtonConfig> get actions => [
  (label: 'Share', icon: Icons.share, onTap: _share),
  (label: 'Edit',  icon: Icons.edit,  onTap: _edit),
  (label: 'Delete',icon: Icons.delete,onTap: _delete),
];

// In build:
Row(
  children: [
    for (final (:label, :icon, :onTap) in actions)
      TextButton.icon(
        onPressed: onTap,
        icon: Icon(icon),
        label: Text(label),
      ),
  ],
)
```

---

## Summary

**Every Flutter widget:**
- `const` constructor with `super.key`
- All child widgets that can be `const` are `const`
- No business logic in `build()` — only UI composition

**Every StatefulWidget:**
- Controllers / subscriptions disposed in `dispose()`
- `if (!mounted) return;` after every `await`
- Futures stored in fields, not created inside `build()`

**Every data model:**
- All fields are `final`
- Has `copyWith()` for immutable updates
- Overrides `==` and `hashCode`
- Has `fromJson()` / `toJson()` if used with APIs

**Every async operation:**
- Wrapped in try/catch
- Loading and error states handled
- Mounted checked before `setState`
