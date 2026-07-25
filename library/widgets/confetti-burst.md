---
id: confetti-burst
title: Confetti Burst Particle Animation
sidebar_label: Confetti Burst
---

# Confetti Burst Particle Animation

A pure Flutter particle physics explosion widget that shoots colorful confetti shapes (squares, circles, ribbons) with gravity, velocity, rotation, and fade-out. Perfect for rewards, purchase success, and milestone celebrations.

## Features
- 🎆 Physics-driven particle simulation (gravity, velocity, angular rotation)
- 🎨 Multi-color palette and custom shapes (rectangles, circles)
- ⏱ Configurable particle count, explosion angle, speed, and duration
- 🔁 Imperative trigger API via `GlobalKey<ConfettiBurstState>`
- 🚀 Zero pubspec dependencies (Pure CustomPainter & AnimationController)

## Widget Code

```dart
import 'dart:math';
import 'package:flutter/material.dart';

// ── Particle Data Model ──────────────────────────────────────────────────────

class _ConfettiParticle {
  double x;
  double y;
  double vx;
  double vy;
  double size;
  Color color;
  double rotation;
  double vRotation;
  bool isCircle;

  _ConfettiParticle({
    required this.x,
    required this.y,
    required this.vx,
    required this.vy,
    required this.size,
    required this.color,
    required this.rotation,
    required this.vRotation,
    required this.isCircle,
  });
}

// ── Confetti Burst Widget ────────────────────────────────────────────────────

class ConfettiBurst extends StatefulWidget {
  final Widget child;
  final int particleCount;
  final List<Color> colors;
  final Duration duration;

  const ConfettiBurst({
    super.key,
    required this.child,
    this.particleCount = 50,
    this.colors = const [
      Color(0xFFFF0055),
      Color(0xFF00E676),
      Color(0xFF00B0FF),
      Color(0xFFFFD600),
      Color(0xFFAA00FF),
    ],
    this.duration = const Duration(milliseconds: 2500),
  });

  @override
  State<ConfettiBurst> createState() => ConfettiBurstState();
}

class ConfettiBurstState extends State<ConfettiBurst>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  final List<_ConfettiParticle> _particles = [];
  final Random _random = Random();

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
    )..addListener(_updateParticles);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  /// Fire the confetti explosion
  void play() {
    _initParticles();
    _controller.forward(from: 0);
  }

  void _initParticles() {
    _particles.clear();
    for (int i = 0; i < widget.particleCount; i++) {
      final angle = _random.nextDouble() * 2 * pi;
      final speed = _random.nextDouble() * 8 + 4;
      _particles.add(
        _ConfettiParticle(
          x: 0,
          y: 0,
          vx: cos(angle) * speed,
          vy: sin(angle) * speed - 6, // Initial upward velocity boost
          size: _random.nextDouble() * 6 + 6,
          color: widget.colors[_random.nextInt(widget.colors.length)],
          rotation: _random.nextDouble() * 2 * pi,
          vRotation: (_random.nextDouble() - 0.5) * 0.3,
          isCircle: _random.nextBool(),
        ),
      );
    }
  }

  void _updateParticles() {
    if (!_controller.isAnimating) return;
    setState(() {
      for (final p in _particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.3; // Gravity acceleration
        p.vx *= 0.98; // Air resistance
        p.rotation += p.vRotation;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    return Stack(
      clipBehavior: Clip.none,
      children: [
        widget.child,
        if (_controller.isAnimating)
          Positioned.fill(
            child: IgnorePointer(
              child: CustomPaint(
                painter: _ConfettiPainter(
                  particles: _particles,
                  progress: _controller.value,
                ),
              ),
            ),
          ),
      ],
    );
  }
}

// ── Painter ──────────────────────────────────────────────────────────────────

class _ConfettiPainter extends CustomPainter {
  final List<_ConfettiParticle> particles;
  final double progress;

  _ConfettiPainter({required this.particles, required this.progress});

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final opacity = (1.0 - progress).clamp(0.0, 1.0);

    for (final p in particles) {
      final paint = Paint()
        ..color = p.color.withOpacity(opacity)
        ..style = PaintingStyle.fill;

      canvas.save();
      canvas.translate(center.dx + p.x, center.dy + p.y);
      canvas.rotate(p.rotation);

      if (p.isCircle) {
        canvas.drawCircle(Offset.zero, p.size / 2, paint);
      } else {
        canvas.drawRect(
          Rect.fromCenter(
            center: Offset.zero,
            width: p.size,
            height: p.size * 0.6,
          ),
          paint,
        );
      }

      canvas.restore();
    }
  }

  @override
  bool shouldRepaint(covariant _ConfettiPainter old) => true;
}
```

## Usage

```dart
final _confettiKey = GlobalKey<ConfettiBurstState>();

ConfettiBurst(
  key: _confettiKey,
  particleCount: 70,
  child: FilledButton.icon(
    onPressed: () {
      _confettiKey.currentState?.play();
    },
    icon: const Icon(Icons.celebration),
    label: const Text('Claim Reward!'),
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Content widget inside the burst container |
| `particleCount` | `int` | `50` | Number of confetti pieces per burst |
| `colors` | `List<Color>` | 5 neon colors | Color palette for confetti |
| `duration` | `Duration` | `2500ms` | Total duration of burst animation |

## Customization Tips

- Call `play()` inside an `onSuccess` API callback or form submission handler
- Pass custom brand colors to `colors:` to match your application's design system
