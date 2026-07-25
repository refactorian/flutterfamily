---
id: crypto-finance-app
title: Crypto & Finance Wallet Starter Kit
sidebar_label: Crypto & Wallet App
---

# Crypto & Finance Wallet Starter Kit

A high-performance fintech and cryptocurrency wallet app starter. Includes live market trend lists, portfolio balance card, quick buy/sell/swap actions, and transaction history tabs.

## Features
- 💼 Total portfolio balance card with dynamic hidden/visible toggle
- 📈 Live market price list with 24h change indicators (+ / - %)
- ⚡ Quick actions bar (Send, Receive, Swap, Buy)
- 📜 Transaction history list with category icons
- 🔒 Biometric lock integration setup ready

## Template Code

```dart
import 'package:flutter/material.dart';

class CryptoWalletScreen extends StatefulWidget {
  const CryptoWalletScreen({super.key});

  @override
  State<CryptoWalletScreen> createState() => _CryptoWalletScreenState();
}

class _CryptoWalletScreenState extends State<CryptoWalletScreen> {
  bool _hideBalance = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFF0B0E14),
      appBar: AppBar(
        backgroundColor: Colors.transparent,
        title: const Text('My Wallet', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
        actions: [
          IconButton(
            icon: Icon(_hideBalance ? Icons.visibility_off : Icons.visibility, color: Colors.white70),
            onPressed: () => setState(() => _hideBalance = !_hideBalance),
          ),
          IconButton(
            icon: const Icon(Icons.qr_code_scanner_rounded, color: Colors.white70),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Portfolio Balance Card ─────────────────────────────
          Container(
            padding: const EdgeInsets.all(24),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF6366F1), Color(0xFF4F46E5)],
                begin: Alignment.topLeft,
                end: Alignment.bottomRight,
              ),
              borderRadius: BorderRadius.circular(24),
              boxShadow: [
                BoxShadow(
                  color: const Color(0xFF6366F1).withOpacity(0.3),
                  blurRadius: 20,
                  offset: const Offset(0, 10),
                ),
              ],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Total Balance', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 8),
                Text(
                  _hideBalance ? '••••••••' : '\$34,892.40',
                  style: const TextStyle(color: Colors.white, fontSize: 32, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 6),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                      decoration: BoxDecoration(
                        color: Colors.greenAccent.withOpacity(0.2),
                        borderRadius: BorderRadius.circular(8),
                      ),
                      child: const Row(
                        children: [
                          Icon(Icons.arrow_upward_rounded, color: Colors.greenAccent, size: 14),
                          SizedBox(width: 2),
                          Text('+5.42%', style: TextStyle(color: Colors.greenAccent, fontSize: 12, fontWeight: FontWeight.bold)),
                        ],
                      ),
                    ),
                    const SizedBox(width: 8),
                    const Text('Past 24 hours', style: TextStyle(color: Colors.white54, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Action Buttons Row ──────────────────────────────────
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceAround,
            children: const [
              _ActionButton(icon: Icons.arrow_upward_rounded, label: 'Send'),
              _ActionButton(icon: Icons.arrow_downward_rounded, label: 'Receive'),
              _ActionButton(icon: Icons.swap_horiz_rounded, label: 'Swap'),
              _ActionButton(icon: Icons.add_rounded, label: 'Buy'),
            ],
          ),
          const SizedBox(height: 28),

          // ── Assets Watchlist ────────────────────────────────────
          const Text('Watchlist', style: TextStyle(color: Colors.white, fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 14),
          const _AssetTile(
            symbol: 'BTC',
            name: 'Bitcoin',
            price: '\$64,230.00',
            change: '+3.14%',
            isPositive: true,
            iconColor: Color(0xFFF7931A),
          ),
          const SizedBox(height: 10),
          const _AssetTile(
            symbol: 'ETH',
            name: 'Ethereum',
            price: '\$3,480.50',
            change: '+4.82%',
            isPositive: true,
            iconColor: Color(0xFF627EEA),
          ),
          const SizedBox(height: 10),
          const _AssetTile(
            symbol: 'SOL',
            name: 'Solana',
            price: '\$142.10',
            change: '-1.25%',
            isPositive: false,
            iconColor: Color(0xFF14F195),
          ),
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
          width: 54,
          height: 54,
          decoration: BoxDecoration(
            color: const Color(0xFF1A1F2C),
            shape: BoxShape.circle,
            border: Border.all(color: Colors.white10),
          ),
          child: Icon(icon, color: Colors.white, size: 24),
        ),
        const SizedBox(height: 8),
        Text(label, style: const TextStyle(color: Colors.white70, fontSize: 12)),
      ],
    );
  }
}

class _AssetTile extends StatelessWidget {
  final String symbol;
  final String name;
  final String price;
  final String change;
  final bool isPositive;
  final Color iconColor;

  const _AssetTile({
    required this.symbol,
    required this.name,
    required this.price,
    required this.change,
    required this.isPositive,
    required this.iconColor,
  });

  @override
  Widget build(BuildContext context) {
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: const Color(0xFF131822),
        borderRadius: BorderRadius.circular(18),
      ),
      child: Row(
        children: [
          CircleAvatar(
            backgroundColor: iconColor.withOpacity(0.2),
            child: Text(symbol[0], style: TextStyle(color: iconColor, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(width: 14),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(name, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
                Text(symbol, style: const TextStyle(color: Colors.white54, fontSize: 12)),
              ],
            ),
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.end,
            children: [
              Text(price, style: const TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
              Text(
                change,
                style: TextStyle(
                  color: isPositive ? Colors.greenAccent : Colors.redAccent,
                  fontSize: 12,
                  fontWeight: FontWeight.w600,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}
```

## Integrations
- Web3 via `web3dart` or Solana `solana` SDKs
- Biometric authentication via `local_auth`
