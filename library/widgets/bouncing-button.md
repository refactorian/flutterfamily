---
id: bouncing-button
title: Tactile Spring Bouncing Button
sidebar_label: Bouncing Button
---

# Tactile Spring Bouncing Button

A tactile action button widget that shrinks down smoothly when pressed and springs back up on release. Creates a playful, micro-interactive feel for primary actions and icon buttons.

## Features
- 🤏 Press-down scale shrink animation (`scale: 0.94`)
- 🎞️ Elastic spring-back animation curve (`Curves.elasticOut` / `Curves.easeOut`)
- 🎨 Supports custom background color, gradient, elevation, child label or icon
- 📳 Built-in haptic feedback trigger option (`HapticFeedback.lightImpact()`)

## Widget Code

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class BouncingButton extends StatefulWidget {
  final Widget child;
  final VoidCallback? onPressed;
  final double scaleFactor;
  final Duration duration;
  final Color? backgroundColor;
  final Gradient? gradient;
  final EdgeInsetsGeometry padding;
  final double borderRadius;
  final bool enableHaptic;

  const BouncingButton({
    super.key,
    required this.child,
    this.onPressed,
    this.scaleFactor = 0.94,
    this.duration = const Duration(milliseconds: 150),
    this.backgroundColor,
    this.gradient,
    this.padding = const EdgeInsets.symmetric(horizontal: 24, vertical: 14),
    this.borderRadius = 14,
    this.enableHaptic = true,
  });

  @override
  State<BouncingButton> createState() => _BouncingButtonState();
}

class _BouncingButtonState extends State<BouncingButton>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _scaleAnimation;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: widget.duration,
      lowerBound: 0.0,
      upperBound: 1.0 - widget.scaleFactor,
    );
    _scaleAnimation = Tween<double>(
      begin: 1.0,
      end: widget.scaleFactor,
    ).animate(_controller);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails _) {
    if (widget.onPressed == null) return;
    if (widget.enableHaptic) HapticFeedback.lightImpact();
    _controller.forward();
  }

  void _onTapUp(TapUpDetails _) {
    if (widget.onPressed == null) return;
    _controller.reverse();
    widget.onPressed?.call();
  }

  void _onTapCancel() {
    if (widget.onPressed == null) return;
    _controller.reverse();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final bg = widget.backgroundColor ?? cs.primary;

    return GestureDetector(
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: AnimatedBuilder(
        animation: _scaleAnimation,
        builder: (context, child) => Transform.scale(
          scale: _scaleAnimation.value,
          child: child,
        ),
        child: Container(
          padding: widget.padding,
          decoration: BoxDecoration(
            color: widget.gradient == null ? bg : null,
            gradient: widget.gradient,
            borderRadius: BorderRadius.circular(widget.borderRadius),
            boxShadow: [
              BoxShadow(
                color: (widget.backgroundColor ?? cs.primary).withOpacity(0.3),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: DefaultTextStyle(
            style: TextStyle(
              color: cs.onPrimary,
              fontWeight: FontWeight.bold,
              fontSize: 15,
            ),
            child: widget.child,
          ),
        ),
      ),
    );
  }
}
```

## Usage

```dart
BouncingButton(
  onPressed: () => debugPrint('Bounced!'),
  gradient: const LinearGradient(
    colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
  ),
  child: const Row(
    mainAxisSize: MainAxisSize.min,
    children: [
      Icon(Icons.flash_on_rounded, color: Colors.white, size: 18),
      SizedBox(width: 8),
      Text('Quick Action'),
    ],
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Button inner content |
| `onPressed` | `VoidCallback?` | `null` | Tap action callback |
| `scaleFactor` | `double` | `0.94` | Press-down shrink scale target |
| `enableHaptic` | `bool` | `true` | Triggers subtle tactile vibration on press |
