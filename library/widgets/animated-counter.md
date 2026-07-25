---
id: animated-counter
title: Animated Number Counter
sidebar_label: Animated Counter
---

# Animated Number Counter

A widget that animates number changes with a smooth count-up/count-down tween. Perfect for dashboards, stats, leaderboards, and any UI element where numbers update visually. Supports integer and decimal formatting, prefixes, and suffixes.

## Features
- 🔢 Smooth `Tween<double>` animation between any two numbers
- ⬆️⬇️ Count-up and count-down support
- 🎨 Configurable `TextStyle`, curve, and duration
- 💲 Prefix/suffix strings (e.g. `$`, `%`, `K+`)
- 🔢 Decimal place formatting
- 📣 `onComplete` callback when animation finishes

## Widget Code

```dart
import 'package:flutter/material.dart';

class AnimatedCounter extends StatefulWidget {
  /// The value to animate to
  final double end;

  /// Starting value (defaults to 0)
  final double begin;

  /// Number of decimal places to display
  final int decimals;

  /// Text prefix (e.g. '$', '+')
  final String prefix;

  /// Text suffix (e.g. '%', 'K')
  final String suffix;

  final TextStyle? style;
  final Duration duration;
  final Curve curve;
  final VoidCallback? onComplete;

  const AnimatedCounter({
    super.key,
    required this.end,
    this.begin = 0,
    this.decimals = 0,
    this.prefix = '',
    this.suffix = '',
    this.style,
    this.duration = const Duration(milliseconds: 1200),
    this.curve = Curves.easeOutCubic,
    this.onComplete,
  });

  @override
  State<AnimatedCounter> createState() => _AnimatedCounterState();
}

class _AnimatedCounterState extends State<AnimatedCounter>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;
  late double _previousEnd;

  @override
  void initState() {
    super.initState();
    _previousEnd = widget.begin;
    _controller = AnimationController(vsync: this, duration: widget.duration);
    _buildAnimation(widget.begin, widget.end);
    _controller.forward().whenComplete(() => widget.onComplete?.call());
  }

  void _buildAnimation(double from, double to) {
    _animation = Tween<double>(begin: from, end: to).animate(
      CurvedAnimation(parent: _controller, curve: widget.curve),
    );
  }

  @override
  void didUpdateWidget(AnimatedCounter oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.end != widget.end) {
      // Animate from wherever we currently are
      final currentValue = _animation.value;
      _controller.reset();
      _buildAnimation(currentValue, widget.end);
      _controller.forward().whenComplete(() => widget.onComplete?.call());
    }
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  String _format(double value) {
    if (widget.decimals == 0) {
      return value.toInt().toString();
    }
    return value.toStringAsFixed(widget.decimals);
  }

  @override
  Widget build(BuildContext context) {
    return AnimatedBuilder(
      animation: _animation,
      builder: (_, __) {
        return Text(
          '${widget.prefix}${_format(_animation.value)}${widget.suffix}',
          style: widget.style ??
              Theme.of(context).textTheme.headlineMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
        );
      },
    );
  }
}
```

## Usage

### Basic count-up

```dart
AnimatedCounter(
  end: 4832,
  duration: const Duration(milliseconds: 1500),
  style: const TextStyle(
    fontSize: 48,
    fontWeight: FontWeight.bold,
    color: Color(0xFF6366F1),
  ),
)
```

### Currency with decimal

```dart
AnimatedCounter(
  end: 48295.50,
  decimals: 2,
  prefix: '\$',
  duration: const Duration(milliseconds: 2000),
  curve: Curves.easeOutExpo,
  style: const TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
  ),
)
```

### Percentage counter

```dart
AnimatedCounter(
  end: 87.4,
  decimals: 1,
  suffix: '%',
  style: TextStyle(
    fontSize: 36,
    fontWeight: FontWeight.bold,
    color: Colors.green.shade600,
  ),
)
```

### Re-triggerable stats card

```dart
class StatsCard extends StatefulWidget {
  const StatsCard({super.key});

  @override
  State<StatsCard> createState() => _StatsCardState();
}

class _StatsCardState extends State<StatsCard> {
  double _users = 1200;

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        AnimatedCounter(
          end: _users,
          suffix: ' users',
          duration: const Duration(milliseconds: 800),
        ),
        ElevatedButton(
          onPressed: () => setState(() => _users += 350),
          child: const Text('Simulate growth'),
        ),
      ],
    );
  }
}
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `end` | `double` | required | Target value to animate to |
| `begin` | `double` | `0` | Starting value |
| `decimals` | `int` | `0` | Number of decimal places |
| `prefix` | `String` | `''` | Text before the number (e.g. `$`) |
| `suffix` | `String` | `''` | Text after the number (e.g. `%`) |
| `style` | `TextStyle?` | headline bold | Text style |
| `duration` | `Duration` | `1200ms` | Animation duration |
| `curve` | `Curve` | `easeOutCubic` | Animation easing |
| `onComplete` | `VoidCallback?` | `null` | Called when animation finishes |

## Customization Tips

- Wrap in `VisibilityDetector` to trigger count-up only when the widget enters the viewport
- Chain multiple counters by using the `onComplete` callback to start the next
- For large numbers, format with `intl` package: `NumberFormat.compact().format(value)` inside the builder
