---
id: settings-screen
title: App Settings Screen
sidebar_label: Settings
---

# App Settings Screen

A production-quality settings screen organized with sectioned `ListView`, toggle switches, radio option sheets, navigation tiles, and a sign-out button with confirmation dialog. Follows Material 3 design patterns.

## Features
- 📋 Sectioned list with headers
- 🌙 Dark mode toggle with live theme switching
- 🔔 Notification toggle switches
- 🌍 Language picker (bottom sheet)
- 🔒 Biometric lock toggle
- 🚪 Sign out with confirmation dialog
- 💾 In-memory state (wire to Provider/Riverpod)

## Flutter Code

```dart
import 'package:flutter/material.dart';

class SettingsScreen extends StatefulWidget {
  const SettingsScreen({super.key});

  @override
  State<SettingsScreen> createState() => _SettingsScreenState();
}

class _SettingsScreenState extends State<SettingsScreen> {
  // ── Preferences state ──────────────────────────────────────────
  bool _darkMode = false;
  bool _pushNotifications = true;
  bool _emailNotifications = false;
  bool _biometricLock = false;
  String _selectedLanguage = 'English';

  final List<String> _languages = [
    'English',
    'Spanish',
    'French',
    'German',
    'Arabic',
    'Japanese',
  ];

  void _showLanguagePicker() {
    showModalBottomSheet<void>(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(20)),
      ),
      builder: (context) => ListView(
        shrinkWrap: true,
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          Padding(
            padding: const EdgeInsets.fromLTRB(20, 8, 20, 12),
            child: Text(
              'Select Language',
              style: Theme.of(context).textTheme.titleMedium?.copyWith(
                    fontWeight: FontWeight.bold,
                  ),
            ),
          ),
          ..._languages.map(
            (lang) => RadioListTile<String>(
              title: Text(lang),
              value: lang,
              groupValue: _selectedLanguage,
              onChanged: (v) {
                if (v != null) {
                  setState(() => _selectedLanguage = v);
                  Navigator.pop(context);
                }
              },
            ),
          ),
          const SizedBox(height: 8),
        ],
      ),
    );
  }

  void _showSignOutDialog() {
    showDialog<void>(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Sign Out'),
        content: const Text(
            'Are you sure you want to sign out of your account?'),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            onPressed: () {
              Navigator.pop(context);
              // TODO: Sign out logic
            },
            style: FilledButton.styleFrom(
              backgroundColor: Colors.red,
            ),
            child: const Text('Sign Out'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: const Text('Settings'),
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
      ),
      body: ListView(
        children: [
          // ── Account ─────────────────────────────────────────────
          _SectionHeader(title: 'Account'),
          _ProfileTile(
            name: 'Alex Johnson',
            email: 'alex@example.com',
            onTap: () {/* Navigate to profile */},
          ),

          const SizedBox(height: 8),

          // ── Appearance ──────────────────────────────────────────
          _SectionHeader(title: 'Appearance'),
          _ToggleTile(
            icon: Icons.dark_mode_outlined,
            title: 'Dark Mode',
            value: _darkMode,
            onChanged: (v) => setState(() => _darkMode = v),
          ),
          _NavigationTile(
            icon: Icons.language_rounded,
            title: 'Language',
            subtitle: _selectedLanguage,
            onTap: _showLanguagePicker,
          ),

          const SizedBox(height: 8),

          // ── Notifications ───────────────────────────────────────
          _SectionHeader(title: 'Notifications'),
          _ToggleTile(
            icon: Icons.notifications_outlined,
            title: 'Push Notifications',
            value: _pushNotifications,
            onChanged: (v) => setState(() => _pushNotifications = v),
          ),
          _ToggleTile(
            icon: Icons.email_outlined,
            title: 'Email Notifications',
            value: _emailNotifications,
            onChanged: (v) => setState(() => _emailNotifications = v),
          ),

          const SizedBox(height: 8),

          // ── Security ────────────────────────────────────────────
          _SectionHeader(title: 'Security & Privacy'),
          _ToggleTile(
            icon: Icons.fingerprint_rounded,
            title: 'Biometric Lock',
            subtitle: 'Use fingerprint or face ID to unlock',
            value: _biometricLock,
            onChanged: (v) => setState(() => _biometricLock = v),
          ),
          _NavigationTile(
            icon: Icons.lock_reset_rounded,
            title: 'Change Password',
            onTap: () {/* Navigate to change password */},
          ),
          _NavigationTile(
            icon: Icons.privacy_tip_outlined,
            title: 'Privacy Policy',
            onTap: () {/* Open privacy policy */},
          ),

          const SizedBox(height: 8),

          // ── About ───────────────────────────────────────────────
          _SectionHeader(title: 'About'),
          _NavigationTile(
            icon: Icons.info_outlined,
            title: 'App Version',
            subtitle: '2.4.1 (Build 104)',
            onTap: null,
          ),
          _NavigationTile(
            icon: Icons.star_outline_rounded,
            title: 'Rate this App',
            onTap: () {/* Open app store */},
          ),
          _NavigationTile(
            icon: Icons.help_outline_rounded,
            title: 'Help & Support',
            onTap: () {/* Open support */},
          ),

          const SizedBox(height: 24),

          // ── Sign Out ────────────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: OutlinedButton.icon(
              onPressed: _showSignOutDialog,
              icon: const Icon(Icons.logout_rounded, color: Colors.red),
              label: const Text(
                'Sign Out',
                style: TextStyle(color: Colors.red, fontWeight: FontWeight.w600),
              ),
              style: OutlinedButton.styleFrom(
                padding: const EdgeInsets.symmetric(vertical: 14),
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
          ),
          const SizedBox(height: 40),
        ],
      ),
    );
  }
}

// ── Reusable list widgets ──────────────────────────────────────────────────

class _SectionHeader extends StatelessWidget {
  final String title;
  const _SectionHeader({required this.title});

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return Padding(
      padding: const EdgeInsets.fromLTRB(16, 20, 16, 6),
      child: Text(
        title.toUpperCase(),
        style: TextStyle(
          color: cs.primary,
          fontSize: 11,
          fontWeight: FontWeight.w700,
          letterSpacing: 1.2,
        ),
      ),
    );
  }
}

class _ToggleTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final bool value;
  final ValueChanged<bool> onChanged;

  const _ToggleTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.value,
    required this.onChanged,
  });

  @override
  Widget build(BuildContext context) {
    return SwitchListTile(
      secondary: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      value: value,
      onChanged: onChanged,
    );
  }
}

class _NavigationTile extends StatelessWidget {
  final IconData icon;
  final String title;
  final String? subtitle;
  final VoidCallback? onTap;

  const _NavigationTile({
    required this.icon,
    required this.title,
    this.subtitle,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    return ListTile(
      leading: Icon(icon),
      title: Text(title),
      subtitle: subtitle != null ? Text(subtitle!) : null,
      trailing: onTap != null
          ? const Icon(Icons.chevron_right_rounded)
          : null,
      onTap: onTap,
    );
  }
}

class _ProfileTile extends StatelessWidget {
  final String name;
  final String email;
  final VoidCallback onTap;

  const _ProfileTile({
    required this.name,
    required this.email,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    return ListTile(
      leading: CircleAvatar(
        backgroundColor: cs.primaryContainer,
        child: Text(
          name[0],
          style: TextStyle(
            color: cs.primary,
            fontWeight: FontWeight.bold,
          ),
        ),
      ),
      title: Text(name, style: const TextStyle(fontWeight: FontWeight.w600)),
      subtitle: Text(email),
      trailing: const Icon(Icons.chevron_right_rounded),
      onTap: onTap,
    );
  }
}
```

## Dependencies

No extra packages required. For real theme switching, use:
- `provider` or `flutter_riverpod` to expose `ThemeMode`

## Customization Tips

- Wrap the `MaterialApp` `themeMode` in a `StateNotifier` and toggle from `_darkMode`
- Use `local_auth` package to properly gate the biometric toggle
- Add `in_app_review` package to open native app-store rating dialog
