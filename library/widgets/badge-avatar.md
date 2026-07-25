---
id: badge-avatar
title: Status & Badge Avatar Widget
sidebar_label: Status & Badge Avatar
---

# Status & Badge Avatar Widget

A flexible profile avatar widget with online/offline status dot indicators, numeric unread notification count badge, and optional story ring gradient border.

## Features
- 🟢 Status dot indicator (Online, Away, Offline, Busy)
- 🔴 Numeric unread notification badge (with `99+` cap)
- 🌈 Animated story ring gradient border
- 📷 Image URL or fallback text initials

## Widget Code

```dart
import 'package:flutter/material.dart';

enum UserStatus { online, away, busy, offline }

class BadgeAvatar extends StatelessWidget {
  final String? imageUrl;
  final String initials;
  final double radius;
  final UserStatus? status;
  final int badgeCount;
  final bool hasStoryRing;
  final VoidCallback? onTap;

  const BadgeAvatar({
    super.key,
    this.imageUrl,
    required this.initials,
    this.radius = 28,
    this.status,
    this.badgeCount = 0,
    this.hasStoryRing = false,
    this.onTap,
  });

  Color _getStatusColor(UserStatus s) {
    switch (s) {
      case UserStatus.online: return const Color(0xFF10B981);
      case UserStatus.away: return const Color(0xFFF59E0B);
      case UserStatus.busy: return const Color(0xFFEF4444);
      case UserStatus.offline: return const Color(0xFF94A3B8);
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    Widget avatarCore = CircleAvatar(
      radius: radius,
      backgroundColor: cs.primaryContainer,
      backgroundImage: imageUrl != null ? NetworkImage(imageUrl!) : null,
      child: imageUrl == null
          ? Text(
              initials,
              style: TextStyle(
                fontWeight: FontWeight.bold,
                fontSize: radius * 0.7,
                color: cs.onPrimaryContainer,
              ),
            )
          : null,
    );

    if (hasStoryRing) {
      avatarCore = Container(
        padding: const EdgeInsets.all(3),
        decoration: const BoxDecoration(
          shape: BoxShape.circle,
          gradient: LinearGradient(
            colors: [Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFF7B52C)],
          ),
        ),
        child: Container(
          padding: const EdgeInsets.all(2),
          decoration: BoxDecoration(
            color: cs.surface,
            shape: BoxShape.circle,
          ),
          child: avatarCore,
        ),
      );
    }

    return GestureDetector(
      onTap: onTap,
      child: Stack(
        clipBehavior: Clip.none,
        children: [
          avatarCore,

          // ── Status Dot ────────────────────────────────────────
          if (status != null)
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                width: radius * 0.55,
                height: radius * 0.55,
                decoration: BoxDecoration(
                  color: _getStatusColor(status!),
                  shape: BoxShape.circle,
                  border: Border.all(color: cs.surface, width: 2),
                ),
              ),
            ),

          // ── Unread Badge Counter ──────────────────────────────
          if (badgeCount > 0)
            Positioned(
              right: -4,
              top: -4,
              child: Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: cs.error,
                  borderRadius: BorderRadius.circular(10),
                  border: Border.all(color: cs.surface, width: 1.5),
                ),
                child: Text(
                  badgeCount > 99 ? '99+' : '$badgeCount',
                  style: const TextStyle(
                    color: Colors.white,
                    fontSize: 10,
                    fontWeight: FontWeight.bold,
                  ),
                ),
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
// User Avatar with Online Status Dot
BadgeAvatar(
  imageUrl: 'https://i.pravatar.cc/150?img=12',
  initials: 'JD',
  radius: 30,
  status: UserStatus.online,
)

// Notification Avatar with Count Badge
BadgeAvatar(
  initials: 'AB',
  radius: 26,
  badgeCount: 5,
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `imageUrl` | `String?` | `null` | Remote avatar image URL |
| `initials` | `String` | required | Fallback initials text |
| `radius` | `double` | `28` | Avatar circle radius |
| `status` | `UserStatus?` | `null` | Online, away, busy, or offline status |
| `badgeCount` | `int` | `0` | Unread notifications count |
| `hasStoryRing` | `bool` | `false` | Story gradient ring border |
