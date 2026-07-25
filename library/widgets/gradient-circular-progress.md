---
id: gradient-circular-progress
title: Gradient Ring Circular Progress
sidebar_label: Gradient Circular Progress
---

# Gradient Ring Circular Progress

A customizable circular progress indicator painted with a multi-color gradient sweep, smooth value animation, rounded stroke caps, and center label child widget. Zero third-party pub packages.

## Features
- 🌈 Multi-color `SweepGradient` ring paint
- 🎞️ Animated progress transition via `TweenAnimationBuilder`
- 🎯 Custom inner child slot (center percentage label or icon)
- 📐 Adjustable diameter, stroke width, and background track color

## Widget Code

```dart
import 'dart:math';
import 'package:flutter/material.dart';

class GradientCircularProgress extends StatelessWidget {
  final double progress; // 0.0 to 1.0
  final double size;
  final double strokeWidth;
  final List<Color> gradientColors;
  final Color trackColor;
  final Widget? child;

  const GradientCircularProgress({
    super.key,
    required this.progress,
    this.size = 120,
    this.strokeWidth = 10,
    this.gradientColors = const [
      Color(0xFF6366F1),
      Color(0xFF8B5CF6),
      Color(0xFFEC4899),
    ],
    this.trackColor = const Color(0xFFE2E8F0),
    this.child,
  });

  @override
  Widget build(BuildContext context) {
    return TweenAnimationBuilder<double>(
      tween: Tween(begin: 0.0, end: progress.clamp(0.0, 1.0)),
      duration: const Duration(milliseconds: 800),
      curve: Curves.easeOutCubic,
      builder: (context, animValue, _) {
        return SizedBox(
          width: size,
          height: size,
          child: Stack(
            alignment: Alignment.center,
            children: [
              CustomPaint(
                size: Size(size, size),
                painter: _GradientCircularPainter(
                  progress: animValue,
                  strokeWidth: strokeWidth,
                  gradientColors: gradientColors,
                  trackColor: trackColor,
                ),
              ),
              if (child != null) child!,
            ],
          ),
        );
      },
    );
  }
}

class _GradientCircularPainter extends CustomPainter {
  final double progress;
  final double strokeWidth;
  final List<Color> gradientColors;
  final Color trackColor;

  _GradientCircularPainter({
    required this.progress,
    required this.strokeWidth,
    required this.gradientColors,
    required this.trackColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - (strokeWidth / 2);
    const startAngle = -pi / 2;

    // Track
    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke;

    canvas.drawCircle(center, radius, trackPaint);

    if (progress <= 0) return;

    // Gradient Progress Arc
    final sweepAngle = 2 * pi * progress;
    final progressPaint = Paint()
      ..shader = SweepGradient(
        startAngle: startAngle,
        endAngle: startAngle + sweepAngle,
        colors: gradientColors,
        transform: const GradientRotation(-pi / 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      startAngle,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant _GradientCircularPainter old) =>
      old.progress != progress;
}
```

## Usage

```dart
GradientCircularProgress(
  progress: 0.75,
  size: 140,
  strokeWidth: 12,
  gradientColors: const [Color(0xFF3B82F6), Color(0xFF10B981)],
  child: Column(
    mainAxisSize: MainAxisSize.min,
    children: const [
      Text('75%', style: TextStyle(fontSize: 24, fontWeight: FontWeight.bold)),
      Text('Completed', style: TextStyle(fontSize: 11, color: Colors.grey)),
    ],
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `progress` | `double` | required | Progress ratio between `0.0` and `1.0` |
| `size` | `double` | `120` | Outer square diameter |
| `strokeWidth` | `double` | `10` | Ring stroke thickness |
| `gradientColors` | `List<Color>` | 3 colors | Multi-color sweep gradient stops |
| `trackColor` | `Color` | slate grey | Background inactive ring color |
