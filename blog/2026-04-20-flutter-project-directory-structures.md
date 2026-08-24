---
slug: flutter-project-directory-structures
title: "Flutter Project Directory Structures: 17 Architectures and When to Use Them"
authors: [admin]
tags: [flutter, architecture, performance, optimization]
---

# Flutter Project Directory Structures

Explore 17 popular Flutter project directory structures, including Feature-Driven, Clean Architecture, MVVM, BLoC, Riverpod, Vertical Slice, DDD, and Monorepo approaches. Learn how each structure works, its advantages and trade-offs, and which architecture fits your Flutter project.

{/* truncate */}

---

Here's the collection of common Flutter project directory structures, from simple projects to large-scale production applications.

## 1. Flat / Simple Structure

Best for small apps, prototypes, tutorials, and simple utilities.

```text
lib/
├── main.dart
├── screens/
│   ├── home_screen.dart
│   ├── settings_screen.dart
│   └── profile_screen.dart
├── widgets/
│   ├── app_button.dart
│   └── app_card.dart
├── models/
│   └── user.dart
├── services/
│   └── api_service.dart
├── utils/
│   └── helpers.dart
└── constants/
    └── app_constants.dart
```

### Characteristics

- Very easy to understand
- Minimal architectural overhead
- Suitable for small applications
- Becomes difficult to maintain as the application grows

---

## 2. Feature-Driven Structure

Organizes code around business features rather than technical layers.

```text
lib/
├── main.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── routing/
│   ├── theme/
│   └── utils/
├── features/
│   ├── authentication/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── home/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── profile/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── settings/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
    ├── widgets/
    ├── models/
    └── extensions/
```

### Characteristics

- Feature boundaries are clear
- Easy to scale
- Features can be developed independently
- Excellent default for medium and large applications

---

## 3. Layer-Driven / Technical-Layer Structure

Organizes files according to their technical responsibility.

```text
lib/
├── main.dart
├── presentation/
│   ├── screens/
│   ├── widgets/
│   └── controllers/
├── domain/
│   ├── entities/
│   ├── repositories/
│   └── use_cases/
├── data/
│   ├── models/
│   ├── repositories/
│   ├── datasources/
│   └── services/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── routing/
│   └── utils/
└── config/
    ├── environment/
    └── app_config.dart
```

### Characteristics

- Clear separation of technical responsibilities
- Works well with Clean Architecture
- Easy to understand for developers familiar with layered architecture
- Can become difficult to navigate when many features exist

---

## 4. Clean Architecture

Separates presentation, business logic, and external data sources.

```text
lib/
├── main.dart
├── core/
│   ├── error/
│   ├── network/
│   ├── usecases/
│   ├── utils/
│   └── constants/
├── features/
│   └── authentication/
│       ├── data/
│       │   ├── datasources/
│       │   │   ├── auth_local_datasource.dart
│       │   │   └── auth_remote_datasource.dart
│       │   ├── models/
│       │   │   └── user_model.dart
│       │   └── repositories/
│       │       └── auth_repository_impl.dart
│       ├── domain/
│       │   ├── entities/
│       │   │   └── user.dart
│       │   ├── repositories/
│       │   │   └── auth_repository.dart
│       │   └── usecases/
│       │       ├── login.dart
│       │       └── logout.dart
│       └── presentation/
│           ├── pages/
│           ├── widgets/
│           └── bloc/
└── injection_container.dart
```

### Characteristics

- Strong separation of concerns
- Business rules are independent of Flutter/UI
- Highly testable
- Suitable for complex applications
- More boilerplate than simpler structures

---

## 5. Clean Architecture + Feature-First

A common production-oriented combination of feature-first organization and Clean Architecture.

```text
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── theme/
├── core/
│   ├── constants/
│   ├── errors/
│   ├── extensions/
│   ├── network/
│   ├── storage/
│   ├── utils/
│   └── widgets/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── home/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── settings/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── di/
    └── injection.dart
```

### Characteristics

