---
id: custom-bottom-nav
title: Animated Bottom Navigation Bar
sidebar_label: Bottom Navigation Bar
---

# Animated Bottom Navigation Bar

A custom `BottomNavigationBar` replacement with a floating pill indicator that slides between tabs, icon scale bounce animations, and optional floating card elevation. Perfect as a drop-in for any app's main navigation shell.

## Features
- 🏃 Smooth sliding pill indicator using `AnimatedPositioned`
- 🔠 Labels that fade in/out on selection
- 🎯 Icon scale bounce on tap via `AnimationController`
- 🎨 Fully customizable colors, sizes, and pill shape
- 🪄 Works with any icon set
- ♿ Semantics labels for accessibility

## Widget Code

```dart
import 'package:flutter/material.dart';

// ── Data model ─────────────────────────────────────────────────────────────

class NavItem {
  final IconData icon;
  final IconData activeIcon;
  final String label;

  const NavItem({
    required this.icon,
    required this.activeIcon,
    required this.label,
  });
}

// ── Widget ──────────────────────────────────────────────────────────────────

class AnimatedBottomNavBar extends StatefulWidget {
  final List<NavItem> items;
  final int currentIndex;
  final ValueChanged<int> onTap;
  final Color? backgroundColor;
  final Color? activeColor;
  final Color? inactiveColor;
  final double height;

  const AnimatedBottomNavBar({
    super.key,
    required this.items,
    required this.currentIndex,
    required this.onTap,
    this.backgroundColor,
    this.activeColor,
    this.inactiveColor,
    this.height = 68,
  });

  @override
  State<AnimatedBottomNavBar> createState() => _AnimatedBottomNavBarState();
}

class _AnimatedBottomNavBarState extends State<AnimatedBottomNavBar>
    with TickerProviderStateMixin {
  late List<AnimationController> _bounceControllers;
  late List<Animation<double>> _bounceAnimations;

  @override
  void initState() {
    super.initState();
    _bounceControllers = List.generate(
      widget.items.length,
      (_) => AnimationController(
        vsync: this,
        duration: const Duration(milliseconds: 300),
      ),
    );
    _bounceAnimations = _bounceControllers.map((c) {
      return Tween<double>(begin: 1, end: 1.25).animate(
        CurvedAnimation(parent: c, curve: Curves.elasticOut),
      );
    }).toList();

    // Trigger bounce for initial selected item
    _bounceControllers[widget.currentIndex].forward();
  }

  @override
  void didUpdateWidget(AnimatedBottomNavBar oldWidget) {
    super.didUpdateWidget(oldWidget);
    if (oldWidget.currentIndex != widget.currentIndex) {
      _bounceControllers[oldWidget.currentIndex].reverse();
      _bounceControllers[widget.currentIndex].forward(from: 0);
    }
  }

  @override
  void dispose() {
    for (final c in _bounceControllers) {
      c.dispose();
    }
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final bg = widget.backgroundColor ?? cs.surface;
    final active = widget.activeColor ?? cs.primary;
    final inactive = widget.inactiveColor ?? cs.onSurfaceVariant;

    return Container(
      height: widget.height + MediaQuery.of(context).padding.bottom,
      padding: EdgeInsets.only(bottom: MediaQuery.of(context).padding.bottom),
      decoration: BoxDecoration(
        color: bg,
        boxShadow: [
          BoxShadow(
            color: Colors.black.withOpacity(0.08),
            blurRadius: 16,
            offset: const Offset(0, -2),
          ),
        ],
      ),
      child: LayoutBuilder(
        builder: (context, constraints) {
          final itemWidth = constraints.maxWidth / widget.items.length;
          final pillWidth = itemWidth * 0.55;

          return Stack(
            children: [
              // ── Sliding pill indicator ─────────────────────────
              AnimatedPositioned(
                duration: const Duration(milliseconds: 300),
                curve: Curves.easeInOutCubic,
                left: widget.currentIndex * itemWidth +
                    (itemWidth - pillWidth) / 2,
                top: 8,
                child: Container(
                  width: pillWidth,
                  height: 4,
                  decoration: BoxDecoration(
                    color: active,
                    borderRadius: BorderRadius.circular(2),
                  ),
                ),
              ),

              // ── Nav items row ──────────────────────────────────
              Row(
                children: widget.items.asMap().entries.map((entry) {
                  final index = entry.key;
                  final item = entry.value;
                  final isSelected = index == widget.currentIndex;

                  return Expanded(
                    child: GestureDetector(
                      behavior: HitTestBehavior.opaque,
                      onTap: () => widget.onTap(index),
                      child: Semantics(
                        label: item.label,
                        selected: isSelected,
                        child: AnimatedBuilder(
                          animation: _bounceAnimations[index],
                          builder: (_, __) {
                            return Transform.scale(
                              scale: isSelected
                                  ? _bounceAnimations[index].value
                                  : 1.0,
                              child: Column(
                                mainAxisAlignment: MainAxisAlignment.center,
                                children: [
                                  const SizedBox(height: 6),
                                  AnimatedSwitcher(
                                    duration:
                                        const Duration(milliseconds: 200),
                                    child: Icon(
                                      isSelected
                                          ? item.activeIcon
                                          : item.icon,
                                      key: ValueKey(isSelected),
                                      color: isSelected ? active : inactive,
                                      size: 24,
                                    ),
                                  ),
                                  const SizedBox(height: 4),
                                  AnimatedDefaultTextStyle(
                                    duration:
                                        const Duration(milliseconds: 200),
                                    style: TextStyle(
                                      color: isSelected ? active : inactive,
                                      fontSize: 11,
                                      fontWeight: isSelected
                                          ? FontWeight.w700
                                          : FontWeight.normal,
                                    ),
                                    child: Text(item.label),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                      ),
                    ),
                  );
                }).toList(),
              ),
            ],
          );
        },
      ),
    );
  }
}
```

