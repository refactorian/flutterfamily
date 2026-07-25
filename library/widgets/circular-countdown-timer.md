---
id: circular-countdown-timer
title: Circular Countdown Timer
sidebar_label: Countdown Timer
---

# Circular Countdown Timer

A fully custom circular progress countdown timer drawn with `CustomPainter`. Features a sweeping arc that depletes over time, a center display for remaining time, and callbacks for completion and tick events.

## Features
- 🕐 `CustomPainter` arc that sweeps from full to empty
- ⏱ MM:SS or SS display format auto-selection
- ▶️ Start / Pause / Reset controls
- 🎨 Configurable foreground color, background track, and stroke width
- 📣 `onComplete` and `onTick` callbacks
- 🔁 Looping mode support

## Widget Code

```dart
import 'dart:math';
import 'dart:async';
import 'package:flutter/material.dart';

class CircularCountdownTimer extends StatefulWidget {
  /// Total duration in seconds
  final int durationSeconds;

  final double size;
  final double strokeWidth;
  final Color progressColor;
  final Color trackColor;
  final TextStyle? timeStyle;
  final bool autoStart;
  final bool loop;
  final VoidCallback? onComplete;
  final ValueChanged<int>? onTick; // remaining seconds

  const CircularCountdownTimer({
    super.key,
    required this.durationSeconds,
    this.size = 180,
    this.strokeWidth = 10,
    this.progressColor = const Color(0xFF6366F1),
    this.trackColor = const Color(0xFFE8E8E8),
    this.timeStyle,
    this.autoStart = true,
    this.loop = false,
    this.onComplete,
    this.onTick,
  });

  @override
  State<CircularCountdownTimer> createState() =>
      _CircularCountdownTimerState();
}

class _CircularCountdownTimerState extends State<CircularCountdownTimer>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  Timer? _ticker;
  int _remaining = 0;
  bool _isRunning = false;
  bool _isCompleted = false;

  @override
  void initState() {
    super.initState();
    _remaining = widget.durationSeconds;
    _controller = AnimationController(
      vsync: this,
      duration: Duration(seconds: widget.durationSeconds),
    )..addStatusListener((status) {
        if (status == AnimationStatus.completed) {
          _isCompleted = true;
          _ticker?.cancel();
          widget.onComplete?.call();
          if (widget.loop) {
            Future.delayed(const Duration(milliseconds: 300), () {
              if (mounted) reset();
            });
          }
        }
      });

    if (widget.autoStart) start();
  }

  void start() {
    if (_isCompleted) return;
    setState(() => _isRunning = true);
    _controller.forward();
    _ticker = Timer.periodic(const Duration(seconds: 1), (_) {
      if (!mounted) return;
      setState(() {
        _remaining = (widget.durationSeconds -
                (_controller.value * widget.durationSeconds).round())
            .clamp(0, widget.durationSeconds);
      });
      widget.onTick?.call(_remaining);
    });
  }

  void pause() {
    _controller.stop();
    _ticker?.cancel();
    setState(() => _isRunning = false);
  }

  void reset() {
    _controller.reset();
    _ticker?.cancel();
    setState(() {
      _remaining = widget.durationSeconds;
      _isRunning = false;
      _isCompleted = false;
    });
    if (widget.autoStart) start();
  }

  @override
  void dispose() {
    _ticker?.cancel();
    _controller.dispose();
    super.dispose();
  }

  String _formatTime(int seconds) {
    if (widget.durationSeconds >= 60) {
      final m = (seconds ~/ 60).toString().padLeft(2, '0');
      final s = (seconds % 60).toString().padLeft(2, '0');
      return '$m:$s';
    }
    return seconds.toString();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        // ── Arc progress ──────────────────────────────────────────
        AnimatedBuilder(
          animation: _controller,
          builder: (_, __) {
            return CustomPaint(
              size: Size(widget.size, widget.size),
              painter: _ArcPainter(
                progress: 1 - _controller.value,
                progressColor: _isCompleted
                    ? Colors.green
                    : widget.progressColor,
                trackColor: widget.trackColor,
                strokeWidth: widget.strokeWidth,
              ),
              child: SizedBox(
                width: widget.size,
                height: widget.size,
                child: Center(
                  child: _isCompleted
                      ? const Icon(Icons.check_rounded,
                          color: Colors.green, size: 48)
                      : Text(
                          _formatTime(_remaining),
                          style: widget.timeStyle ??
                              TextStyle(
                                fontSize: widget.size * 0.22,
                                fontWeight: FontWeight.bold,
                                color: cs.onSurface,
                                fontFeatures: const [
                                  FontFeature.tabularFigures()
                                ],
                              ),
                        ),
                ),
              ),
            );
          },
        ),

        const SizedBox(height: 20),

        // ── Controls ──────────────────────────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            IconButton.filled(
              icon: Icon(_isRunning
                  ? Icons.pause_rounded
                  : Icons.play_arrow_rounded),
              onPressed: _isCompleted
                  ? null
                  : (_isRunning ? pause : start),
              style: IconButton.styleFrom(
                backgroundColor: cs.primary,
                foregroundColor: Colors.white,
                iconSize: 26,
                minimumSize: const Size(52, 52),
              ),
            ),
            const SizedBox(width: 16),
            IconButton.outlined(
              icon: const Icon(Icons.replay_rounded),
              onPressed: reset,
              style: IconButton.styleFrom(
                iconSize: 22,
                minimumSize: const Size(48, 48),
              ),
            ),
          ],
        ),
      ],
    );
  }
}

// ── Arc painter ──────────────────────────────────────────────────────────────

class _ArcPainter extends CustomPainter {
  final double progress; // 1.0 = full, 0.0 = empty
  final Color progressColor;
  final Color trackColor;
  final double strokeWidth;

  const _ArcPainter({
    required this.progress,
    required this.progressColor,
    required this.trackColor,
    required this.strokeWidth,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final radius = (size.width / 2) - (strokeWidth / 2);
    const startAngle = -pi / 2; // Top of circle

    final trackPaint = Paint()
      ..color = trackColor
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    final progressPaint = Paint()
      ..shader = SweepGradient(
        startAngle: startAngle,
        endAngle: startAngle + 2 * pi * progress,
        colors: [progressColor.withOpacity(0.7), progressColor],
        tileMode: TileMode.clamp,
        transform: const GradientRotation(-pi / 2),
      ).createShader(Rect.fromCircle(center: center, radius: radius))
      ..strokeWidth = strokeWidth
      ..style = PaintingStyle.stroke
      ..strokeCap = StrokeCap.round;

    // Track
    canvas.drawCircle(center, radius, trackPaint);

    // Progress arc
    if (progress > 0) {
      canvas.drawArc(
        Rect.fromCircle(center: center, radius: radius),
        startAngle,
        2 * pi * progress,
        false,
        progressPaint,
      );
    }
  }

  @override
  bool shouldRepaint(_ArcPainter old) =>
      old.progress != progress || old.progressColor != progressColor;
}
```