This is often a strong choice for large Flutter applications because:

```text
features/
    ↓
domain
    ↓
data

presentation
    ↓
domain
```

Features remain isolated while the architectural boundaries remain explicit.

---

## 6. MVVM Structure

Uses Model-View-ViewModel.

```text
lib/
├── main.dart
├── models/
│   ├── user.dart
│   └── product.dart
├── views/
│   ├── home/
│   │   └── home_view.dart
│   ├── login/
│   │   └── login_view.dart
│   └── profile/
│       └── profile_view.dart
├── viewmodels/
│   ├── home_viewmodel.dart
│   ├── login_viewmodel.dart
│   └── profile_viewmodel.dart
├── services/
│   ├── api_service.dart
│   └── auth_service.dart
└── repositories/
    ├── user_repository.dart
    └── product_repository.dart
```

### Characteristics

- UI is separated from presentation logic
- ViewModels manage state and UI-facing logic
- Familiar architecture for developers from other platforms
- Works well with Provider, Riverpod, ChangeNotifier, etc.

---

## 7. MVC Structure

Uses Model-View-Controller.

```text
lib/
├── main.dart
├── models/
│   ├── user.dart
│   └── product.dart
├── views/
│   ├── home_view.dart
│   ├── login_view.dart
│   └── profile_view.dart
├── controllers/
│   ├── auth_controller.dart
│   ├── home_controller.dart
│   └── profile_controller.dart
├── services/
│   └── api_service.dart
└── utils/
    └── helpers.dart
```

### Characteristics

- Simple mental model
- Good for small-to-medium projects
- Controllers can become too large if business logic is not separated properly

---

## 8. MVI Structure

Uses Model-View-Intent.

```text
lib/
├── main.dart
├── features/
│   └── login/
│       ├── model/
│       │   ├── login_state.dart
│       │   └── login_intent.dart
│       ├── view/
│       │   └── login_page.dart
│       └── intent/
│           └── login_intent_handler.dart
├── core/
│   ├── network/
│   └── utils/
└── app/
    └── app.dart
```

### Characteristics

- State-driven architecture
- Explicit user intents/actions
- Useful for complex reactive interfaces
- Works particularly well with unidirectional data flow

---

## 9. BLoC / Cubit Feature Structure

Organizes BLoC state management around features.

```text
lib/
├── main.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   └── widgets/
├── features/
│   ├── auth/
│   │   ├── bloc/
│   │   │   ├── auth_bloc.dart
│   │   │   ├── auth_event.dart
│   │   │   └── auth_state.dart
│   │   ├── models/
│   │   ├── repositories/
│   │   ├── pages/
│   │   └── widgets/
│   ├── home/
│   │   ├── bloc/
│   │   ├── models/
│   │   ├── pages/
│   │   └── widgets/
│   └── profile/
│       ├── cubit/
│       ├── models/
│       ├── pages/
│       └── widgets/
└── app/
    ├── app.dart
    └── router.dart
```

### Characteristics

- Natural structure for `flutter_bloc`
- Keeps state-management code close to its feature
- Easy to test
- Avoids one giant global BLoC directory

---

## 10. Riverpod Feature Structure

Organizes Riverpod providers alongside their features.

```text
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── theme/
├── core/
│   ├── network/
│   ├── storage/
│   └── utils/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── screens/
│   │   └── widgets/
│   ├── products/
│   │   ├── data/
│   │   ├── models/
│   │   ├── providers/
│   │   ├── screens/
│   │   └── widgets/
│   └── cart/
│       ├── models/
│       ├── providers/
│       ├── screens/
│       └── widgets/
└── shared/
    └── widgets/
```

### Characteristics

- Providers remain close to the state they manage
- Good fit for Riverpod
- Scales well with feature-first architecture

---

## 11. Repository Pattern

Separates data access behind repositories.

