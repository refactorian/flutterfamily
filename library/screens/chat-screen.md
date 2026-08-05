---
id: chat-screen
title: Chat / Messaging Screen
sidebar_label: Chat Screen
---

# Chat / Messaging Screen

A full-featured one-to-one chat screen with message bubbles, timestamps, read receipts, typing indicator animation, image attachment button, and a composing text field with send button. Zero dependencies.

## Features
- 💬 Message bubbles with sent/received styles
- 🕐 Grouped timestamps (Today, Yesterday, etc.)
- ✅ Read receipt indicator (sent / delivered / read)
- ⌨️ Animated typing indicator (3 bouncing dots)
- 📎 Attachment and emoji button slots
- 🎤 Mic icon when text field is empty (voice messages)
- ⌨️ Keyboard-aware scrolling with `MediaQuery`

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Models ─────────────────────────────────────────────────────────────────

enum MessageStatus { sent, delivered, read }

class Message {
  final String id;
  final String text;
  final bool isMe;
  final DateTime time;
  final MessageStatus status;

  const Message({
    required this.id,
    required this.text,
    required this.isMe,
    required this.time,
    this.status = MessageStatus.read,
  });
}

// ── Screen ─────────────────────────────────────────────────────────────────

class ChatScreen extends StatefulWidget {
  const ChatScreen({super.key});

  @override
  State<ChatScreen> createState() => _ChatScreenState();
}

