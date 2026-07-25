---
id: shimmer-loading
title: Shimmer Skeleton Loading
sidebar_label: Shimmer Loading
---

# Shimmer Skeleton Loading Widget

A fully custom shimmer / skeleton loading widget built with `CustomPainter` and `AnimationController` — no third-party packages. Use it as a drop-in placeholder while async content is loading.

## Features
- ✨ Smooth left-to-right shimmer sweep animation
- 🎨 Configurable base color, highlight color, and speed
- 📐 `ShimmerBox` for rectangular areas (text lines, image placeholders)
- 🔵 `ShimmerCircle` for avatar / icon placeholders
- 🧩 Composable — wrap any shape in `ShimmerWrapper`
- 🌙 Dark-mode aware (uses `Theme` colors by default)

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Core shimmer wrapper ─────────────────────────────────────────────────────

class ShimmerWrapper extends StatefulWidget {
  final Widget child;

  /// Base (background) color of the shimmer
  final Color? baseColor;

  /// Highlight color of the sweep
  final Color? highlightColor;

  /// Duration of one full shimmer cycle
  final Duration period;

  const ShimmerWrapper({
    super.key,
    required this.child,
    this.baseColor,
    this.highlightColor,
    this.period = const Duration(milliseconds: 1400),
  });

  @override
  State<ShimmerWrapper> createState() => _ShimmerWrapperState();
}

class _ShimmerWrapperState extends State<ShimmerWrapper>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(vsync: this, duration: widget.period)
      ..repeat();
    _animation = Tween<double>(begin: -1, end: 2).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final brightness = Theme.of(context).brightness;
    final isDark = brightness == Brightness.dark;

    final base = widget.baseColor ??
        (isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE8E8E8));
    final highlight = widget.highlightColor ??
        (isDark ? const Color(0xFF3D3D3D) : const Color(0xFFF5F5F5));

    return AnimatedBuilder(
      animation: _animation,
      builder: (context, child) {
        return ShaderMask(
          blendMode: BlendMode.srcATop,
          shaderCallback: (bounds) {
            return LinearGradient(
              begin: Alignment.centerLeft,
              end: Alignment.centerRight,
              stops: const [0.0, 0.5, 1.0],
              colors: [base, highlight, base],
              transform: _SlidingGradientTransform(slidePercent: _animation.value),
            ).createShader(bounds);
          },
          child: child,
        );
      },
      child: widget.child,
    );
  }
}

// ── Gradient slide transform ─────────────────────────────────────────────────

class _SlidingGradientTransform extends GradientTransform {
  final double slidePercent;
  const _SlidingGradientTransform({required this.slidePercent});

  @override
  Matrix4? transform(Rect bounds, {TextDirection? textDirection}) {
    return Matrix4.translationValues(bounds.width * slidePercent, 0, 0);
  }
}

// ── Convenience shape widgets ────────────────────────────────────────────────

/// A rectangular shimmer placeholder (for text lines, image areas, etc.)
class ShimmerBox extends StatelessWidget {
  final double width;
  final double height;
  final double borderRadius;

  const ShimmerBox({
    super.key,
    required this.width,
    required this.height,
    this.borderRadius = 8,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: width,
      height: height,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE8E8E8),
        borderRadius: BorderRadius.circular(borderRadius),
      ),
    );
  }
}

/// A circular shimmer placeholder (for avatars, icons, etc.)
class ShimmerCircle extends StatelessWidget {
  final double size;

  const ShimmerCircle({super.key, required this.size});

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    return Container(
      width: size,
      height: size,
      decoration: BoxDecoration(
        color: isDark ? const Color(0xFF2A2A2A) : const Color(0xFFE8E8E8),
        shape: BoxShape.circle,
      ),
    );
  }
}
```

## Usage

### Feed card skeleton

```dart
ShimmerWrapper(
  child: Padding(
    padding: const EdgeInsets.all(16),
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header row
        Row(
          children: [
            const ShimmerCircle(size: 44),
            const SizedBox(width: 12),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: const [
                ShimmerBox(width: 140, height: 12),
                SizedBox(height: 6),
                ShimmerBox(width: 90, height: 10),
              ],
            ),
          ],
        ),
        const SizedBox(height: 16),
        // Image placeholder
        const ShimmerBox(width: double.infinity, height: 180, borderRadius: 12),
        const SizedBox(height: 12),
        // Text lines
        const ShimmerBox(width: double.infinity, height: 12),
        const SizedBox(height: 8),
        const ShimmerBox(width: double.infinity, height: 12),
        const SizedBox(height: 8),
        const ShimmerBox(width: 200, height: 12),
      ],
    ),
  ),
)
```

### Toggle between shimmer and real content

```dart
class _MyWidgetState extends State<MyWidget> {
  bool _isLoading = true;
  List<String> _items = [];

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  Future<void> _loadData() async {
    final data = await fetchItems(); // your API call
    setState(() {
      _items = data;
      _isLoading = false;
    });
  }

  @override
  Widget build(BuildContext context) {
    if (_isLoading) {
      return ShimmerWrapper(
        child: Column(
          children: List.generate(
            4,
            (_) => Padding(
              padding: const EdgeInsets.symmetric(vertical: 8, horizontal: 16),
              child: Row(
                children: const [
                  ShimmerCircle(size: 48),
                  SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        ShimmerBox(width: double.infinity, height: 13),
                        SizedBox(height: 8),
                        ShimmerBox(width: 160, height: 11),
                      ],
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      );
    }

    return ListView.builder(
      itemCount: _items.length,
      itemBuilder: (_, i) => ListTile(title: Text(_items[i])),
    );
  }
}
```

## Parameters — `ShimmerWrapper`

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Skeleton layout to overlay shimmer on |
| `baseColor` | `Color?` | Theme-aware | Background color of shimmer blocks |
| `highlightColor` | `Color?` | Theme-aware | Sweep highlight color |
| `period` | `Duration` | `1400ms` | Duration of one shimmer cycle |

## Customization Tips

- For a **gold shimmer** effect: set `baseColor: Color(0xFFD4A017)` and `highlightColor: Color(0xFFFFF0A0)`
- Reduce `period` to `900ms` for a faster, more energetic shimmer
- Wrap multiple independent sections in their **own** `ShimmerWrapper` to animate them in sync
