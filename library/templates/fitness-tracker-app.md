---
id: fitness-tracker-app
title: Fitness & Health Tracker Starter Kit
sidebar_label: Fitness & Health App
---

# Fitness & Health Tracker Starter Kit

A sleek fitness and activity tracking mobile template. Built with custom progress rings, workout loggers, streak trackers, and dark mode UI tailored for health & wellness applications.

## Features
- ⭕ Multi-ring activity progress tracker (Calories, Steps, Active Minutes)
- 🏋️ Workout logger with set/rep counters and timer
- 📊 Weekly activity bar chart visualization
- 🔥 Daily workout streak tracker
- 🌙 Optimized dark mode dashboard layout

## Template Code

```dart
import 'package:flutter/material.dart';
import 'dart:math';

// ── Activity Progress Ring Painter ──────────────────────────────────────────

class ActivityRingsPainter extends CustomPainter {
  final double caloriesProgress;
  final double stepsProgress;
  final double minutesProgress;

  ActivityRingsPainter({
    required this.caloriesProgress,
    required this.stepsProgress,
    required this.minutesProgress,
  });

  @override
  void paint(Canvas canvas, Size size) {
    final center = Offset(size.width / 2, size.height / 2);
    final strokeWidth = 14.0;

    _drawRing(canvas, center, size.width / 2 - 10, const Color(0xFFFF0055), caloriesProgress, strokeWidth);
    _drawRing(canvas, center, size.width / 2 - 28, const Color(0xFF00E676), stepsProgress, strokeWidth);
    _drawRing(canvas, center, size.width / 2 - 46, const Color(0xFF00B0FF), minutesProgress, strokeWidth);
  }

  void _drawRing(Canvas canvas, Offset center, double radius, Color color, double progress, double strokeWidth) {
    final bgPaint = Paint()
      ..color = color.withOpacity(0.2)
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth;

    final progressPaint = Paint()
      ..color = color
      ..style = PaintingStyle.stroke
      ..strokeWidth = strokeWidth
      ..strokeCap = StrokeCap.round;

    canvas.drawCircle(center, radius, bgPaint);
    final sweepAngle = 2 * pi * progress.clamp(0.0, 1.0);
    canvas.drawArc(
      Rect.fromCircle(center: center, radius: radius),
      -pi / 2,
      sweepAngle,
      false,
      progressPaint,
    );
  }

  @override
  bool shouldRepaint(covariant ActivityRingsPainter old) => true;
}

// ── Fitness Dashboard Screen ────────────────────────────────────────────────

class FitnessDashboardScreen extends StatelessWidget {
  const FitnessDashboardScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0A0E1A),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('Activity Today', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today_rounded, color: Colors.white),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Activity Rings Card ────────────────────────────────
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              color: const Color(0xFF161B2E),
              borderRadius: BorderRadius.circular(24),
            ),
            child: Row(
              children: [
                SizedBox(
                  width: 130,
                  height: 130,
                  child: CustomPaint(
                    painter: ActivityRingsPainter(
                      caloriesProgress: 0.75,
                      stepsProgress: 0.60,
                      minutesProgress: 0.85,
                    ),
                  ),
                ),
                const SizedBox(width: 24),
                const Expanded(
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      _StatRow(label: 'Move', value: '450 / 600 kcal', color: Color(0xFFFF0055)),
                      SizedBox(height: 12),
                      _StatRow(label: 'Steps', value: '6,240 / 10,000', color: Color(0xFF00E676)),
                      SizedBox(height: 12),
                      _StatRow(label: 'Exercise', value: '42 / 50 mins', color: Color(0xFF00B0FF)),
                    ],
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Recent Workouts Section ─────────────────────────────
          const Text(
            'Recent Workouts',
            style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold),
          ),
          const SizedBox(height: 12),
          const _WorkoutTile(
            title: 'Morning Outdoor Run',
            duration: '32 mins',
            calories: '340 kcal',
            icon: Icons.directions_run_rounded,
            color: Color(0xFFFF0055),
          ),
          const SizedBox(height: 10),
          const _WorkoutTile(
            title: 'HIIT & Core Training',
            duration: '45 mins',
            calories: '410 kcal',
            icon: Icons.fitness_center_rounded,
            color: Color(0xFF00B0FF),
          ),
        ],
      ),
    );
  }
}

class _StatRow extends StatelessWidget {
  final String label;
  final String value;
  final Color color;

  const _StatRow({required this.label, required this.value, required this.color});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        Row(
          children: [
            Container(width: 8, height: 8, decoration: BoxDecoration(color: color, shape: BoxShape.circle)),
            const SizedBox(width: 6),
            Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
          ],
        ),
        const SizedBox(height: 2),
        Text(value, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold, fontSize: 13)),
      ],
    );
  }
}

class _WorkoutTile extends StatelessWidget {
  final String title;
  final String duration;
  final String calories;
  final IconData icon;
  final Color color;

  const _WorkoutTile({
    required this.title,
    required this.duration,
    required this.calories,
    required this.icon,
    required this.color,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF161B2E),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Row(
        children: [
          Container(
            padding: const EdgeInsets.all(12),
            decoration: BoxDecoration(
              color: color.withOpacity(0.15),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(icon, color: color, size: 24),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(title, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.w600)),
                const SizedBox(height: 4),
                Text('$duration • $calories', style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          const Icon(Icons.chevron_right_rounded, color: Colors.white38),
        ],
      ),
    );
  }
}
```

## Recommended Packages
- `pedometer` for step count sensors
- `health` for Apple HealthKit & Google Health Connect sync
- `fl_chart` for historical weekly bar & line graphs