## Usage

```dart
class _AppShellState extends State<AppShell> {
  int _currentIndex = 0;

  final _pages = const [
    HomePage(),
    ExplorePage(),
    SavedPage(),
    ProfilePage(),
  ];

  final _navItems = const [
    NavItem(
      icon: Icons.home_outlined,
      activeIcon: Icons.home_rounded,
      label: 'Home',
    ),
    NavItem(
      icon: Icons.explore_outlined,
      activeIcon: Icons.explore_rounded,
      label: 'Explore',
    ),
    NavItem(
      icon: Icons.bookmark_border_rounded,
      activeIcon: Icons.bookmark_rounded,
      label: 'Saved',
    ),
    NavItem(
      icon: Icons.person_outline_rounded,
      activeIcon: Icons.person_rounded,
      label: 'Profile',
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: IndexedStack(
        index: _currentIndex,
        children: _pages,
      ),
      bottomNavigationBar: AnimatedBottomNavBar(
        items: _navItems,
        currentIndex: _currentIndex,
        onTap: (i) => setState(() => _currentIndex = i),
      ),
    );
  }
}
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `items` | `List<NavItem>` | required | Tab definitions (icon, activeIcon, label) |
| `currentIndex` | `int` | required | The currently selected tab index |
| `onTap` | `ValueChanged<int>` | required | Callback when a tab is tapped |
| `backgroundColor` | `Color?` | `surface` | Bar background color |
| `activeColor` | `Color?` | `primary` | Active tab color |
| `inactiveColor` | `Color?` | `onSurfaceVariant` | Inactive tab color |
| `height` | `double` | `68` | Height of the bar (excludes safe area) |

## Customization Tips

- Replace the top indicator bar with a floating rounded container below the icon for a "bubble" nav style
- Use `IndexedStack` (not `Navigator`) for the page body to preserve scroll state across tabs
- Add a `Badge` widget around the icon for notification counts
