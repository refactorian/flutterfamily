---
id: otp-input-field
title: OTP & PIN Code Input Field
sidebar_label: OTP Input Field
---

# OTP & PIN Code Input Field

An interactive, animated N-digit PIN/OTP code entry widget with individual focus boxes, auto-advance, backspace auto-revert, obscure mode option, error shake animation, and auto-submit callback.

## Features
- 🔢 Configurable pin length (default 4 or 6 digits)
- 🎞️ Active box highlight glow and error shake feedback
- 🔒 Obscure pin mode (dot / asterisk mask)
- ⌨️ Automatic focus advance and backspace handling
- 📣 `onCompleted` callback triggered automatically on last digit

## Widget Code

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class OtpInputField extends StatefulWidget {
  final int length;
  final ValueChanged<String>? onChanged;
  final ValueChanged<String>? onCompleted;
  final bool obscureText;
  final bool hasError;

  const OtpInputField({
    super.key,
    this.length = 6,
    this.onChanged,
    this.onCompleted,
    this.obscureText = false,
    this.hasError = false,
  });

  @override
  State<OtpInputField> createState() => _OtpInputFieldState();
}

class _OtpInputFieldState extends State<OtpInputField>
    with SingleTickerProviderStateMixin {
  late List<TextEditingController> _controllers;
  late List<FocusNode> _focusNodes;
  late AnimationController _shakeController;
  late Animation<double> _shakeAnimation;

  @override
  void initState() {
    super.initState();
    _controllers = List.generate(widget.length, (_) => TextEditingController());
    _focusNodes = List.generate(widget.length, (_) => FocusNode());

    _shakeController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 400),
    );
    _shakeAnimation = TweenSequence<double>([
      TweenSequenceItem(tween: Tween(begin: 0, end: 10), weight: 1),
      TweenSequenceItem(tween: Tween(begin: 10, end: -10), weight: 2),
      TweenSequenceItem(tween: Tween(begin: -10, end: 6), weight: 2),
      TweenSequenceItem(tween: Tween(begin: 6, end: 0), weight: 1),
    ]).animate(CurvedAnimation(parent: _shakeController, curve: Curves.easeInOut));
  }

  @override
  void didUpdateWidget(OtpInputField oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (widget.hasError && !oldWidget.hasError) {
      _shakeController.forward(from: 0);
    }
  }

  @override
  void dispose() {
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    _shakeController.dispose();
    super.dispose();
  }

  String get _currentPin => _controllers.map((c) => c.text).join();

  void _onTextChanged(int index, String value) {
    if (value.length > 1) {
      // Handle paste scenario
      final chars = value.split('');
      for (int i = 0; i < widget.length && i < chars.length; i++) {
        _controllers[i].text = chars[i];
      }
      _focusNodes[widget.length - 1].requestFocus();
    } else if (value.isNotEmpty) {
      if (index < widget.length - 1) {
        _focusNodes[index + 1].requestFocus();
      } else {
        _focusNodes[index].unfocus();
      }
    }

    final pin = _currentPin;
    widget.onChanged?.call(pin);
    if (pin.length == widget.length) {
      widget.onCompleted?.call(pin);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return AnimatedBuilder(
      animation: _shakeAnimation,
      builder: (context, child) {
        return Transform.translate(
          offset: Offset(_shakeAnimation.value, 0),
          child: Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: List.generate(widget.length, (index) {
              final isFocused = _focusNodes[index].hasFocus;
              final isFilled = _controllers[index].text.isNotEmpty;

              Color borderColor = cs.outlineVariant;
              if (widget.hasError) {
                borderColor = cs.error;
              } else if (isFocused) {
                borderColor = cs.primary;
              } else if (isFilled) {
                borderColor = cs.primary.withOpacity(0.5);
              }

              return SizedBox(
                width: 48,
                height: 56,
                child: RawKeyboardListener(
                  focusNode: FocusNode(),
                  onKey: (event) {
                    if (event is RawKeyDownEvent &&
                        event.logicalKey == LogicalKeyboardKey.backspace &&
                        _controllers[index].text.isEmpty &&
                        index > 0) {
                      _focusNodes[index - 1].requestFocus();
                      _controllers[index - 1].clear();
                    }
                  },
                  child: TextField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    obscureText: widget.obscureText,
                    maxLength: 1,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: TextStyle(
                      fontSize: 20,
                      fontWeight: FontWeight.bold,
                      color: widget.hasError ? cs.error : cs.onSurface,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      contentPadding: EdgeInsets.zero,
                      filled: true,
                      fillColor: isFocused
                          ? cs.primary.withOpacity(0.08)
                          : cs.surfaceContainerHighest.withOpacity(0.3),
                      enabledBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: borderColor, width: 1.5),
                      ),
                      focusedBorder: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                        borderSide: BorderSide(color: borderColor, width: 2),
                      ),
                    ),
                    onChanged: (v) => _onTextChanged(index, v),
                  ),
                ),
              );
            }),
          ),
        );
      },
    );
  }
}
```

## Usage

```dart
bool _hasError = false;

OtpInputField(
  length: 6,
  hasError: _hasError,
  onChanged: (pin) => debugPrint('Current pin: $pin'),
  onCompleted: (pin) {
    if (pin == '123456') {
      debugPrint('OTP Verified!');
    } else {
      setState(() => _hasError = true);
    }
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `length` | `int` | `6` | Total number of PIN digit boxes |
| `onChanged` | `ValueChanged<String>?` | `null` | Triggered on every keystroke |
| `onCompleted` | `ValueChanged<String>?` | `null` | Triggered when all digits are filled |
| `obscureText` | `bool` | `false` | Masks digit values for security PINs |
| `hasError` | `bool` | `false` | Triggers error shake animation and red border |