## Usage

### 60-second countdown

```dart
CircularCountdownTimer(
  durationSeconds: 60,
  size: 180,
  strokeWidth: 10,
  progressColor: const Color(0xFF6366F1),
  onComplete: () => showDialog(
    context: context,
    builder: (_) => const AlertDialog(title: Text('Time\'s up!')),
  ),
)
```

### Quiz timer (30s, looping)

```dart
CircularCountdownTimer(
  durationSeconds: 30,
  size: 120,
  strokeWidth: 8,
  progressColor: Colors.orange,
  loop: true,
  onTick: (remaining) {
    if (remaining == 10) {
      // Flash warning
    }
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `durationSeconds` | `int` | required | Total countdown in seconds |
| `size` | `double` | `180` | Diameter of the timer widget |
| `strokeWidth` | `double` | `10` | Arc stroke thickness |
| `progressColor` | `Color` | indigo | Arc fill color |
| `trackColor` | `Color` | light grey | Background track color |
| `autoStart` | `bool` | `true` | Start countdown immediately |
| `loop` | `bool` | `false` | Restart automatically on complete |
| `onComplete` | `VoidCallback?` | `null` | Called when timer reaches zero |
| `onTick` | `ValueChanged<int>?` | `null` | Called every second with remaining time |

## Customization Tips

- Use `SweepGradient` colors that transition through your brand palette for a premium arc
- Expose a `GlobalKey<_CircularCountdownTimerState>` to control the timer from a parent (start/pause/reset)
- In quiz apps, change `progressColor` dynamically to red when `remaining < 10`
