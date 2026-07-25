---
id: rating-bar
title: Interactive Star Rating Bar
sidebar_label: Rating Bar
---

# Interactive Star Rating Bar

A customizable, touch-interactive star rating widget that supports full and half-star selection, animated scale feedback on tap, and read-only display mode. Zero dependencies.

## Features
- ⭐ Full and half-star selection support
- 📏 Configurable number of stars (default 5)
- 🎨 Configurable filled / empty / half star colors
- 🔠 Configurable icon and size
- 🔒 Read-only mode for displaying ratings
- 📣 `onRatingChanged` callback with `double` value
- 🎞️ Tap-scale animation per star

## Widget Code

```dart
import 'package:flutter/material.dart';

class StarRatingBar extends StatefulWidget {
  /// Current rating value (e.g. 3.5)
  final double initialRating;

  final int starCount;
  final double starSize;
  final bool allowHalfRating;
  final bool readOnly;
  final Color filledColor;
  final Color emptyColor;
  final double spacing;
  final ValueChanged<double>? onRatingChanged;

  const StarRatingBar({
    super.key,
    this.initialRating = 0,
    this.starCount = 5,
    this.starSize = 32,
    this.allowHalfRating = true,
    this.readOnly = false,
    this.filledColor = const Color(0xFFFBBF24),
    this.emptyColor = const Color(0xFFD1D5DB),
    this.spacing = 4,
    this.onRatingChanged,
  });

  @override
  State<StarRatingBar> createState() => _StarRatingBarState();
}

class _StarRatingBarState extends State<StarRatingBar>
    with TickerProviderStateMixin {
  late double _rating;
  late List<AnimationController> _scaleControllers;
  late List<Animation<double>> _scaleAnimations;

  @override
  void initState() {
    super.initState();
    _rating = widget.initialRating;
    _scaleControllers = List.generate(
      widget.starCount,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 200),
        value: 1.0,
      ),
    );
    _scaleAnimations = _scaleControllers
        .map(
          (c) => TweenSequence<double>([
            TweenSequenceItem(
              tween: Tween(begin: 1.0, end: 1.3),
              weight: 50,
            ),
            TweenSequenceItem(
              tween: Tween(begin: 1.3, end: 1.0),
              weight: 50,
            ),
          ]).animate(CurvedAnimation(parent: c, curve: Curves.easeInOut)),
        )
        .toList();
  }

  @override
  void dispose() {
    for (final c in _scaleControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _handleTap(int index, Offset localPosition, double starWidth) {
    if (widget.readOnly) return;

    double newRating;
    if (widget.allowHalfRating &&
        localPosition.dx < (starWidth / 2)) {
      newRating = index + 0.5;
    } else {
      newRating = index + 1.0;
    }

    setState(() => _rating = newRating);
    _scaleControllers[index].forward(from: 0);
    widget.onRatingChanged?.call(newRating);
  }

  IconData _getStarIcon(int index) {
    if (_rating >= index + 1) return Icons.star_rounded;
    if (widget.allowHalfRating && _rating >= index + 0.5) {
      return Icons.star_half_rounded;
    }
    return Icons.star_outline_rounded;
  }

  Color _getStarColor(int index) {
    if (_rating >= index + 0.5) return widget.filledColor;
    return widget.emptyColor;
  }

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisSize: MainAxisSize.min,
      children: List.generate(widget.starCount, (index) {
        return Padding(
          padding: EdgeInsets.symmetric(horizontal: widget.spacing / 2),
          child: GestureDetector(
            onTapDown: widget.readOnly
                ? null
                : (details) => _handleTap(
                      index,
                      details.localPosition,
                      widget.starSize,
                    ),
            child: AnimatedBuilder(
              animation: _scaleAnimations[index],
              builder: (_, __) {
                return Transform.scale(
                  scale: _scaleAnimations[index].value,
                  child: Icon(
                    _getStarIcon(index),
                    color: _getStarColor(index),
                    size: widget.starSize,
                  ),
                );
              },
            ),
          ),
        );
      }),
    );
  }
}
```

## Usage

### Interactive rating

```dart
double _userRating = 0;

StarRatingBar(
  initialRating: _userRating,
  starSize: 36,
  allowHalfRating: true,
  onRatingChanged: (rating) {
    setState(() => _userRating = rating);
    debugPrint('Rating: $rating');
  },
)
```

### Read-only product rating display

```dart
Row(
  children: [
    StarRatingBar(
      initialRating: 4.5,
      starSize: 18,
      readOnly: true,
      filledColor: Colors.amber,
      spacing: 2,
    ),
    const SizedBox(width: 6),
    Text(
      '4.5 (248 reviews)',
      style: TextStyle(
        color: Theme.of(context).colorScheme.onSurfaceVariant,
        fontSize: 13,
      ),
    ),
  ],
)
```

### Full rating submission form

```dart
class ReviewForm extends StatefulWidget {
  const ReviewForm({super.key});

  @override
  State<ReviewForm> createState() => _ReviewFormState();
}

class _ReviewFormState extends State<ReviewForm> {
  double _rating = 0;
  final _controller = TextEditingController();

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Your Rating', style: TextStyle(fontWeight: FontWeight.bold)),
        const SizedBox(height: 8),
        StarRatingBar(
          starSize: 40,
          onRatingChanged: (r) => setState(() => _rating = r),
        ),
        const SizedBox(height: 4),
        Text(
          _rating == 0 ? 'Tap to rate' : '$_rating / 5',
          style: TextStyle(color: Colors.grey.shade600),
        ),
        const SizedBox(height: 16),
        TextField(
          controller: _controller,
          maxLines: 4,
          decoration: InputDecoration(
            labelText: 'Write a review (optional)',
            border: OutlineInputBorder(
              borderRadius: BorderRadius.circular(12),
            ),
          ),
        ),
        const SizedBox(height: 16),
        FilledButton(
          onPressed: _rating > 0 ? () {} : null,
          child: const Text('Submit Review'),
        ),
      ],
    );
  }
}
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `initialRating` | `double` | `0` | Starting rating value |
| `starCount` | `int` | `5` | Total number of stars |
| `starSize` | `double` | `32` | Size of each star icon |
| `allowHalfRating` | `bool` | `true` | Enable half-star selection |
| `readOnly` | `bool` | `false` | Disables interaction |
| `filledColor` | `Color` | amber | Color of filled/half stars |
| `emptyColor` | `Color` | grey | Color of empty stars |
| `spacing` | `double` | `4` | Horizontal gap between stars |
| `onRatingChanged` | `ValueChanged<double>?` | `null` | Callback with new rating |

## Customization Tips

- Swap `Icons.star_rounded` for heart icons (`Icons.favorite_rounded`) for a "likes" style rating
- For a 10-point scale, set `starCount: 10` and `starSize: 20`
- Store the rating in a `Provider` or `Riverpod` state to persist across widget rebuilds
