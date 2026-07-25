---
id: cart-screen
title: Shopping Cart Screen
sidebar_label: Shopping Cart
---

# Shopping Cart Screen

A production-ready shopping cart with swipe-to-delete, animated item removal, quantity update, promo code input, and a detailed order summary. Built with `AnimatedList` for smooth add/remove transitions.

## Features
- 🛒 `AnimatedList` for smooth item add/remove animations
- 👆 Swipe-to-delete with `Dismissible`
- ➕ Inline quantity stepper per item
- 🏷️ Promo code input with validation
- 💰 Live order summary (subtotal, discount, tax, total)
- 🚀 Checkout CTA with item count badge

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Model ───────────────────────────────────────────────────────────────────

class CartItem {
  final String id;
  final String name;
  final String variant;
  final double price;
  final Color imageColor; // Stand-in for image
  int quantity;

  CartItem({
    required this.id,
    required this.name,
    required this.variant,
    required this.price,
    required this.imageColor,
    this.quantity = 1,
  });
}

// ── Screen ───────────────────────────────────────────────────────────────────

class CartScreen extends StatefulWidget {
  const CartScreen({super.key});

  @override
  State<CartScreen> createState() => _CartScreenState();
}

class _CartScreenState extends State<CartScreen> {
  final _listKey = GlobalKey<AnimatedListState>();
  final _promoController = TextEditingController();
  String? _appliedPromo;
  double _discount = 0;

  final List<CartItem> _items = [
    CartItem(
      id: '1',
      name: 'Premium Slim-Fit Jacket',
      variant: 'Black / L',
      price: 129.99,
      imageColor: const Color(0xFF1E293B),
      quantity: 1,
    ),
    CartItem(
      id: '2',
      name: 'Minimal Canvas Sneakers',
      variant: 'White / 42',
      price: 89.99,
      imageColor: const Color(0xFFE2E8F0),
      quantity: 2,
    ),
    CartItem(
      id: '3',
      name: 'Leather Tote Bag',
      variant: 'Tan / One Size',
      price: 64.99,
      imageColor: const Color(0xFFB45309),
      quantity: 1,
    ),
  ];

  double get _subtotal =>
      _items.fold(0, (sum, i) => sum + i.price * i.quantity);
  double get _tax => _subtotal * 0.08;
  double get _total => _subtotal + _tax - _discount;

  void _removeItem(int index) {
    final removed = _items[index];
    _listKey.currentState?.removeItem(
      index,
      (context, animation) => _buildCartTile(context, removed, index, animation),
    );
    _items.removeAt(index);
    setState(() {});
  }

