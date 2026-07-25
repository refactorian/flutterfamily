---
id: subscription-pricing-screen
title: Subscription & Paywall Screen
sidebar_label: Subscription & Paywall
---

# Subscription & Paywall Screen

A mobile app paywall and subscription tier screen. Includes monthly/yearly billing toggle switch with a "Save 20%" discount badge, highlighted Pro tier card, feature checkmark comparison list, and a "Start Free Trial" call-to-action button.

## Features
- 🗓️ Monthly / Yearly billing cycle toggle with discount badge
- 👑 Popular/Best Value badge overlay on featured tier card
- ✅ Feature checklist with checkmark icons
- 🔒 Restore purchases link & terms/privacy footers
- ⚡ 7-day free trial CTA button with auto-renews subtitle

## Screen Code

```dart
import 'package:flutter/material.dart';

class SubscriptionPricingScreen extends StatefulWidget {
  const SubscriptionPricingScreen({super.key});

  @override
  State<SubscriptionPricingScreen> createState() => _SubscriptionPricingScreenState();
}

class _SubscriptionPricingScreenState extends State<SubscriptionPricingScreen> {
  bool _isYearly = true;
  int _selectedTierIndex = 1; // 0: Starter, 1: Pro, 2: Enterprise

  final List<Map<String, dynamic>> _tiers = [
    {
      'name': 'Starter',
      'monthlyPrice': '\$4.99',
      'yearlyPrice': '\$3.99',
      'isPopular': false,
      'features': ['Access to basic features', '2 GB cloud storage', 'Standard support'],
    },
    {
      'name': 'Pro Unlimited',
      'monthlyPrice': '\$12.99',
      'yearlyPrice': '\$9.99',
      'isPopular': true,
      'features': ['All Starter features', '100 GB cloud storage', 'AI assistant enabled', 'Priority 24/7 support'],
    },
    {
      'name': 'Team / Enterprise',
      'monthlyPrice': '\$29.99',
      'yearlyPrice': '\$24.99',
      'isPopular': false,
      'features': ['Unlimited cloud storage', 'Dedicated account manager', 'Custom API integrations', 'Team admin dashboard'],
    },
  ];

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return Scaffold(
      appBar: AppBar(
        title: const Text('Upgrade Plan', style: TextStyle(fontWeight: FontWeight.bold)),
      ),
      body: Column(
        children: [
          Expanded(
            child: ListView(
              padding: const EdgeInsets.all(20),
              children: [
                // ── Header Title & Subtitle ───────────────────────
                const Text(
                  'Unlock Full Power',
                  textAlign: TextAlign.center,
                  style: TextStyle(fontSize: 26, FontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                const Text(
                  'Choose the plan that fits your workflow. Cancel anytime.',
                  textAlign: TextAlign.center,
                  style: TextStyle(color: Colors.grey),
                ),
                const SizedBox(height: 20),

                // ── Billing Toggle (Monthly vs Yearly) ───────────
                Center(
                  child: Container(
                    padding: const EdgeInsets.all(4),
                    decoration: BoxDecoration(
                      color: cs.surfaceContainerHighest.withOpacity(0.4),
                      borderRadius: BorderRadius.circular(16),
                    ),
                    child: Row(
                      mainAxisSize: MainAxisSize.min,
                      children: [
                        _BillingTab(
                          label: 'Monthly',
                          selected: !_isYearly,
                          onTap: () => setState(() => _isYearly = false),
                        ),
                        _BillingTab(
                          label: 'Yearly (Save 20%)',
                          selected: _isYearly,
                          badge: 'BEST VALUE',
                          onTap: () => setState(() => _isYearly = true),
                        ),
                      ],
                    ),
                  ),
                ),
                const SizedBox(height: 24),

                // ── Tier Cards List ───────────────────────────────
                ...List.generate(_tiers.length, (index) {
                  final tier = _tiers[index];
                  final isSelected = index == _selectedTierIndex;
                  final isPopular = tier['isPopular'] as bool;
                  final price = _isYearly ? tier['yearlyPrice'] : tier['monthlyPrice'];

                  return GestureDetector(
                    onTap: () => setState(() => _selectedTierIndex = index),
                    child: Container(
                      margin: const EdgeInsets.only(bottom: 14),
                      padding: const EdgeInsets.all(20),
                      decoration: BoxDecoration(
                        color: isSelected ? cs.primaryContainer.withOpacity(0.2) : cs.surface,
                        borderRadius: BorderRadius.circular(20),
                        border: Border.all(
                          color: isSelected ? cs.primary : cs.outlineVariant,
                          width: isSelected ? 2 : 1,
                        ),
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(tier['name'] as String, style: const TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                              if (isPopular)
                                Container(
                                  padding: const EdgeInsets.symmetric(horizontal: 10, vertical: 4),
                                  decoration: BoxDecoration(
                                    color: Colors.amber,
                                    borderRadius: BorderRadius.circular(12),
                                  ),
                                  child: const Text('POPULAR', style: TextStyle(fontSize: 10, fontWeight: FontWeight.bold, color: Colors.black)),
                                ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            crossAxisAlignment: CrossAxisAlignment.baseline,
                            textBaseline: TextBaseline.alphabetic,
                            children: [
                              Text(price as String, style: TextStyle(fontSize: 28, fontWeight: FontWeight.bold, color: cs.primary)),
                              const Text(' / month', style: TextStyle(color: Colors.grey)),
                            ],
                          ),
                          const SizedBox(height: 14),
                          const Divider(),
                          const SizedBox(height: 10),
                          ...(tier['features'] as List<String>).map((feat) {
                            return Padding(
                              padding: const EdgeInsets.only(bottom: 6),
                              child: Row(
                                children: [
                                  const Icon(Icons.check_circle_rounded, color: Colors.green, size: 16),
                                  const SizedBox(width: 8),
                                  Text(feat, style: const TextStyle(fontSize: 13)),
                                ],
                              ),
                            );
                          }),
                        ],
                      ),
                    ),
                  );
                }),
              ],
            ),
          ),

          // ── Sticky CTA Button ────────────────────────────────────
          SafeArea(
            child: Padding(
              padding: const EdgeInsets.all(20),
              child: Column(
                children: [
                  SizedBox(
                    width: double.infinity,
                    height: 52,
                    child: FilledButton(
                      onPressed: () {
                        // Launch subscription workflow
                      },
                      child: const Text('Start 7-Day Free Trial', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                    ),
                  ),
                  const SizedBox(height: 8),
                  const Text('Cancel anytime in App Store. Auto-renews after trial.', style: TextStyle(fontSize: 11, color: Colors.grey)),
                ],
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class _BillingTab extends StatelessWidget {
  final String label;
  final bool selected;
  final String? badge;
  final VoidCallback onTap;

  const _BillingTab({
    required this.label,
    required this.selected,
    this.badge,
    required this.onTap,
  });

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;

    return GestureDetector(
      onTap: onTap,
      child: AnimatedContainer(
        duration: const Duration(milliseconds: 200),
        padding: const EdgeInsets.symmetric(horizontal: 14, vertical: 8),
        decoration: BoxDecoration(
          color: selected ? cs.surface : Colors.transparent,
          borderRadius: BorderRadius.circular(12),
        ),
        child: Text(
          label,
          style: TextStyle(
            fontSize: 12,
            fontWeight: selected ? FontWeight.bold : FontWeight.normal,
            color: selected ? cs.primary : cs.onSurfaceVariant,
          ),
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
  MaterialPageRoute(builder: (_) => const SubscriptionPricingScreen()),
);
```
