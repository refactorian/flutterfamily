---
id: social-media-app
title: Social Media & Chat Starter Kit
sidebar_label: Social & Chat App
---

# Social Media & Chat App Starter Kit

A production-ready social networking and chat app template built with Flutter. Includes post feed with media cards, real-time comment threads, user profiles, and a direct messaging UI.

## Features
- 📰 Feed feed with stories bar, like animation, comments, and share actions
- 💬 Real-time chat UI with message bubbles, timestamp grouping, and typing indicators
- 👤 User profile screen with follower stats, tabbed posts grid, and bio header
- 🔔 Notification feed for likes, comments, and mentions
- 🌓 Modern dark / light theme support

## App Architecture

```
lib/
├── models/
│   ├── post.dart
│   ├── user.dart
│   └── chat_message.dart
├── providers/
│   └── feed_provider.dart
├── screens/
│   ├── feed_screen.dart
│   ├── chat_detail_screen.dart
│   └── profile_screen.dart
└── widgets/
    ├── post_card.dart
    ├── story_avatar.dart
    └── message_bubble.dart
```

## Template Code

### Data Models & State Management

```dart
import 'package:flutter/material.dart';

class SocialUser {
  final String id;
  final String username;
  final String avatarUrl;
  final bool isVerified;

  const SocialUser({
    required this.id,
    required this.username,
    required this.avatarUrl,
    this.isVerified = false,
  });
}

class SocialPost {
  final String id;
  final SocialUser author;
  final String caption;
  final String? imageUrl;
  final String timeAgo;
  int likesCount;
  int commentsCount;
  bool isLiked;

  SocialPost({
    required this.id,
    required this.author,
    required this.caption,
    this.imageUrl,
    required this.timeAgo,
    required this.likesCount,
    required this.commentsCount,
    this.isLiked = false,
  });
}

class ChatMessage {
  final String id;
  final String senderId;
  final String text;
  final DateTime timestamp;
  final bool isRead;

  const ChatMessage({
    required this.id,
    required this.senderId,
    required this.text,
    required this.timestamp,
    this.isRead = false,
  });
}
```

### Feed Screen & Story Bar

