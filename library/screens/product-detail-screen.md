---
id: product-detail-screen
title: Product Detail Screen
sidebar_label: Product Detail
---

# Product Detail Screen

A polished e-commerce product detail screen with an image gallery carousel, size/color selectors, quantity stepper, expandable description, and a sticky Add-to-Cart bottom bar. Follows standard mobile shopping UX patterns.

## Features
- 🖼️ Image gallery with `PageView` and dot indicators
- 🎨 Color variant selector
- 📏 Size selector chips
- ➕ Quantity stepper
- ⭐ Rating display with review count
- ❤️ Wishlist toggle button
- 📋 Expandable description
- 🛒 Sticky bottom bar with price + Add to Cart

## Flutter Code

```dart
import 'package:flutter/material.dart';

class ProductDetailScreen extends StatefulWidget {
  const ProductDetailScreen({super.key});

  @override
  State<ProductDetailScreen> createState() => _ProductDetailScreenState();
}

class _ProductDetailScreenState extends State<ProductDetailScreen> {
  int _currentImage = 0;
  int _quantity = 1;
  String? _selectedSize;
  int _selectedColor = 0;
  bool _isWishlisted = false;
  bool _isDescExpanded = false;
  bool _isAddingToCart = false;

  final _pageController = PageController();

  final List<Color> _colorOptions = const [
    Color(0xFF1E293B),
    Color(0xFF3B82F6),
    Color(0xFFE2E8F0),
    Color(0xFFEF4444),
  ];

  final List<String> _sizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  // Demo placeholder image colors
  final List<Color> _imageBgColors = const [
    Color(0xFF1E293B),
    Color(0xFF0F172A),
    Color(0xFF1E3A5F),
    Color(0xFF172554),
  ];

  @override
  void dispose() {
    _pageController.dispose();
    super.dispose();
  }

  Future<void> _addToCart() async {
    if (_selectedSize == null) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Please select a size')),
      );
      return;
    }
    setState(() => _isAddingToCart = true);
    await Future.delayed(const Duration(milliseconds: 800));
    if (!mounted) return;
    setState(() => _isAddingToCart = false);
    ScaffoldMessenger.of(context).showSnackBar(
      const SnackBar(content: Text('Added to cart!')),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      extendBodyBehindAppBar: true,
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        leading: IconButton(
          icon: Container(
            padding: const EdgeInsets.all(8),
            decoration: BoxDecoration(
              color: cs.surface.withOpacity(0.9),
              shape: BoxShape.circle,
            ),
            child: const Icon(Icons.arrow_back_ios_new_rounded, size: 18),
          ),
          onPressed: () => Navigator.pop(context),
        ),
        actions: [
          IconButton(
            icon: Container(
              padding: const EdgeInsets.all(8),
              decoration: BoxDecoration(
                color: cs.surface.withOpacity(0.9),
                shape: BoxShape.circle,
              ),
              child: const Icon(Icons.share_outlined, size: 18),
            ),
            onPressed: () {},
          ),
          const SizedBox(width: 8),
        ],
      ),
      body: Column(
        children: [
          // ── Image gallery ─────────────────────────────────────
          SizedBox(
            height: 360,
            child: Stack(
              children: [
                PageView.builder(
                  controller: _pageController,
                  itemCount: _imageBgColors.length,
                  onPageChanged: (i) => setState(() => _currentImage = i),
                  itemBuilder: (context, index) {
                    return Container(
                      color: _imageBgColors[index],
                      child: Center(
                        child: Icon(
                          Icons.checkroom_rounded,
                          size: 120,
                          color: Colors.white.withOpacity(0.3),
                        ),
                      ),
                    );
                  },
                ),
                // Wishlist button
                Positioned(
                  bottom: 16,
                  right: 16,
                  child: GestureDetector(
                    onTap: () => setState(() => _isWishlisted = !_isWishlisted),
                    child: AnimatedContainer(
                      duration: const Duration(milliseconds: 200),
                      width: 44,
                      height: 44,
                      decoration: BoxDecoration(
                        color: _isWishlisted ? Colors.red : cs.surface,
                        shape: BoxShape.circle,
                        boxShadow: [
                          BoxShadow(
                            color: Colors.black.withOpacity(0.15),
                            blurRadius: 8,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Icon(
                        _isWishlisted
                            ? Icons.favorite_rounded
                            : Icons.favorite_border_rounded,
                        color: _isWishlisted ? Colors.white : cs.onSurface,
                        size: 22,
                      ),
                    ),
                  ),
                ),
                // Dot indicators
                Positioned(
                  bottom: 20,
                  left: 0,
                  right: 0,
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: List.generate(_imageBgColors.length, (i) {
                      return AnimatedContainer(
                        duration: const Duration(milliseconds: 300),
                        margin: const EdgeInsets.symmetric(horizontal: 3),
                        width: i == _currentImage ? 20 : 6,
                        height: 6,
                        decoration: BoxDecoration(
                          color: i == _currentImage
                              ? Colors.white
                              : Colors.white.withOpacity(0.4),
                          borderRadius: BorderRadius.circular(3),
                        ),
                      );
                    }),
                  ),
                ),
              ],
            ),
          ),

          // ── Product info (scrollable) ─────────────────────────
          Expanded(
            child: SingleChildScrollView(
              padding: const EdgeInsets.fromLTRB(20, 20, 20, 100),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Title + price
                  Row(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Premium Slim-Fit Jacket',
                              style: theme.textTheme.titleLarge?.copyWith(
                                fontWeight: FontWeight.bold,
                                height: 1.2,
                              ),
                            ),
                            const SizedBox(height: 4),
                            Text(
                              'StyleCo. Collection',
                              style: theme.textTheme.bodyMedium?.copyWith(
                                color: cs.onSurfaceVariant,
                              ),
                            ),
                          ],
                        ),
                      ),
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.end,
                        children: [
                          Text(
                            '\$129.99',
                            style: theme.textTheme.headlineSmall?.copyWith(
                              fontWeight: FontWeight.bold,
                              color: cs.primary,
                            ),
                          ),
                          Text(
                            '\$179.99',
                            style: TextStyle(
                              color: cs.onSurfaceVariant,
                              decoration: TextDecoration.lineThrough,
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                    ],
                  ),
                  const SizedBox(height: 12),

                  // Rating
                  Row(
                    children: [
                      ...List.generate(
                        5,
                        (i) => Icon(
                          i < 4 ? Icons.star_rounded : Icons.star_half_rounded,
                          color: Colors.amber,
                          size: 18,
                        ),
                      ),
                      const SizedBox(width: 6),
                      Text(
                        '4.5',
                        style: theme.textTheme.bodyMedium?.copyWith(
                          fontWeight: FontWeight.w600,
                        ),
                      ),
                      const SizedBox(width: 4),
                      Text(
                        '(248 reviews)',
                        style: TextStyle(
                          color: cs.onSurfaceVariant,
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                  const Divider(height: 32),

                  // Color selector
                  Text(
                    'Color',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Row(
                    children: List.generate(_colorOptions.length, (i) {
                      final selected = i == _selectedColor;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedColor = i),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.only(right: 10),
                          width: 36,
                          height: 36,
                          decoration: BoxDecoration(
                            color: _colorOptions[i],
                            shape: BoxShape.circle,
                            border: Border.all(
                              color: selected ? cs.primary : Colors.transparent,
                              width: 2.5,
                            ),
                            boxShadow: [
                              if (selected)
                                BoxShadow(
                                  color: cs.primary.withOpacity(0.4),
                                  blurRadius: 8,
                                ),
                            ],
                          ),
                          child: selected
                              ? const Icon(Icons.check_rounded,
                                  color: Colors.white, size: 16)
                              : null,
                        ),
                      );
                    }),
                  ),
                  const SizedBox(height: 20),

                  // Size selector
                  Text(
                    'Size',
                    style: theme.textTheme.titleSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                  const SizedBox(height: 10),
                  Wrap(
                    spacing: 8,
                    children: _sizes.map((size) {
                      final selected = size == _selectedSize;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedSize = size),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 150),
                          width: 48,
                          height: 48,
                          decoration: BoxDecoration(
                            color: selected ? cs.primary : Colors.transparent,
                            border: Border.all(
                              color: selected ? cs.primary : cs.outline,
                            ),
                            borderRadius: BorderRadius.circular(10),
                          ),
                          child: Center(
                            child: Text(
                              size,
                              style: TextStyle(
                                color: selected ? Colors.white : cs.onSurface,
                                fontWeight: FontWeight.w600,
                                fontSize: 13,
                              ),
                            ),
                          ),
                        ),
                      );
                    }).toList(),
                  ),
                  const SizedBox(height: 20),

                  // Quantity
                  Row(
                    children: [
                      Text(
                        'Quantity',
                        style: theme.textTheme.titleSmall?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const Spacer(),
                      _QuantityStepper(
                        quantity: _quantity,
                        onDecrement: () {
                          if (_quantity > 1) {
                            setState(() => _quantity--);
                          }
                        },
                        onIncrement: () => setState(() => _quantity++),
                      ),
                    ],
                  ),
                  const Divider(height: 28),

                  // Description
                  GestureDetector(
                    onTap: () =>
                        setState(() => _isDescExpanded = !_isDescExpanded),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceBetween,
                      children: [
                        Text(
                          'Description',
                          style: theme.textTheme.titleSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        Icon(
                          _isDescExpanded
                              ? Icons.keyboard_arrow_up_rounded
                              : Icons.keyboard_arrow_down_rounded,
                        ),
                      ],
                    ),
                  ),
                  if (_isDescExpanded) ...[
                    const SizedBox(height: 10),
                    Text(
                      'Crafted from premium wool-blend fabric, this slim-fit jacket offers superior warmth without bulk. '
                      'Features a tailored silhouette, inner pockets, and durable YKK zippers. '
                      'Machine washable and designed to retain its shape wash after wash.',
                      style: theme.textTheme.bodyMedium?.copyWith(
                        color: cs.onSurfaceVariant,
                        height: 1.6,
                      ),
                    ),
                  ],
                ],
              ),
            ),
          ),
        ],
      ),

      // ── Sticky bottom bar ─────────────────────────────────────
      bottomNavigationBar: Container(
        padding: EdgeInsets.fromLTRB(
            20, 16, 20, 16 + MediaQuery.of(context).padding.bottom),
        decoration: BoxDecoration(
          color: cs.surface,
          border: Border(top: BorderSide(color: cs.outline.withOpacity(0.3))),
        ),
        child: Row(
          children: [
            Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  'Total price',
                  style: TextStyle(
                      color: cs.onSurfaceVariant, fontSize: 12),
                ),
                Text(
                  '\$${(129.99 * _quantity).toStringAsFixed(2)}',
                  style: theme.textTheme.titleLarge?.copyWith(
                    fontWeight: FontWeight.bold,
                    color: cs.primary,
                  ),
                ),
              ],
            ),
            const SizedBox(width: 20),
            Expanded(
              child: SizedBox(
                height: 52,
                child: FilledButton(
                  onPressed: _isAddingToCart ? null : _addToCart,
                  style: FilledButton.styleFrom(
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isAddingToCart
                      ? const SizedBox(
                          width: 22,
                          height: 22,
                          child: CircularProgressIndicator(
                            strokeWidth: 2.5,
                            color: Colors.white,
                          ),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.shopping_bag_outlined, size: 20),
                            SizedBox(width: 8),
                            Text(
                              'Add to Cart',
                              style: TextStyle(
                                fontSize: 16,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Quantity stepper ─────────────────────────────────────────────────────────

class _QuantityStepper extends StatelessWidget {
  final int quantity;
  final VoidCallback onDecrement;
  final VoidCallback onIncrement;

  const _QuantityStepper({
    required this.quantity,
    required this.onDecrement,
    required this.onIncrement,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        _StepButton(
          icon: Icons.remove_rounded,
          onPressed: onDecrement,
        ),
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 200),
          child: Text(
            '$quantity',
            key: ValueKey(quantity),
            style: const TextStyle(
              fontSize: 16,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
        _StepButton(
          icon: Icons.add_rounded,
          onPressed: onIncrement,
        ),
      ],
    );
  }
}

class _StepButton extends StatelessWidget {
  final IconData icon;
  final VoidCallback onPressed;

  const _StepButton({required this.icon, required this.onPressed});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Container(
      width: 36,
      height: 36,
      margin: const EdgeInsets.symmetric(horizontal: 12),
      decoration: BoxDecoration(
        border: Border.all(color: cs.outline),
        borderRadius: BorderRadius.circular(10),
      ),
      child: IconButton(
        icon: Icon(icon, size: 16),
        onPressed: onPressed,
        padding: EdgeInsets.zero,
      ),
    );
  }
}
```

## Dependencies

No extra packages. For real images use:
- `cached_network_image: ^3.3.0`

## Customization Tips

- Replace `_imageBgColors` with real product image URLs using `CachedNetworkImage`
- Integrate cart with Riverpod `cartProvider` from the E-Commerce template
- Add a "Buy Now" button alongside "Add to Cart" that goes directly to checkout
