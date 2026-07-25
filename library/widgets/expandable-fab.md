---
id: expandable-fab
title: Expandable FAB (Speed Dial)
sidebar_label: Expandable FAB
---

# Expandable FAB — Speed Dial

A fully animated, production-ready Floating Action Button that expands into multiple child action buttons with staggered entrance, rotation, and backdrop blur overlay. A drop-in replacement for a standard `FloatingActionButton`.

## Features
- 🌀 Rotate animation on the main FAB icon (+ → ×)
- ⬆️ Staggered scale + fade entrance for child buttons
- 🌫️ Optional `BackdropFilter` blur overlay when expanded
- 🏷️ Labels alongside each child button
- 🎨 Configurable colors per child action
- ♿ Dismisses on barrier tap or back button

## Widget Code

```dart
import 'dart:ui';
import 'package:flutter/material.dart';

// ── Data model ─────────────────────────────────────────────────────────────

class FabAction {
  final IconData icon;
  final String label;
  final Color? backgroundColor;
  final Color? foregroundColor;
  final VoidCallback onPressed;

  const FabAction({
    required this.icon,
    required this.label,
    required this.onPressed,
    this.backgroundColor,
    this.foregroundColor,
  });
}

// ── Widget ──────────────────────────────────────────────────────────────────

class ExpandableFab extends StatefulWidget {
  final List<FabAction> actions;
  final double childSpacing;
  final bool useBlurOverlay;
  final Color? fabColor;

  const ExpandableFab({
    super.key,
    required this.actions,
    this.childSpacing = 64,
    this.useBlurOverlay = true,
    this.fabColor,
  });

  @override
  State<ExpandableFab> createState() => _ExpandableFabState();
}

class _ExpandableFabState extends State<ExpandableFab>
    with SingleTickerProviderStateMixin {
  bool _isOpen = false;
  late AnimationController _controller;
  late Animation<double> _rotateAnim;
  late Animation<double> _scaleAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 300),
    );
    _rotateAnim = Tween<double>(begin: 0, end: 0.375).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeInOut),
    );
    _scaleAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOut);
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _toggle() {
    setState(() => _isOpen = !_isOpen);
    if (_isOpen) {
      _controller.forward();
    } else {
      _controller.reverse();
    }
  }

  void _close() {
    if (_isOpen) _toggle();
  }

  Animation<double> _childAnimation(int index) {
    final count = widget.actions.length;
    final start = (index / count) * 0.6;
    final end = start + 0.5;
    return Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _controller,
        curve: Interval(start.clamp(0, 1), end.clamp(0, 1),
            curve: Curves.easeOut),
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Stack(
      alignment: Alignment.bottomRight,
      clipBehavior: Clip.none,
      children: [
        // ── Blur overlay ────────────────────────────────────────
        if (widget.useBlurOverlay)
          AnimatedBuilder(
            animation: _scaleAnim,
            builder: (_, __) {
              if (_scaleAnim.value == 0) return const SizedBox.shrink();
              return Positioned.fill(
                child: GestureDetector(
                  onTap: _close,
                  child: BackdropFilter(
                    filter: ImageFilter.blur(
                      sigmaX: 3 * _scaleAnim.value,
                      sigmaY: 3 * _scaleAnim.value,
                    ),
                    child: Container(
                      color: Colors.black.withOpacity(0.3 * _scaleAnim.value),
                    ),
                  ),
                ),
              );
            },
          ),

        // ── Child action buttons ─────────────────────────────────
        ...widget.actions.asMap().entries.map((entry) {
          final index = entry.key;
          final action = entry.value;
          final offset = (widget.actions.length - index) * widget.childSpacing;
          final childAnim = _childAnimation(index);

          return Positioned(
            bottom: offset,
            right: 0,
            child: AnimatedBuilder(
              animation: childAnim,
              builder: (_, __) {
                return Transform.scale(
                  scale: childAnim.value,
                  alignment: Alignment.bottomRight,
                  child: Opacity(
                    opacity: childAnim.value.clamp(0.0, 1.0),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        // Label chip
                        if (childAnim.value > 0.5)
                          Container(
                            margin: const EdgeInsets.only(right: 12),
                            padding: const EdgeInsets.symmetric(
                              horizontal: 12,
                              vertical: 6,
                            ),
                            decoration: BoxDecoration(
                              color: cs.surfaceContainerHighest,
                              borderRadius: BorderRadius.circular(8),
                              boxShadow: [
                                BoxShadow(
                                  color: Colors.black.withOpacity(0.15),
                                  blurRadius: 8,
                                ),
                              ],
                            ),
                            child: Text(
                              action.label,
                              style: const TextStyle(
                                fontSize: 13,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ),
                        // Action button
                        FloatingActionButton.small(
                          heroTag: 'fab_action_$index',
                          backgroundColor:
                              action.backgroundColor ?? cs.secondaryContainer,
                          foregroundColor:
                              action.foregroundColor ?? cs.onSecondaryContainer,
                          elevation: 4,
                          onPressed: () {
                            _close();
                            action.onPressed();
                          },
                          child: Icon(action.icon),
                        ),
                      ],
                    ),
                  ),
                );
              },
            ),
          );
        }),

        // ── Main FAB ──────────────────────────────────────────────
        FloatingActionButton(
          heroTag: 'fab_main',
          backgroundColor: widget.fabColor ?? cs.primary,
          foregroundColor: Colors.white,
          onPressed: _toggle,
          child: RotationTransition(
            turns: _rotateAnim,
            child: const Icon(Icons.add_rounded),
          ),
        ),
      ],
    );
  }
}
```

## Usage

```dart
Scaffold(
  floatingActionButton: ExpandableFab(
    useBlurOverlay: true,
    actions: [
      FabAction(
        icon: Icons.camera_alt_outlined,
        label: 'Take Photo',
        backgroundColor: const Color(0xFF6366F1),
        foregroundColor: Colors.white,
        onPressed: () => debugPrint('Camera tapped'),
      ),
      FabAction(
        icon: Icons.photo_library_outlined,
        label: 'Upload Image',
        backgroundColor: const Color(0xFF0EA5E9),
        foregroundColor: Colors.white,
        onPressed: () => debugPrint('Gallery tapped'),
      ),
      FabAction(
        icon: Icons.link_rounded,
        label: 'Add Link',
        backgroundColor: const Color(0xFF10B981),
        foregroundColor: Colors.white,
        onPressed: () => debugPrint('Link tapped'),
      ),
    ],
  ),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `actions` | `List<FabAction>` | required | List of child action buttons |
| `childSpacing` | `double` | `64` | Vertical gap between child buttons |
| `useBlurOverlay` | `bool` | `true` | Show blur + dark backdrop when open |
| `fabColor` | `Color?` | `primary` | Color of the main FAB |

## Customization Tips

- Set `useBlurOverlay: false` for a minimal speed-dial without the backdrop
- Add a `WillPopScope` (or `PopScope` in Flutter 3.16+) at the screen level to call `_close()` on back press
- Animate the FAB icon between two different icons (e.g., `Icons.edit` → `Icons.close`) instead of rotation
