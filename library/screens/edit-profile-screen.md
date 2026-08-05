---
id: edit-profile-screen
title: Edit Profile & Security Screen
sidebar_label: Edit Profile
---

# Edit Profile & Security Screen

A comprehensive profile management screen. Features avatar image picker with camera overlay, personal information form (Name, Email, Bio, Phone), password change section, notification preference toggles, and account deletion dialog trigger.

## Features
- 📷 Profile avatar with camera edit badge overlay
- 📝 Form validation for Name, Email, Bio, and Phone
- 🔑 Security section with Password Update trigger
- 🔔 Preferences toggle section
- 🗑️ Danger Zone with red Delete Account modal dialog

## Screen Code

```dart
import 'package:flutter/material.dart';

class EditProfileScreen extends StatefulWidget {
  const EditProfileScreen({super.key});

  @override
  State<EditProfileScreen> createState() => _EditProfileScreenState();
}

class _EditProfileScreenState extends State<EditProfileScreen> {
  final _formKey = GlobalKey<FormState>();
  late TextEditingController _nameController;
  late TextEditingController _emailController;
  late TextEditingController _phoneController;
  late TextEditingController _bioController;
  bool _emailNotifs = true;
  bool _pushNotifs = true;

  @override
  void initState() {
    super.initState();
    _nameController = TextEditingController(text: 'Alex Johnson');
    _emailController = TextEditingController(text: 'alex.johnson@example.com');
    _phoneController = TextEditingController(text: '+1 (555) 234-5678');
    _bioController = TextEditingController(
      text:
          'Flutter developer & UI designer crafting clean mobile experiences.',
    );
  }

  @override
  void dispose() {
    _nameController.dispose();
    _emailController.dispose();
    _phoneController.dispose();
    _bioController.dispose();
    super.dispose();
  }

  void _saveProfile() {
    if (_formKey.currentState!.validate()) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Profile updated successfully!'),
          backgroundColor: Colors.green,
        ),
      );
    }
  }

  void _showDeleteAccountDialog() {
    showDialog(
      context: context,
      builder: (context) => AlertDialog(
        title: const Text('Delete Account?'),
        content: const Text(
          'This action is permanent and cannot be undone. All your data will be wiped.',
        ),
        actions: [
          TextButton(
            onPressed: () => Navigator.pop(context),
            child: const Text('Cancel'),
          ),
          FilledButton(
            style: FilledButton.styleFrom(backgroundColor: Colors.red),
            onPressed: () => Navigator.pop(context),
            child: const Text('Delete Permanently'),
          ),
        ],
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        title: const Text(
          'Edit Profile',
          style: TextStyle(fontWeight: FontWeight.bold),
        ),
        actions: [
          TextButton(
            onPressed: _saveProfile,
            child: const Text(
              'Save',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
          ),
        ],
      ),
      body: Form(
        key: _formKey,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            // ── Avatar Edit Header ───────────────────────────────
            Center(
              child: Stack(
                children: [
                  const CircleAvatar(
                    radius: 50,
                    backgroundImage: NetworkImage(
                      'https://i.pravatar.cc/300?img=11',
                    ),
                  ),
                  Positioned(
                    right: 0,
                    bottom: 0,
                    child: Container(
                      padding: const EdgeInsets.all(8),
                      decoration: const BoxDecoration(
                        color: Colors.indigo,
                        shape: BoxShape.circle,
                      ),
                      child: const Icon(
                        Icons.camera_alt_rounded,
                        color: Colors.white,
                        size: 18,
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Personal Info Form ───────────────────────────────
            const Text(
              'Personal Information',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _nameController,
              decoration: InputDecoration(
                labelText: 'Full Name',
                prefixIcon: const Icon(Icons.person_outline_rounded),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) => v == null || v.isEmpty ? 'Required' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _emailController,
              keyboardType: TextInputType.emailAddress,
              decoration: InputDecoration(
                labelText: 'Email Address',
                prefixIcon: const Icon(Icons.email_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              validator: (v) =>
                  v == null || !v.contains('@') ? 'Invalid Email' : null,
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _phoneController,
              keyboardType: TextInputType.phone,
              decoration: InputDecoration(
                labelText: 'Phone Number',
                prefixIcon: const Icon(Icons.phone_outlined),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 14),
            TextFormField(
              controller: _bioController,
              maxLines: 3,
              decoration: InputDecoration(
                labelText: 'Bio',
                prefixIcon: const Icon(Icons.info_outline_rounded),
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
            ),
            const SizedBox(height: 28),

            // ── Security & Preferences ──────────────────────────
            const Text(
              'Preferences',
              style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Push Notifications'),
              subtitle: const Text('Receive activity updates'),
              value: _pushNotifs,
              onChanged: (v) => setState(() => _pushNotifs = v),
            ),
            SwitchListTile(
              contentPadding: EdgeInsets.zero,
              title: const Text('Email Digest'),
              subtitle: const Text('Weekly summary newsletters'),
              value: _emailNotifs,
              onChanged: (v) => setState(() => _emailNotifs = v),
            ),
            const SizedBox(height: 20),

            // ── Danger Zone ──────────────────────────────────────
            const Text(
              'Danger Zone',
              style: TextStyle(fontWeight: FontWeight.bold, color: Colors.red),
            ),
            const SizedBox(height: 8),
            OutlinedButton.icon(
              style: OutlinedButton.styleFrom(
                foregroundColor: Colors.red,
                side: const BorderSide(color: Colors.red),
                shape: RoundedRectangleBorder(
                  borderRadius: BorderRadius.circular(12),
                ),
              ),
              onPressed: _showDeleteAccountDialog,
              icon: const Icon(Icons.delete_forever_rounded),
              label: const Text('Delete Account'),
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
Navigator.push(
  context,
  MaterialPageRoute(builder: (_) => const EditProfileScreen()),
);
```
