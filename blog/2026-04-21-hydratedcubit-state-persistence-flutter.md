---
slug: hydratedcubit-state-persistence-flutter
title: "State Persistence Made Simple: A Complete Guide to HydratedCubit in Flutter"
authors: [admin]
tags: [flutter, dart, bloc, cubit, state-management]
---

A Flutter application often needs to remember things after the user closes and reopens it.

A user's preferred theme should remain dark if they selected dark mode. App preferences shouldn't reset every time the application launches. Offline-first applications may need to restore previously loaded data before making another network request. Even seemingly small pieces of UI state—such as selected filters, onboarding progress, or recently used settings—can benefit from persistence.

{/* truncate */}

Without a state-persistence mechanism, developers commonly end up writing storage-related code alongside their state-management logic:

```text
State
  ↓
Cubit
  ↓
SharedPreferences / Database
  ↓
Manual serialization
  ↓
Manual restoration during startup
```

This can quickly become repetitive.

You need to decide when to save state, when to read it, how to serialize it, how to deserialize it, and what should happen when stored data becomes invalid.

This is where **HydratedCubit** becomes useful.

`HydratedCubit` extends the regular Cubit pattern with automatic state persistence. Instead of manually calling a storage API whenever state changes, you describe how your state should be converted to and restored from JSON.

Conceptually:

```text
Cubit State
    │
    ├── toJson()
    │       ↓
    │   Persistent Storage
    │
    └── fromJson()
            ↑
      App Relaunch
```

The result is a much simpler architecture:

```text
UI
 ↓
HydratedCubit
 ↓
State
 ↕
Hydrated Storage
```

The Cubit remains responsible for state transitions, while Hydrated Bloc handles persistence and restoration.

---

## What Is HydratedCubit?

`HydratedCubit` is a persistence-enabled version of `Cubit` provided by the `hydrated_bloc` package.

A normal Cubit might look like this:

```dart
class ThemeCubit extends Cubit<ThemeState> {
  ThemeCubit() : super(const ThemeState(isDark: false));

  void toggleTheme() {
    emit(state.copyWith(isDark: !state.isDark));
  }
}
```

When the application is terminated, the Cubit's state disappears from memory.

With `HydratedCubit`:

```dart
class ThemeCubit extends HydratedCubit<ThemeState> {
  ThemeCubit() : super(const ThemeState(isDark: false));

  void toggleTheme() {
    emit(state.copyWith(isDark: !state.isDark));
  }

  @override
  ThemeState? fromJson(Map<String, dynamic> json) {
    // Restore state.
  }

  @override
  Map<String, dynamic>? toJson(ThemeState state) {
    // Persist state.
  }
}
```

Hydrated Bloc automatically handles the lifecycle of persisted state.

You only need to define two things:

- `toJson()` — how state should be stored.
- `fromJson()` — how stored data should become state again.

This makes it particularly useful for relatively small pieces of application state.

---

# Prerequisites & Setup

This tutorial assumes you already have:

- Flutter installed.
- A basic understanding of Dart.
- Familiarity with `Cubit`.
- Basic knowledge of Flutter widgets.
- Basic understanding of JSON-style `Map<String, dynamic>` objects.

## 1. Add the Dependencies

Add the following packages to your `pubspec.yaml`:

```yaml
dependencies:
  flutter:
    sdk: flutter

  flutter_bloc: ^9.1.1
  hydrated_bloc: ^10.1.1
  path_provider: ^2.1.5
```

The important packages are:

### `hydrated_bloc`

Provides `HydratedCubit`, `HydratedBloc`, and the underlying persistence mechanism.

### `path_provider`

Provides a platform-appropriate directory where Hydrated Bloc can store its persisted data.

> Package versions change over time. For a new project, use the current compatible versions available on pub.dev rather than blindly copying the versions shown above.

Then run:

```bash
flutter pub get
```

---

# 2. Initialize HydratedStorage

Hydrated storage must be initialized before your application starts using hydrated Cubits.

