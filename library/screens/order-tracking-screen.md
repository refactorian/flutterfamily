---
id: order-tracking-screen
title: Order Tracking Screen
sidebar_label: Order Tracking
---

# Order Tracking Screen

A live order tracking screen with an animated vertical stepper timeline, estimated delivery countdown, package info card, and a map placeholder area. Clean, informative layout commonly found in e-commerce and delivery apps.

## Features
- 📦 Animated vertical step timeline (Order Placed → Shipped → Out for Delivery → Delivered)
- ⏱️ Estimated delivery date display
- 🔢 Order number and tracking ID
- 📍 Delivery address card
- 🗺️ Map placeholder area with "Track on Map" CTA
- ✅ Step-by-step status with timestamps

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Model ────────────────────────────────────────────────────────────────────

enum OrderStatus { placed, processing, shipped, outForDelivery, delivered }

class OrderStep {
  final String title;
  final String? subtitle;
  final String? time;
  final OrderStatus status;

  const OrderStep({
    required this.title,
    this.subtitle,
    this.time,
    required this.status,
  });
}

// ── Screen ────────────────────────────────────────────────────────────────────

class OrderTrackingScreen extends StatefulWidget {
  const OrderTrackingScreen({super.key});

  @override
  State<OrderTrackingScreen> createState() => _OrderTrackingScreenState();
}

