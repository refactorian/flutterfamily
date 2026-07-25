---
id: draggable-bottom-sheet
title: Custom Draggable Bottom Sheet
sidebar_label: Draggable Bottom Sheet
---

# Custom Draggable Bottom Sheet

A draggable bottom sheet container using `DraggableScrollableSheet` with smooth rounded corners, drag handle bar, backdrop blur overlay option, and snap size thresholds.

## Features
- 📜 Smooth gesture dragging between min, initial, and max size fractions
- 📌 Snap size stops (`snap: true` with `snapSizes`)
- ➖ Drag handle pill indicator in header
- 🎨 Configurable background color, elevation, and border radius

## Widget Code

```dart
import 'package:flutter/material.dart';

class CustomDraggableBottomSheet extends StatelessWidget {
  final Widget child;
  final String? title;
  final double initialChildSize;
  final double minChildSize;
  final double maxChildSize;
  final List<double>? snapSizes;

  const CustomDraggableBottomSheet({
    super.key,
    required this.child,
    this.title,
    this.initialChildSize = 0.45,
    this.minChildSize = 0.2,
    this.maxChildSize = 0.9,
    this.snapSizes = const [0.2, 0.45, 0.9],
  });

  static Future<T?> show<T>({
    required BuildContext context,
    required Widget child,
    String? title,
  }) {
    return showModalBottomSheet<T>(
      context: context,
      isScrollControlled: true,
      backgroundColor: Colors.transparent,
      builder: (context) => CustomDraggableBottomSheet(
        title: title,
        child: child,
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return DraggableScrollableSheet(
      initialChildSize: initialChildSize,
      minChildSize: minChildSize,
      maxChildSize: maxChildSize,
      snap: true,
      snapSizes: snapSizes,
      builder: (context, scrollController) {
        return Container(
          decoration: BoxDecoration(
            color: cs.surface,
            borderRadius: const BorderRadius.vertical(top: Radius.circular(24)),
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.15),
                blurRadius: 20,
                offset: const Offset(0, -4),
              ),
            ],
          ),
          child: Column(
            children: [
              // ── Drag Handle & Header ─────────────────────────
              const SizedBox(height: 12),
              Container(
                width: 38,
                height: 4.5,
                decoration: BoxDecoration(
                  color: cs.onSurfaceVariant.withOpacity(0.3),
                  borderRadius: BorderRadius.circular(3),
                ),
              ),
              if (title != null) ...[
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        title!,
                        style: const TextStyle(
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      IconButton(
                        icon: const Icon(Icons.close_rounded, size: 20),
                        onPressed: () => Navigator.of(context).pop(),
                      ),
                    ],
                  ),
                ),
                const Divider(height: 1),
              ],
              const SizedBox(height: 8),

              // ── Scrollable Body ──────────────────────────────
              Expanded(
                child: ListView(
                  controller: scrollController,
                  padding: const EdgeInsets.symmetric(horizontal: 20),
                  children: [child],
                ),
              ),
            ],
          ),
        );
      },
    );
  }
}
```

## Usage

```dart
// Show modal sheet
CustomDraggableBottomSheet.show(
  context: context,
  title: 'Filter Results',
  child: Column(
    children: [
      const ListTile(leading: Icon(Icons.star), title: Text('Top Rated')),
      const ListTile(leading: Icon(Icons.near_me), title: Text('Nearby')),
      const ListTile(leading: Icon(Icons.attach_money), title: Text('Price Low to High')),
      ElevatedButton(
        onPressed: () => Navigator.pop(context),
        child: const Text('Apply Filters'),
      ),
    ],
  ),
);
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | Content inside the sheet body |
| `title` | `String?` | `null` | Optional header title bar string |
| `initialChildSize` | `double` | `0.45` | Starting screen height fraction |
| `minChildSize` | `double` | `0.2` | Minimum drag size fraction |
| `maxChildSize` | `double` | `0.9` | Maximum expansion height fraction |
