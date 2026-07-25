---
id: wallet-transactions-screen
title: Digital Wallet & Transactions
sidebar_label: Digital Wallet
---

# Digital Wallet & Transactions Screen

A mobile banking and digital wallet dashboard layout. Includes a pageable gradient credit card carousel, quick action buttons (Send, Request, Top-Up), interactive search filter, and daily transaction history list with income/expense indicators (+ / -).

## Features
- 💳 Pageable credit card carousel slider with gradient designs & card type icons
- ⚡ Quick action buttons bar (Send Money, Request, Top-Up, Analytics)
- 📊 Income (+) and Expense (-) transaction items with category icons
- 📅 Grouped transactions list by date (Today, Yesterday)
- 🔒 Balance visibility toggle (Show/Hide amounts)

## Screen Code

```dart
import 'package:flutter/material.dart';

class WalletTransactionsScreen extends StatefulWidget {
  const WalletTransactionsScreen({super.key});

  @override
  State<WalletTransactionsScreen> createState() => _WalletTransactionsScreenState();
}

class _WalletTransactionsScreenState extends State<WalletTransactionsScreen> {
  bool _hideBalance = false;
  int _activeCardIndex = 0;

  final List<Map<String, dynamic>> _cards = [
    {
      'bank': 'Platinum Visa',
      'number': '•••• •••• •••• 4920',
      'balance': '\$12,450.80',
      'expiry': '08/28',
      'colors': [Color(0xFF6366F1), Color(0xFF4F46E5)],
    },
    {
      'bank': 'Mastercard Gold',
      'number': '•••• •••• •••• 8831',
      'balance': '\$4,810.00',
      'expiry': '11/27',
      'colors': [Color(0xFF0F172A), Color(0xFF334155)],
    },
  ];

  final List<Map<String, dynamic>> _transactions = [
    {
      'title': 'Apple Store Purchase',
      'category': 'Electronics',
      'date': 'Today, 2:45 PM',
      'amount': '-\$129.00',
      'isIncome': false,
      'icon': Icons.laptop_mac_rounded,
      'color': Colors.red,
    },
    {
      'title': 'Salary Deposit',
      'category': 'Income',
      'date': 'Today, 9:00 AM',
      'amount': '+\$4,250.00',
      'isIncome': true,
      'icon': Icons.account_balance_rounded,
      'color': Colors.green,
    },
    {
      'title': 'Starbucks Coffee',
      'category': 'Food & Drink',
      'date': 'Yesterday',
      'amount': '-\$6.50',
      'isIncome': false,
      'icon': Icons.local_cafe_rounded,
      'color': Colors.orange,
    },
    {
      'title': 'Freelance Client Payment',
      'category': 'Income',
      'date': 'Yesterday',
      'amount': '+\$850.00',
      'isIncome': true,
      'icon': Icons.work_rounded,
      'color': Colors.green,
    },
  ];

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        elevation: 0,
        title: const Text('My Wallet', style: TextStyle(color: Colors.black, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Icon(_hideBalance ? Icons.visibility_off_outlined : Icons.visibility_outlined, color: Colors.black),
            onPressed: () => setState(() => _hideBalance = !_hideBalance),
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 12),
        children: [
          // ── Cards Carousel ────────────────────────────────────
          SizedBox(
            height: 190,
            child: PageView.builder(
              controller: PageController(viewportFraction: 0.88),
              onPageChanged: (index) => setState(() => _activeCardIndex = index),
              itemCount: _cards.length,
              itemBuilder: (context, index) {
                final card = _cards[index];
                final colors = card['colors'] as List<Color>;

                return Container(
                  margin: const EdgeInsets.symmetric(horizontal: 6),
                  padding: const EdgeInsets.all(22),
                  decoration: BoxDecoration(
                    gradient: LinearGradient(colors: colors, begin: Alignment.topLeft, end: Alignment.bottomRight),
                    borderRadius: BorderRadius.circular(24),
                    boxShadow: [
                      BoxShadow(
                        color: colors.first.withOpacity(0.35),
                        blurRadius: 16,
                        offset: const Offset(0, 8),
                      ),
                    ],
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(card['bank'] as String, style: const TextStyle(color: Colors.white70, fontSize: 13)),
                          const Icon(Icons.contactless_rounded, color: Colors.white, size: 26),
                        ],
                      ),
                      Text(
                        _hideBalance ? '••••••••' : card['balance'] as String,
                        style: const TextStyle(color: Colors.white, fontSize: 28, fontWeight: FontWeight.bold),
                      ),
                      Row(
                        mainAxisAlignment: MainAxisAlignment.spaceBetween,
                        children: [
                          Text(card['number'] as String, style: const TextStyle(color: Colors.white, fontSize: 14, letterSpacing: 1)),
                          Text(card['expiry'] as String, style: const TextStyle(color: Colors.white70, fontSize: 12)),
                        ],
                      ),
                    ],
                  ),
                );
              },
            ),
          ),
          const SizedBox(height: 20),

          // ── Quick Actions Row ─────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: const [
              _ActionButton(icon: Icons.send_rounded, label: 'Send'),
              _ActionButton(icon: Icons.call_received_rounded, label: 'Request'),
              _ActionButton(icon: Icons.add_card_rounded, label: 'Top-Up'),
              _ActionButton(icon: Icons.pie_chart_outline_rounded, label: 'Analytics'),
            ],
          ),
          const SizedBox(height: 28),

          // ── Transactions Section Header ────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 20),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Transactions', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                TextButton(onPressed: () {}, child: const Text('See All')),
              ],
            ),
          ),
          const SizedBox(height: 8),

          // ── Transactions List ──────────────────────────────────
          ..._transactions.map((tx) {
            final isIncome = tx['isIncome'] as bool;
            final amountColor = isIncome ? Colors.green : Colors.black87;

            return Padding(
              padding: const EdgeInsets.symmetric(horizontal: 20, vertical: 6),
              child: Container(
                padding: const EdgeInsets.all(14),
                decoration: BoxDecoration(
                  color: Colors.white,
                  borderRadius: BorderRadius.circular(16),
                  border: Border.all(color: Colors.grey.shade200),
                ),
                child: Row(
                  children: [
                    CircleAvatar(
                      backgroundColor: (tx['color'] as Color).withOpacity(0.12),
                      child: Icon(tx['icon'] as IconData, color: tx['color'] as Color, size: 20),
                    ),
                    const SizedBox(width: 14),
                    Expanded(
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Text(tx['title'] as String, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 14)),
                          const SizedBox(height: 2),
                          Text(tx['date'] as String, style: TextStyle(color: Colors.grey.shade500, fontSize: 12)),
                        ],
                      ),
                    ),
                    Text(
                      _hideBalance ? '••••' : tx['amount'] as String,
                      style: TextStyle(color: amountColor, fontWeight: FontWeight.bold, fontSize: 15),
                    ),
                  ],
                ),
              ),
            );
          }),
        ],
      ),
    );
  }
}

class _ActionButton extends StatelessWidget {
  final IconData icon;
  final String label;

  const _ActionButton({required this.icon, required this.label});

  @override
  Widget build(BuildContext context) {
    return Column(
      children: [
        Container(
          width: 52,
          height: 52,
          decoration: BoxDecoration(
            color: Colors.white,
            shape: BoxShape.circle,
            boxShadow: [
              BoxShadow(
                color: Colors.black.withOpacity(0.06),
                blurRadius: 10,
                offset: const Offset(0, 4),
              ),
            ],
          ),
          child: Icon(icon, color: Theme.of(context).colorScheme.primary, size: 22),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
      ],
    );
  }
}
```

## Usage

```dart
Navigator.push(
  context,
  MaterialPageRoute(builder: (_) => const WalletTransactionsScreen()),
);
```
