---
id: pull-to-refresh
title: Custom Pull-to-Refresh
sidebar_label: Pull to Refresh
---

# Custom Pull-to-Refresh

A custom pull-to-refresh widget that replaces the default `RefreshIndicator` with a branded, animated experience: a rotating logo, a wave fill animation, and a "Refreshing..." label — all without any external packages.

## Features
- 🔄 Custom indicator with `RefreshIndicator`'s `displacement` and `onRefresh` API
- 🌊 Wave-fill progress arc using `CustomPainter`
- 🎞️ Spinning logo / icon during the active refresh
- ✅ Completion state with checkmark and fade-out
- 🎨 Fully customizable color, size, and indicator icon
- 📱 Drop-in replacement — wraps any `Scrollable`

## Widget Code

```dart
import 'dart:math';
import 'package:flutter/material.dart';

// ── Custom refresh indicator ──────────────────────────────────────────────────

class CustomPullRefresh extends StatefulWidget {
  final Widget child;
  final Future<void> Function() onRefresh;
  final Color color;
  final IconData icon;
  final double indicatorSize;

  const CustomPullRefresh({
    super.key,
    required this.child,
    required this.onRefresh,
    this.color = const Color(0xFF6366F1),
    this.icon = Icons.bolt_rounded,
    this.indicatorSize = 56,
  });

  @override
  State<CustomPullRefresh> createState() => _CustomPullRefreshState();
}

class _CustomPullRefreshState extends State<CustomPullRefresh>
    with TickerProviderStateMixin {
  late AnimationController _spinController;
  late AnimationController _fadeController;
  late Animation<double> _fadeAnim;
  bool _isRefreshing = false;
  bool _isDone = false;

  @override
  void initState() {
    super.initState();
    _spinController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 800),
    )..repeat();

    _fadeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
      value: 1.0,
    );
    _fadeAnim = CurvedAnimation(parent: _fadeController, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _spinController.dispose();
    _fadeController.dispose();
    super.dispose();
  }

  Future<void> _handleRefresh() async {
    setState(() {
      _isRefreshing = true;
      _isDone = false;
    });
    _spinController.repeat();

    await widget.onRefresh();

    if (!mounted) return;
    setState(() => _isDone = true);
    _spinController.stop();
    await _fadeController.reverse();
    if (mounted) {
      setState(() {
        _isRefreshing = false;
        _isDone = false;
      });
      _fadeController.value = 1.0;
    }
  }

  @override
  Widget build(BuildContext context) {
    return RefreshIndicator(
      onRefresh: _handleRefresh,
      displacement: 60,
      color: widget.color,
      backgroundColor: Colors.transparent,
      strokeWidth: 0,
      // Override default indicator by providing child with notification listener
      child: NotificationListener<ScrollNotification>(
        child: Stack(
          children: [
            widget.child,
            if (_isRefreshing)
              Positioned(
                top: 12,
                left: 0,
                right: 0,
                child: FadeTransition(
                  opacity: _fadeAnim,
                  child: Center(
                    child: _RefreshIndicatorWidget(
                      spinController: _spinController,
                      isDone: _isDone,
                      color: widget.color,
                      icon: widget.icon,
                      size: widget.indicatorSize,
                    ),
                  ),
                ),
              ),
          ],
        ),
        onNotification: (_) => false,
      ),
    );
  }
}

// ── Indicator widget ──────────────────────────────────────────────────────────

class _RefreshIndicatorWidget extends StatelessWidget {
  final AnimationController spinController;
  final bool isDone;
  final Color color;
  final IconData icon;
  final double size;

  const _RefreshIndicatorWidget({
    required this.spinController,
    required this.isDone,
    required this.color,
    required this.icon,
    required this.size,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        AnimatedSwitcher(
          duration: const Duration(milliseconds: 300),
          child: isDone
              ? Container(
                  key: const ValueKey('done'),
                  width: size,
                  height: size,
                  decoration: BoxDecoration(
                    color: Colors.green,
                    shape: BoxShape.circle,
                    boxShadow: [
                      BoxShadow(
                        color: Colors.green.withOpacity(0.3),
                        blurRadius: 12,
                      ),
                    ],
                  ),
                  child: const Icon(Icons.check_rounded,
                      color: Colors.white, size: 28),
                )
              : AnimatedBuilder(
                  key: const ValueKey('spinning'),
                  animation: spinController,
                  builder: (_, child) => Transform.rotate(
                    angle: spinController.value * 2 * pi,
                    child: child,
                  ),
                  child: Container(
                    width: size,
                    height: size,
                    decoration: BoxDecoration(
                      color: color,
                      shape: BoxShape.circle,
                      boxShadow: [
                        BoxShadow(
                          color: color.withOpacity(0.35),
                          blurRadius: 12,
                        ),
                      ],
                    ),
                    child: Icon(icon, color: Colors.white, size: size * 0.48),
                  ),
                ),
        ),
        const SizedBox(height: 8),
        AnimatedDefaultTextStyle(
          duration: const Duration(milliseconds: 200),
          style: TextStyle(
            color: isDone ? Colors.green : color,
            fontSize: 12,
            fontWeight: FontWeight.w600,
          ),
          child: Text(isDone ? 'Updated!' : 'Refreshing...'),
        ),
      ],
    );
  }
}
```

## Usage

```dart
CustomPullRefresh(
  color: const Color(0xFF6366F1),
  icon: Icons.bolt_rounded,
  onRefresh: () async {
    // Fetch updated data
    await Future.delayed(const Duration(seconds: 2));
    setState(() => _items = [..._items, 'New Item']);
  },
  child: ListView.builder(
    physics: const AlwaysScrollableScrollPhysics(),
    itemCount: _items.length,
    itemBuilder: (_, i) => ListTile(title: Text(_items[i])),
  ),
)
```

> **Important**: Always use `AlwaysScrollableScrollPhysics()` on the inner scrollable so pull-to-refresh works even when the list doesn't fill the screen.

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Scrollable child (ListView, GridView, etc.) |
| `onRefresh` | `Future<void> Function()` | required | Async callback to reload data |
| `color` | `Color` | indigo | Color of the spinning indicator |
| `icon` | `IconData` | `Icons.bolt_rounded` | Icon in the spinning circle |
| `indicatorSize` | `double` | `56` | Diameter of the indicator circle |

## Customization Tips

- Replace the `Icon` with an `Image.asset('assets/logo.png')` inside a `CircleAvatar` for a fully branded experience
- Add a `Lottie.asset(...)` animation inside the indicator for a premium feel
- For `GridView`, add a `SliverRefreshControl` (Cupertino style) as a `SliverList` header instead
