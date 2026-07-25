---
id: onboarding-screen
title: Onboarding / Intro Slides Screen
sidebar_label: Onboarding Slides
---

# Onboarding / Intro Slides Screen

A polished 3-page onboarding flow with a PageView, animated page indicator dots, smooth transitions, and a skip button. Designed to introduce your app's key value propositions before the user logs in.

## Features
- 📄 PageView with swipe gestures
- 🔵 Animated page indicator (expanding dot style)
- ⏭️ Skip button to jump to last page
- ➡️ Next / Get Started CTA button
- 🎨 Per-page accent color transitions
- 💾 SharedPreferences flag to show only once (optional tip)

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Data model ─────────────────────────────────────────────────────────────

class OnboardingPage {
  final String title;
  final String description;
  final IconData icon;
  final Color color;

  const OnboardingPage({
    required this.title,
    required this.description,
    required this.icon,
    required this.color,
  });
}

final _pages = const [
  OnboardingPage(
    title: 'Discover Amazing Things',
    description:
        'Explore a world of possibilities with curated content made just for you. Start your journey today.',
    icon: Icons.explore_rounded,
    color: Color(0xFF6366F1),
  ),
  OnboardingPage(
    title: 'Stay Connected',
    description:
        'Real-time sync across all your devices means your data is always up-to-date, wherever you are.',
    icon: Icons.sync_rounded,
    color: Color(0xFF0EA5E9),
  ),
  OnboardingPage(
    title: 'Achieve Your Goals',
    description:
        'Powerful tools and insights help you track progress and hit every milestone, faster than ever.',
    icon: Icons.emoji_events_rounded,
    color: Color(0xFF10B981),
  ),
];

// ── Screen ─────────────────────────────────────────────────────────────────

class OnboardingScreen extends StatefulWidget {
  final VoidCallback onComplete;

  const OnboardingScreen({super.key, required this.onComplete});

  @override
  State<OnboardingScreen> createState() => _OnboardingScreenState();
}

class _OnboardingScreenState extends State<OnboardingScreen>
    with TickerProviderStateMixin {
  final _pageController = PageController();
  int _currentPage = 0;

  late List<AnimationController> _iconControllers;

  @override
  void initState() {
    super.initState();
    _iconControllers = List.generate(
      _pages.length,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 600),
      ),
    );
    _iconControllers[0].forward();
  }

  @override
  void dispose() {
    _pageController.dispose();
    for (final c in _iconControllers) {
      c.dispose();
    }
    super.dispose();
  }

  void _onPageChanged(int index) {
    setState(() => _currentPage = index);
    _iconControllers[index].forward(from: 0);
  }

  void _next() {
    if (_currentPage < _pages.length - 1) {
      _pageController.nextPage(
        duration: const Duration(milliseconds: 400),
        curve: Curves.easeInOutCubic,
      );
    } else {
      widget.onComplete();
    }
  }

  void _skip() {
    _pageController.animateToPage(
      _pages.length - 1,
      duration: const Duration(milliseconds: 400),
      curve: Curves.easeInOutCubic,
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final isLast = _currentPage == _pages.length - 1;
    final currentColor = _pages[_currentPage].color;

    return Scaffold(
      backgroundColor: theme.colorScheme.surface,
      body: SafeArea(
        child: Column(
          children: [
            // Skip button
            Align(
              alignment: Alignment.centerRight,
              child: AnimatedOpacity(
                opacity: isLast ? 0 : 1,
                duration: const Duration(milliseconds: 300),
                child: TextButton(
                  onPressed: isLast ? null : _skip,
                  child: Text(
                    'Skip',
                    style: TextStyle(color: currentColor),
                  ),
                ),
              ),
            ),

            // PageView
            Expanded(
              child: PageView.builder(
                controller: _pageController,
                onPageChanged: _onPageChanged,
                itemCount: _pages.length,
                itemBuilder: (context, index) {
                  final page = _pages[index];
                  final iconAnim = CurvedAnimation(
                    parent: _iconControllers[index],
                    curve: Curves.elasticOut,
                  );
                  return Padding(
                    padding: const EdgeInsets.symmetric(horizontal: 32),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        // Icon container
                        ScaleTransition(
                          scale: iconAnim,
                          child: Container(
                            width: 140,
                            height: 140,
                            decoration: BoxDecoration(
                              color: page.color.withOpacity(0.12),
                              shape: BoxShape.circle,
                            ),
                            child: Icon(
                              page.icon,
                              size: 64,
                              color: page.color,
                            ),
                          ),
                        ),
                        const SizedBox(height: 48),
                        Text(
                          page.title,
                          style: theme.textTheme.headlineSmall?.copyWith(
                            fontWeight: FontWeight.bold,
                            height: 1.2,
                          ),
                          textAlign: TextAlign.center,
                        ),
                        const SizedBox(height: 16),
                        Text(
                          page.description,
                          style: theme.textTheme.bodyLarge?.copyWith(
                            color: theme.colorScheme.onSurfaceVariant,
                            height: 1.6,
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),

            // Page indicators
            Padding(
              padding: const EdgeInsets.symmetric(vertical: 24),
              child: Row(
                mainAxisAlignment: MainAxisAlignment.center,
                children: List.generate(_pages.length, (index) {
                  return AnimatedContainer(
                    duration: const Duration(milliseconds: 300),
                    curve: Curves.easeInOut,
                    margin: const EdgeInsets.symmetric(horizontal: 4),
                    width: _currentPage == index ? 28 : 8,
                    height: 8,
                    decoration: BoxDecoration(
                      borderRadius: BorderRadius.circular(4),
                      color: _currentPage == index
                          ? currentColor
                          : currentColor.withOpacity(0.25),
                    ),
                  );
                }),
              ),
            ),

            // CTA button
            Padding(
              padding: const EdgeInsets.fromLTRB(24, 0, 24, 32),
              child: AnimatedContainer(
                duration: const Duration(milliseconds: 300),
                width: double.infinity,
                height: 56,
                child: FilledButton(
                  onPressed: _next,
                  style: FilledButton.styleFrom(
                    backgroundColor: currentColor,
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      Text(
                        isLast ? 'Get Started' : 'Next',
                        style: const TextStyle(
                          fontSize: 16,
                          fontWeight: FontWeight.w600,
                          color: Colors.white,
                        ),
                      ),
                      const SizedBox(width: 8),
                      Icon(
                        isLast ? Icons.check_rounded : Icons.arrow_forward_rounded,
                        color: Colors.white,
                        size: 20,
                      ),
                    ],
                  ),
                ),
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
// In your main app or splash screen, show onboarding if first launch:
OnboardingScreen(
  onComplete: () {
    // Mark onboarding as seen, navigate to login
    Navigator.of(context).pushReplacement(
      MaterialPageRoute(builder: (_) => const EmailLoginScreen()),
    );
  },
);
```

## Dependencies

No extra packages required.

## Customization Tips

- Replace `IconData` + solid color with Lottie animations for a richer experience (`lottie` package)
- Add `shared_preferences` to store a `hasSeenOnboarding` flag and skip on subsequent launches
- Use `NetworkImage` in a `ClipOval` for illustration-style artwork per slide
