---
id: home-dashboard-screen
title: Home Dashboard Screen
sidebar_label: Home Dashboard
---

# Home Dashboard Screen

A feature-rich app home screen with a sticky `SliverAppBar`, quick-action grid, horizontal category chips, a featured banner card, and a feed list — all in a single `CustomScrollView`. Ideal as the main screen for productivity, lifestyle, or social apps.

## Features
- 📌 Collapsing `SliverAppBar` with avatar and search
- ⚡ Quick-action grid (4 shortcuts)
- 🏷️ Horizontal scrollable category chip filter
- 🖼️ Featured content banner with gradient overlay
- 📜 Vertical feed list with card tiles
- 🔔 Notification badge on AppBar icon

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Models ─────────────────────────────────────────────────────────────────

class QuickAction {
  final String label;
  final IconData icon;
  final Color color;

  const QuickAction({
    required this.label,
    required this.icon,
    required this.color,
  });
}

class FeedItem {
  final String title;
  final String subtitle;
  final String tag;
  final String timeAgo;
  final Color tagColor;

  const FeedItem({
    required this.title,
    required this.subtitle,
    required this.tag,
    required this.timeAgo,
    required this.tagColor,
  });
}

// ── Screen ─────────────────────────────────────────────────────────────────

class HomeDashboardScreen extends StatefulWidget {
  const HomeDashboardScreen({super.key});

  @override
  State<HomeDashboardScreen> createState() => _HomeDashboardScreenState();
}

class _HomeDashboardScreenState extends State<HomeDashboardScreen> {
  int _selectedCategory = 0;

  final List<String> _categories = [
    'All',
    'Design',
    'Development',
    'Business',
    'Marketing',
  ];

  final List<QuickAction> _quickActions = const [
    QuickAction(
      label: 'Analytics',
      icon: Icons.bar_chart_rounded,
      color: Color(0xFF6366F1),
    ),
    QuickAction(
      label: 'Messages',
      icon: Icons.chat_bubble_outline_rounded,
      color: Color(0xFF0EA5E9),
    ),
    QuickAction(
      label: 'Calendar',
      icon: Icons.calendar_month_outlined,
      color: Color(0xFF10B981),
    ),
    QuickAction(
      label: 'Settings',
      icon: Icons.settings_outlined,
      color: Color(0xFFF59E0B),
    ),
  ];