```dart
class SocialFeedScreen extends StatefulWidget {
  const SocialFeedScreen({super.key});

  @override
  State<SocialFeedScreen> createState() => _SocialFeedScreenState();
}

class _SocialFeedScreenState extends State<SocialFeedScreen> {
  final List<SocialPost> _posts = [
    SocialPost(
      id: '1',
      author: const SocialUser(
        id: 'u1',
        username: 'sarah_dev',
        avatarUrl: 'https://i.pravatar.cc/150?img=1',
        isVerified: true,
      ),
      caption: 'Just launched my new Flutter app! Check it out 🚀 #flutter #dart',
      imageUrl: 'https://picsum.photos/600/400?random=1',
      timeAgo: '2h ago',
      likesCount: 142,
      commentsCount: 18,
    ),
    SocialPost(
      id: '2',
      author: const SocialUser(
        id: 'u2',
        username: 'alex_ui',
        avatarUrl: 'https://i.pravatar.cc/150?img=5',
      ),
      caption: 'Working on a sleek glassmorphism UI concept today ✨',
      imageUrl: 'https://picsum.photos/600/400?random=2',
      timeAgo: '4h ago',
      likesCount: 89,
      commentsCount: 7,
    ),
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text('FlutterSocial', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: const Icon(Icons.favorite_border_rounded),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.send_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        children: [
          // ── Stories Tray ─────────────────────────────────────
          SizedBox(
            height: 100,
            child: ListView.separated(
              padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
              scrollDirection: Axis.horizontal,
              itemCount: 8,
              separatorBuilder: (_, __) => const SizedBox(width: 12),
              itemBuilder: (context, index) {
                if (index == 0) {
                  return const _AddStoryAvatar();
                }
                return _StoryAvatar(
                  username: 'user_$index',
                  avatarUrl: 'https://i.pravatar.cc/150?img=${index + 10}',
                  hasUnseen: index % 2 == 0,
                );
              },
            ),
          ),
          const Divider(height: 1),

          // ── Posts List ───────────────────────────────────────
          ..._posts.map((post) => _PostCard(
                post: post,
                onLike: () {
                  setState(() {
                    post.isLiked = !post.isLiked;
                    post.likesCount += post.isLiked ? 1 : -1;
                  });
                },
              )),
        ],
      ),
    );
  }
}

class _StoryAvatar extends StatelessWidget {
  final String username;
  final String avatarUrl;
  final bool hasUnseen;

  const _StoryAvatar({
    required this.username,
    required this.avatarUrl,
    required this.hasUnseen,
  });

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Container(
          padding: const EdgeInsets.all(2.5),
          decoration: BoxDecoration(
            shape: BoxShape.circle,
            gradient: hasUnseen
                ? const LinearGradient(
                    colors: [Color(0xFF833AB4), Color(0xFFFD1D1D), Color(0xFFF7B52C)],
                    begin: Alignment.topLeft,
                    end: Alignment.bottomRight,
                  )
                : null,
            color: hasUnseen ? null : Colors.grey.shade400,
          ),
          child: Container(
            padding: const EdgeInsets.all(2),
            decoration: const BoxDecoration(
              color: Colors.white,
              shape: BoxShape.circle,
            ),
            child: CircleAvatar(
              radius: 26,
              backgroundImage: NetworkImage(avatarUrl),
            ),
          ),
        ),
        const SizedBox(height: 4),
        Text(username, style: const TextStyle(fontSize: 11)),
      ],
    );
  }
}

class _AddStoryAvatar extends StatelessWidget {
  const _AddStoryAvatar();

  @override
  Widget build(BuildContext context) {
    return Column(
      mainAxisSize: MainAxisSize.min,
      children: [
        Stack(
          children: [
            const CircleAvatar(
              radius: 28,
              backgroundImage: NetworkImage('https://i.pravatar.cc/150?img=3'),
            ),
            Positioned(
              right: 0,
              bottom: 0,
              child: Container(
                padding: const EdgeInsets.all(2),
                decoration: const BoxDecoration(
                  color: Colors.blue,
                  shape: BoxShape.circle,
                ),
                child: const Icon(Icons.add, color: Colors.white, size: 14),
              ),
            ),
          ],
        ),
        const SizedBox(height: 4),
        const Text('Your Story', style: TextStyle(fontSize: 11)),
      ],
    );
  }
}

class _PostCard extends StatelessWidget {
  final SocialPost post;
  final VoidCallback onLike;

  const _PostCard({required this.post, required this.onLike});

  @override
  Widget build(BuildContext context) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        // Header
        ListTile(
          contentPadding: const EdgeInsets.symmetric(horizontal: 16),
          leading: CircleAvatar(
            backgroundImage: NetworkImage(post.author.avatarUrl),
          ),
          title: Row(
            children: [
              Text(post.author.username, const TextStyle(fontWeight: FontWeight.bold)),
              if (post.author.isVerified) ...[
                const SizedBox(width: 4),
                const Icon(Icons.verified, color: Colors.blue, size: 16),
              ],
            ],
          ),
          subtitle: Text(post.timeAgo),
          trailing: const Icon(Icons.more_vert),
        ),

        // Caption
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 4),
          child: Text(post.caption),
        ),

        // Media
        if (post.imageUrl != null) ...[
          const SizedBox(height: 8),
          Image.network(
            post.imageUrl!,
            width: double.infinity,
            height: 280,
            fit: BoxFit.cover,
          ),
        ],

        // Action Bar
        Padding(
          padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
          child: Row(
            children: [
              IconButton(
                icon: Icon(
                  post.isLiked ? Icons.favorite : Icons.favorite_border,
                  color: post.isLiked ? Colors.red : null,
                ),
                onPressed: onLike,
              ),
              Text('${post.likesCount}'),
              const SizedBox(width: 16),
              const Icon(Icons.chat_bubble_outline_rounded, size: 22),
              const SizedBox(width: 6),
              Text('${post.commentsCount}'),
              const Spacer(),
              IconButton(
                icon: const Icon(Icons.bookmark_border_rounded),
                onPressed: () {},
              ),
            ],
          ),
        ),
        const Divider(height: 1),
      ],
    );
  }
}
```

## Setup & Dependencies
- Compatible with `flutter_riverpod` or `bloc` for state management
- Add `image_picker` for photo uploads
- Add `cached_network_image` for smooth image caching