```text
lib/
├── main.dart
├── models/
│   ├── user.dart
│   └── product.dart
├── repositories/
│   ├── user_repository.dart
│   └── product_repository.dart
├── datasources/
│   ├── remote/
│   │   └── api_datasource.dart
│   └── local/
│       └── database_datasource.dart
├── services/
│   ├── api_service.dart
│   └── storage_service.dart
├── screens/
└── widgets/
```

### Characteristics

Useful when an application has multiple data sources:

```text
UI
 ↓
Repository
 ↓
 ┌──────────────┐
 │              │
Local          Remote
Data            API
```

---

## 12. Package-by-Feature / Modular Structure

Useful for very large applications or teams.

```text
packages/
├── app/
│   └── lib/
├── authentication/
│   └── lib/
│       ├── authentication.dart
│       └── src/
├── user/
│   └── lib/
│       ├── user.dart
│       └── src/
├── products/
│   └── lib/
│       ├── products.dart
│       └── src/
├── payments/
│   └── lib/
│       ├── payments.dart
│       └── src/
└── design_system/
    └── lib/
        ├── design_system.dart
        └── src/

apps/
└── mobile/
    └── lib/
        └── main.dart
```

### Characteristics

- Strong module boundaries
- Features can become independent Dart/Flutter packages
- Excellent for large teams
- Useful for monorepos
- More setup and tooling required

---

## 13. Monorepo Structure

A full repository containing applications and shared packages.

```text
project/
├── apps/
│   ├── mobile/
│   │   ├── android/
│   │   ├── ios/
│   │   └── lib/
│   ├── web/
│   └── admin/
├── packages/
│   ├── core/
│   ├── networking/
│   ├── authentication/
│   ├── database/
│   ├── design_system/
│   └── shared_models/
├── tools/
├── scripts/
├── melos.yaml
└── pubspec.yaml
```

### Characteristics

- Shared packages across multiple Flutter applications
- Good for mobile + web + desktop + admin products
- Suitable for large organizations
- Often paired with a monorepo tool such as Melos

---

## 14. Design-System-Oriented Structure

Useful when the application has a large reusable UI system.

```text
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   └── theme/
├── design_system/
│   ├── tokens/
│   │   ├── colors.dart
│   │   ├── spacing.dart
│   │   ├── typography.dart
│   │   └── radii.dart
│   ├── components/
│   │   ├── buttons/
│   │   ├── cards/
│   │   ├── dialogs/
│   │   ├── inputs/
│   │   └── navigation/
│   └── extensions/
├── features/
│   ├── home/
│   ├── profile/
│   └── settings/
└── core/
```

### Characteristics

- Centralized visual language
- Excellent for product families
- Makes UI consistency easier
- Particularly useful for large applications

---

## 15. Domain-Driven Design (DDD)

Organizes the application around business domains and bounded contexts.

```text
lib/
├── main.dart
├── shared/
│   ├── kernel/
│   ├── value_objects/
│   └── exceptions/
├── domains/
│   ├── identity/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   ├── catalog/
│   │   ├── domain/
│   │   ├── application/
│   │   ├── infrastructure/
│   │   └── presentation/
│   └── ordering/
│       ├── domain/
│       ├── application/
│       ├── infrastructure/
│       └── presentation/
└── app/
    ├── routing/
    └── dependency_injection/
```

### Characteristics

- Models the business domain explicitly
- Useful for complex business applications
- Strong boundaries between domains
- Usually unnecessary for small apps

---

## 16. Vertical Slice Architecture

Each feature contains everything needed to implement a complete user-facing slice.

```text
lib/
├── main.dart
├── core/
│   ├── networking/
│   ├── database/
│   └── routing/
├── features/
│   ├── login/
│   │   ├── login_page.dart
│   │   ├── login_controller.dart
│   │   ├── login_state.dart
│   │   ├── login_repository.dart
│   │   └── login_models.dart
│   ├── register/
│   │   ├── register_page.dart
│   │   ├── register_controller.dart
│   │   ├── register_state.dart
│   │   └── register_repository.dart
│   └── checkout/
│       ├── checkout_page.dart
│       ├── checkout_controller.dart
│       ├── checkout_state.dart
│       └── checkout_repository.dart
└── shared/
    ├── widgets/
    └── extensions/
```