  void _applyPromo() {
    final code = _promoController.text.trim().toUpperCase();
    if (code == 'FLUTTER20') {
      setState(() {
        _appliedPromo = code;
        _discount = _subtotal * 0.2;
      });
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Promo applied! 20% off')),
      );
    } else {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Invalid promo code')),
      );
    }
  }

  @override
  void dispose() {
    _promoController.dispose();
    super.dispose();
  }

  Widget _buildCartTile(
    BuildContext context,
    CartItem item,
    int index,
    Animation<double> animation,
  ) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return SizeTransition(
      sizeFactor: animation,
      child: Dismissible(
        key: ValueKey(item.id),
        direction: DismissDirection.endToStart,
        onDismissed: (_) => _removeItem(index),
        background: Container(
          alignment: Alignment.centerRight,
          padding: const EdgeInsets.only(right: 20),
          margin: const EdgeInsets.only(bottom: 12),
          decoration: BoxDecoration(
            color: Colors.red.shade50,
            borderRadius: BorderRadius.circular(16),
          ),
          child: const Icon(Icons.delete_outline_rounded, color: Colors.red, size: 26),
        ),
        child: Container(
          margin: const EdgeInsets.only(bottom: 12),
          padding: const EdgeInsets.all(12),
          decoration: BoxDecoration(
            border: Border.all(color: cs.outline.withOpacity(0.4)),
            borderRadius: BorderRadius.circular(16),
          ),
          child: Row(
            children: [
              // Product image
              ClipRRect(
                borderRadius: BorderRadius.circular(10),
                child: Container(
                  width: 76,
                  height: 76,
                  color: item.imageColor,
                  child: Icon(
                    Icons.checkroom_rounded,
                    color: Colors.white.withOpacity(0.4),
                    size: 36,
                  ),
                ),
              ),
              const SizedBox(width: 12),
              // Info
              Expanded(
                child: Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      item.name,
                      style: theme.textTheme.bodyMedium?.copyWith(
                        fontWeight: FontWeight.w600,
                      ),
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                    const SizedBox(height: 4),
                    Text(
                      item.variant,
                      style: TextStyle(
                        color: cs.onSurfaceVariant,
                        fontSize: 12,
                      ),
                    ),
                    const SizedBox(height: 8),
                    Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          '\$${(item.price * item.quantity).toStringAsFixed(2)}',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            color: cs.primary,
                          ),
                        ),
                        // Quantity stepper
                        Row(
                          children: [
                            _SmallStepButton(
                              icon: Icons.remove_rounded,
                              onPressed: () {
                                if (item.quantity > 1) {
                                  setState(() => item.quantity--);
                                } else {
                                  _removeItem(index);
                                }
                              },
                            ),
                            Padding(
                              padding: const EdgeInsets.symmetric(horizontal: 10),
                              child: Text(
                                '${item.quantity}',
                                style: const TextStyle(fontWeight: FontWeight.bold),
                              ),
                            ),
                            _SmallStepButton(
                              icon: Icons.add_rounded,
                              onPressed: () => setState(() => item.quantity++),
                            ),
                          ],
                        ),
                      ],
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: Text('My Cart (${_items.length})'),
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          if (_items.isNotEmpty)
            TextButton(
              onPressed: () {
                for (int i = _items.length - 1; i >= 0; i--) {
                  _removeItem(i);
                }
              },
              child: const Text('Clear all'),
            ),
        ],
      ),
      body: _items.isEmpty
          ? _buildEmptyCart(context)
          : Column(
              children: [
                // Cart list
                Expanded(
                  child: AnimatedList(
                    key: _listKey,
                    padding: const EdgeInsets.all(16),
                    initialItemCount: _items.length,
                    itemBuilder: (context, index, animation) {
                      return _buildCartTile(
                          context, _items[index], index, animation);
                    },
                  ),
                ),

                // Order summary
                Container(
                  padding: EdgeInsets.fromLTRB(
                    20,
                    20,
                    20,
                    20 + MediaQuery.of(context).padding.bottom,
                  ),
                  decoration: BoxDecoration(
                    color: cs.surface,
                    border: Border(
                      top: BorderSide(color: cs.outline.withOpacity(0.3)),
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.04),
                        blurRadius: 16,
                        offset: const Offset(0, -4),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.stretch,
                    children: [
                      // Promo
                      Row(
                        children: [
                          Expanded(
                            child: TextField(
                              controller: _promoController,
                              textCapitalization: TextCapitalization.characters,
                              decoration: InputDecoration(
                                hintText: 'Promo code (try FLUTTER20)',
                                hintStyle: const TextStyle(fontSize: 13),
                                prefixIcon:
                                    const Icon(Icons.local_offer_outlined, size: 18),
                                filled: true,
                                fillColor: cs.surfaceContainerHighest
                                    .withOpacity(0.4),
                                border: OutlineInputBorder(
                                  borderRadius: BorderRadius.circular(10),
                                  borderSide: BorderSide.none,
                                ),
                                contentPadding: const EdgeInsets.symmetric(
                                    horizontal: 12, vertical: 12),
                              ),
                            ),
                          ),
                          const SizedBox(width: 10),
                          ElevatedButton(
                            onPressed: _appliedPromo != null ? null : _applyPromo,
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                  horizontal: 16, vertical: 14),
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(10),
                              ),
                            ),
                            child: Text(_appliedPromo != null ? 'Applied' : 'Apply'),
                          ),
                        ],
                      ),
                      const SizedBox(height: 16),

                      // Summary lines
                      _SummaryRow(label: 'Subtotal', value: '\$${_subtotal.toStringAsFixed(2)}'),
                      if (_discount > 0)
                        _SummaryRow(
                          label: 'Discount ($_appliedPromo)',
                          value: '-\$${_discount.toStringAsFixed(2)}',
                          valueColor: Colors.green,
                        ),
                      _SummaryRow(label: 'Tax (8%)', value: '\$${_tax.toStringAsFixed(2)}'),
                      const Divider(height: 20),
                      _SummaryRow(
                        label: 'Total',
                        value: '\$${_total.toStringAsFixed(2)}',
                        isBold: true,
                      ),
                      const SizedBox(height: 16),

                      // Checkout button
                      FilledButton(
                        onPressed: () {/* Navigate to checkout */},
                        style: FilledButton.styleFrom(
                          padding: const EdgeInsets.symmetric(vertical: 16),
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(12),
                          ),
                        ),
                        child: const Text(
                          'Proceed to Checkout',
                          style: TextStyle(
                              fontSize: 16, fontWeight: FontWeight.w600),
                        ),
                      ),
                    ],
                  ),
                ),
              ],
            ),
    );
  }

  Widget _buildEmptyCart(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;
    return Center(
      child: Column(
        mainAxisAlignment: MainAxisAlignment.center,
        children: [
          Icon(Icons.shopping_bag_outlined, size: 80, color: cs.outlineVariant),
          const SizedBox(height: 16),
          Text('Your cart is empty',
              style: theme.textTheme.titleLarge?.copyWith(
                fontWeight: FontWeight.bold,
              )),
          const SizedBox(height: 8),
          Text('Add items to get started',
              style: TextStyle(color: cs.onSurfaceVariant)),
          const SizedBox(height: 32),
          FilledButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Continue Shopping'),
          ),
        ],
      ),
    );
  }
}

// ── Helper widgets ─────────────────────────────────────────────────────────

class _SmallStepButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _SmallStepButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return GestureDetector(
      onTap: onPressed,
      child: Container(
        width: 28,
        height: 28,
        decoration: BoxDecoration(
          border: Border.all(color: cs.outline),
          borderRadius: BorderRadius.circular(6),
        ),
        child: Icon(icon, size: 14),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isBold;
  final Color? valueColor;

  const _SummaryRow({
    required this.label,
    required this.value,
    this.isBold = false,
    this.valueColor,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final style = TextStyle(
      fontWeight: isBold ? FontWeight.bold : FontWeight.normal,
      color: isBold ? cs.onSurface : cs.onSurfaceVariant,
      fontSize: isBold ? 16 : 14,
    );
    return Padding(
      padding: const EdgeInsets.only(bottom: 6),
      child: Row(
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Text(label, style: style),
          Text(
            value,
            style: style.copyWith(color: valueColor ?? style.color),
          ),
        ],
      ),
    );
  }
}
```

## Dependencies

No extra packages required.

## Customization Tips

- Use `flutter_slidable` for more advanced swipe actions (e.g., save for later + delete)
- Wire `_items` to a Riverpod `cartProvider` to share state across screens
- Add `StripePaymentSheet` or `PayPalWebCheckout` in the checkout handler
