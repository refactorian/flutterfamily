---
id: stepper-progress
title: Multi-Step Progress Indicator
sidebar_label: Step Progress Bar
---

# Multi-Step Progress Indicator

A horizontal multi-step progress tracker with animated connecting lines, step state icons, and labels. Used in checkout flows, onboarding wizards, and form wizards to show the user's position in a multi-stage process.

## Features
- 📍 Active, completed, and upcoming step states
- ✅ Completed steps show a checkmark icon
- 🎞️ Animated fill line between steps
- 🏷️ Labels under each step circle
- 🎨 Configurable colors for each state
- 🔢 Supports 2–6+ steps

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Data model ─────────────────────────────────────────────────────────────

class StepItem {
  final String label;
  final IconData? completedIcon;

  const StepItem({
    required this.label,
    this.completedIcon,
  });
}

// ── Widget ──────────────────────────────────────────────────────────────────

class StepProgressBar extends StatefulWidget {
  final List<StepItem> steps;
  final int currentStep;
  final Color activeColor;
  final Color completedColor;
  final Color inactiveColor;
  final double stepSize;

  const StepProgressBar({
    super.key,
    required this.steps,
    required this.currentStep,
    this.activeColor = const Color(0xFF6366F1),
    this.completedColor = const Color(0xFF10B981),
    this.inactiveColor = const Color(0xFFD1D5DB),
    this.stepSize = 36,
  });

  @override
  State<StepProgressBar> createState() => _StepProgressBarState();
}

class _StepProgressBarState extends State<StepProgressBar>
    with TickerProviderStateMixin {
  late List<AnimationController> _lineControllers;
  late List<Animation<double>> _lineAnimations;
  int _previousStep = 0;

  @override
  void initState() {
    super.initState();
    _lineControllers = List.generate(
      widget.steps.length - 1,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 400),
      ),
    );
    _lineAnimations = _lineControllers
        .map((c) => CurvedAnimation(parent: c, curve: Curves.easeInOut))
        .toList();

    _previousStep = widget.currentStep;
    _syncLines(widget.currentStep);
  }

  @override
  void didUpdateWidget(StepProgressBar old) {
    super.didUpdateWidget(old);
    if (old.currentStep != widget.currentStep) {
      _syncLines(widget.currentStep);
      _previousStep = widget.currentStep;
    }
  }

  void _syncLines(int step) {
    for (int i = 0; i < _lineControllers.length; i++) {
      if (i < step) {
        _lineControllers[i].forward();
      } else {
        _lineControllers[i].reverse();
      }
    }
  }

  @override
  void dispose() {
    for (final c in _lineControllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      children: List.generate(widget.steps.length * 2 - 1, (index) {
        if (index.isOdd) {
          // Connector line
          final lineIndex = index ~/ 2;
          return Expanded(
            child: AnimatedBuilder(
              animation: _lineAnimations[lineIndex],
              builder: (_, __) {
                return Stack(
                  children: [
                    // Background line
                    Container(
                      height: 3,
                      color: widget.inactiveColor,
                    ),
                    // Animated fill
                    FractionallySizedBox(
                      widthFactor: _lineAnimations[lineIndex].value,
                      child: Container(
                        height: 3,
                        decoration: BoxDecoration(
                          gradient: LinearGradient(
                            colors: [
                              widget.completedColor,
                              widget.activeColor,
                            ],
                          ),
                          borderRadius: BorderRadius.circular(2),
                        ),
                      ),
                    ),
                  ],
                );
              },
            ),
          );
        }

        // Step circle
        final stepIndex = index ~/ 2;
        final isCompleted = stepIndex < widget.currentStep;
        final isActive = stepIndex == widget.currentStep;

        Color circleColor;
        if (isCompleted) {
          circleColor = widget.completedColor;
        } else if (isActive) {
          circleColor = widget.activeColor;
        } else {
          circleColor = widget.inactiveColor;
        }

        return Column(
          mainAxisSize: MainAxisSize.min,
          children: [
            AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              width: widget.stepSize,
              height: widget.stepSize,
              decoration: BoxDecoration(
                color: circleColor,
                shape: BoxShape.circle,
                boxShadow: isActive
                    ? [
                        BoxShadow(
                          color: widget.activeColor.withOpacity(0.35),
                          blurRadius: 12,
                          spreadRadius: 2,
                        ),
                      ]
                    : null,
              ),
              child: Center(
                child: AnimatedSwitcher(
                  duration: const Duration(milliseconds: 250),
                  child: isCompleted
                      ? Icon(
                          widget.steps[stepIndex].completedIcon ??
                              Icons.check_rounded,
                          key: const ValueKey('check'),
                          color: Colors.white,
                          size: widget.stepSize * 0.5,
                        )
                      : Text(
                          '${stepIndex + 1}',
                          key: ValueKey(stepIndex),
                          style: TextStyle(
                            color: isActive || isCompleted
                                ? Colors.white
                                : Colors.grey.shade500,
                            fontWeight: FontWeight.bold,
                            fontSize: widget.stepSize * 0.38,
                          ),
                        ),
                ),
              ),
            ),
            const SizedBox(height: 6),
            Text(
              widget.steps[stepIndex].label,
              style: TextStyle(
                fontSize: 11,
                fontWeight: isActive ? FontWeight.w700 : FontWeight.normal,
                color: isActive
                    ? widget.activeColor
                    : isCompleted
                        ? widget.completedColor
                        : Colors.grey.shade500,
              ),
              textAlign: TextAlign.center,
            ),
          ],
        );
      }),
    );
  }
}
```

## Usage

```dart
class CheckoutFlow extends StatefulWidget {
  const CheckoutFlow({super.key});

  @override
  State<CheckoutFlow> createState() => _CheckoutFlowState();
}

class _CheckoutFlowState extends State<CheckoutFlow> {
  int _step = 0;

  final _steps = const [
    StepItem(label: 'Cart'),
    StepItem(label: 'Address'),
    StepItem(label: 'Payment'),
    StepItem(label: 'Confirm'),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(title: const Text('Checkout')),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(
          children: [
            StepProgressBar(
              steps: _steps,
              currentStep: _step,
              activeColor: const Color(0xFF6366F1),
              completedColor: const Color(0xFF10B981),
            ),
            const SizedBox(height: 40),
            // Page content for current step
            Expanded(
              child: Center(child: Text('Step ${_step + 1}: ${_steps[_step].label}')),
            ),
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                if (_step > 0)
                  OutlinedButton(
                    onPressed: () => setState(() => _step--),
                    child: const Text('Back'),
                  ),
                FilledButton(
                  onPressed: _step < _steps.length - 1
                      ? () => setState(() => _step++)
                      : () => debugPrint('Order Placed!'),
                  child: Text(_step < _steps.length - 1 ? 'Next' : 'Place Order'),
                ),
              ],
            ),
          ],
        ),
      ),
    );
  }
}
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `steps` | `List<StepItem>` | required | Step definitions with labels |
| `currentStep` | `int` | required | Zero-based index of active step |
| `activeColor` | `Color` | indigo | Color of the active step circle |
| `completedColor` | `Color` | green | Color of completed step circles |
| `inactiveColor` | `Color` | grey | Color of upcoming steps |
| `stepSize` | `double` | `36` | Diameter of each step circle |

## Customization Tips

- For a vertical stepper, replace the `Row` with a `Column` and the connector lines with vertical containers
- Add a `WillPopScope` to intercept back navigation and move to the previous step instead of popping the screen
- Use `PageView` with `NeverScrollableScrollPhysics` as the body, controlled by `_step`
