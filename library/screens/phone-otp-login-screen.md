---
id: phone-otp-login-screen
title: Phone & OTP Login Screen
sidebar_label: Phone OTP Login
---

# Phone & OTP Login Screen

A two-step authentication screen with country code picker, phone number entry, and an animated OTP (One-Time Password) input with auto-focus and auto-submit behavior. Perfect for SMS-based authentication flows.

## Features
- 🌍 Country code dropdown picker
- 📱 Phone number field with numeric keyboard
- 🔢 6-digit OTP input with auto-advance focus
- ⏱️ Resend OTP countdown timer
- ✅ Auto-submit when last digit is entered
- 🔄 Step-based page transition animation

## Flutter Code

```dart
import 'dart:async';
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

// ─── Step 1: Phone Entry ────────────────────────────────────────────────────

class PhoneLoginScreen extends StatefulWidget {
  const PhoneLoginScreen({super.key});

  @override
  State<PhoneLoginScreen> createState() => _PhoneLoginScreenState();
}

class _PhoneLoginScreenState extends State<PhoneLoginScreen> {
  final _phoneController = TextEditingController();
  String _selectedCode = '+1';
  bool _isLoading = false;

  final List<Map<String, String>> _countryCodes = const [
    {'code': '+1', 'flag': '🇺🇸', 'name': 'United States'},
    {'code': '+44', 'flag': '🇬🇧', 'name': 'United Kingdom'},
    {'code': '+91', 'flag': '🇮🇳', 'name': 'India'},
    {'code': '+61', 'flag': '🇦🇺', 'name': 'Australia'},
    {'code': '+49', 'flag': '🇩🇪', 'name': 'Germany'},
    {'code': '+33', 'flag': '🇫🇷', 'name': 'France'},
  ];

  Future<void> _sendOtp() async {
    final phone = _phoneController.text.trim();
    if (phone.length < 7) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Enter a valid phone number')),
      );
      return;
    }
    setState(() => _isLoading = true);
    await Future.delayed(const Duration(seconds: 1)); // Replace with SMS send
    if (!mounted) return;
    setState(() => _isLoading = false);
    Navigator.of(context).push(
      MaterialPageRoute(
        builder: (_) => OtpVerificationScreen(
          phoneNumber: '$_selectedCode ${_phoneController.text}',
        ),
      ),
    );
  }

  @override
  void dispose() {
    _phoneController.dispose();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Container(
              width: 60,
              height: 60,
              decoration: BoxDecoration(
                color: cs.primaryContainer,
                borderRadius: BorderRadius.circular(16),
              ),
              child: Icon(
                Icons.phone_outlined,
                color: cs.primary,
                size: 28,
              ),
            ),
            const SizedBox(height: 24),
            Text(
              'Enter your phone\nnumber',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
                height: 1.2,
              ),
            ),
            const SizedBox(height: 12),
            Text(
              'We\'ll send you a verification code to confirm your identity.',
              style: theme.textTheme.bodyLarge?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 40),

            // Phone input row
            Container(
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(12),
                border: Border.all(color: cs.outline),
                color: cs.surfaceContainerHighest.withOpacity(0.4),
              ),
              child: Row(
                children: [
                  // Country code picker
                  DropdownButtonHideUnderline(
                    child: ButtonTheme(
                      alignedDropdown: true,
                      child: DropdownButton<String>(
                        value: _selectedCode,
                        borderRadius: BorderRadius.circular(12),
                        items: _countryCodes
                            .map(
                              (c) => DropdownMenuItem(
                                value: c['code'],
                                child: Text(
                                  '${c['flag']} ${c['code']}',
                                  style: const TextStyle(fontSize: 14),
                                ),
                              ),
                            )
                            .toList(),
                        onChanged: (v) =>
                            setState(() => _selectedCode = v ?? '+1'),
                      ),
                    ),
                  ),
                  Container(
                    width: 1,
                    height: 28,
                    color: cs.outline,
                  ),
                  Expanded(
                    child: TextField(
                      controller: _phoneController,
                      keyboardType: TextInputType.phone,
                      textInputAction: TextInputAction.done,
                      onSubmitted: (_) => _sendOtp(),
                      inputFormatters: [
                        FilteringTextInputFormatter.digitsOnly,
                        LengthLimitingTextInputFormatter(12),
                      ],
                      decoration: const InputDecoration(
                        border: InputBorder.none,
                        hintText: '555 000 0000',
                        contentPadding:
                            EdgeInsets.symmetric(horizontal: 16, vertical: 14),
                      ),
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 32),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: _isLoading ? null : _sendOtp,
                style: FilledButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isLoading
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Send Verification Code',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
          ],
        ),
      ),
    );
  }
}

// ─── Step 2: OTP Verification ───────────────────────────────────────────────

class OtpVerificationScreen extends StatefulWidget {
  final String phoneNumber;

  const OtpVerificationScreen({super.key, required this.phoneNumber});

  @override
  State<OtpVerificationScreen> createState() => _OtpVerificationScreenState();
}

class _OtpVerificationScreenState extends State<OtpVerificationScreen> {
  static const int _otpLength = 6;
  static const int _resendSeconds = 60;

  final List<TextEditingController> _controllers =
      List.generate(_otpLength, (_) => TextEditingController());
  final List<FocusNode> _focusNodes =
      List.generate(_otpLength, (_) => FocusNode());

  int _secondsLeft = _resendSeconds;
  Timer? _timer;
  bool _isVerifying = false;

  @override
  void initState() {
    super.initState();
    _startTimer();
    WidgetsBinding.instance.addPostFrameCallback(
      (_) => _focusNodes[0].requestFocus(),
    );
  }

  void _startTimer() {
    _timer?.cancel();
    setState(() => _secondsLeft = _resendSeconds);
    _timer = Timer.periodic(const Duration(seconds: 1), (t) {
      if (_secondsLeft == 0) {
        t.cancel();
      } else {
        setState(() => _secondsLeft--);
      }
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    for (final c in _controllers) {
      c.dispose();
    }
    for (final f in _focusNodes) {
      f.dispose();
    }
    super.dispose();
  }

  void _onOtpChanged(String value, int index) {
    if (value.length == 1 && index < _otpLength - 1) {
      _focusNodes[index + 1].requestFocus();
    } else if (value.isEmpty && index > 0) {
      _focusNodes[index - 1].requestFocus();
    }

    // Auto-submit when all fields filled
    final fullOtp = _controllers.map((c) => c.text).join();
    if (fullOtp.length == _otpLength) {
      _verifyOtp(fullOtp);
    }
  }

  Future<void> _verifyOtp(String otp) async {
    setState(() => _isVerifying = true);
    await Future.delayed(const Duration(seconds: 1)); // Replace with real verify
    if (!mounted) return;
    setState(() => _isVerifying = false);
    // Navigate to home on success
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(backgroundColor: Colors.transparent, elevation: 0),
      body: Padding(
        padding: const EdgeInsets.symmetric(horizontal: 24),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const SizedBox(height: 24),
            Text(
              'Enter OTP',
              style: theme.textTheme.headlineMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            RichText(
              text: TextSpan(
                style: theme.textTheme.bodyLarge?.copyWith(
                  color: cs.onSurfaceVariant,
                ),
                children: [
                  const TextSpan(text: 'A 6-digit code was sent to '),
                  TextSpan(
                    text: widget.phoneNumber,
                    style: TextStyle(
                      color: cs.onSurface,
                      fontWeight: FontWeight.w600,
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 40),

            // OTP boxes
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: List.generate(_otpLength, (index) {
                return SizedBox(
                  width: 48,
                  height: 58,
                  child: TextFormField(
                    controller: _controllers[index],
                    focusNode: _focusNodes[index],
                    keyboardType: TextInputType.number,
                    textAlign: TextAlign.center,
                    maxLength: 1,
                    inputFormatters: [FilteringTextInputFormatter.digitsOnly],
                    style: theme.textTheme.headlineSmall?.copyWith(
                      fontWeight: FontWeight.bold,
                    ),
                    decoration: InputDecoration(
                      counterText: '',
                      border: OutlineInputBorder(
                        borderRadius: BorderRadius.circular(12),
                      ),
                      filled: true,
                      fillColor:
                          cs.surfaceContainerHighest.withOpacity(0.4),
                    ),
                    onChanged: (v) => _onOtpChanged(v, index),
                  ),
                );
              }),
            ),
            const SizedBox(height: 40),

            SizedBox(
              width: double.infinity,
              height: 52,
              child: FilledButton(
                onPressed: _isVerifying
                    ? null
                    : () {
                        final otp =
                            _controllers.map((c) => c.text).join();
                        if (otp.length == _otpLength) _verifyOtp(otp);
                      },
                style: FilledButton.styleFrom(
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(12),
                  ),
                ),
                child: _isVerifying
                    ? const SizedBox(
                        width: 22,
                        height: 22,
                        child: CircularProgressIndicator(
                          strokeWidth: 2.5,
                          color: Colors.white,
                        ),
                      )
                    : const Text(
                        'Verify Code',
                        style: TextStyle(
                            fontSize: 16, fontWeight: FontWeight.w600),
                      ),
              ),
            ),
            const SizedBox(height: 24),

            // Resend
            Center(
              child: _secondsLeft > 0
                  ? Text(
                      'Resend code in ${_secondsLeft}s',
                      style: TextStyle(color: cs.onSurfaceVariant),
                    )
                  : TextButton(
                      onPressed: _startTimer,
                      child: const Text('Resend Code'),
                    ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Dependencies

No extra packages required. For real SMS OTP, integrate:
- `firebase_auth` — Firebase Phone Auth
- `flutter_otp_text_field` — alternative OTP widget

## Customization Tips

- Replace the `_otpLength` constant to support 4-digit or 8-digit OTPs
- Integrate `firebase_auth.verifyPhoneNumber()` in `_sendOtp()`
- Paste-from-clipboard: listen to `_controllers[0]` and split pasted value across all boxes
