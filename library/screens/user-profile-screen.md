---
id: user-profile-screen
title: User Profile Screen
sidebar_label: User Profile
---

# User Profile Screen

A polished profile screen with avatar upload, editable fields, stats counters, and a cover photo header. Includes a gradient header with an overlapping avatar card — a widely used modern pattern in social and fitness apps.

## Features
- 🖼️ Cover photo header with gradient overlay
- 👤 Circular avatar with camera-pick overlay button
- 📊 Inline stats row (Posts / Followers / Following)
- ✏️ Edit profile mode toggle
- 🏷️ Bio, location, and website fields
- 💾 Save changes with loading state

## Flutter Code

```dart
import 'package:flutter/material.dart';

class UserProfileScreen extends StatefulWidget {
  const UserProfileScreen({super.key});

  @override
  State<UserProfileScreen> createState() => _UserProfileScreenState();
}

class _UserProfileScreenState extends State<UserProfileScreen> {
  bool _isEditing = false;
  bool _isSaving = false;

  final _nameController = TextEditingController(text: 'Alex Johnson');
  final _bioController = TextEditingController(
    text: 'Flutter developer & UI/UX enthusiast. Building beautiful apps.',
  );
  final _locationController = TextEditingController(text: 'San Francisco, CA');
  final _websiteController = TextEditingController(text: 'alexj.dev');

  @override
  void dispose() {
    _nameController.dispose();
    _bioController.dispose();
    _locationController.dispose();
    _websiteController.dispose();
    super.dispose();
  }

  Future<void> _save() async {
    setState(() => _isSaving = true);
    await Future.delayed(const Duration(seconds: 1));
    if (!mounted) return;
    setState(() {
      _isSaving = false;
      _isEditing = false;
    });
    ScaffoldMessenger.of(
      context,
    ).showSnackBar(const SnackBar(content: Text('Profile updated!')));
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      body: CustomScrollView(
        slivers: [
          // ── Collapsible header ──────────────────────────────────
          SliverAppBar(
            expandedHeight: 220,
            pinned: true,
            stretch: true,
            backgroundColor: cs.primary,
            actions: [
              IconButton(
                icon: Icon(
                  _isEditing ? Icons.close_rounded : Icons.edit_rounded,
                  color: Colors.white,
                ),
                onPressed: () => setState(() => _isEditing = !_isEditing),
              ),
              const SizedBox(width: 4),
            ],
            flexibleSpace: FlexibleSpaceBar(
              stretchModes: const [StretchMode.zoomBackground],
              background: Stack(
                fit: StackFit.expand,
                children: [
                  // Cover gradient
                  Container(
                    decoration: BoxDecoration(
                      gradient: LinearGradient(
                        colors: [cs.primary, cs.primaryContainer],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                    ),
                  ),
                  // Decorative circles
                  Positioned(
                    top: -40,
                    right: -40,
                    child: Container(
                      width: 180,
                      height: 180,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.08),
                      ),
                    ),
                  ),
                  Positioned(
                    bottom: 10,
                    left: -30,
                    child: Container(
                      width: 120,
                      height: 120,
                      decoration: BoxDecoration(
                        shape: BoxShape.circle,
                        color: Colors.white.withValues(alpha: 0.06),
                      ),
                    ),
                  ),
                ],
              ),
            ),
          ),

          SliverToBoxAdapter(
            child: Column(
              children: [
                // ── Avatar section ────────────────────────────────
                Transform.translate(
                  offset: const Offset(0, -50),
                  child: Column(
                    children: [
                      Stack(
                        children: [
                          Container(
                            width: 100,
                            height: 100,
                            decoration: BoxDecoration(
                              shape: BoxShape.circle,
                              border: Border.all(color: cs.surface, width: 4),
                              color: cs.primaryContainer,
                            ),
                            child: ClipOval(
                              child: Icon(
                                Icons.person_rounded,
                                size: 60,
                                color: cs.primary,
                              ),
                            ),
                          ),
                          if (_isEditing)
                            Positioned(
                              bottom: 0,
                              right: 0,
                              child: GestureDetector(
                                onTap: () {
                                  /* Pick image */
                                },
                                child: Container(
                                  width: 32,
                                  height: 32,
                                  decoration: BoxDecoration(
                                    color: cs.primary,
                                    shape: BoxShape.circle,
                                    border: Border.all(
                                      color: cs.surface,
                                      width: 2,
                                    ),
                                  ),
                                  child: const Icon(
                                    Icons.camera_alt_rounded,
                                    color: Colors.white,
                                    size: 16,
                                  ),
                                ),
                              ),
                            ),
                        ],
                      ),
                      const SizedBox(height: 12),
                      if (!_isEditing) ...[
                        Text(
                          _nameController.text,
                          style: theme.textTheme.titleLarge?.copyWith(
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          '@alexjohnson',
                          style: TextStyle(color: cs.onSurfaceVariant),
                        ),
                      ],
                    ],
                  ),
                ),

                // ── Stats row ─────────────────────────────────────
                if (!_isEditing)
                  Padding(
                    padding: const EdgeInsets.only(bottom: 24),
                    child: Row(
                      mainAxisAlignment: MainAxisAlignment.spaceEvenly,
                      children: const [
                        _StatItem(label: 'Posts', value: '142'),
                        _Divider(),
                        _StatItem(label: 'Followers', value: '4.8K'),
                        _Divider(),
                        _StatItem(label: 'Following', value: '289'),
                      ],
                    ),
                  ),

                // ── Info / Edit section ───────────────────────────
                Padding(
                  padding: const EdgeInsets.symmetric(horizontal: 24),
                  child: _isEditing
                      ? _buildEditForm(theme, cs)
                      : _buildInfoView(theme, cs),
                ),

                const SizedBox(height: 32),
              ],
            ),
          ),
        ],
      ),
    );
  }

  Widget _buildInfoView(ThemeData theme, ColorScheme cs) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (_bioController.text.isNotEmpty) ...[
          Text(
            _bioController.text,
            style: theme.textTheme.bodyLarge?.copyWith(height: 1.5),
            textAlign: TextAlign.center,
          ),
          const SizedBox(height: 20),
        ],
        _InfoRow(
          icon: Icons.location_on_outlined,
          text: _locationController.text,
        ),
        const SizedBox(height: 12),
        _InfoRow(
          icon: Icons.link_rounded,
          text: _websiteController.text,
          isLink: true,
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          child: OutlinedButton(
            onPressed: () => setState(() => _isEditing = true),
            style: OutlinedButton.styleFrom(
              padding: const EdgeInsets.symmetric(vertical: 14),
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: const Text('Edit Profile'),
          ),
        ),
      ],
    );
  }

  Widget _buildEditForm(ThemeData theme, ColorScheme cs) {
    final border = OutlineInputBorder(borderRadius: BorderRadius.circular(12));
    final fill = cs.surfaceContainerHighest.withValues(alpha: 0.4);

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        TextFormField(
          controller: _nameController,
          decoration: InputDecoration(
            labelText: 'Full Name',
            border: border,
            filled: true,
            fillColor: fill,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _bioController,
          maxLines: 3,
          decoration: InputDecoration(
            labelText: 'Bio',
            alignLabelWithHint: true,
            border: border,
            filled: true,
            fillColor: fill,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _locationController,
          decoration: InputDecoration(
            labelText: 'Location',
            prefixIcon: const Icon(Icons.location_on_outlined),
            border: border,
            filled: true,
            fillColor: fill,
          ),
        ),
        const SizedBox(height: 16),
        TextFormField(
          controller: _websiteController,
          keyboardType: TextInputType.url,
          decoration: InputDecoration(
            labelText: 'Website',
            prefixIcon: const Icon(Icons.link_rounded),
            border: border,
            filled: true,
            fillColor: fill,
          ),
        ),
        const SizedBox(height: 28),
        SizedBox(
          width: double.infinity,
          height: 52,
          child: FilledButton(
            onPressed: _isSaving ? null : _save,
            style: FilledButton.styleFrom(
              shape: RoundedRectangleBorder(
                borderRadius: BorderRadius.circular(12),
              ),
            ),
            child: _isSaving
                ? const SizedBox(
                    width: 22,
                    height: 22,
                    child: CircularProgressIndicator(
                      strokeWidth: 2.5,
                      color: Colors.white,
                    ),
                  )
                : const Text(
                    'Save Changes',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.w600),
                  ),
          ),
        ),
      ],
    );
  }
}

// ── Helper widgets ─────────────────────────────────────────────────────────

class _StatItem extends StatelessWidget {
  final String label;
  final String value;

  const _StatItem({required this.label, required this.value});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Column(
      children: [
        Text(
          value,
          style: theme.textTheme.titleLarge?.copyWith(
            fontWeight: FontWeight.bold,
          ),
        ),
        const SizedBox(height: 4),
        Text(
          label,
          style: TextStyle(
            color: theme.colorScheme.onSurfaceVariant,
            fontSize: 13,
          ),
        ),
      ],
    );
  }
}

class _Divider extends StatelessWidget {
  const _Divider();

  @override
  Widget build(BuildContext context) {
    return Container(
      height: 32,
      width: 1,
      color: Theme.of(context).colorScheme.outline,
    );
  }
}

class _InfoRow extends StatelessWidget {
  final IconData icon;
  final String text;
  final bool isLink;

  const _InfoRow({required this.icon, required this.text, this.isLink = false});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Row(
      children: [
        Icon(icon, size: 18, color: cs.onSurfaceVariant),
        const SizedBox(width: 8),
        Text(
          text,
          style: TextStyle(
            color: isLink ? cs.primary : cs.onSurface,
            fontSize: 14,
            decoration: isLink ? TextDecoration.underline : null,
          ),
        ),
      ],
    );
  }
}
```

## Dependencies

No extra packages. For image picking, add:
- `image_picker: ^1.1.0`

## Customization Tips

- Replace the placeholder icon avatar with `CachedNetworkImage` for real user avatars
- Hook `_save()` to your update-profile API / Firestore document update
- Add a `TabBar` below the stats for Posts / Likes / Media grids
