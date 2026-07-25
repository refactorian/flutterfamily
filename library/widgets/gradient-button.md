---
id: gradient-button
title: Animated Gradient Button
sidebar_label: Gradient Button
---

# Animated Gradient Button

A premium gradient button with a shimmer shine sweep animation on tap, press-scale feedback, loading state spinner, and fully configurable gradient colors. A direct upgrade over `FilledButton`.

## Features
- 🌈 Configurable gradient with any number of colors
- ✨ Shimmer shine sweep animation on press
- 📦 Press-scale haptic feedback (shrinks on tap-down)
- ⏳ Loading state with centered `CircularProgressIndicator`
- 🚫 Disabled state with reduced opacity
- 📐 Configurable width, height, radius, and font size

## Widget Code

```dart
import 'package:flutter/material.dart';

class GradientButton extends StatefulWidget {
  final String label;
  final VoidCallback? onPressed;
  final List<Color> gradientColors;
  final AlignmentGeometry gradientBegin;
  final AlignmentGeometry gradientEnd;
  final double borderRadius;
  final double height;
  final double? width;
  final TextStyle? textStyle;
  final Widget? icon;
  final bool isLoading;

  const GradientButton({
    super.key,
    required this.label,
    required this.onPressed,
    this.gradientColors = const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
    this.gradientBegin = Alignment.centerLeft,
    this.gradientEnd = Alignment.centerRight,
    this.borderRadius = 14,
    this.height = 54,
    this.width,
    this.textStyle,
    this.icon,
    this.isLoading = false,
  });

  @override
  State<GradientButton> createState() => _GradientButtonState();
}

class _GradientButtonState extends State<GradientButton>
    with SingleTickerProviderStateMixin {
  bool _isPressed = false;

  late AnimationController _shineController;
  late Animation<double> _shineAnimation;

  @override
  void initState() {
    super.initState();
    _shineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 700),
    );
    _shineAnimation = Tween<double>(begin: -1.5, end: 2.5).animate(
      CurvedAnimation(parent: _shineController, curve: Curves.easeInOut),
    );
  }

  @override
  void dispose() {
    _shineController.dispose();
    super.dispose();
  }

  void _onTapDown(TapDownDetails _) {
    if (widget.onPressed == null || widget.isLoading) return;
    setState(() => _isPressed = true);
    _shineController.forward(from: 0);
  }

  void _onTapUp(TapUpDetails _) {
    setState(() => _isPressed = false);
  }

  void _onTapCancel() {
    setState(() => _isPressed = false);
  }

  bool get _isDisabled => widget.onPressed == null || widget.isLoading;

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: _isDisabled ? null : widget.onPressed,
      onTapDown: _onTapDown,
      onTapUp: _onTapUp,
      onTapCancel: _onTapCancel,
      child: AnimatedScale(
        scale: _isPressed ? 0.96 : 1.0,
        duration: const Duration(milliseconds: 100),
        curve: Curves.easeOut,
        child: AnimatedOpacity(
          opacity: _isDisabled ? 0.5 : 1.0,
          duration: const Duration(milliseconds: 200),
          child: Container(
            width: widget.width ?? double.infinity,
            height: widget.height,
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(widget.borderRadius),
              gradient: LinearGradient(
                colors: widget.gradientColors,
                begin: widget.gradientBegin,
                end: widget.gradientEnd,
              ),
              boxShadow: _isDisabled
                  ? null
                  : [
                      BoxShadow(
                        color: widget.gradientColors.first.withOpacity(0.4),
                        blurRadius: 16,
                        offset: const Offset(0, 6),
                      ),
                    ],
            ),
            clipBehavior: Clip.antiAlias,
            child: Stack(
              alignment: Alignment.center,
              children: [
                // ── Shine sweep overlay ──────────────────────────
                AnimatedBuilder(
                  animation: _shineAnimation,
                  builder: (_, __) {
                    return Positioned.fill(
                      child: ShaderMask(
                        blendMode: BlendMode.srcATop,
                        shaderCallback: (bounds) => LinearGradient(
                          begin: Alignment.centerLeft,
                          end: Alignment.centerRight,
                          colors: [
                            Colors.transparent,
                            Colors.white.withOpacity(0.25),
                            Colors.transparent,
                          ],
                          stops: [
                            (_shineAnimation.value - 0.3).clamp(0.0, 1.0),
                            _shineAnimation.value.clamp(0.0, 1.0),
                            (_shineAnimation.value + 0.3).clamp(0.0, 1.0),
                          ],
                        ).createShader(bounds),
                        child: Container(
                          color: Colors.white.withOpacity(0.01),
                        ),
                      ),
                    );
                  },
                ),

                // ── Label / Icon / Loader ────────────────────────
                widget.isLoading
                    ? const SizedBox(
                        width: 24,
                        height: 24,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          valueColor:
                              AlwaysStoppedAnimation<Color>(Colors.white),
                        ),
                      )
                    : Row(
                        mainAxisSize: MainAxisSize.min,
                        children: [
                          if (widget.icon != null) ...[
                            widget.icon!,
                            const SizedBox(width: 8),
                          ],
                          Text(
                            widget.label,
                            style: widget.textStyle ??
                                const TextStyle(
                                  color: Colors.white,
                                  fontSize: 16,
                                  fontWeight: FontWeight.w700,
                                  letterSpacing: 0.3,
                                ),
                          ),
                        ],
                      ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}
```

## Usage

### Basic gradient button

```dart
GradientButton(
  label: 'Get Started',
  onPressed: () => debugPrint('Tapped!'),
  gradientColors: const [Color(0xFF6366F1), Color(0xFF8B5CF6)],
)
```

### With icon and loading state

```dart
GradientButton(
  label: 'Upload File',
  icon: const Icon(Icons.cloud_upload_outlined, color: Colors.white, size: 20),
  isLoading: _isUploading,
  gradientColors: const [Color(0xFF0EA5E9), Color(0xFF06B6D4)],
  onPressed: _isUploading ? null : _handleUpload,
  height: 56,
  borderRadius: 16,
)
```

### Custom green CTA

```dart
GradientButton(
  label: 'Complete Purchase',
  gradientColors: const [Color(0xFF059669), Color(0xFF10B981)],
  gradientBegin: Alignment.topLeft,
  gradientEnd: Alignment.bottomRight,
  borderRadius: 12,
  height: 58,
  onPressed: _handleCheckout,
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `label` | `String` | required | Button text |
| `onPressed` | `VoidCallback?` | required | Null disables the button |
| `gradientColors` | `List<Color>` | indigo→purple | Gradient color stops |
| `gradientBegin` | `Alignment` | `centerLeft` | Gradient start alignment |
| `gradientEnd` | `Alignment` | `centerRight` | Gradient end alignment |
| `borderRadius` | `double` | `14` | Corner radius |
| `height` | `double` | `54` | Button height |
| `width` | `double?` | `null` (full) | Button width |
| `icon` | `Widget?` | `null` | Optional leading icon |
| `isLoading` | `bool` | `false` | Show spinner, disable tap |

## Customization Tips

- Use `gradientBegin: Alignment.topLeft, gradientEnd: Alignment.bottomRight` for a diagonal gradient
- For dark mode, derive gradient colors from `Theme.of(context).colorScheme` to keep them on-brand
- Add a `border: Border.all(color: Colors.white24)` to `BoxDecoration` for a glass-style button
