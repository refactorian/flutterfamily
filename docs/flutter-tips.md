---
sidebar_position: 23
title: Flutter Tips
description: Widgets, state management patterns, safe BuildContext usage, and helper extension methods in Flutter.
---

---

## const Widgets

```dart
// ✅ Use const wherever possible — prevents unnecessary rebuilds
class MyWidget extends StatelessWidget {
  const MyWidget({super.key}); // const constructor

  @override
  Widget build(BuildContext context) {
    return const Column(
      children: [
        Text('Hello'),          // const — never rebuilt
        SizedBox(height: 16),   // const
        Icon(Icons.star),       // const
      ],
    );
  }
}
```

---

## State Management Patterns

```dart
// setState — simplest, for local state
class Counter extends StatefulWidget {
  const Counter({super.key});
  @override State<Counter> createState() => _CounterState();
}

class _CounterState extends State<Counter> {
  int _count = 0;

  void _increment() => setState(() => _count++);

  @override
  Widget build(BuildContext context) {
    return Text('$_count', onTap: _increment);
  }
}

// Provider — for shared state
class AppState extends ChangeNotifier {
  List<Todo> _todos = [];
  List<Todo> get todos => List.unmodifiable(_todos);

  void addTodo(Todo todo) {
    _todos = [..._todos, todo];
    notifyListeners();
  }
}

// Riverpod — modern state management
final counterProvider = StateNotifierProvider<CounterNotifier, int>(
  (ref) => CounterNotifier(),
);

class CounterNotifier extends StateNotifier<int> {
  CounterNotifier() : super(0);
  void increment() => state++;
}
```

---

## BuildContext Safely

```dart
class MyPage extends StatefulWidget {
  const MyPage({super.key});
  @override State<MyPage> createState() => _MyPageState();
}

class _MyPageState extends State<MyPage> {
  Future<void> _load() async {
    await heavyOperation();

    // ⚠️ Widget might be disposed after await!
    if (!mounted) return; // check mounted before using context

    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Done!')),
    );
  }

  @override
  Widget build(BuildContext context) { ... }
}
```

---

## Key Dart Patterns for Flutter

```dart
// 1. named constructor for JSON
class Todo {
  final String id;
  final String title;
  final bool done;

  const Todo({required this.id, required this.title, this.done = false});

  factory Todo.fromJson(Map<String, dynamic> json) => Todo(
    id: json['id'] as String,
    title: json['title'] as String,
    done: json['done'] as bool? ?? false,
  );

  Map<String, dynamic> toJson() => {'id': id, 'title': title, 'done': done};

  // Immutable update (copyWith pattern)
  Todo copyWith({String? id, String? title, bool? done}) => Todo(
    id: id ?? this.id,
    title: title ?? this.title,
    done: done ?? this.done,
  );
}

// Usage
var todo = Todo(id: '1', title: 'Buy milk');
var completed = todo.copyWith(done: true);

// 2. sealed class for UI states
sealed class UiState<T> {
  const UiState();
}
class Loading<T> extends UiState<T> { const Loading(); }
class Data<T> extends UiState<T> {
  final T value;
  const Data(this.value);
}
class Error<T> extends UiState<T> {
  final String message;
  const Error(this.message);
}

// In Flutter widget
Widget build(BuildContext context) {
  return switch (state) {
    Loading() => const CircularProgressIndicator(),
    Data(value: var data) => DataView(data: data),
    Error(message: var msg) => ErrorView(message: msg),
  };
}
```

---

## Extension Methods for Flutter

```dart
extension ContextExtensions on BuildContext {
  ThemeData get theme => Theme.of(this);
  TextTheme get textTheme => Theme.of(this).textTheme;
  ColorScheme get colors => Theme.of(this).colorScheme;
  double get screenWidth => MediaQuery.sizeOf(this).width;
  double get screenHeight => MediaQuery.sizeOf(this).height;
  bool get isDark => Theme.of(this).brightness == Brightness.dark;

  void showSnack(String message) =>
      ScaffoldMessenger.of(this).showSnackBar(SnackBar(content: Text(message)));

  Future<T?> push<T>(Widget page) =>
      Navigator.push<T>(this, MaterialPageRoute(builder: (_) => page));
}

// Usage in widgets
context.showSnack('Saved!');
context.push(UserProfilePage(userId: 42));
print(context.screenWidth);
```