A typical `main.dart` looks like this:

```dart
import 'package:flutter/material.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = await HydratedStorage.build(
    storageDirectory: HydratedStorageDirectory(
      (await getApplicationDocumentsDirectory()).path,
    ),
  );

  HydratedBloc.storage = storage;

  runApp(const MyApp());
}
```

There are several important details here.

## `WidgetsFlutterBinding.ensureInitialized()`

Because we're performing asynchronous initialization before `runApp()`, Flutter needs its bindings initialized first.

```dart
WidgetsFlutterBinding.ensureInitialized();
```

Without this, platform APIs such as `path_provider` may not be ready to use.

## `getApplicationDocumentsDirectory()`

`path_provider` gives us a platform-specific application directory:

```dart
final directory = await getApplicationDocumentsDirectory();
```

We then provide that location to Hydrated Storage.

## `HydratedBloc.storage`

Finally:

```dart
HydratedBloc.storage = storage;
```

This registers the storage implementation globally for hydrated Blocs and Cubits.

After this point, `HydratedCubit` instances can automatically persist their state.

---

# Building a Theme Persistence Example

Let's build a complete application that demonstrates the entire process.

Our application will:

1. Start with a light theme.
2. Allow the user to switch between light and dark mode.
3. Persist the selected theme.
4. Restore the theme after the application is restarted.
5. Handle invalid persisted data safely.

The final architecture will be:

```text
MyApp
 │
 └── BlocProvider
       │
       └── ThemeCubit
             │
             └── ThemeState
```

---

# Step 1: Create the State Model

We'll create a simple immutable state object.

```dart
class ThemeState {
  final bool isDark;

  const ThemeState({
    required this.isDark,
  });

  const ThemeState.light()
      : isDark = false;

  const ThemeState.dark()
      : isDark = true;

  ThemeState copyWith({
    bool? isDark,
  }) {
    return ThemeState(
      isDark: isDark ?? this.isDark,
    );
  }
}
```

The state contains only one property:

```dart
final bool isDark;
```

If `isDark` is `true`, we'll use the dark theme.

If it's `false`, we'll use the light theme.

The `copyWith()` method allows us to create a new state without mutating the existing one.

For example:

```dart
final newState = state.copyWith(
  isDark: !state.isDark,
);
```

This immutable-state approach works naturally with Cubit.

---

# Step 2: Create the HydratedCubit

Now we'll create our persistence-enabled Cubit.

```dart
import 'package:hydrated_bloc/hydrated_bloc.dart';

class ThemeCubit extends HydratedCubit<ThemeState> {
  ThemeCubit() : super(const ThemeState.light());

  void toggleTheme() {
    emit(
      state.copyWith(
        isDark: !state.isDark,
      ),
    );
  }

  @override
  ThemeState? fromJson(Map<String, dynamic> json) {
    try {
      final isDark = json['isDark'];

      if (isDark is! bool) {
        return const ThemeState.light();
      }

      return ThemeState(
        isDark: isDark,
      );
    } catch (_) {
      return const ThemeState.light();
    }
  }

  @override
  Map<String, dynamic>? toJson(ThemeState state) {
    return {
      'isDark': state.isDark,
    };
  }
}
```

This is the most important part of the tutorial.

---

# Understanding `toJson()`

Whenever the Cubit's state changes, Hydrated Bloc can serialize the state using:

```dart
@override
Map<String, dynamic>? toJson(ThemeState state) {
  return {
    'isDark': state.isDark,
  };
}
```

Suppose the user enables dark mode.

The Cubit's state becomes:

```dart
ThemeState(
  isDark: true,
)
```

Hydrated Bloc converts it into:

```json
{
  "isDark": true
}
```

and persists that representation.

You don't have to manually call:

```dart
storage.write(...)
```

after every state change.

That's one of the major advantages of HydratedCubit.

---

# Understanding `fromJson()`

When the application starts again, Hydrated Bloc reads the previously persisted representation and passes it to:

```dart
fromJson()
```

For example:

