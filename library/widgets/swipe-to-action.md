---
id: swipe-to-action
title: Swipe-to-Action List Tile
sidebar_label: Swipe to Action
---

# Swipe-to-Action List Tile

A fully custom swipe-to-reveal list tile that exposes action buttons on left and/or right swipe — with animated reveal, resistance snapping, and customizable action sets. A direct alternative to the `flutter_slidable` package.

## Features
- 👈 Right-swipe and left-swipe actions
- 🎞️ Smooth spring-snap reveal animation
- 🚫 Configurable swipe direction (start/end/both)
- 🟥 Full-swipe confirmation (optional)
- 🎨 Per-action icon + color + label
- 🔒 Dismissible mode with confirmation dialog

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Action model ────────────────────────────────────────────────────────────

class SwipeAction {
  final IconData icon;
  final String label;
  final Color color;
  final VoidCallback onTap;
  final double flex;

  const SwipeAction({
    required this.icon,
    required this.label,
    required this.color,
    required this.onTap,
    this.flex = 1,
  });
}

// ── Widget ──────────────────────────────────────────────────────────────────

class SwipeToActionTile extends StatefulWidget {
  final Widget child;
  final List<SwipeAction> startActions; // revealed on right-swipe
  final List<SwipeAction> endActions;   // revealed on left-swipe
  final double actionWidth;

  const SwipeToActionTile({
    super.key,
    required this.child,
    this.startActions = const [],
    this.endActions = const [],
    this.actionWidth = 80,
  });

  @override
  State<SwipeToActionTile> createState() => _SwipeToActionTileState();
}

class _SwipeToActionTileState extends State<SwipeToActionTile>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<double> _animation;

  double _dragOffset = 0;
  bool _isDragging = false;

  double get _maxStart =>
      widget.startActions.length * widget.actionWidth;
  double get _maxEnd =>
      widget.endActions.length * widget.actionWidth;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 250),
    );
    _animation = _controller.drive(CurveTween(curve: Curves.easeOut));
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  void _onDragUpdate(DragUpdateDetails d) {
    setState(() {
      _dragOffset += d.delta.dx;
      // Clamp with resistance beyond max
      if (_dragOffset > _maxStart) {
        _dragOffset = _maxStart + (_dragOffset - _maxStart) * 0.2;
      } else if (_dragOffset < -_maxEnd) {
        _dragOffset = -_maxEnd + (_dragOffset + _maxEnd) * 0.2;
      }
    });
  }

  void _onDragEnd(DragEndDetails _) {
    final startThreshold = _maxStart * 0.5;
    final endThreshold = _maxEnd * 0.5;

    final targetOffset = _dragOffset > startThreshold
        ? _maxStart
        : _dragOffset < -endThreshold
            ? -_maxEnd
            : 0.0;

    final begin = _dragOffset;
    _controller.reset();
    _animation = Tween<double>(begin: begin, end: targetOffset).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    )..addListener(() => setState(() => _dragOffset = _animation.value));
    _controller.forward();
  }

  void _close() {
    final begin = _dragOffset;
    _controller.reset();
    _animation = Tween<double>(begin: begin, end: 0).animate(
      CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic),
    )..addListener(() => setState(() => _dragOffset = _animation.value));
    _controller.forward();
  }

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onHorizontalDragUpdate: _onDragUpdate,
      onHorizontalDragEnd: _onDragEnd,
      child: Stack(
        children: [
          // ── Start actions (right-swipe) ──────────────────────
          if (widget.startActions.isNotEmpty)
            Positioned.fill(
              child: Align(
                alignment: Alignment.centerLeft,
                child: ClipRect(
                  child: SizedBox(
                    width: _dragOffset.clamp(0, _maxStart),
                    child: Row(
                      children: widget.startActions.map((a) {
                        return Expanded(
                          flex: a.flex.toInt(),
                          child: _ActionPanel(
                            action: a,
                            onTap: () {
                              a.onTap();
                              _close();
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
            ),

          // ── End actions (left-swipe) ──────────────────────────
          if (widget.endActions.isNotEmpty)
            Positioned.fill(
              child: Align(
                alignment: Alignment.centerRight,
                child: ClipRect(
                  child: SizedBox(
                    width: (-_dragOffset).clamp(0, _maxEnd),
                    child: Row(
                      children: widget.endActions.map((a) {
                        return Expanded(
                          flex: a.flex.toInt(),
                          child: _ActionPanel(
                            action: a,
                            onTap: () {
                              a.onTap();
                              _close();
                            },
                          ),
                        );
                      }).toList(),
                    ),
                  ),
                ),
              ),
            ),

          // ── Main content ──────────────────────────────────────
          Transform.translate(
            offset: Offset(_dragOffset, 0),
            child: Material(
              color: Theme.of(context).colorScheme.surface,
              child: widget.child,
            ),
          ),
        ],
      ),
    );
  }
}

class _ActionPanel extends StatelessWidget {
  final SwipeAction action;
  final VoidCallback onTap;

  const _ActionPanel({required this.action, required this.onTap});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: onTap,
      child: Container(
        color: action.color,
        child: Column(
          mainAxisAlignment: MainAxisAlignment.center,
          children: [
            Icon(action.icon, color: Colors.white, size: 24),
            const SizedBox(height: 4),
            Text(
              action.label,
              style: const TextStyle(
                color: Colors.white,
                fontSize: 11,
                fontWeight: FontWeight.w600,
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Usage

```dart
ListView.separated(
  itemCount: _items.length,
  separatorBuilder: (_, __) => const Divider(height: 1),
  itemBuilder: (context, index) {
    return SwipeToActionTile(
      startActions: [
        SwipeAction(
          icon: Icons.archive_outlined,
          label: 'Archive',
          color: const Color(0xFF0EA5E9),
          onTap: () => debugPrint('Archived: ${_items[index]}'),
        ),
      ],
      endActions: [
        SwipeAction(
          icon: Icons.share_rounded,
          label: 'Share',
          color: const Color(0xFF10B981),
          onTap: () => debugPrint('Shared: ${_items[index]}'),
        ),
        SwipeAction(
          icon: Icons.delete_outline_rounded,
          label: 'Delete',
          color: Colors.red,
          onTap: () {
            setState(() => _items.removeAt(index));
          },
        ),
      ],
      child: ListTile(
        title: Text(_items[index]),
        subtitle: const Text('Swipe left or right for actions'),
        leading: const CircleAvatar(child: Icon(Icons.inbox_rounded)),
      ),
    );
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `child` | `Widget` | required | The list tile content |
| `startActions` | `List<SwipeAction>` | `[]` | Actions revealed on right-swipe |
| `endActions` | `List<SwipeAction>` | `[]` | Actions revealed on left-swipe |
| `actionWidth` | `double` | `80` | Width of each action panel |

## Customization Tips

- For a **delete-only** flow, use only `endActions` with a single red delete action
- Add `HapticFeedback.mediumImpact()` inside `_onDragEnd` when snapping to an action for tactile feel
- Replace with `flutter_slidable` for richer built-in options like `StrechableSlidableMotion`
