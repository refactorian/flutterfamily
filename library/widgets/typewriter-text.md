---
id: typewriter-text
title: Typewriter Text Animation
sidebar_label: Typewriter Text
---

# Typewriter Text Animation

A widget that animates text appearing character by character — like a typewriter. Supports looping through multiple phrases, configurable typing and deletion speed, and a blinking cursor.

## Features
- ⌨️ Character-by-character typing animation
- 🗑️ Backspace/delete animation between phrases
- 🔁 Loops through a list of phrases infinitely
- 💡 Blinking cursor widget
- ⏱ Configurable type speed, delete speed, and pause duration
- 🎨 Any `TextStyle` supported

## Widget Code

```dart
import 'dart:async';
import 'package:flutter/material.dart';

class TypewriterText extends StatefulWidget {
  final List<String> phrases;
  final TextStyle? style;
  final Duration typeSpeed;
  final Duration deleteSpeed;
  final Duration pauseDuration;
  final bool showCursor;
  final String cursor;
  final bool loop;

  const TypewriterText({
    super.key,
    required this.phrases,
    this.style,
    this.typeSpeed = const Duration(milliseconds: 60),
    this.deleteSpeed = const Duration(milliseconds: 35),
    this.pauseDuration = const Duration(milliseconds: 1800),
    this.showCursor = true,
    this.cursor = '|',
    this.loop = true,
  });

  @override
  State<TypewriterText> createState() => _TypewriterTextState();
}

class _TypewriterTextState extends State<TypewriterText>
    with SingleTickerProviderStateMixin {
  String _displayedText = '';
  int _phraseIndex = 0;
  bool _isDeleting = false;
  bool _isPaused = false;
  Timer? _timer;

  late AnimationController _cursorController;
  late Animation<double> _cursorOpacity;

  @override
  void initState() {
    super.initState();
    _cursorController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 500),
    )..repeat(reverse: true);
    _cursorOpacity = CurvedAnimation(
      parent: _cursorController,
      curve: Curves.easeInOut,
    );
    _startTyping();
  }

  @override
  void dispose() {
    _timer?.cancel();
    _cursorController.dispose();
    super.dispose();
  }

  void _startTyping() {
    _schedule();
  }

  void _schedule() {
    if (!mounted) return;

    if (_isPaused) return;

    final currentPhrase = widget.phrases[_phraseIndex];

    if (!_isDeleting) {
      // Typing forward
      if (_displayedText.length < currentPhrase.length) {
        _timer = Timer(widget.typeSpeed, () {
          if (!mounted) return;
          setState(() {
            _displayedText = currentPhrase.substring(
              0,
              _displayedText.length + 1,
            );
          });
          _schedule();
        });
      } else {
        // Done typing — pause then start deleting
        _isPaused = true;
        _timer = Timer(widget.pauseDuration, () {
          if (!mounted) return;
          setState(() {
            _isDeleting = true;
            _isPaused = false;
          });
          _schedule();
        });
      }
    } else {
      // Deleting
      if (_displayedText.isNotEmpty) {
        _timer = Timer(widget.deleteSpeed, () {
          if (!mounted) return;
          setState(() {
            _displayedText = _displayedText.substring(
              0,
              _displayedText.length - 1,
            );
          });
          _schedule();
        });
      } else {
        // Done deleting — move to next phrase
        setState(() {
          _isDeleting = false;
          if (widget.loop) {
            _phraseIndex = (_phraseIndex + 1) % widget.phrases.length;
          } else if (_phraseIndex < widget.phrases.length - 1) {
            _phraseIndex++;
          }
        });
        _schedule();
      }
    }
  }

  @override
  Widget build(BuildContext context) {
    final defaultStyle = Theme.of(context).textTheme.headlineSmall?.copyWith(
          fontWeight: FontWeight.bold,
        );
    final effectiveStyle = widget.style ?? defaultStyle;

    return Row(
      mainAxisSize: MainAxisSize.min,
      crossAxisAlignment: CrossAxisAlignment.baseline,
      textBaseline: TextBaseline.alphabetic,
      children: [
        Text(_displayedText, style: effectiveStyle),
        if (widget.showCursor)
          FadeTransition(
            opacity: _cursorOpacity,
            child: Text(
              widget.cursor,
              style: effectiveStyle?.copyWith(
                color: Theme.of(context).colorScheme.primary,
              ),
            ),
          ),
      ],
    );
  }
}
```

## Usage

### Hero headline cycler

```dart
TypewriterText(
  phrases: const [
    'Build Beautiful Apps.',
    'Ship Faster.',
    'Write Clean Code.',
    'Love Flutter. ❤️',
  ],
  style: const TextStyle(
    fontSize: 32,
    fontWeight: FontWeight.bold,
  ),
  typeSpeed: const Duration(milliseconds: 70),
  deleteSpeed: const Duration(milliseconds: 40),
  pauseDuration: const Duration(seconds: 2),
)
```

### Single phrase (no loop)

```dart
TypewriterText(
  phrases: const ['Welcome to Flutter Family 🚀'],
  loop: false,
  showCursor: false,
  style: TextStyle(
    fontSize: 18,
    color: Theme.of(context).colorScheme.primary,
  ),
)
```

### Subtitle role cycler

```dart
Row(
  mainAxisAlignment: MainAxisAlignment.center,
  children: const [
    Text('I am a ', style: TextStyle(fontSize: 20)),
    TypewriterText(
      phrases: ['Flutter Developer', 'UI Designer', 'Dart enthusiast'],
      style: TextStyle(
        fontSize: 20,
        fontWeight: FontWeight.bold,
        color: Color(0xFF6366F1),
      ),
      cursor: '_',
    ),
  ],
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `phrases` | `List<String>` | required | List of phrases to type out |
| `style` | `TextStyle?` | headline bold | Text style |
| `typeSpeed` | `Duration` | `60ms` | Delay between each character typed |
| `deleteSpeed` | `Duration` | `35ms` | Delay between each character deleted |
| `pauseDuration` | `Duration` | `1800ms` | Pause after fully typing a phrase |
| `showCursor` | `bool` | `true` | Show blinking cursor |
| `cursor` | `String` | `'|'` | Cursor character |
| `loop` | `bool` | `true` | Loop through phrases infinitely |

## Customization Tips

- Use `cursor: '▋'` or `cursor: '_'` for alternative cursor styles
- Wrap in an `AnimatedSize` if the widget's container needs to expand/collapse as text length changes
- For a one-shot animation with `onComplete` callback, add a `ValueNotifier<bool>` that flips when `_phraseIndex == phrases.length - 1 && !loop`
