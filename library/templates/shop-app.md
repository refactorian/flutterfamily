---
id: shop-app
title: Flutter E-Commerce Starter Template
sidebar_label: E-Commerce Starter
---

# Flutter E-Commerce Starter

Full starter application configured with Riverpod state management, Stripe API integration, and custom checkout workflows.

## Setup Instructions
1. Clone the repository
2. Run `flutter pub get`
3. Configure your API keys in `lib/config.dart`

## Example

### Product Model & Riverpod State

```dart
import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

// --- Model ---
class Product {
  final String id;
  final String name;
  final double price;
  final String imageUrl;

  const Product({
    required this.id,
    required this.name,
    required this.price,
    required this.imageUrl,
  });
}

// --- Providers ---
final productsProvider = Provider<List<Product>>((ref) => [
  Product(id: '1', name: 'Minimal Sneakers', price: 89.99, imageUrl: 'https://placehold.co/300x200'),
  Product(id: '2', name: 'Canvas Tote Bag',  price: 34.99, imageUrl: 'https://placehold.co/300x200'),
  Product(id: '3', name: 'Leather Wallet',   price: 54.99, imageUrl: 'https://placehold.co/300x200'),
]);

final cartProvider = StateNotifierProvider<CartNotifier, List<Product>>(
  (ref) => CartNotifier(),
);

class CartNotifier extends StateNotifier<List<Product>> {
  CartNotifier() : super([]);

  void add(Product product) => state = [...state, product];
  void remove(String id) => state = state.where((p) => p.id != id).toList();
  double get total => state.fold(0, (sum, p) => sum + p.price);
}
```

### Product Listing Screen

```dart
class ShopScreen extends ConsumerWidget {
  const ShopScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final products = ref.watch(productsProvider);
    final cart = ref.watch(cartProvider);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Shop'),
        actions: [
          Badge(
            label: Text('${cart.length}'),
            child: const Icon(Icons.shopping_bag_outlined),
          ),
          const SizedBox(width: 16),
        ],
      ),
      body: GridView.builder(
        padding: const EdgeInsets.all(16),
        gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
          crossAxisCount: 2,
          childAspectRatio: 0.72,
          crossAxisSpacing: 12,
          mainAxisSpacing: 12,
        ),
        itemCount: products.length,
        itemBuilder: (context, index) {
          final product = products[index];
          final inCart = cart.any((p) => p.id == product.id);

          return Card(
            clipBehavior: Clip.antiAlias,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Expanded(
                  child: Image.network(
                    product.imageUrl,
                    fit: BoxFit.cover,
                    width: double.infinity,
                  ),
                ),
                Padding(
                  padding: const EdgeInsets.all(8),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Text(product.name,
                          style: const TextStyle(fontWeight: FontWeight.w600)),
                      Text('\$${product.price.toStringAsFixed(2)}',
                          style: TextStyle(color: Colors.grey[600])),
                      const SizedBox(height: 6),
                      SizedBox(
                        width: double.infinity,
                        child: FilledButton(
                          onPressed: () => inCart
                              ? ref.read(cartProvider.notifier).remove(product.id)
                              : ref.read(cartProvider.notifier).add(product),
                          style: inCart
                              ? FilledButton.styleFrom(backgroundColor: Colors.grey)
                              : null,
                          child: Text(inCart ? 'Remove' : 'Add to Cart'),
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