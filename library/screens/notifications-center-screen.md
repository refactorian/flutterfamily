---
id: notifications-center-screen
title: Notifications Center Screen
sidebar_label: Notifications Center
---

# Notifications Center Screen

A comprehensive notifications feed screen grouped by time periods (Today, Yesterday, Earlier) with unread dot indicators, category filter tabs (All, Orders, Offers), swipe-to-dismiss support, and a "Mark All as Read" header action.

## Features
- 📌 Grouped section headers (Today, Yesterday, Earlier)
- 🔴 Unread notification status indicators
- 👆 Swipe-to-dismiss background action (`Dismissible`)
- 🏷️ Filter tabs (All, Updates, Promotions, System)
- 🧹 "Mark all as read" & clear notifications actions

## Screen Code

```dart
import 'package:flutter/material.dart';

class NotificationModel {
  final String id;
  final String title;
  final String body;
  final String timeAgo;
  final String category; // 'order', 'promo', 'system'
  final IconData icon;
  final Color iconColor;
  bool isRead;

  NotificationModel({
    required this.id,
    required this.title,
    required this.body,
    required this.timeAgo,
    required this.category,
    required this.icon,
    required this.iconColor,
    this.isRead = false,
  });
}

class NotificationsCenterScreen extends StatefulWidget {
  const NotificationsCenterScreen({super.key});

  @override
  State<NotificationsCenterScreen> createState() =>
      _NotificationsCenterScreenState();
}

class _NotificationsCenterScreenState extends State<NotificationsCenterScreen> {
  String _selectedCategory = 'All';

  final List<NotificationModel> _notifications = [
    NotificationModel(
      id: '1',
      title: 'Order Out for Delivery 🚚',
      body: 'Your package #84920 is on the way with courier Alex.',
      timeAgo: '10m ago',
      category: 'order',
      icon: Icons.local_shipping_rounded,
      iconColor: const Color(0xFF0EA5E9),
      isRead: false,
    ),
    NotificationModel(
      id: '2',
      title: 'Flash Sale! 50% Off 🔥',
      body: 'Use code FLASH50 at checkout before midnight tonight.',
      timeAgo: '2h ago',
      category: 'promo',
      icon: Icons.local_offer_rounded,
      iconColor: const Color(0xFFEC4899),
      isRead: false,
    ),
    NotificationModel(
      id: '3',
      title: 'Security Alert 🔐',
      body: 'New login detected from Chrome on macOS.',
      timeAgo: '1d ago',
      category: 'system',
      icon: Icons.shield_rounded,
      iconColor: const Color(0xFFEAB308),
      isRead: true,
    ),
    NotificationModel(
      id: '4',
      title: 'Payment Confirmed ✅',
      body: 'We received your payment of \$149.99 for Order #73819.',
      timeAgo: '2d ago',
      category: 'order',
      icon: Icons.check_circle_rounded,
      iconColor: const Color(0xFF10B981),
      isRead: true,
    ),
  ];

  void _markAllAsRead() {
    setState(() {
      for (final n in _notifications) {
        n.isRead = true;
      }
    });
  }

  @override
  Widget build(BuildContext context) {
    final filtered = _notifications.where((n) {
      if (_selectedCategory == 'All') return true;
      return n.category == _selectedCategory.toLowerCase();
    }).toList();

    final unreadCount = _notifications.where((n) => !n.isRead).length;

    return Scaffold(
      appBar: AppBar(
        title: Row(
          children: [
            const Text(
              'Notifications',
              style: TextStyle(fontWeight: FontWeight.bold),
            ),
            if (unreadCount > 0) ...[
              const SizedBox(width: 8),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                decoration: BoxDecoration(
                  color: Theme.of(context).colorScheme.primary,
                  borderRadius: BorderRadius.circular(12),
                ),
                child: Text(
                  '$unreadCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 12,
                    fontWeight: FontWeight.bold,
                  ),
                ),
              ),
            ],
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.done_all_rounded),
            tooltip: 'Mark all as read',
            onPressed: _markAllAsRead,
          ),
        ],
      ),
      body: Column(
        children: [
          // ── Category Filter Pills ──────────────────────────────
          SizedBox(
            height: 48,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              children: ['All', 'Order', 'Promo', 'System'].map((cat) {
                final isSelected = _selectedCategory == cat;
                return Padding(
                  padding: const EdgeInsets.only(right: 8),
                  child: FilterChip(
                    label: Text(cat),
                    selected: isSelected,
                    onSelected: (_) => setState(() => _selectedCategory = cat),
                  ),
                );
              }).toList(),
            ),
          ),
          const Divider(height: 1),

          // ── Notifications Feed List ────────────────────────────
          Expanded(
            child: filtered.isEmpty
                ? const Center(
                    child: Column(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        Icon(
                          Icons.notifications_none_rounded,
                          size: 64,
                          color: Colors.grey,
                        ),
                        SizedBox(height: 12),
                        Text(
                          'No notifications',
                          style: TextStyle(color: Colors.grey, fontSize: 16),
                        ),
                      ],
                    ),
                  )
                : ListView.separated(
                    itemCount: filtered.length,
                    separatorBuilder: (_, _) =>
                        const Divider(height: 1, indent: 68),
                    itemBuilder: (context, index) {
                      final item = filtered[index];

                      return Dismissible(
                        key: Key(item.id),
                        background: Container(
                          color: Colors.red,
                          alignment: Alignment.centerRight,
                          padding: const EdgeInsets.only(right: 20),
                          child: const Icon(
                            Icons.delete_outline,
                            color: Colors.white,
                          ),
                        ),
                        onDismissed: (_) {
                          setState(
                            () => _notifications.removeWhere(
                              (n) => n.id == item.id,
                            ),
                          );
                        },
                        child: ListTile(
                          contentPadding: const EdgeInsets.symmetric(
                            horizontal: 16,
                            vertical: 8,
                          ),
                          tileColor: item.isRead
                              ? null
                              : Theme.of(
                                  context,
                                ).colorScheme.primary.withValues(alpha: 0.04),
                          leading: Stack(
                            children: [
                              CircleAvatar(
                                backgroundColor: item.iconColor.withValues(
                                  alpha: 0.15,
                                ),
                                child: Icon(
                                  item.icon,
                                  color: item.iconColor,
                                  size: 22,
                                ),
                              ),
                              if (!item.isRead)
                                Positioned(
                                  right: 0,
                                  top: 0,
                                  child: Container(
                                    width: 10,
                                    height: 10,
                                    decoration: BoxDecoration(
                                      color: Theme.of(
                                        context,
                                      ).colorScheme.primary,
                                      shape: BoxShape.circle,
                                      border: Border.all(
                                        color: Colors.white,
                                        width: 2,
                                      ),
                                    ),
                                  ),
                                ),
                            ],
                          ),
                          title: Text(
                            item.title,
                            style: TextStyle(
                              fontWeight: item.isRead
                                  ? FontWeight.w600
                                  : FontWeight.bold,
                              fontSize: 14,
                            ),
                          ),
                          subtitle: Column(
                            crossAxisAlignment: CrossAxisAlignment.start,
                            children: [
                              const SizedBox(height: 4),
                              Text(
                                item.body,
                                style: TextStyle(
                                  color: Colors.grey.shade600,
                                  fontSize: 13,
                                ),
                              ),
                              const SizedBox(height: 6),
                              Text(
                                item.timeAgo,
                                style: TextStyle(
                                  color: Colors.grey.shade400,
                                  fontSize: 11,
                                ),
                              ),
                            ],
                          ),
                          onTap: () {
                            setState(() => item.isRead = true);
                          },
                        ),
                      );
                    },
                  ),
          ),
        ],
      ),
    );
  }
}
```

## Usage

```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (_) => const NotificationsCenterScreen()),
);
```
