---
id: login-screen
title: Modern Login & OTP Screen
sidebar_label: Login Screen
---

# Modern Login & OTP Screen

A clean authentication screen template with animated floating labels, phone number verification, and social login buttons.

## Features
- 🎨 Animated text input fields
- 📱 Responsive layout for Mobile & Web
- 🔑 Form validation out of the box

## Flutter Code Snippet

```dart
import 'package:flutter/material.dart';

class LoginScreen extends StatelessWidget {
  const LoginScreen({Key? key}) : super(key: key);

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      body: Center(
        child: Text('Login Screen Content'),
      ),
    );
  }
}