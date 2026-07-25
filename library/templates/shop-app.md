---
id: shop-app
title: E-Commerce Starter Kit
sidebar_label: E-Commerce Starter
---

# E-Commerce Starter Kit

A production-ready e-commerce mobile template built with Flutter and Riverpod. Features product catalog grid, cart state management, checkout summary, wishlisting, and order confirmation flow.

## Features
- 🛍️ Product catalog grid with category filters, badge overlays, and search
- 🛒 Cart state management powered by Riverpod `StateNotifier`
- 💳 Checkout workflow with subtotal, tax calculation, and shipping options
- ❤️ Interactive wishlist toggle per product
- 🌓 Material 3 theme design system with custom color tokens

## App Architecture

```
lib/
├── models/
│   ├── product.dart
│   └── cart_item.dart
├── providers/
│   ├── product_provider.dart
│   └── cart_provider.dart
├── screens/
│   ├── shop_home_screen.dart
│   ├── product_detail_screen.dart
│   └── cart_checkout_screen.dart
└── widgets/
    ├── product_card.dart
    └── cart_tile.dart
```

## Template Code

### Data Models & Riverpod Providers

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// ── Models ──────────────────────────────────────────────────────────────────

class Product {
  final String id;
  final String name;
  final String category;
  final double price;
  final double rating;
  final String imageUrl;
  final String description;

  const Product({
    required this.id,
    required this.name,
    required this.category,
    required this.price,
    required this.rating,
    required this.imageUrl,
    required this.description,
  });
}

class CartItem {
  final Product product;
  int quantity;

  CartItem({required this.product, this.quantity = 1});

  double get totalPrice => product.price * quantity;
}

// ── State Notifiers & Providers ──────────────────────────────────────────────

final productsProvider = Provider<List<Product>>((ref) => [
  const Product(
    id: 'p1',
    name: 'Minimal Wireless Headphones',
    category: 'Audio',
    price: 149.99,
    rating: 4.8,
    imageUrl: 'https://picsum.photos/400/400?random=1',
    description: 'Active noise cancelling wireless headphones with 30-hour battery life.',
  ),
  const Product(
    id: 'p2',
    name: 'Ergonomic Desk Lamp',
    category: 'Home',
    price: 64.50,
    rating: 4.6,
    imageUrl: 'https://picsum.photos/400/400?random=2',
    description: 'Dimmable LED desk lamp with wireless charging pad built into base.',
  ),
  const Product(
    id: 'p3',
    name: 'Canvas Commuter Backpack',
    category: 'Fashion',
    price: 89.00,
    rating: 4.9,
    imageUrl: 'https://picsum.photos/400/400?random=3',
    description: 'Water-resistant canvas backpack with padded laptop sleeve.',
  ),
]);

final cartProvider = StateNotifierProvider<CartNotifier, List<CartItem>>(
  (ref) => CartNotifier(),
);

class CartNotifier extends StateNotifier<List<CartItem>> {
  CartNotifier() : super([]);

  void add(Product product) {
    final index = state.indexWhere((item) => item.product.id == product.id);
    if (index >= 0) {
      state[index].quantity++;
      state = [...state];
    } else {
      state = [...state, CartItem(product: product)];
    }
  }

  void remove(String productId) {
    state = state.where((item) => item.product.id != productId).toList();
  }

  void updateQuantity(String productId, int delta) {
    final index = state.indexWhere((item) => item.product.id == productId);
    if (index >= 0) {
      final newQty = state[index].quantity + delta;
      if (newQty <= 0) {
        remove(productId);
      } else {
        state[index].quantity = newQty;
        state = [...state];
      }
    }
  }

  double get subtotal => state.fold(0, (sum, item) => sum + item.totalPrice);
}
```

### Product Catalog Screen

```dart
class ShopHomeScreen extends ConsumerWidget {
  const ShopHomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final cart = ref.watch(cartProvider);
    final totalCount = cart.fold(0, (sum, i) => sum + i.quantity);

    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        title: const Text('Store', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          Stack(
            children: [
              IconButton(
                icon: const Icon(Icons.shopping_bag_outlined),
                onPressed: () {
                  // Navigate to cart screen
                },
              ),
              if (totalCount > 0)
                Positioned(
                  right: 8,
                  top: 8,
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: const BoxDecoration(
                      color: Colors.indigo,
                      shape: BoxShape.circle,
                    ),
                    constraints: const BoxConstraints(minWidth: 16, minHeight: 16),
                    child: Text(
                      '$totalCount',
                      style: const TextStyle(color: Colors.white, fontSize: 10, fontWeight: FontWeight.bold),
                      textAlign: TextAlign.center,
                    ),
                  ),
                ),
            ],
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.7,
          crossAxisSpacing: 14,
          mainAxisSpacing: 14,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          final inCart = cart.any((item) => item.product.id == product.id);

          return Card(
            elevation: 0,
            shape: RoundedRectangleBorder(
              borderRadius: BorderRadius.circular(16),
              side: BorderSide(color: Colors.grey.shade200),
            ),
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Image.network(
                    product.imageUrl,
                    width: double.infinity,
                    fit: BoxFit.cover,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(12),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(
                        product.name,
                        maxLines: 1,
                        overflow: TextOverflow.ellipsis,
                        style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 13),
                      ),
                      const SizedBox(height: 4),
                      Text(
                        '\$${product.price.toStringAsFixed(2)}',
                        style: const TextStyle(
                          color: Colors.indigo,
                          fontWeight: FontWeight.bold,
                          fontSize: 14,
                        ),
                      ),
                      const SizedBox(height: 8),
                      SizedBox(
                        width: double.infinity,
                        height: 36,
                        child: FilledButton(
                          onPressed: () => ref.read(cartProvider.notifier).add(product),
                          style: FilledButton.styleFrom(
                            backgroundColor: inCart ? Colors.indigo.shade100 : Colors.indigo,
                            foregroundColor: inCart ? Colors.indigo : Colors.white,
                          ),
                          child: Text(
                            inCart ? 'Add More' : 'Add to Cart',
                            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.bold),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }
}
```

## Setup & Dependencies
- Add `flutter_riverpod` to your `pubspec.yaml`
- Wrap app root in `ProviderScope(child: MyApp())`
- Add `flutter_stripe` or `pay` package for checkout payment gateways
