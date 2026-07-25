---
id: custom-carousel-slider
title: Animated Card Carousel Slider
sidebar_label: Card Carousel Slider
---

# Animated Card Carousel Slider

A custom PageView card carousel slider featuring center-scale depth transformation, smooth page indicators, optional auto-scroll loop timer, and customizable card aspect ratios — zero third-party pub packages required.

## Features
- 🎞️ Center card scale & opacity depth animation as user swipes
- 🔘 Animated dot page indicators with active pill expansion
- ⏱ Optional auto-play loop timer with configurable interval
- 📐 Adjustable viewport fraction and card height/aspect ratio
- 📣 `onPageChanged` callback

## Widget Code

```dart
import 'dart:async';
import 'package:flutter/material.dart';

class CustomCarouselSlider<T> extends StatefulWidget {
  final List<T> items;
  final Widget Function(BuildContext context, T item, bool isCurrent) itemBuilder;
  final double viewportFraction;
  final double height;
  final bool autoPlay;
  final Duration autoPlayInterval;
  final ValueChanged<int>? onPageChanged;

  const CustomCarouselSlider({
    super.key,
    required this.items,
    required this.itemBuilder,
    this.viewportFraction = 0.82,
    this.height = 200,
    this.autoPlay = true,
    this.autoPlayInterval = const Duration(seconds: 4),
    this.onPageChanged,
  });

  @override
  State<CustomCarouselSlider<T>> createState() =>
      _CustomCarouselSliderState<T>();
}

class _CustomCarouselSliderState<T> extends State<CustomCarouselSlider<T>> {
  late PageController _pageController;
  int _currentPage = 0;
  Timer? _timer;

  @override
  void initState() {
    super.initState();
    _pageController = PageController(
      viewportFraction: widget.viewportFraction,
      initialPage: 0,
    );

    if (widget.autoPlay && widget.items.length > 1) {
      _startAutoPlay();
    }
  }

  void _startAutoPlay() {
    _timer?.cancel();
    _timer = Timer.periodic(widget.autoPlayInterval, (_) {
      if (!mounted) return;
      final nextPage = (_currentPage + 1) % widget.items.length;
      _pageController.animateToPage(
        nextPage,
        duration: const Duration(milliseconds: 500),
        curve: Curves.easeInOutCubic,
      );
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    _pageController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    if (widget.items.isEmpty) return const SizedBox.shrink();

    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        SizedBox(
          height: widget.height,
          child: PageView.builder(
            controller: _pageController,
            itemCount: widget.items.length,
            onPageChanged: (index) {
              setState(() => _currentPage = index);
              widget.onPageChanged?.call(index);
            },
            itemBuilder: (context, index) {
              return AnimatedBuilder(
                animation: _pageController,
                builder: (context, child) {
                  double value = 1.0;
                  if (_pageController.position.haveDimensions) {
                    value = (_pageController.page! - index);
                    value = (1 - (value.abs() * 0.15)).clamp(0.85, 1.0);
                  } else {
                    value = index == _currentPage ? 1.0 : 0.85;
                  }

                  return Transform.scale(
                    scale: value,
                    child: Opacity(
                      opacity: value < 0.9 ? 0.7 : 1.0,
                      child: widget.itemBuilder(
                        context,
                        widget.items[index],
                        index == _currentPage,
                      ),
                    ),
                  );
                },
              );
            },
          ),
        ),
        const SizedBox(height: 14),

        // ── Animated Page Indicator Dots ────────────────────────
        Row(
          mainAxisAlignment: MainAxisAlignment.center,
          children: List.generate(widget.items.length, (index) {
            final isSelected = index == _currentPage;
            return AnimatedContainer(
              duration: const Duration(milliseconds: 300),
              margin: const EdgeInsets.symmetric(horizontal: 4),
              height: 7,
              width: isSelected ? 22 : 7,
              decoration: BoxDecoration(
                color: isSelected
                    ? Theme.of(context).colorScheme.primary
                    : Theme.of(context).colorScheme.outlineVariant,
                borderRadius: BorderRadius.circular(4),
              ),
            );
          }),
        ),
      ],
    );
  }
}
```

## Usage

```dart
final banners = [
  {'title': 'Summer Sale 50% Off', 'color': Color(0xFF6366F1)},
  {'title': 'New Tech Arrivals', 'color': Color(0xFF10B981)},
  {'title': 'Free Express Delivery', 'color': Color(0xFFEC4899)},
];

CustomCarouselSlider<Map<String, dynamic>>(
  items: banners,
  height: 180,
  autoPlay: true,
  itemBuilder: (context, banner, isCurrent) {
    return Container(
      decoration: BoxDecoration(
        color: banner['color'] as Color,
        borderRadius: BorderRadius.circular(20),
        boxShadow: [
          BoxShadow(
            color: (banner['color'] as Color).withOpacity(0.3),
            blurRadius: 12,
            offset: const Offset(0, 6),
          ),
        ],
      ),
      padding: const EdgeInsets.all(24),
      child: Center(
        child: Text(
          banner['title'] as String,
          style: const TextStyle(
            color: Colors.white,
            fontSize: 20,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
    );
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | `List<T>` | required | List of carousel items |
| `itemBuilder` | `Function` | required | Widget builder for each item card |
| `viewportFraction` | `double` | `0.82` | Width fraction of visible card |
| `height` | `double` | `200` | Carousel height |
| `autoPlay` | `bool` | `true` | Enables auto-scroll loop |
| `autoPlayInterval` | `Duration` | `4000ms` | Delay between slides |

## Customization Tips

- Adjust `viewportFraction: 1.0` for full-width banner carousels
- Pause timer on user touch by wrapping `PageView` in `Listener` or `GestureDetector`
