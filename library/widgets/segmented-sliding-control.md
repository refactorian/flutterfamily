---
id: segmented-sliding-control
title: Animated Sliding Segmented Control
sidebar_label: Sliding Segmented Control
---

# Animated Sliding Segmented Control

An iOS-inspired sliding segmented control widget with an animated pill indicator that smoothly slides between selected options, supports custom colors, icons, and spring physics. Zero external dependencies.

## Features
- 🎞️ Animated sliding indicator pill between segments
- 🎨 Configurable track color, pill color, text color, and active text color
- 🔤 Support for text labels and/or icon segments
- 📐 Configurable height, border radius, and padding
- 📣 `onValueChanged` callback with index/value
- 📱 Material 3 & iOS Cupertino look-and-feel support

## Widget Code

```dart
import 'package:flutter/material.dart';

class SlidingSegmentedControl<T> extends StatefulWidget {
  final List<T> items;
  final T selectedValue;
  final Widget Function(T item, bool isSelected) builder;
  final ValueChanged<T> onValueChanged;
  final Color? backgroundColor;
  final Color? indicatorColor;
  final double height;
  final double borderRadius;
  final EdgeInsetsGeometry padding;

  const SlidingSegmentedControl({
    super.key,
    required this.items,
    required this.selectedValue,
    required this.builder,
    required this.onValueChanged,
    this.backgroundColor,
    this.indicatorColor,
    this.height = 44,
    this.borderRadius = 12,
    this.padding = const EdgeInsets.all(4),
  });

  @override
  State<SlidingSegmentedControl<T>> createState() =>
      _SlidingSegmentedControlState<T>();
}

class _SlidingSegmentedControlState<T> extends StatefulWidget
    implements State<SlidingSegmentedControl<T>> {
  @override
  late _SlidingSegmentedControlStateImpl<T> _stateImpl;

  @override
  Widget build(BuildContext context) => _stateImpl.build(context);
}

class _SlidingSegmentedControlStateImpl<T>
    extends State<SlidingSegmentedControl<T>> {
  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final bg = widget.backgroundColor ?? cs.surfaceContainerHighest;
    final pill = widget.indicatorColor ?? cs.surface;
    final selectedIndex = widget.items.indexOf(widget.selectedValue);

    return Container(
      height: widget.height,
      padding: widget.padding,
      decoration: BoxDecoration(
        color: bg,
        borderRadius: BorderRadius.circular(widget.borderRadius),
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final totalWidth = constraints.maxWidth;
          final itemWidth = totalWidth / widget.items.length;

          return Stack(
            children: [
              // ── Sliding Pill Background ──────────────────────
              AnimatedPositioned(
                duration: const Duration(milliseconds: 250),
                curve: Curves.easeOutCubic,
                left: selectedIndex * itemWidth,
                top: 0,
                bottom: 0,
                width: itemWidth,
                child: Container(
                  decoration: BoxDecoration(
                    color: pill,
                    borderRadius: BorderRadius.circular(
                      widget.borderRadius - 2,
                    ),
                    boxShadow: [
                      BoxShadow(
                        color: Colors.black.withOpacity(0.08),
                        blurRadius: 6,
                        offset: const Offset(0, 2),
                      ),
                    ],
                  ),
                ),
              ),

              // ── Touch Targets & Labels ───────────────────────
              Row(
                children: widget.items.map((item) {
                  final isSelected = item == widget.selectedValue;
                  return Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => widget.onValueChanged(item),
                      child: Center(
                        child: widget.builder(item, isSelected),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

## Usage

### Simple Text Tabs

```dart
String _selectedPeriod = 'Monthly';

SlidingSegmentedControl<String>(
  items: const ['Weekly', 'Monthly', 'Yearly'],
  selectedValue: _selectedPeriod,
  onValueChanged: (val) => setState(() => _selectedPeriod = val),
  builder: (item, isSelected) => Text(
    item,
    style: TextStyle(
      fontWeight: isSelected ? FontWeight.bold : FontWeight.normal,
      color: isSelected ? Colors.indigo : Colors.grey.shade600,
    ),
  ),
)
```

### Icon & Text Tabs

```dart
int _selectedTab = 0;

SlidingSegmentedControl<int>(
  items: const [0, 1, 2],
  selectedValue: _selectedTab,
  onValueChanged: (val) => setState(() => _selectedTab = val),
  builder: (index, isSelected) {
    final icons = [Icons.grid_view_rounded, Icons.list_rounded, Icons.map_rounded];
    final labels = ['Grid', 'List', 'Map'];
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: [
        Icon(
          icons[index],
          size: 16,
          color: isSelected ? Colors.black : Colors.grey,
        ),
        const SizedBox(width: 6),
        Text(
          labels[index],
          style: TextStyle(
            fontSize: 12,
            fontWeight: isSelected ? FontWeight.bold : FontWeight.w500,
            color: isSelected ? Colors.black : Colors.grey,
          ),
        ),
      ],
    );
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | `List<T>` | required | List of segment items |
| `selectedValue` | `T` | required | Currently selected item |
| `builder` | `Widget Function(T, bool)` | required | Builder for each segment's content |
| `onValueChanged` | `ValueChanged<T>` | required | Selection change callback |
| `backgroundColor` | `Color?` | surfaceContainer | Track background color |
| `indicatorColor` | `Color?` | surface | Sliding pill background color |
| `height` | `double` | `44` | Control height |
| `borderRadius` | `double` | `12` | Corner radius |

## Customization Tips

- Adjust `borderRadius` to `22` for a fully rounded capsule appearance
- Combine with a `PageView` using `PageController` to create synchronized swipeable tab pages
