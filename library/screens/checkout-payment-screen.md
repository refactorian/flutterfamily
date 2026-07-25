---
id: checkout-payment-screen
title: Checkout & Payment Screen
sidebar_label: Checkout & Payment
---

# Checkout & Payment Screen

A production-ready e-commerce checkout and payment selection screen. Includes payment method selectors (Credit Card, Apple Pay, PayPal), credit card form inputs with formatting, delivery address card, order breakdown summary, and a fixed Pay button with loading state.

## Features
- 💳 Multi-payment option selector (Credit Card, Apple/Google Pay, PayPal)
- 📝 Formatted card number, expiry, and CVV text fields
- 📍 Selectable shipping address card with change button
- 🧾 Detailed order subtotal, shipping fee, tax, and total breakdown
- 🔒 Secure SSL payment trust badge & animated pay button

## Screen Code

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

enum PaymentMethod { creditCard, applePay, paypal }

class CheckoutPaymentScreen extends StatefulWidget {
  const CheckoutPaymentScreen({super.key});

  @override
  State<CheckoutPaymentScreen> createState() => _CheckoutPaymentScreenState();
}

class _CheckoutPaymentScreenState extends State<CheckoutPaymentScreen> {
  PaymentMethod _selectedMethod = PaymentMethod.creditCard;
  final _formKey = GlobalKey<FormState>();
  final _cardNumberController = TextEditingController();
  final _expiryController = TextEditingController();
  final _cvvController = TextEditingController();
  final _nameController = TextEditingController();
  bool _saveCard = true;
  bool _isProcessing = false;

  @override
  void dispose() {
    _cardNumberController.dispose();
    _expiryController.dispose();
    _cvvController.dispose();
    _nameController.dispose();
    super.dispose();
  }

