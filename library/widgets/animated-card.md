---
id: animated-card
title: 3D Parallax Tilt Card
sidebar_label: 3D Tilt Card
---

# 3D Parallax Tilt Card Widget

An interactive Flutter widget that applies real-time `Matrix4` 3D tilt effects based on touch/mouse gesture position. The card smoothly resets to its original orientation when the user lifts their finger, using a spring-like animation.

## Features
- 🎮 Real-time tilt tracking via `GestureDetector` pan events
- 🔄 Spring-back reset animation with `CurvedAnimation`
- 🔍 Perspective depth effect using `Matrix4.setEntry(3, 2, ...)`
- 📐 Configurable max tilt angle and scale factor
- 🖥️ Works on touch and mouse (desktop/web) inputs
- ⚡ Zero rebuild of child widget during tilt

## Widget Code

```dart
import 'dart:math';
import 'package:flutter/material.dart';

class ParallaxTiltCard extends StatefulWidget {
  final Widget child;

  /// Maximum tilt angle in degrees (default: 15°)
  final double maxTiltAngle;

  /// Scale factor when tilting (default: 1.05 = 5% zoom)
  final double scale;

  /// Duration for the spring-back reset animation
  final Duration resetDuration;

  const ParallaxTiltCard({
    super.key,
    required this.child,
    this.maxTiltAngle = 15.0,
    this.scale = 1.05,
    this.resetDuration = const Duration(milliseconds: 400),
  });

  @override
  State<ParallaxTiltCard> createState() => _ParallaxTiltCardState();
}

class _ParallaxTiltCardState extends State<ParallaxTiltCard>
    with SingleTickerProviderStateMixin {
  double _rotateX = 0;
  double _rotateY = 0;

  late AnimationController _resetController;
  late Animation<double> _resetAnimX;
  late Animation<double> _resetAnimY;

  @override
  void initState() {
    super.initState();
    _resetController = AnimationController(
      vsync: this,
      duration: widget.resetDuration,
    );
  }

  @override
  void dispose() {
    _resetController.dispose();
    super.dispose();
  }

  void _onPanUpdate(DragUpdateDetails details, BoxConstraints constraints) {
    // Stop any ongoing reset animation
    _resetController.stop();

    final centerX = constraints.maxWidth / 2;
    final centerY = constraints.maxHeight / 2;
    final dx = details.localPosition.dx - centerX;
    final dy = details.localPosition.dy - centerY;
    final rad = widget.maxTiltAngle * (pi / 180);

    setState(() {
      _rotateY = (dx / centerX).clamp(-1.0, 1.0) * rad;
      _rotateX = -(dy / centerY).clamp(-1.0, 1.0) * rad;
    });
  }

  void _onPanEnd(DragEndDetails _) {
    _resetAnimX = Tween<double>(begin: _rotateX, end: 0).animate(
      CurvedAnimation(parent: _resetController, curve: Curves.easeOut),
    )..addListener(() => setState(() => _rotateX = _resetAnimX.value));

    _resetAnimY = Tween<double>(begin: _rotateY, end: 0).animate(
      CurvedAnimation(parent: _resetController, curve: Curves.easeOut),
    )..addListener(() => setState(() => _rotateY = _resetAnimY.value));

    _resetController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final isTilting = _rotateX != 0 || _rotateY != 0;

    return LayoutBuilder(
      builder: (context, constraints) {
        return GestureDetector(
          onPanUpdate: (d) => _onPanUpdate(d, constraints),
          onPanEnd: _onPanEnd,
          child: AnimatedScale(
            scale: isTilting ? widget.scale : 1.0,
            duration: const Duration(milliseconds: 150),
            curve: Curves.easeOut,
            child: Transform(
              alignment: Alignment.center,
              transform: Matrix4.identity()
                ..setEntry(3, 2, 0.001) // perspective
                ..rotateX(_rotateX)
                ..rotateY(_rotateY),
              child: widget.child,
            ),
          ),
        );
      },
    );
  }
}
```

## Usage

```dart
ParallaxTiltCard(
  maxTiltAngle: 12.0,
  scale: 1.04,
  child: Container(
    width: 300,
    height: 180,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(20),
      gradient: const LinearGradient(
        colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      boxShadow: [
        BoxShadow(
          color: const Color(0xFF6366F1).withOpacity(0.35),
          blurRadius: 24,
          offset: const Offset(0, 12),
        ),
      ],
    ),
    child: Stack(
      children: [
        // Shiny highlight overlay
        Positioned(
          top: -30,
          left: -20,
          child: Container(
            width: 160,
            height: 160,
            decoration: BoxDecoration(
              shape: BoxShape.circle,
              color: Colors.white.withOpacity(0.07),
            ),
          ),
        ),
        const Center(
          child: Text(
            'Tilt Me!',
            style: TextStyle(
              color: Colors.white,
              fontSize: 22,
              fontWeight: FontWeight.bold,
            ),
          ),
        ),
      ],
    ),
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | The widget to apply the tilt effect to |
| `maxTiltAngle` | `double` | `15.0` | Max rotation angle in degrees |
| `scale` | `double` | `1.05` | Scale factor applied during tilt |
| `resetDuration` | `Duration` | `400ms` | Duration of the spring-back animation |

## Customization Tips

- Lower `maxTiltAngle` to `8°` for subtle, professional card effects
- Pair with a `GlowBorder` or `BoxShadow` that updates based on `_rotateX`/`_rotateY` for a dynamic lighting effect
- Wrap inside a `Hero` widget for seamless page transitions with the tilt card as the shared element