```dart
{
  "isDark": true
}
```

becomes:

```dart
ThemeState(
  isDark: true,
)
```

Our implementation is:

```dart
@override
ThemeState? fromJson(Map<String, dynamic> json) {
  try {
    final isDark = json['isDark'];

    if (isDark is! bool) {
      return const ThemeState.light();
    }

    return ThemeState(
      isDark: isDark,
    );
  } catch (_) {
    return const ThemeState.light();
  }
}
```

The return type is nullable:

```dart
ThemeState?
```

This is useful because returning `null` can indicate that persisted state should not be restored.

For example:

```dart
return null;
```

can be used when the stored representation is invalid or incompatible.

In this example, however, we're deliberately returning a safe fallback:

```dart
return const ThemeState.light();
```

---

# Step 3: Connect the Cubit to the Application

Now let's create the Flutter application.

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ThemeCubit(),
      child: const AppView(),
    );
  }
}
```

The important part is:

```dart
BlocProvider(
  create: (_) => ThemeCubit(),
  child: const AppView(),
)
```

Because `ThemeCubit` extends `HydratedCubit`, it will automatically attempt to restore its previous state when it is created.

---

# Step 4: Build the UI

Our `AppView` can listen to the Cubit's state and update the application theme.

```dart
class AppView extends StatelessWidget {
  const AppView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeState>(
      builder: (context, state) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData.light(),
          darkTheme: ThemeData.dark(),
          themeMode:
              state.isDark ? ThemeMode.dark : ThemeMode.light,
          home: const HomePage(),
        );
      },
    );
  }
}
```

Whenever the state changes, `BlocBuilder` rebuilds the `MaterialApp`.

If:

```dart
state.isDark == true
```

we use:

```dart
ThemeMode.dark
```

Otherwise:

```dart
ThemeMode.light
```

---

# Step 5: Add the Theme Toggle

Now let's create the actual screen.

```dart
class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HydratedCubit Demo'),
      ),
      body: Center(
        child: BlocBuilder<ThemeCubit, ThemeState>(
          builder: (context, state) {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  state.isDark
                      ? Icons.dark_mode
                      : Icons.light_mode,
                  size: 80,
                ),
                const SizedBox(height: 24),
                Text(
                  state.isDark
                      ? 'Dark Mode'
                      : 'Light Mode',
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    context.read<ThemeCubit>().toggleTheme();
                  },
                  child: const Text('Toggle Theme'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
```

The button calls:

```dart
context.read<ThemeCubit>().toggleTheme();
```

which changes the state.

The Cubit emits the new state:

```dart
emit(
  state.copyWith(
    isDark: !state.isDark,
  ),
);
```

Hydrated Bloc then persists the new state automatically.

---

# Complete Runnable Example

Putting everything together, you can have a single `main.dart` file:

```dart
import 'package:flutter/material.dart';
import 'package:flutter_bloc/flutter_bloc.dart';
import 'package:hydrated_bloc/hydrated_bloc.dart';
import 'package:path_provider/path_provider.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();

  final storage = await HydratedStorage.build(
    storageDirectory: HydratedStorageDirectory(
      (await getApplicationDocumentsDirectory()).path,
    ),
  );

  HydratedBloc.storage = storage;

  runApp(const MyApp());
}

class ThemeState {
  final bool isDark;

  const ThemeState({
    required this.isDark,
  });

  const ThemeState.light()
      : isDark = false;

  ThemeState copyWith({
    bool? isDark,
  }) {
    return ThemeState(
      isDark: isDark ?? this.isDark,
    );
  }
}

class ThemeCubit extends HydratedCubit<ThemeState> {
  ThemeCubit() : super(const ThemeState.light());

  void toggleTheme() {
    emit(
      state.copyWith(
        isDark: !state.isDark,
      ),
    );
  }

  @override
  ThemeState? fromJson(Map<String, dynamic> json) {
    try {
      final isDark = json['isDark'];

      if (isDark is! bool) {
        return const ThemeState.light();
      }

      return ThemeState(
        isDark: isDark,
      );
    } catch (_) {
      return const ThemeState.light();
    }
  }

  @override
  Map<String, dynamic>? toJson(ThemeState state) {
    return {
      'isDark': state.isDark,
    };
  }
}

class MyApp extends StatelessWidget {
  const MyApp({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocProvider(
      create: (_) => ThemeCubit(),
      child: const AppView(),
    );
  }
}

class AppView extends StatelessWidget {
  const AppView({super.key});

  @override
  Widget build(BuildContext context) {
    return BlocBuilder<ThemeCubit, ThemeState>(
      builder: (context, state) {
        return MaterialApp(
          debugShowCheckedModeBanner: false,
          theme: ThemeData.light(),
          darkTheme: ThemeData.dark(),
          themeMode:
              state.isDark ? ThemeMode.dark : ThemeMode.light,
          home: const HomePage(),
        );
      },
    );
  }
}

class HomePage extends StatelessWidget {
  const HomePage({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('HydratedCubit Demo'),
      ),
      body: Center(
        child: BlocBuilder<ThemeCubit, ThemeState>(
          builder: (context, state) {
            return Column(
              mainAxisAlignment: MainAxisAlignment.center,
              children: [
                Icon(
                  state.isDark
                      ? Icons.dark_mode
                      : Icons.light_mode,
                  size: 80,
                ),
                const SizedBox(height: 24),
                Text(
                  state.isDark
                      ? 'Dark Mode'
                      : 'Light Mode',
                  style: Theme.of(context)
                      .textTheme
                      .headlineSmall,
                ),
                const SizedBox(height: 24),
                FilledButton(
                  onPressed: () {
                    context
                        .read<ThemeCubit>()
                        .toggleTheme();
                  },
                  child: const Text('Toggle Theme'),
                ),
              ],
            );
          },
        ),
      ),
    );
  }
}
```

Now the behavior is straightforward:

```text
First launch
    ↓
ThemeCubit starts with Light
    ↓
User selects Dark Mode
    ↓
Cubit emits Dark state
    ↓
HydratedCubit serializes state
    ↓
State is persisted
    ↓
App is closed
    ↓
App launches again
    ↓
ThemeCubit is created
    ↓
HydratedCubit reads persisted state
    ↓
fromJson()
    ↓
Dark state restored
```

No explicit `SharedPreferences.getBool()` call is required.

No manual save operation is required.

No custom initialization logic is required for this particular state.

---

# Best Practices & Edge Cases

HydratedCubit makes persistence easy, but persistent state introduces its own architectural considerations.

## 1. Always Treat Persisted Data as Untrusted

Persisted data can become invalid.

Your application may have:

- Changed its state model.
- Removed a property.
- Changed a property's type.
- Introduced a migration.
- Encountered corrupted storage.
- Loaded state created by an older application version.

Therefore, don't assume that this is safe:

```dart
final isDark = json['isDark'] as bool;
```

A safer approach is:

```dart
final isDark = json['isDark'];

if (isDark is! bool) {
  return const ThemeState.light();
}
```

For more complicated state, validate every important field.

---

## 2. Use Safe Fallback States

A persistence failure shouldn't normally prevent your entire application from starting.

For example:

```dart
@override
ThemeState? fromJson(Map<String, dynamic> json) {
  try {
    final isDark = json['isDark'];

    if (isDark is! bool) {
      return const ThemeState.light();
    }

    return ThemeState(
      isDark: isDark,
    );
  } catch (_) {
    return const ThemeState.light();
  }
}
```

The key idea is:

> If persisted state cannot be restored safely, fall back to a valid default state.

This is especially important for critical Cubits used near the root of your application.

---

# 3. Don't Persist Everything

Just because a Cubit is hydrated doesn't mean every property in its state should be persisted.

Consider:

```dart
class PlayerState {
  final String currentSong;
  final bool isPlaying;
  final Duration position;
  final bool isBuffering;
}
```

Persisting `currentSong` might make sense.

Persisting `isBuffering` probably doesn't.

`isBuffering` represents temporary runtime state and has little value after an application restart.

You might instead persist only:

```dart
{
  "currentSong": "...",
  "position": 123
}
```

The general rule is:

> Persist durable application state, not transient runtime state.

Good candidates include:

- Theme preference.
- Language preference.
- User settings.
- Selected filters.
- Onboarding progress.
- Last selected tab.
- Small pieces of offline state.
- Cached application state where appropriate.

Poor candidates include:

- Loading indicators.
- Animation state.
- Temporary UI flags.
- Network connection state.
- One-time events.
- Ephemeral progress indicators.

---

# 4. Be Careful With Sensitive Data

Hydrated storage should **not automatically be treated as a secure vault**.

Avoid casually persisting sensitive information such as:

- Passwords.
- Authentication secrets.
- Private encryption keys.
- Highly sensitive personal information.
- Long-lived credentials.

If sensitive data must be stored locally, consider an appropriate secure-storage solution and security architecture.

For example, authentication tokens may be better handled with a platform-backed secure storage mechanism rather than simply placing them inside a hydrated Cubit's state.

A useful architectural separation is:

```text
Regular application state
        ↓
HydratedCubit

Sensitive credentials
        ↓
Secure storage
```

Don't choose HydratedCubit simply because it is convenient.

Choose the storage mechanism based on the sensitivity and lifetime of the data.

---

# 5. Clear Hydrated State During Logout

Authentication introduces an important edge case.

Suppose the application has a hydrated Cubit containing user-specific information:

```text
User A
  ↓
Hydrated state
  ↓
Logout
  ↓
User B logs in
```

If the previous state isn't cleared appropriately, User B could potentially see state belonging to User A.

When logging out, you may need to clear hydrated storage:

```dart
await HydratedBloc.storage.clear();
```

For example:

```dart
Future<void> logout() async {
  await authRepository.logout();

  await HydratedBloc.storage.clear();
}
```

Be careful, though: this clears **hydrated storage globally**, not just one arbitrary Cubit's state.

Therefore, clearing storage should be an intentional application-level operation.

If your application contains data that should survive logout—such as a global theme preference—you may want a more selective architecture rather than indiscriminately clearing everything.

---

# 6. Think About State Versioning

Your application will evolve.

Imagine version 1 stores:

```json
{
  "isDark": true
}
```

Later, version 2 changes the model:

```json
{
  "theme": "dark"
}
```

Old persisted state may no longer match your new model.

This is where defensive deserialization becomes important.

For more sophisticated applications, you can include a version:

```dart
@override
Map<String, dynamic>? toJson(ThemeState state) {
  return {
    'version': 1,
    'isDark': state.isDark,
  };
}
```

Then inspect it during restoration:

```dart
@override
ThemeState? fromJson(Map<String, dynamic> json) {
  final version = json['version'];

  if (version != 1) {
    return const ThemeState.light();
  }

  final isDark = json['isDark'];

  if (isDark is! bool) {
    return const ThemeState.light();
  }

  return ThemeState(
    isDark: isDark,
  );
}
```

For simple applications, a fallback may be enough.

For complex applications with long-lived persisted state, explicit versioning and migration strategies become increasingly valuable.

---

# 7. Keep Hydrated State Small

HydratedCubit is particularly convenient for relatively small state objects.

For example:

```text
Theme preferences
User settings
Selected filters
Small cached responses
Application configuration
```

are reasonable candidates.

You should be more cautious about using a hydrated Cubit as a general-purpose database for massive datasets.

If you need to persist:

```text
100,000 products
50,000 messages
Large documents
Complex relational data
Huge offline datasets
```

a dedicated database such as SQLite may be a better architectural choice.

Think of HydratedCubit primarily as:

> **Persistent application state**, not necessarily **application data storage**.

---

# 8. Don't Confuse Persistence With Caching

These concepts overlap but aren't identical.

### Persistence

The goal is to preserve state across application restarts.

Example:

```text
User prefers dark mode
```

### Caching

The goal is to avoid unnecessarily retrieving data again.

Example:

```text
News articles fetched yesterday
```

You can use HydratedCubit for small cached state, but large or complex caches may be better handled by a dedicated storage layer.

---

# 9. Keep Serialization Close to the State

A clean approach is to make your serialization representation predictable.

For example:

```dart
@override
Map<String, dynamic>? toJson(ThemeState state) {
  return {
    'isDark': state.isDark,
  };
}
```

and:

```dart
@override
ThemeState? fromJson(Map<String, dynamic> json) {
  final isDark = json['isDark'];

  if (isDark is! bool) {
    return const ThemeState.light();
  }

  return ThemeState(
    isDark: isDark,
  );
}
```

This makes the persistence boundary explicit.

Your UI doesn't need to know where the data comes from.

Your widgets simply consume:

```dart
ThemeState
```

while HydratedCubit deals with persistence.

---

# When Should You Use HydratedCubit?

HydratedCubit is a particularly good fit when all of the following are true:

```text
State is relatively small
        +
State should survive app restarts
        +
State naturally belongs to a Cubit
        +
JSON serialization is straightforward
```

Examples include:

| State | HydratedCubit? |
|---|---|
| Dark/light theme | Excellent |
| Language preference | Excellent |
| Selected tab | Good |
| User preferences | Excellent |
| Onboarding progress | Good |
| Small offline state | Good |
| Large product database | Usually no |
| Complex relational data | Usually no |
| Passwords/secrets | No |
| Temporary loading state | No |
| Animation state | No |

---

# The Mental Model to Remember

The easiest way to understand HydratedCubit is to think of it as a normal Cubit with an automatic persistence layer.

Without hydration:

```text
Event
 ↓
Cubit
 ↓
State
 ↓
UI
```

With hydration:

```text
                 ┌───────────────┐
                 │ Persistent    │
                 │ Storage       │
                 └───────▲───────┘
                         │
                    fromJson()
                         │
Event → Cubit → State ───┘
             │
             └── toJson()
```

Your application still follows the normal Cubit state-management pattern.

The difference is that the state can survive the application's lifecycle.

---

# Conclusion

State persistence doesn't need to mean scattering storage calls throughout your Flutter application.

With `HydratedCubit`, you can keep state management and persistence closely integrated:

```dart
class ThemeCubit extends HydratedCubit<ThemeState> {
  // State transitions...

  @override
  ThemeState? fromJson(Map<String, dynamic> json) {
    // Restore state.
  }

  @override
  Map<String, dynamic>? toJson(ThemeState state) {
    // Persist state.
  }
}
```

That's the core idea.

For small, durable pieces of application state—such as themes, preferences, selected filters, onboarding progress, and certain offline state—this can eliminate a considerable amount of repetitive persistence code.

The most important lessons are:

1. Initialize `HydratedStorage` before `runApp()`.
2. Use `toJson()` to define what gets persisted.
3. Use `fromJson()` to safely restore state.
4. Validate persisted data instead of blindly casting it.
5. Persist durable state rather than temporary UI state.
6. Don't use HydratedCubit as a replacement for a full database.
7. Keep sensitive credentials out of ordinary hydrated state.
8. Consider state versioning when your application evolves.
9. Clear user-specific hydrated state appropriately during logout.

Once you understand these principles, HydratedCubit becomes more than a convenient package—it becomes a clean architectural tool for making selected parts of your Flutter application's state survive restarts without turning your widgets into storage managers.

## Next Steps

Once the basic theme example is working, try applying the same pattern to:

- Persisting a selected language.
- Remembering the last selected navigation tab.
- Saving onboarding progress.
- Persisting user preferences.
- Building a small offline-first state cache.
- Adding state versioning and migration.
- Combining hydrated state with a repository/database layer for larger offline applications.

The key is to start small: **identify the state that genuinely needs to survive an app restart, make that state serializable, and let HydratedCubit handle the persistence lifecycle.**