### Characteristics

- Feature code is highly localized
- Reduces cross-project dependencies
- Excellent for rapidly evolving applications
- Similar in spirit to feature-first architecture, but slices can contain the complete flow rather than following strict global layers

---

## 17. Hybrid Architecture

Combines several approaches.

```text
lib/
├── main.dart
├── app/
│   ├── app.dart
│   ├── router.dart
│   ├── theme/
│   └── dependency_injection.dart
├── core/
│   ├── constants/
│   ├── errors/
│   ├── network/
│   ├── storage/
│   ├── extensions/
│   └── widgets/
├── features/
│   ├── auth/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   ├── news/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── settings/
│       ├── data/
│       ├── domain/
│       └── presentation/
├── shared/
│   ├── models/
│   ├── widgets/
│   └── services/
└── generated/
```

### Characteristics

This is often the most practical approach:

- Feature-first at the top level
- Clean Architecture inside complex features
- Shared infrastructure in `core`
- Reusable application components in `shared`
- App-wide configuration in `app`

---

# Quick Comparison

| Structure | Small App | Medium App | Large App | Complexity |
|---|---:|---:|---:|---:|
| Flat | Excellent | Poor | Poor | Very Low |
| Layer-Driven | Good | Good | Fair | Low |
| Feature-Driven | Good | Excellent | Excellent | Medium |
| MVC | Good | Good | Fair | Low |
| MVVM | Good | Excellent | Good | Medium |
| BLoC + Features | Good | Excellent | Excellent | Medium |
| Riverpod + Features | Good | Excellent | Excellent | Medium |
| Clean Architecture | Fair | Excellent | Excellent | High |
| Feature + Clean Architecture | Fair | Excellent | Excellent | High |
| Repository Pattern | Good | Excellent | Excellent | Medium |
| Vertical Slice | Good | Excellent | Excellent | Medium |
| DDD | Poor | Good | Excellent | Very High |
| Modular / Packages | Poor | Good | Excellent | High |
| Monorepo | Poor | Good | Excellent | Very High |
| Design System | Fair | Excellent | Excellent | Medium |
| Hybrid | Excellent | Excellent | Excellent | Medium–High |

---

# Recommended Choices

## Small Utility / Prototype

```text
lib/
├── main.dart
├── screens/
├── widgets/
├── models/
└── services/
```

Use this when the project is small enough that architecture would otherwise become overhead.

## Normal Production App

```text
lib/
├── app/
├── core/
├── features/
└── shared/
```

Use **Feature-Driven Architecture** as the primary organization.

## Large Production App

```text
lib/
├── app/
├── core/
├── features/
│   ├── feature_a/
│   │   ├── data/
│   │   ├── domain/
│   │   └── presentation/
│   └── feature_b/
│       ├── data/
│       ├── domain/
│       └── presentation/
└── shared/
```

Use **Feature-First + Clean Architecture**.

 ## Multiple Apps / Large Team

```text
apps/
├── mobile/
├── web/
└── admin/

packages/
├── core/
├── design_system/
├── authentication/
├── networking/
└── shared_models/
```

Use a **Monorepo + Modular Packages + Feature-First Architecture**.

---

# A Useful Rule of Thumb

Instead of asking:

> "Which architecture is the best?"

Ask:

> "Where will this project become difficult to maintain?"

For most Flutter projects, a practical progression is:

```text
Small
  ↓
Flat
  ↓
Feature-Driven
  ↓
Feature-Driven + State Management
  ↓
Feature-Driven + Clean Architecture
  ↓
Modular / Monorepo
Large
```

Do not introduce Clean Architecture, DDD, or a monorepo simply because they are popular. Add architectural complexity when the project's size, team structure, domain complexity, testing requirements, or number of applications actually justifies it.