  void _handlePay() async {
    if (_selectedMethod == PaymentMethod.creditCard) {
      if (!_formKey.currentState!.validate()) return;
    }

    setState(() => _isProcessing = true);
    await Future.delayed(const Duration(seconds: 2));

    if (!mounted) return;
    setState(() => _isProcessing = false);

    showModalBottomSheet(
      context: context,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => const _PaymentSuccessSheet(),
    );
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Checkout', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // ── Shipping Address Section ───────────────────────
                const Text('Shipping Address', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 10),
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest.withOpacity(0.3),
                    borderRadius: BorderRadius.circular(16),
                    border: Border.all(color: cs.outlineVariant),
                  ),
                  child: Row(
                    children: [
                      Container(
                        padding: const EdgeInsets.all(10),
                        decoration: BoxDecoration(
                          color: cs.primaryContainer,
                          shape: BoxShape.circle,
                        ),
                        child: Icon(Icons.location_on_rounded, color: cs.primary, size: 20),
                      ),
                      const SizedBox(width: 14),
                      const Expanded(
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text('Home Address', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                            SizedBox(height: 2),
                            Text('742 Evergreen Terrace, Springfield', style: TextStyle(color: Colors.grey, fontSize: 12)),
                          ],
                        ),
                      ),
                      TextButton(onPressed: () {}, child: const Text('Change')),
                    ],
                  ),
                ),
                const SizedBox(height: 24),

                // ── Payment Methods Selector ──────────────────────
                const Text('Payment Method', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                const SizedBox(height: 12),
                Row(
                  children: [
                    _PaymentTile(
                      method: PaymentMethod.creditCard,
                      icon: Icons.credit_card_rounded,
                      label: 'Card',
                      selected: _selectedMethod == PaymentMethod.creditCard,
                      onTap: () => setState(() => _selectedMethod = PaymentMethod.creditCard),
                    ),
                    const SizedBox(width: 10),
                    _PaymentTile(
                      method: PaymentMethod.applePay,
                      icon: Icons.apple_rounded,
                      label: 'Apple Pay',
                      selected: _selectedMethod == PaymentMethod.applePay,
                      onTap: () => setState(() => _selectedMethod = PaymentMethod.applePay),
                    ),
                    const SizedBox(width: 10),
                    _PaymentTile(
                      method: PaymentMethod.paypal,
                      icon: Icons.account_balance_wallet_rounded,
                      label: 'PayPal',
                      selected: _selectedMethod == PaymentMethod.paypal,
                      onTap: () => setState(() => _selectedMethod = PaymentMethod.paypal),
                    ),
                  ],
                ),
                const SizedBox(height: 20),

                // ── Credit Card Inputs ─────────────────────────────
                if (_selectedMethod == PaymentMethod.creditCard)
                  Form(
                    key: _formKey,
                    child: Column(
                      children: [
                        TextFormField(
                          controller: _nameController,
                          decoration: InputDecoration(
                            labelText: 'Cardholder Name',
                            prefixIcon: const Icon(Icons.person_outline_rounded),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                        ),
                        const SizedBox(height: 14),
                        TextFormField(
                          controller: _cardNumberController,
                          keyboardType: TextInputType.number,
                          inputFormatters: [
                            FilteringTextInputFormatter.digitsOnly,
                            LengthLimitingTextInputFormatter(16),
                          ],
                          decoration: InputDecoration(
                            labelText: 'Card Number',
                            prefixIcon: const Icon(Icons.credit_card),
                            border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                          ),
                          validator: (v) => v == null || v.length < 16 ? 'Invalid Card Number' : null,
                        ),
                        const SizedBox(height: 14),
                        Row(
                          children: [
                            Expanded(
                              child: TextFormField(
                                controller: _expiryController,
                                keyboardType: TextInputType.number,
                                decoration: InputDecoration(
                                  labelText: 'Expiry (MM/YY)',
                                  prefixIcon: const Icon(Icons.calendar_month_rounded),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                validator: (v) => v == null || v.isEmpty ? 'Required' : null,
                              ),
                            ),
                            const SizedBox(width: 12),
                            Expanded(
                              child: TextFormField(
                                controller: _cvvController,
                                keyboardType: TextInputType.number,
                                obscureText: true,
                                inputFormatters: [
                                  FilteringTextInputFormatter.digitsOnly,
                                  LengthLimitingTextInputFormatter(4),
                                ],
                                decoration: InputDecoration(
                                  labelText: 'CVV',
                                  prefixIcon: const Icon(Icons.lock_outline_rounded),
                                  border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
                                ),
                                validator: (v) => v == null || v.length < 3 ? 'Invalid' : null,
                              ),
                            ),
                          ],
                        ),
                        const SizedBox(height: 10),
                        SwitchListTile(
                          contentPadding: EdgeInsets.zero,
                          title: const Text('Save card for future purchases', style: TextStyle(fontSize: 13)),
                          value: _saveCard,
                          onChanged: (v) => setState(() => _saveCard = v),
                        ),
                      ],
                    ),
                  ),

                const SizedBox(height: 20),

                // ── Order Summary Box ──────────────────────────────
                Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: cs.surfaceContainerHighest.withOpacity(0.2),
                    borderRadius: BorderRadius.circular(16),
                  ),
                  child: const Column(
                    children: [
                      _SummaryRow(label: 'Subtotal', value: '\$189.99'),
                      SizedBox(height: 8),
                      _SummaryRow(label: 'Shipping', value: '\$5.00'),
                      SizedBox(height: 8),
                      _SummaryRow(label: 'Tax (8%)', value: '\$15.20'),
                      Divider(height: 20),
                      _SummaryRow(label: 'Total', value: '\$210.19', isTotal: true),
                    ],
                  ),
                ),
              ],
            ),
          ),

          // ── Sticky Pay Button ────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: SizedBox(
                width: double.infinity,
                height: 52,
                child: FilledButton(
                  onPressed: _isProcessing ? null : _handlePay,
                  style: FilledButton.styleFrom(
                    shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(14)),
                  ),
                  child: _isProcessing
                      ? const SizedBox(
                          width: 24,
                          height: 24,
                          child: CircularProgressIndicator(color: Colors.white, strokeWidth: 2.5),
                        )
                      : const Row(
                          mainAxisAlignment: MainAxisAlignment.center,
                          children: [
                            Icon(Icons.lock_rounded, size: 18),
                            SizedBox(width: 8),
                            Text('Pay \$210.19', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                          ],
                        ),
                ),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _PaymentTile extends StatelessWidget {
  final PaymentMethod method;
  final IconData icon;
  final String label;
  final bool selected;
  final VoidCallback onTap;

  const _PaymentTile({
    required this.method,
    required this.icon,
    required this.label,
    required this.selected,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Expanded(
      child: GestureDetector(
        onTap: onTap,
        child: AnimatedContainer(
          duration: const Duration(milliseconds: 200),
          padding: const EdgeInsets.symmetric(vertical: 14),
          decoration: BoxDecoration(
            color: selected ? cs.primaryContainer : cs.surface,
            borderRadius: BorderRadius.circular(14),
            border: Border.all(
              color: selected ? cs.primary : cs.outlineVariant,
              width: selected ? 2 : 1,
            ),
          ),
          child: Column(
            children: [
              Icon(icon, color: selected ? cs.primary : cs.onSurfaceVariant),
              const SizedBox(height: 6),
              Text(
                label,
                style: TextStyle(
                  fontSize: 12,
                  fontWeight: selected ? FontWeight.bold : FontWeight.normal,
                  color: selected ? cs.primary : cs.onSurfaceVariant,
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}

class _SummaryRow extends StatelessWidget {
  final String label;
  final String value;
  final bool isTotal;

  const _SummaryRow({required this.label, required this.value, this.isTotal = false});

  @override
  Widget build(BuildContext context) {
    return Row(
      mainAxisAlignment: MainAxisAlignment.spaceBetween,
      children: [
        Text(
          label,
          style: TextStyle(
            fontSize: isTotal ? 16 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.normal,
            color: isTotal ? Colors.black : Colors.grey.shade600,
          ),
        ),
        Text(
          value,
          style: TextStyle(
            fontSize: isTotal ? 18 : 14,
            fontWeight: isTotal ? FontWeight.bold : FontWeight.w600,
            color: isTotal ? Theme.of(context).colorScheme.primary : Colors.black,
          ),
        ),
      ],
    );
  }
}

class _PaymentSuccessSheet extends StatelessWidget {
  const _PaymentSuccessSheet();

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.all(28),
      child: Column(
        mainAxisSize: MainAxisSize.min,
        children: [
          Container(
            padding: const EdgeInsets.all(16),
            decoration: const BoxDecoration(color: Colors.green, shape: BoxShape.circle),
            child: const Icon(Icons.check_rounded, color: Colors.white, size: 40),
          ),
          const SizedBox(height: 16),
          const Text('Payment Successful!', style: TextStyle(fontSize: 22, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          const Text('Order #94820 confirmed. We will notify you once shipped.', textAlign: TextAlign.center, style: TextStyle(color: Colors.grey)),
          const SizedBox(height: 24),
          SizedBox(
            width: double.infinity,
            child: FilledButton(
              onPressed: () {
                Navigator.pop(context);
                Navigator.pop(context);
              },
              child: const Text('Back to Store'),
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
  MaterialPageRoute(builder: (_) => const CheckoutPaymentScreen()),
);
```