class _OrderTrackingScreenState extends State<OrderTrackingScreen>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;

  // Current order status — change this to update the UI
  final OrderStatus _currentStatus = OrderStatus.shipped;

  final List<OrderStep> _steps = const [
    OrderStep(
      title: 'Order Placed',
      subtitle: 'Your order has been confirmed',
      time: 'Jul 24, 10:32 AM',
      status: OrderStatus.placed,
    ),
    OrderStep(
      title: 'Processing',
      subtitle: 'Your items are being prepared',
      time: 'Jul 24, 2:15 PM',
      status: OrderStatus.processing,
    ),
    OrderStep(
      title: 'Shipped',
      subtitle: 'Your package is on its way · FedEx #392884710',
      time: 'Jul 25, 9:00 AM',
      status: OrderStatus.shipped,
    ),
    OrderStep(
      title: 'Out for Delivery',
      subtitle: 'Your driver is nearby',
      time: 'Expected today',
      status: OrderStatus.outForDelivery,
    ),
    OrderStep(
      title: 'Delivered',
      subtitle: 'Package delivered to your door',
      time: 'Expected Jul 27',
      status: OrderStatus.delivered,
    ),
  ];

  bool _isStepDone(OrderStatus step) {
    return step.index <= _currentStatus.index;
  }

  bool _isCurrentStep(OrderStatus step) {
    return step.index == _currentStatus.index;
  }

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1200),
    )..forward();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: const Text('Track Order'),
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.help_outline_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Order card ─────────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(16),
              decoration: BoxDecoration(
                gradient: LinearGradient(
                  colors: [cs.primary, cs.primaryContainer],
                  begin: Alignment.topLeft,
                  end: Alignment.bottomRight,
                ),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(
                            'Order #4821',
                            style: const TextStyle(
                              color: Colors.white,
                              fontWeight: FontWeight.bold,
                              fontSize: 18,
                            ),
                          ),
                          const SizedBox(height: 4),
                          Text(
                            'Placed on Jul 24, 2025',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.8),
                              fontSize: 13,
                            ),
                          ),
                        ],
                      ),
                      Container(
                        padding: const EdgeInsets.symmetric(
                          horizontal: 10,
                          vertical: 5,
                        ),
                        decoration: BoxDecoration(
                          color: Colors.white.withValues(alpha: 0.2),
                          borderRadius: BorderRadius.circular(20),
                        ),
                        child: Text(
                          _currentStatus == OrderStatus.delivered
                              ? '✅ Delivered'
                              : '🚚 In Transit',
                          style: const TextStyle(
                            color: Colors.white,
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 16),
                  Row(
                    children: [
                      const Icon(
                        Icons.calendar_today_outlined,
                        color: Colors.white70,
                        size: 16,
                      ),
                      const SizedBox(width: 6),
                      Text(
                        'Estimated delivery: Jul 27, 2025',
                        style: TextStyle(
                          color: Colors.white.withValues(alpha: 0.9),
                          fontSize: 13,
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
            const SizedBox(height: 20),

            // ── Map placeholder ────────────────────────────────────
            ClipRRect(
              borderRadius: BorderRadius.circular(16),
              child: Container(
                height: 140,
                decoration: BoxDecoration(color: cs.surfaceContainerHighest),
                child: Stack(
                  children: [
                    // Fake map grid
                    CustomPaint(
                      size: const Size(double.infinity, 140),
                      painter: _MapGridPainter(
                        color: cs.outline.withValues(alpha: 0.3),
                      ),
                    ),
                    Center(
                      child: Column(
                        mainAxisAlignment: MainAxisAlignment.center,
                        children: [
                          Container(
                            padding: const EdgeInsets.all(10),
                            decoration: BoxDecoration(
                              color: cs.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.local_shipping_rounded,
                              color: Colors.white,
                              size: 24,
                            ),
                          ),
                          const SizedBox(height: 10),
                          ElevatedButton.icon(
                            onPressed: () {},
                            icon: const Icon(Icons.map_outlined, size: 16),
                            label: const Text('Track on Map'),
                            style: ElevatedButton.styleFrom(
                              padding: const EdgeInsets.symmetric(
                                horizontal: 16,
                                vertical: 8,
                              ),
                              minimumSize: Size.zero,
                              tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                              shape: RoundedRectangleBorder(
                                borderRadius: BorderRadius.circular(8),
                              ),
                            ),
                          ),
                        ],
                      ),
                    ),
                  ],
                ),
              ),
            ),
            const SizedBox(height: 24),

            // ── Delivery address ───────────────────────────────────
            Text(
              'Delivery Address',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            Container(
              padding: const EdgeInsets.all(14),
              decoration: BoxDecoration(
                border: Border.all(color: cs.outline.withValues(alpha: 0.4)),
                borderRadius: BorderRadius.circular(12),
              ),
              child: Row(
                children: [
                  Container(
                    padding: const EdgeInsets.all(10),
                    decoration: BoxDecoration(
                      color: cs.primaryContainer,
                      borderRadius: BorderRadius.circular(10),
                    ),
                    child: Icon(Icons.location_on_outlined, color: cs.primary),
                  ),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Alex Johnson',
                          style: const TextStyle(fontWeight: FontWeight.w600),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          '123 Market Street, Apt 4B\nSan Francisco, CA 94105',
                          style: TextStyle(
                            color: cs.onSurfaceVariant,
                            fontSize: 13,
                            height: 1.4,
                          ),
                        ),
                      ],
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Tracking timeline ──────────────────────────────────
            Text(
              'Tracking History',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 16),
            ..._steps.asMap().entries.map((entry) {
              final index = entry.key;
              final step = entry.value;
              final done = _isStepDone(step.status);
              final current = _isCurrentStep(step.status);
              final isLast = index == _steps.length - 1;

              final begin = (index * 0.12).clamp(0.0, 1.0);
              final end = (begin + 0.4).clamp(0.0, 1.0);
              final itemAnimation = Tween<double>(begin: 0, end: 1).animate(
                CurvedAnimation(
                  parent: _controller,
                  curve: Interval(begin, end, curve: Curves.easeOut),
                ),
              );

              return FadeTransition(
                opacity: itemAnimation,
                child: _TrackingStepTile(
                  step: step,
                  isDone: done,
                  isCurrent: current,
                  isLast: isLast,
                ),
              );
            }),
            const SizedBox(height: 24),

            // ── Contact courier ───────────────────────────────────
            OutlinedButton.icon(
              onPressed: () {},
              icon: const Icon(Icons.headset_mic_outlined),
              label: const Text('Contact Courier'),
              style: OutlinedButton.styleFrom(
                minimumSize: const Size(double.infinity, 50),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Tracking step tile ────────────────────────────────────────────────────────

class _TrackingStepTile extends StatelessWidget {
  final OrderStep step;
  final bool isDone;
  final bool isCurrent;
  final bool isLast;

  const _TrackingStepTile({
    required this.step,
    required this.isDone,
    required this.isCurrent,
    required this.isLast,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final activeColor = isCurrent
        ? cs.primary
        : (isDone ? Colors.green : cs.outline);

    return Row(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Icon + vertical line column
        Column(
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 400),
              width: 28,
              height: 28,
              decoration: BoxDecoration(
                color: isDone ? activeColor : cs.surface,
                shape: BoxShape.circle,
                border: Border.all(color: activeColor, width: 2.5),
              ),
              child: isDone
                  ? Icon(
                      isCurrent
                          ? Icons.radio_button_checked_rounded
                          : Icons.check_rounded,
                      color: Colors.white,
                      size: 14,
                    )
                  : null,
            ),
            if (!isLast)
              AnimatedContainer(
                duration: const Duration(milliseconds: 400),
                width: 2,
                height: 48,
                color: isDone
                    ? Colors.green.withValues(alpha: 0.5)
                    : cs.outline.withValues(alpha: 0.3),
              ),
          ],
        ),
        const SizedBox(width: 14),
        // Text content
        Expanded(
          child: Padding(
            padding: EdgeInsets.only(bottom: isLast ? 0 : 24),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  step.title,
                  style: TextStyle(
                    fontWeight: isCurrent ? FontWeight.bold : FontWeight.w600,
                    color: isDone
                        ? Theme.of(context).colorScheme.onSurface
                        : Theme.of(context).colorScheme.onSurfaceVariant,
                  ),
                ),
                if (step.subtitle != null) ...[
                  const SizedBox(height: 2),
                  Text(
                    step.subtitle!,
                    style: TextStyle(
                      color: Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 13,
                    ),
                  ),
                ],
                if (step.time != null) ...[
                  const SizedBox(height: 4),
                  Text(
                    step.time!,
                    style: TextStyle(
                      color: isCurrent
                          ? cs.primary
                          : Theme.of(context).colorScheme.onSurfaceVariant,
                      fontSize: 12,
                      fontWeight: isCurrent
                          ? FontWeight.w600
                          : FontWeight.normal,
                    ),
                  ),
                ],
              ],
            ),
          ),
        ),
      ],
    );
  }
}

// ── Map grid painter ──────────────────────────────────────────────────────────

class _MapGridPainter extends CustomPainter {
  final Color color;
  _MapGridPainter({required this.color});

  @override
  void paint(Canvas canvas, Size size) {
    final paint = Paint()
      ..color = color
      ..strokeWidth = 1;

    const step = 24.0;
    for (double x = 0; x < size.width; x += step) {
      canvas.drawLine(Offset(x, 0), Offset(x, size.height), paint);
    }
    for (double y = 0; y < size.height; y += step) {
      canvas.drawLine(Offset(0, y), Offset(size.width, y), paint);
    }
  }

  @override
  bool shouldRepaint(_MapGridPainter old) => old.color != color;
}
```

## Dependencies

No extra packages. For real maps, integrate:
- `google_maps_flutter: ^2.9.0`
- `flutter_map: ^7.0.0` (OpenStreetMap, no API key needed)

## Customization Tips

- Replace `_MapGridPainter` with `GoogleMap` widget for live driver location
- Poll a tracking API every 30s using a `Timer.periodic` in `initState`
- Add push notifications when the status changes using `firebase_messaging`