  final List<FeedItem> _feedItems = const [
    FeedItem(
      title: 'Building Scalable Flutter Apps',
      subtitle:
          'Learn how to structure your codebase for long-term maintainability with clean architecture.',
      tag: 'Development',
      timeAgo: '2h ago',
      tagColor: Color(0xFF6366F1),
    ),
    FeedItem(
      title: 'Design Systems in 2025',
      subtitle:
          'How top companies build unified design languages that scale across platforms.',
      tag: 'Design',
      timeAgo: '5h ago',
      tagColor: Color(0xFF0EA5E9),
    ),
    FeedItem(
      title: 'Growth Hacking for SaaS',
      subtitle:
          'Practical strategies to grow from 0 to your first 1,000 paying customers.',
      tag: 'Business',
      timeAgo: '1d ago',
      tagColor: Color(0xFF10B981),
    ),
    FeedItem(
      title: 'AI Tools Changing Marketing',
      subtitle:
          'The top AI-powered tools marketers are using to 10x their output in 2025.',
      tag: 'Marketing',
      timeAgo: '2d ago',
      tagColor: Color(0xFFF59E0B),
    ),
  ];

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      body: CustomScrollView(
        slivers: [
          // ── App bar ──────────────────────────────────────────────
          SliverAppBar(
            floating: true,
            snap: true,
            backgroundColor: cs.surface,
            surfaceTintColor: Colors.transparent,
            titleSpacing: 16,
            title: Row(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: cs.primaryContainer,
                  child: Text(
                    'A',
                    style: TextStyle(
                      color: cs.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(width: 12),
                Column(
                  crossAxisAlignment: CrossAxisAlignment.start,
                  children: [
                    Text(
                      'Good morning ☀️',
                      style: theme.textTheme.bodySmall?.copyWith(
                        color: cs.onSurfaceVariant,
                      ),
                    ),
                    Text(
                      'Alex Johnson',
                      style: theme.textTheme.titleSmall?.copyWith(
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
              ],
            ),
            actions: [
              IconButton(
                icon: Badge(
                  label: const Text('3'),
                  child: const Icon(Icons.notifications_outlined),
                ),
                onPressed: () {},
              ),
              IconButton(
                icon: const Icon(Icons.search_rounded),
                onPressed: () {},
              ),
              const SizedBox(width: 4),
            ],
          ),

          SliverToBoxAdapter(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Quick Actions ─────────────────────────────────
                Padding(
                  padding: const EdgeInsets.fromLTRB(16, 20, 16, 0),
                  child: Text(
                    'Quick Actions',
                    style: theme.textTheme.titleMedium?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                const SizedBox(height: 12),
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: _quickActions
                        .map((a) => _QuickActionButton(action: a))
                        .toList(),
                  ),
                ),
                const SizedBox(height: 28),

                // ── Featured banner ───────────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 16),
                  child: _FeaturedBanner(),
                ),
                const SizedBox(height: 28),

                // ── Category chips ────────────────────────────────
                SizedBox(
                  height: 36,
                  child: ListView.builder(
                    scrollDirection: Axis.horizontal,
                    padding: const EdgeInsets.symmetric(horizontal: 16),
                    itemCount: _categories.length,
                    itemBuilder: (context, index) {
                      final selected = index == _selectedCategory;
                      return GestureDetector(
                        onTap: () => setState(() => _selectedCategory = index),
                        child: AnimatedContainer(
                          duration: const Duration(milliseconds: 200),
                          margin: const EdgeInsets.only(right: 8),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          decoration: BoxDecoration(
                            color: selected ? cs.primary : Colors.transparent,
                            border: Border.all(
                              color: selected ? cs.primary : cs.outline,
                            ),
                            borderRadius: BorderRadius.circular(20),
                          ),
                          child: Text(
                            _categories[index],
                            style: TextStyle(
                              color: selected ? Colors.white : cs.onSurface,
                              fontWeight: selected
                                  ? FontWeight.w600
                                  : FontWeight.normal,
                              fontSize: 13,
                            ),
                          ),
                        ),
                      );
                    },
                  ),
                ),
                const SizedBox(height: 20),

                // ── Feed items ────────────────────────────────────
                ..._feedItems
                    .where(
                      (item) =>
                          _selectedCategory == 0 ||
                          item.tag == _categories[_selectedCategory],
                    )
                    .map((item) => _FeedCard(item: item)),

                const SizedBox(height: 24),
              ],
            ),
          ),
        ],
      ),
      // ── Bottom Navigation ──────────────────────────────────────
      bottomNavigationBar: NavigationBar(
        selectedIndex: 0,
        destinations: const [
          NavigationDestination(
            icon: Icon(Icons.home_outlined),
            selectedIcon: Icon(Icons.home_rounded),
            label: 'Home',
          ),
          NavigationDestination(
            icon: Icon(Icons.explore_outlined),
            selectedIcon: Icon(Icons.explore_rounded),
            label: 'Explore',
          ),
          NavigationDestination(
            icon: Icon(Icons.bookmark_border_rounded),
            selectedIcon: Icon(Icons.bookmark_rounded),
            label: 'Saved',
          ),
          NavigationDestination(
            icon: Icon(Icons.person_outline_rounded),
            selectedIcon: Icon(Icons.person_rounded),
            label: 'Profile',
          ),
        ],
      ),
    );
  }
}

// ── Quick action button ─────────────────────────────────────────────────────

class _QuickActionButton extends StatelessWidget {
  final QuickAction action;
  const _QuickActionButton({required this.action});

  @override
  Widget build(BuildContext context) {
    return GestureDetector(
      onTap: () {},
      child: Column(
        children: [
          Container(
            width: 60,
            height: 60,
            decoration: BoxDecoration(
              color: action.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(16),
            ),
            child: Icon(action.icon, color: action.color, size: 26),
          ),
          const SizedBox(height: 8),
          Text(
            action.label,
            style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500),
          ),
        ],
      ),
    );
  }
}

