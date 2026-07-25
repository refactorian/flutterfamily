---
id: timeline-tree-view
title: Timeline Tree Node View
sidebar_label: Timeline Tree View
---

# Timeline Tree Node View

A customizable vertical timeline tree widget with active/completed node states, animated connector lines, custom node icons, and date labels. Ideal for order tracking history, project roadmaps, and career experience trees.

## Features
- 🌲 Vertical timeline layout with node icons and line connectors
- ✅ 3 Node states: Completed, Active (glowing), and Upcoming
- 🎨 Configurable step colors, node size, and line thickness
- 📅 Supports optional date/time labels and detailed subtitle descriptions

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Timeline Data Model ──────────────────────────────────────────────────────

class TimelineItem {
  final String title;
  final String description;
  final String? time;
  final IconData icon;
  final bool isCompleted;
  final bool isActive;

  const TimelineItem({
    required this.title,
    required this.description,
    this.time,
    required this.icon,
    this.isCompleted = false,
    this.isActive = false,
  });
}

// ── Timeline Tree Widget ─────────────────────────────────────────────────────

class TimelineTreeView extends StatelessWidget {
  final List<TimelineItem> items;
  final Color activeColor;
  final Color completedColor;
  final Color inactiveColor;

  const TimelineTreeView({
    super.key,
    required this.items,
    this.activeColor = const Color(0xFF6366F1),
    this.completedColor = const Color(0xFF10B981),
    this.inactiveColor = const Color(0xFFCBD5E1),
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      children: List.generate(items.length, (index) {
        final item = items[index];
        final isLast = index == items.length - 1;

        Color nodeColor;
        if (item.isActive) {
          nodeColor = activeColor;
        } else if (item.isCompleted) {
          nodeColor = completedColor;
        } else {
          nodeColor = inactiveColor;
        }

        return IntrinsicHeight(
          child: Row(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              // ── Node Icon & Line Column ──────────────────────
              SizedBox(
                width: 40,
                child: Column(
                  children: [
                    Container(
                      width: 32,
                      height: 32,
                      decoration: BoxDecoration(
                        color: nodeColor,
                        shape: BoxShape.circle,
                        boxShadow: item.isActive
                            ? [
                                BoxShadow(
                                  color: activeColor.withOpacity(0.4),
                                  blurRadius: 10,
                                  spreadRadius: 2,
                                ),
                              ]
                            : null,
                      ),
                      child: Icon(
                        item.isCompleted ? Icons.check_rounded : item.icon,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                    if (!isLast)
                      Expanded(
                        child: Container(
                          width: 2,
                          color: item.isCompleted
                              ? completedColor
                              : inactiveColor,
                        ),
                      ),
                  ],
                ),
              ),
              const SizedBox(width: 14),

              // ── Node Content ──────────────────────────────────
              Expanded(
                child: Padding(
                  padding: const EdgeInsets.only(bottom: 24),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(
                            item.title,
                            style: TextStyle(
                              fontSize: 15,
                              fontWeight: item.isActive
                                  ? FontWeight.bold
                                  : FontWeight.w600,
                              color: item.isActive
                                  ? activeColor
                                  : Theme.of(context).colorScheme.onSurface,
                            ),
                          ),
                          if (item.time != null)
                            Text(
                              item.time!,
                              style: TextStyle(
                                fontSize: 12,
                                color: Colors.grey.shade500,
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 4),
                      Text(
                        item.description,
                        style: TextStyle(
                          fontSize: 13,
                          color: Theme.of(context).colorScheme.onSurfaceVariant,
                          height: 1.4,
                        ),
                      ),
                    ],
                  ),
                ),
              ),
            ],
          ),
        );
      }),
    );
  }
}
```

## Usage

```dart
const timelineData = [
  TimelineItem(
    title: 'Order Placed',
    description: 'We received your order #84920',
    time: '10:30 AM',
    icon: Icons.receipt_long_rounded,
    isCompleted: true,
  ),
  TimelineItem(
    title: 'Out for Delivery',
    description: 'Driver Alex is on the way with your package',
    time: '02:15 PM',
    icon: Icons.two_wheeler_rounded,
    isActive: true,
  ),
  TimelineItem(
    title: 'Delivered',
    description: 'Package handed directly to recipient',
    icon: Icons.check_circle_outline_rounded,
  ),
];

TimelineTreeView(items: timelineData)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | `List<TimelineItem>` | required | List of timeline node definitions |
| `activeColor` | `Color` | indigo | Color of active node ring & text |
| `completedColor` | `Color` | green | Color of completed check nodes |
| `inactiveColor` | `Color` | slate grey | Color of future node steps |
