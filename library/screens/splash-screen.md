---
id: splash-screen
title: Splash / Launch Screen
sidebar_label: Splash Screen
---

# Splash / Launch Screen

An animated app launch screen with a logo pulse + scale animation, progress indicator, and automatic navigation after initialization. Handles async startup tasks (auth check, remote config, etc.) before routing the user to the correct screen.

## Features
- 🌅 Full-screen gradient background
- 🔵 Logo with scale + fade entrance animation
- ⬆️ Tagline slide-up animation
- ⏳ `LinearProgressIndicator` with animated fill
- 🔄 Handles auth state check before navigating
- 🛣️ Routes to onboarding or home based on state

## Flutter Code

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class SplashScreen extends StatefulWidget {
  const SplashScreen({super.key});

  @override
  State<SplashScreen> createState() => _SplashScreenState();
}

class _SplashScreenState extends State<SplashScreen>
    with TickerProviderStateMixin {
  late AnimationController _logoController;
  late AnimationController _taglineController;
  late AnimationController _progressController;

  late Animation<double> _logoScale;
  late Animation<double> _logoFade;
  late Animation<Offset> _taglineSlide;
  late Animation<double> _taglineFade;

  @override
  void initState() {
    super.initState();

    // Make status bar transparent
    SystemChrome.setSystemUIOverlayStyle(
      const SystemUiOverlayStyle(
        statusBarColor: Colors.transparent,
        statusBarIconBrightness: Brightness.light,
      ),
    );

    // Logo animation
    _logoController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _logoScale = Tween<double>(begin: 0.5, end: 1.0).animate(
      CurvedAnimation(parent: _logoController, curve: Curves.elasticOut),
    );
    _logoFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(
        parent: _logoController,
        curve: const Interval(0, 0.6, curve: Curves.easeOut),
      ),
    );

    // Tagline animation (delayed)
    _taglineController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 600),
    );
    _taglineSlide = Tween<Offset>(begin: const Offset(0, 0.5), end: Offset.zero)
        .animate(
          CurvedAnimation(
            parent: _taglineController,
            curve: Curves.easeOutCubic,
          ),
        );
    _taglineFade = Tween<double>(begin: 0, end: 1).animate(
      CurvedAnimation(parent: _taglineController, curve: Curves.easeOut),
    );

    // Progress animation
    _progressController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 2200),
    );

    _startAnimations();
  }

  Future<void> _startAnimations() async {
    await Future.delayed(const Duration(milliseconds: 200));
    _logoController.forward();

    await Future.delayed(const Duration(milliseconds: 500));
    _taglineController.forward();
    _progressController.forward();

    // Simulate initialization work
    await _initialize();

    if (!mounted) return;

    // Navigate based on auth state
    final isLoggedIn = await _checkAuthState();
    Navigator.of(context).pushReplacement(
      PageRouteBuilder(
        pageBuilder: (_, _, _) => isLoggedIn
            ? const _PlaceholderHome()
            : const _PlaceholderOnboarding(),
        transitionDuration: const Duration(milliseconds: 600),
        transitionsBuilder: (_, animation, _, child) {
          return FadeTransition(opacity: animation, child: child);
        },
      ),
    );
  }

  Future<void> _initialize() async {
    // Run your startup tasks here in parallel:
    await Future.wait([
      Future.delayed(const Duration(milliseconds: 2400)), // min display time
      _loadRemoteConfig(),
      _warmUpCache(),
    ]);
  }

  Future<void> _loadRemoteConfig() async {
    // e.g., FirebaseRemoteConfig.instance.fetchAndActivate()
    await Future.delayed(const Duration(milliseconds: 500));
  }

  Future<void> _warmUpCache() async {
    // e.g., preload images, fonts
    await Future.delayed(const Duration(milliseconds: 300));
  }

  Future<bool> _checkAuthState() async {
    // e.g., FirebaseAuth.instance.currentUser != null
    return false; // change to true to route to home
  }

  @override
  void dispose() {
    _logoController.dispose();
    _taglineController.dispose();
    _progressController.dispose();
    // Restore system UI
    SystemChrome.setSystemUIOverlayStyle(SystemUiOverlayStyle.dark);
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Container(
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF0F0C29), Color(0xFF302B63), Color(0xFF24243E)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: SafeArea(
          child: Column(
            children: [
              Expanded(
                child: Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      // Logo
                      ScaleTransition(
                        scale: _logoScale,
                        child: FadeTransition(
                          opacity: _logoFade,
                          child: Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              color: Colors.white.withValues(alpha: 0.12),
                              borderRadius: BorderRadius.circular(28),
                              border: Border.all(
                                color: Colors.white.withValues(alpha: 0.2),
                              ),
                            ),
                            child: const Icon(
                              Icons.bolt_rounded,
                              color: Colors.white,
                              size: 52,
                            ),
                          ),
                        ),
                      ),
                      const SizedBox(height: 28),

                      // App name
                      FadeTransition(
                        opacity: _logoFade,
                        child: const Text(
                          'MyApp',
                          style: TextStyle(
                            color: Colors.white,
                            fontSize: 36,
                            fontWeight: FontWeight.bold,
                            letterSpacing: 1.5,
                          ),
                        ),
                      ),
                      const SizedBox(height: 12),

                      // Tagline
                      SlideTransition(
                        position: _taglineSlide,
                        child: FadeTransition(
                          opacity: _taglineFade,
                          child: Text(
                            'Your world, your way.',
                            style: TextStyle(
                              color: Colors.white.withValues(alpha: 0.6),
                              fontSize: 16,
                              letterSpacing: 0.5,
                            ),
                          ),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              // Progress bar
              Padding(
                padding: const EdgeInsets.fromLTRB(40, 0, 40, 48),
                child: Column(
                  children: [
                    AnimatedBuilder(
                      animation: _progressController,
                      builder: (_, _) {
                        return ClipRRect(
                          borderRadius: BorderRadius.circular(4),
                          child: LinearProgressIndicator(
                            value: _progressController.value,
                            backgroundColor: Colors.white.withValues(
                              alpha: 0.15,
                            ),
                            valueColor: const AlwaysStoppedAnimation<Color>(
                              Colors.white,
                            ),
                            minHeight: 3,
                          ),
                        );
                      },
                    ),
                    const SizedBox(height: 20),
                    Text(
                      'Loading...',
                      style: TextStyle(
                        color: Colors.white.withValues(alpha: 0.4),
                        fontSize: 12,
                      ),
                    ),
                  ],
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

// ── Placeholder destination screens ────────────────────────────────────────

class _PlaceholderHome extends StatelessWidget {
  const _PlaceholderHome();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Home Screen')));
}

class _PlaceholderOnboarding extends StatelessWidget {
  const _PlaceholderOnboarding();

  @override
  Widget build(BuildContext context) =>
      const Scaffold(body: Center(child: Text('Onboarding Screen')));
}
```

## Dependencies

No extra packages required.

## Customization Tips

- Replace the `Icon` logo with an `Image.asset('assets/logo.png')` for your real brand mark
- Change the gradient to your brand colors
- Replace `_checkAuthState()` with `FirebaseAuth.instance.currentUser != null`
- Add `flutter_native_splash` to set the true native splash screen (before Flutter engine loads)