// ── Featured banner ─────────────────────────────────────────────────────────

class _FeaturedBanner extends StatelessWidget {
  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return ClipRRect(
      borderRadius: BorderRadius.circular(20),
      child: Container(
        height: 160,
        decoration: const BoxDecoration(
          gradient: LinearGradient(
            colors: [Color(0xFF6366F1), Color(0xFF8B5CF6)],
            begin: Alignment.topLeft,
            end: Alignment.bottomRight,
          ),
        ),
        child: Stack(
          children: [
            // Background pattern circles
            Positioned(
              top: -20,
              right: -20,
              child: Container(
                width: 120,
                height: 120,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.08),
                ),
              ),
            ),
            Positioned(
              bottom: -30,
              right: 60,
              child: Container(
                width: 80,
                height: 80,
                decoration: BoxDecoration(
                  shape: BoxShape.circle,
                  color: Colors.white.withValues(alpha: 0.06),
                ),
              ),
            ),
            // Content
            Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                mainAxisAlignment: MainAxisAlignment.spaceBetween,
                children: [
                  Container(
                    padding: const EdgeInsets.symmetric(
                      horizontal: 10,
                      vertical: 4,
                    ),
                    decoration: BoxDecoration(
                      color: Colors.white.withValues(alpha: 0.2),
                      borderRadius: BorderRadius.circular(20),
                    ),
                    child: const Text(
                      '🔥 Featured',
                      style: TextStyle(
                        color: Colors.white,
                        fontSize: 11,
                        fontWeight: FontWeight.w600,
                      ),
                    ),
                  ),
                  Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      const Text(
                        'Flutter Advanced\nPatterns & Architecture',
                        style: TextStyle(
                          color: Colors.white,
                          fontSize: 18,
                          fontWeight: FontWeight.bold,
                          height: 1.2,
                        ),
                      ),
                      const SizedBox(height: 10),
                      ElevatedButton(
                        onPressed: () {},
                        style: ElevatedButton.styleFrom(
                          backgroundColor: Colors.white,
                          foregroundColor: const Color(0xFF6366F1),
                          padding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          minimumSize: Size.zero,
                          tapTargetSize: MaterialTapTargetSize.shrinkWrap,
                          shape: RoundedRectangleBorder(
                            borderRadius: BorderRadius.circular(8),
                          ),
                        ),
                        child: const Text(
                          'Read Now',
                          style: TextStyle(
                            fontSize: 12,
                            fontWeight: FontWeight.w600,
                          ),
                        ),
                      ),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ── Feed card ──────────────────────────────────────────────────────────────

class _FeedCard extends StatelessWidget {
  final FeedItem item;
  const _FeedCard({required this.item});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Container(
      margin: const EdgeInsets.fromLTRB(16, 0, 16, 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        border: Border.all(color: cs.outline.withValues(alpha: 0.4)),
        borderRadius: BorderRadius.circular(16),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: [
          Row(
            children: [
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 3),
                decoration: BoxDecoration(
                  color: item.tagColor.withValues(alpha: 0.1),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  item.tag,
                  style: TextStyle(
                    color: item.tagColor,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
              const Spacer(),
              Text(
                item.timeAgo,
                style: TextStyle(color: cs.onSurfaceVariant, fontSize: 12),
              ),
            ],
          ),
          const SizedBox(height: 10),
          Text(
            item.title,
            style: theme.textTheme.titleSmall?.copyWith(
              fontWeight: FontWeight.bold,
            ),
          ),
          const SizedBox(height: 6),
          Text(
            item.subtitle,
            style: theme.textTheme.bodySmall?.copyWith(
              color: cs.onSurfaceVariant,
              height: 1.5,
            ),
            maxLines: 2,
            overflow: TextOverflow.ellipsis,
          ),
        ],
      ),
    );
  }
}
```

## Dependencies

No extra packages required.

## Customization Tips

- Replace the static `_feedItems` list with a `FutureBuilder` / `StreamBuilder` for live data
- Add a `BottomNavigationBar` state manager via `GoRouter` or `AutoRoute` for real tab switching
- Wrap `_FeaturedBanner` with a `PageView` for a swipeable carousel banner