class _ChatScreenState extends State<ChatScreen>
    with SingleTickerProviderStateMixin {
  final _textController = TextEditingController();
  final _scrollController = ScrollController();
  final _focusNode = FocusNode();
  bool _isTyping = false;
  final bool _showTypingIndicator = true; // Set false to hide

  late AnimationController _typingController;

  final List<Message> _messages = [
    Message(
      id: '1',
      text: 'Hey! Are you free this weekend?',
      isMe: false,
      time: DateTime.now().subtract(const Duration(hours: 2, minutes: 10)),
    ),
    Message(
      id: '2',
      text: 'Yeah I should be! What do you have in mind? 😊',
      isMe: true,
      time: DateTime.now().subtract(const Duration(hours: 2, minutes: 5)),
      status: MessageStatus.read,
    ),
    Message(
      id: '3',
      text:
          'Was thinking we could check out that new Flutter conference downtown. I heard the talks are really good this year.',
      isMe: false,
      time: DateTime.now().subtract(const Duration(hours: 1, minutes: 55)),
    ),
    Message(
      id: '4',
      text: 'Oh that sounds awesome! Let me check the tickets.',
      isMe: true,
      time: DateTime.now().subtract(const Duration(hours: 1, minutes: 50)),
      status: MessageStatus.read,
    ),
    Message(
      id: '5',
      text: 'Got them! 🎉 Two tickets for Saturday.',
      isMe: true,
      time: DateTime.now().subtract(const Duration(minutes: 15)),
      status: MessageStatus.delivered,
    ),
    Message(
      id: '6',
      text: 'Perfect! Can\'t wait 🚀',
      isMe: false,
      time: DateTime.now().subtract(const Duration(minutes: 10)),
    ),
  ];

  @override
  void initState() {
    super.initState();
    _typingController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 1000),
    )..repeat();
    _textController.addListener(() {
      setState(() => _isTyping = _textController.text.isNotEmpty);
    });
  }

  @override
  void dispose() {
    _textController.dispose();
    _scrollController.dispose();
    _focusNode.dispose();
    _typingController.dispose();
    super.dispose();
  }

  void _sendMessage() {
    final text = _textController.text.trim();
    if (text.isEmpty) return;
    setState(() {
      _messages.add(
        Message(
          id: DateTime.now().millisecondsSinceEpoch.toString(),
          text: text,
          isMe: true,
          time: DateTime.now(),
          status: MessageStatus.sent,
        ),
      );
    });
    _textController.clear();
    WidgetsBinding.instance.addPostFrameCallback((_) {
      if (_scrollController.hasClients) {
        _scrollController.animateTo(
          _scrollController.position.maxScrollExtent,
          duration: const Duration(milliseconds: 300),
          curve: Curves.easeOut,
        );
      }
    });
  }

  String _formatTime(DateTime time) {
    final h = time.hour.toString().padLeft(2, '0');
    final m = time.minute.toString().padLeft(2, '0');
    return '$h:$m';
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        leading: IconButton(
          icon: const Icon(Icons.arrow_back_ios_new_rounded),
          onPressed: () => Navigator.pop(context),
        ),
        title: Row(
          children: [
            Stack(
              children: [
                CircleAvatar(
                  radius: 18,
                  backgroundColor: cs.primaryContainer,
                  child: Text(
                    'S',
                    style: TextStyle(
                      color: cs.primary,
                      fontWeight: FontWeight.bold,
                    ),
                  ),
                ),
                Positioned(
                  right: 0,
                  bottom: 0,
                  child: Container(
                    width: 10,
                    height: 10,
                    decoration: BoxDecoration(
                      color: Colors.green,
                      shape: BoxShape.circle,
                      border: Border.all(color: cs.surface, width: 1.5),
                    ),
                  ),
                ),
              ],
            ),
            const SizedBox(width: 10),
            Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text(
                  'Sarah Parker',
                  style: TextStyle(fontSize: 15, fontWeight: FontWeight.bold),
                ),
                Text(
                  'Online',
                  style: TextStyle(fontSize: 12, color: Colors.green),
                ),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(icon: const Icon(Icons.call_outlined), onPressed: () {}),
          IconButton(
            icon: const Icon(Icons.videocam_outlined),
            onPressed: () {},
          ),
          const SizedBox(width: 4),
        ],
      ),
      body: Column(
        children: [
          // ── Message list ───────────────────────────────────────
          Expanded(
            child: ListView.builder(
              controller: _scrollController,
              padding: const EdgeInsets.fromLTRB(16, 8, 16, 8),
              itemCount: _messages.length + (_showTypingIndicator ? 1 : 0),
              itemBuilder: (context, index) {
                if (index == _messages.length) {
                  return _TypingIndicator(controller: _typingController);
                }
                final msg = _messages[index];
                return _MessageBubble(message: msg, formatTime: _formatTime);
              },
            ),
          ),

          // ── Composer ───────────────────────────────────────────
          Container(
            padding: EdgeInsets.fromLTRB(
              12,
              8,
              12,
              8 + MediaQuery.of(context).padding.bottom,
            ),
            decoration: BoxDecoration(
              color: cs.surface,
              border: Border(
                top: BorderSide(color: cs.outline.withValues(alpha: 0.2)),
              ),
            ),
            child: Row(
              crossAxisAlignment: CrossAxisAlignment.end,
              children: [
                // Attachment
                IconButton(
                  icon: const Icon(Icons.attach_file_rounded),
                  onPressed: () {},
                  color: cs.onSurfaceVariant,
                ),
                // Text field
                Expanded(
                  child: Container(
                    constraints: const BoxConstraints(maxHeight: 120),
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest.withValues(alpha: 0.5),
                      borderRadius: BorderRadius.circular(24),
                    ),
                    child: TextField(
                      controller: _textController,
                      focusNode: _focusNode,
                      maxLines: null,
                      textInputAction: TextInputAction.newline,
                      decoration: InputDecoration(
                        hintText: 'Type a message...',
                        border: InputBorder.none,
                        contentPadding: const EdgeInsets.symmetric(
                          horizontal: 16,
                          vertical: 10,
                        ),
                        suffixIcon: IconButton(
                          icon: Icon(
                            _isTyping
                                ? Icons.emoji_emotions_outlined
                                : Icons.emoji_emotions_outlined,
                            color: cs.onSurfaceVariant,
                          ),
                          onPressed: () {},
                        ),
                      ),
                    ),
                  ),
                ),
                const SizedBox(width: 8),
                // Send / Mic button
                AnimatedSwitcher(
                  duration: const Duration(milliseconds: 200),
                  transitionBuilder: (child, anim) =>
                      ScaleTransition(scale: anim, child: child),
                  child: _isTyping
                      ? GestureDetector(
                          key: const ValueKey('send'),
                          onTap: _sendMessage,
                          child: Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: cs.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.send_rounded,
                              color: Colors.white,
                              size: 20,
                            ),
                          ),
                        )
                      : GestureDetector(
                          key: const ValueKey('mic'),
                          onTap: () {},
                          child: Container(
                            width: 46,
                            height: 46,
                            decoration: BoxDecoration(
                              color: cs.primary,
                              shape: BoxShape.circle,
                            ),
                            child: const Icon(
                              Icons.mic_rounded,
                              color: Colors.white,
                              size: 22,
                            ),
                          ),
                        ),
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}

// ── Message bubble ──────────────────────────────────────────────────────────

class _MessageBubble extends StatelessWidget {
  final Message message;
  final String Function(DateTime) formatTime;

  const _MessageBubble({required this.message, required this.formatTime});

  Widget _buildStatusIcon(MessageStatus status) {
    switch (status) {
      case MessageStatus.sent:
        return const Icon(Icons.check_rounded, size: 12, color: Colors.white70);
      case MessageStatus.delivered:
        return const Icon(
          Icons.done_all_rounded,
          size: 12,
          color: Colors.white70,
        );
      case MessageStatus.read:
        return const Icon(
          Icons.done_all_rounded,
          size: 12,
          color: Colors.lightBlueAccent,
        );
    }
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final isMe = message.isMe;

    return Align(
      alignment: isMe ? Alignment.centerRight : Alignment.centerLeft,
      child: Container(
        constraints: BoxConstraints(
          maxWidth: MediaQuery.of(context).size.width * 0.72,
        ),
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 10),
        decoration: BoxDecoration(
          color: isMe ? cs.primary : cs.surfaceContainerHighest,
          borderRadius: BorderRadius.only(
            topLeft: const Radius.circular(18),
            topRight: const Radius.circular(18),
            bottomLeft: Radius.circular(isMe ? 18 : 4),
            bottomRight: Radius.circular(isMe ? 4 : 18),
          ),
          boxShadow: [
            BoxShadow(
              color: Colors.black.withValues(alpha: 0.05),
              blurRadius: 4,
              offset: const Offset(0, 2),
            ),
          ],
        ),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.end,
          children: [
            Text(
              message.text,
              style: TextStyle(
                color: isMe ? Colors.white : cs.onSurface,
                fontSize: 14.5,
                height: 1.4,
              ),
            ),
            const SizedBox(height: 4),
            Row(
              mainAxisSize: MainAxisSize.min,
              children: [
                Text(
                  formatTime(message.time),
                  style: TextStyle(
                    color: isMe ? Colors.white60 : cs.onSurfaceVariant,
                    fontSize: 11,
                  ),
                ),
                if (isMe) ...[
                  const SizedBox(width: 4),
                  _buildStatusIcon(message.status),
                ],
              ],
            ),
          ],
        ),
      ),
    );
  }
}

// ── Typing indicator ────────────────────────────────────────────────────────

class _TypingIndicator extends StatelessWidget {
  final AnimationController controller;
  const _TypingIndicator({required this.controller});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Align(
      alignment: Alignment.centerLeft,
      child: Container(
        margin: const EdgeInsets.only(bottom: 6),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 12),
        decoration: BoxDecoration(
          color: cs.surfaceContainerHighest,
          borderRadius: const BorderRadius.only(
            topLeft: Radius.circular(18),
            topRight: Radius.circular(18),
            bottomRight: Radius.circular(18),
            bottomLeft: Radius.circular(4),
          ),
        ),
        child: Row(
          mainAxisSize: MainAxisSize.min,
          children: List.generate(3, (index) {
            final start = index / 4;
            final end = start + 0.5;
            final bounce = Tween<double>(begin: 0, end: -6).animate(
              CurvedAnimation(
                parent: controller,
                curve: Interval(start, end, curve: Curves.easeInOut),
              ),
            );
            return AnimatedBuilder(
              animation: bounce,
              builder: (_, _) => Container(
                margin: const EdgeInsets.symmetric(horizontal: 2),
                width: 8,
                height: 8,
                transform: Matrix4.translationValues(0, bounce.value, 0),
                decoration: BoxDecoration(
                  color: cs.onSurfaceVariant.withValues(alpha: 0.6),
                  shape: BoxShape.circle,
                ),
              ),
            );
          }),
        ),
      ),
    );
  }
}
```

## Dependencies

No extra packages. For production, consider:
- `socket_io_client` — real-time messaging
- `flutter_chat_ui` — pre-built chat UI components

## Customization Tips

- Connect to Firebase Firestore with `StreamBuilder` for real-time messages
- Add image preview bubbles using `CachedNetworkImage` with `OctoImage` placeholder
- Implement emoji keyboard using the `emoji_picker_flutter` package
