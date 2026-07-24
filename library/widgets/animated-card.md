---
id: animated-card
title: 3D Parallax Tilt Card
sidebar_label: 3D Tilt Card
---

# 3D Parallax Tilt Card Widget

Interactive Flutter widget that applies real-time Matrix4 3D tilt effects using touch/mouse gestures.

## Example

```dart
import 'dart:math';
import 'package:flutter/material.dart';

class ParallaxTiltCard extends StatefulWidget {
  final Widget child;
  final double maxTiltAngle;
  final double scale;

  const ParallaxTiltCard({
    super.key,
    required this.child,
    this.maxTiltAngle = 15.0,
    this.scale = 1.05,
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
      duration: const Duration(milliseconds: 400),
    );
  }

  @override
  void dispose() {
    _resetController.dispose();
    super.dispose();
  }

  void _onPanUpdate(DragUpdateDetails details, BoxConstraints constraints) {
    final centerX = constraints.maxWidth / 2;
    final centerY = constraints.maxHeight / 2;

    final dx = details.localPosition.dx - centerX;
    final dy = details.localPosition.dy - centerY;

    setState(() {
      _rotateY = (dx / centerX) * widget.maxTiltAngle * (pi / 180);
      _rotateX = -(dy / centerY) * widget.maxTiltAngle * (pi / 180);
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
    return LayoutBuilder(
      builder: (context, constraints) {
        return GestureDetector(
          onPanUpdate: (d) => _onPanUpdate(d, constraints),
          onPanEnd: _onPanEnd,
          child: AnimatedScale(
            scale: (_rotateX != 0 || _rotateY != 0) ? widget.scale : 1.0,
            duration: const Duration(milliseconds: 200),
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
  maxTiltAngle: 15.0,
  scale: 1.05,
  child: Container(
    width: 300,
    height: 200,
    decoration: BoxDecoration(
      borderRadius: BorderRadius.circular(16),
      gradient: const LinearGradient(
        colors: [Color(0xFF0175C2), Color(0xFF13B9FD)],
        begin: Alignment.topLeft,
        end: Alignment.bottomRight,
      ),
      boxShadow: [
        BoxShadow(
          color: Colors.black.withOpacity(0.3),
          blurRadius: 20,
          offset: const Offset(0, 10),
        ),
      ],
    ),
    child: const Center(
      child: Text(
        'Tilt Me!',
        style: TextStyle(
          color: Colors.white,
          fontSize: 24,
          fontWeight: FontWeight.bold,
        ),
      ),
    ),
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | The widget to apply the 3D tilt effect to |
| `maxTiltAngle` | `double` | `15.0` | Maximum tilt angle in degrees |
| `scale` | `double` | `1.05` | Scale factor applied during tilt interaction |
