---
id: toast-notification
title: Custom Toast Notification
sidebar_label: Toast Notification
---

# Custom Toast Notification

A global overlay toast/snackbar system with four severity levels (success, error, warning, info), slide-in animation from the top, auto-dismiss, and a static method API — call `AppToast.show(context, ...)` from anywhere.

## Features
- ✅ Four severity types: `success`, `error`, `warning`, `info`
- ⬇️ Slide-in from top with fade animation
- ⏱ Configurable auto-dismiss duration
- 🎨 Color and icon per severity
- ❌ Dismissible with an `X` button
- 📣 `onDismiss` callback
- 🌐 Static `AppToast.show()` API — call from any widget or service

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Toast type ───────────────────────────────────────────────────────────────

enum ToastType { success, error, warning, info }

extension _ToastStyle on ToastType {
  Color get backgroundColor {
    switch (this) {
      case ToastType.success: return const Color(0xFF059669);
      case ToastType.error:   return const Color(0xFFDC2626);
      case ToastType.warning: return const Color(0xFFD97706);
      case ToastType.info:    return const Color(0xFF2563EB);
    }
  }

  IconData get icon {
    switch (this) {
      case ToastType.success: return Icons.check_circle_outline_rounded;
      case ToastType.error:   return Icons.error_outline_rounded;
      case ToastType.warning: return Icons.warning_amber_rounded;
      case ToastType.info:    return Icons.info_outline_rounded;
    }
  }

  String get defaultTitle {
    switch (this) {
      case ToastType.success: return 'Success';
      case ToastType.error:   return 'Error';
      case ToastType.warning: return 'Warning';
      case ToastType.info:    return 'Info';
    }
  }
}

// ── Static API ───────────────────────────────────────────────────────────────

class AppToast {
  static OverlayEntry? _entry;

  static void show(
    BuildContext context, {
    required String message,
    ToastType type = ToastType.info,
    String? title,
    Duration duration = const Duration(seconds: 3),
    VoidCallback? onDismiss,
  }) {
    _entry?.remove();
    _entry = null;

    final overlay = Overlay.of(context);
    late OverlayEntry entry;

    entry = OverlayEntry(
      builder: (_) => _ToastWidget(
        message: message,
        type: type,
        title: title ?? type.defaultTitle,
        onDismiss: () {
          entry.remove();
          _entry = null;
          onDismiss?.call();
        },
        duration: duration,
      ),
    );

    _entry = entry;
    overlay.insert(entry);
  }
}

// ── Toast widget ──────────────────────────────────────────────────────────────

class _ToastWidget extends StatefulWidget {
  final String title;
  final String message;
  final ToastType type;
  final VoidCallback onDismiss;
  final Duration duration;

  const _ToastWidget({
    required this.title,
    required this.message,
    required this.type,
    required this.onDismiss,
    required this.duration,
  });

  @override
  State<_ToastWidget> createState() => _ToastWidgetState();
}

class _ToastWidgetState extends State<_ToastWidget>
    with SingleTickerProviderStateMixin {
  late AnimationController _controller;
  late Animation<Offset> _slideAnim;
  late Animation<double> _fadeAnim;

  @override
  void initState() {
    super.initState();
    _controller = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 350),
    );
    _slideAnim = Tween<Offset>(
      begin: const Offset(0, -1.5),
      end: Offset.zero,
    ).animate(CurvedAnimation(parent: _controller, curve: Curves.easeOutCubic));
    _fadeAnim = CurvedAnimation(parent: _controller, curve: Curves.easeOut);

    _controller.forward();

    Future.delayed(widget.duration, () {
      if (mounted) _dismiss();
    });
  }

  void _dismiss() async {
    await _controller.reverse();
    if (mounted) widget.onDismiss();
  }

  @override
  void dispose() {
    _controller.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final color = widget.type.backgroundColor;

    return Positioned(
      top: MediaQuery.of(context).padding.top + 12,
      left: 16,
      right: 16,
      child: Material(
        color: Colors.transparent,
        child: SlideTransition(
          position: _slideAnim,
          child: FadeTransition(
            opacity: _fadeAnim,
            child: Container(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 14),
              decoration: BoxDecoration(
                color: color,
                borderRadius: BorderRadius.circular(14),
                boxShadow: [
                  BoxShadow(
                    color: color.withOpacity(0.35),
                    blurRadius: 20,
                    offset: const Offset(0, 6),
                  ),
                ],
              ),
              child: Row(
                children: [
                  Icon(widget.type.icon, color: Colors.white, size: 24),
                  const SizedBox(width: 12),
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Text(
                          widget.title,
                          style: const TextStyle(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                            fontSize: 14,
                          ),
                        ),
                        const SizedBox(height: 2),
                        Text(
                          widget.message,
                          style: TextStyle(
                            color: Colors.white.withOpacity(0.9),
                            fontSize: 13,
                          ),
                        ),
                      ],
                    ),
                  ),
                  const SizedBox(width: 8),
                  GestureDetector(
                    onTap: _dismiss,
                    child: Icon(
                      Icons.close_rounded,
                      color: Colors.white.withOpacity(0.8),
                      size: 18,
                    ),
                  ),
                ],
              ),
            ),
          ),
        ),
      ),
    );
  }
}
```

## Usage

```dart
// Show a success toast
AppToast.show(
  context,
  message: 'Your changes have been saved.',
  type: ToastType.success,
);

// Show an error toast
AppToast.show(
  context,
  message: 'Failed to connect. Please try again.',
  type: ToastType.error,
  title: 'Connection Error',
  duration: const Duration(seconds: 5),
);

// Show with callback
AppToast.show(
  context,
  message: 'Item removed from cart.',
  type: ToastType.warning,
  onDismiss: () => debugPrint('Toast dismissed'),
);
```

## Severity Types

| Type | Color | Use Case |
|---|---|---|
| `ToastType.success` | Green | Form saved, action completed |
| `ToastType.error` | Red | Network error, validation failed |
| `ToastType.warning` | Amber | Unsaved changes, low storage |
| `ToastType.info` | Blue | Tips, announcements, feature updates |

## Customization Tips

- Position at bottom by replacing `top:` with `bottom: MediaQuery.of(context).padding.bottom + 12`
- Add a `LinearProgressIndicator` strip below the toast that depletes over `duration` for a visual countdown
- Use a `Queue` to stack multiple toasts sequentially instead of replacing them
