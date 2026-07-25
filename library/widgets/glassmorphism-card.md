---
id: glassmorphism-card
title: Glassmorphism Card
sidebar_label: Glass Card
---

# Glassmorphism Card

A frosted-glass card widget using `BackdropFilter` with `ImageFilter.blur`, a translucent tinted background, and a subtle border glow. Works over gradients, images, and any colored background.

## Features
- 🪟 `BackdropFilter` blur for true glassmorphism
- 🌈 Configurable tint color and opacity
- 💎 Subtle gradient border using `ShaderMask`
- 🎨 Works over any background
- 📐 Configurable blur sigma, border radius, and padding
- 🌙 Dark mode aware

## Widget Code

```dart
import 'dart:ui';
import 'package:flutter/material.dart';

class GlassCard extends StatelessWidget {
  final Widget child;
  final double blurSigma;
  final Color tintColor;
  final double tintOpacity;
  final double borderRadius;
  final double borderOpacity;
  final EdgeInsetsGeometry padding;
  final double? width;
  final double? height;

  const GlassCard({
    super.key,
    required this.child,
    this.blurSigma = 12,
    this.tintColor = Colors.white,
    this.tintOpacity = 0.12,
    this.borderRadius = 20,
    this.borderOpacity = 0.25,
    this.padding = const EdgeInsets.all(20),
    this.width,
    this.height,
  });

  @override
  Widget build(BuildContext context) {
    final isDark = Theme.of(context).brightness == Brightness.dark;
    final effectiveTint =
        isDark ? Colors.white : tintColor;
    final effectiveOpacity =
        isDark ? tintOpacity * 0.6 : tintOpacity;

    return ClipRRect(
      borderRadius: BorderRadius.circular(borderRadius),
      child: BackdropFilter(
        filter: ImageFilter.blur(sigmaX: blurSigma, sigmaY: blurSigma),
        child: Container(
          width: width,
          height: height,
          decoration: BoxDecoration(
            color: effectiveTint.withOpacity(effectiveOpacity),
            borderRadius: BorderRadius.circular(borderRadius),
            border: Border.all(
              color: Colors.white.withOpacity(borderOpacity),
              width: 1.5,
            ),
            gradient: LinearGradient(
              colors: [
                Colors.white.withOpacity(effectiveOpacity * 1.5),
                Colors.white.withOpacity(effectiveOpacity * 0.5),
              ],
              begin: Alignment.topLeft,
              end: Alignment.bottomRight,
            ),
          ),
          padding: padding,
          child: child,
        ),
      ),
    );
  }
}
```

## Usage

### Glass card over a gradient background

```dart
Container(
  width: double.infinity,
  height: 400,
  decoration: const BoxDecoration(
    gradient: LinearGradient(
      colors: [Color(0xFF6366F1), Color(0xFF8B5CF6), Color(0xFFEC4899)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  ),
  child: Center(
    child: GlassCard(
      width: 300,
      blurSigma: 14,
      tintOpacity: 0.15,
      child: Column(
        mainAxisSize: MainAxisSize.min,
        crossAxisAlignment: CrossAxisAlignment.start,
        children: const [
          Text(
            'Glass Card',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
          SizedBox(height: 8),
          Text(
            'Beautiful frosted glass effect over any background.',
            style: TextStyle(color: Colors.white70, height: 1.5),
          ),
        ],
      ),
    ),
  ),
)
```

### Glass stat card

```dart
GlassCard(
  blurSigma: 10,
  tintColor: Colors.blue,
  tintOpacity: 0.1,
  borderRadius: 16,
  padding: const EdgeInsets.all(16),
  child: Row(
    children: [
      Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white.withOpacity(0.2),
          borderRadius: BorderRadius.circular(12),
        ),
        child: const Icon(Icons.people_outline_rounded,
            color: Colors.white, size: 28),
      ),
      const SizedBox(width: 16),
      const Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Text(
            '4,821',
            style: TextStyle(
              color: Colors.white,
              fontSize: 24,
              fontWeight: FontWeight.bold,
            ),
          ),
          Text(
            'Active Users',
            style: TextStyle(color: Colors.white70, fontSize: 13),
          ),
        ],
      ),
    ],
  ),
)
```

### Credit card UI

```dart
Container(
  width: 340,
  height: 200,
  decoration: BoxDecoration(
    borderRadius: BorderRadius.circular(20),
    gradient: const LinearGradient(
      colors: [Color(0xFF0F0C29), Color(0xFF302B63)],
      begin: Alignment.topLeft,
      end: Alignment.bottomRight,
    ),
  ),
  child: GlassCard(
    blurSigma: 6,
    tintOpacity: 0.08,
    borderRadius: 20,
    child: Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: const [
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Text('VISA', style: TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold, fontStyle: FontStyle.italic)),
            Icon(Icons.contactless_rounded, color: Colors.white70, size: 28),
          ],
        ),
        Text('4521  •••• ••••  8834',
          style: TextStyle(color: Colors.white, fontSize: 18, letterSpacing: 2)),
        Row(
          mainAxisAlignment: MainAxisAlignment.spaceBetween,
          children: [
            Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
              Text('CARD HOLDER', style: TextStyle(color: Colors.white54, fontSize: 10)),
              Text('Alex Johnson', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ]),
            Column(crossAxisAlignment: CrossAxisAlignment.end, children: [
              Text('EXPIRES', style: TextStyle(color: Colors.white54, fontSize: 10)),
              Text('09/28', style: TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
            ]),
          ],
        ),
      ],
    ),
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Content inside the glass card |
| `blurSigma` | `double` | `12` | Blur intensity (higher = more frosted) |
| `tintColor` | `Color` | `Colors.white` | Glass tint color |
| `tintOpacity` | `double` | `0.12` | Tint color opacity (0–1) |
| `borderRadius` | `double` | `20` | Corner radius |
| `borderOpacity` | `double` | `0.25` | Border line opacity |
| `padding` | `EdgeInsetsGeometry` | `all(20)` | Inner padding |
| `width` | `double?` | `null` | Fixed width |
| `height` | `double?` | `null` | Fixed height |

## Customization Tips

- Set `blurSigma: 0` for a tinted-only card without blur (better performance)
- Combine with a `Hero` transition for a glowing card detail-view animation
- On older/low-end devices, gate the blur with `if (Platform.isIOS || Platform.isAndroid)` to skip on web
