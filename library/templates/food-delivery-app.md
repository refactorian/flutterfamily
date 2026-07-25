---
id: food-delivery-app
title: Food & Grocery Delivery Starter Kit
sidebar_label: Food Delivery App
---

# Food & Grocery Delivery Starter Kit

A feature-rich food delivery mobile template. Includes address selector header, category pills carousel, restaurant cards with rating badges, live delivery map step tracker, and cart drawer.

## Features
- 📍 Address bar header with delivery time estimator
- 🍔 Horizontally scrollable food category pills
- 🏪 Restaurant cards with rating stars, delivery fee, and distance
- 🛵 Real-time delivery status map view & driver contact card
- 🛒 Sliding cart drawer with checkout total breakdown

## Template Code

```dart
import 'package:flutter/material.dart';

class FoodDeliveryHomeScreen extends StatelessWidget {
  const FoodDeliveryHomeScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF8FAFC),
      appBar: AppBar(
        backgroundColor: Colors.white,
        elevation: 0,
        title: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text('DELIVER TO', style: TextStyle(color: Colors.orange, fontSize: 10, fontWeight: FontWeight.bold)),
            Row(
              children: const [
                Text('742 Evergreen Terrace', style: TextStyle(color: Colors.black, fontSize: 14, fontWeight: FontWeight.bold)),
                Icon(Icons.keyboard_arrow_down_rounded, color: Colors.black),
              ],
            ),
          ],
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.shopping_bag_outlined, color: Colors.black),
            onPressed: () {},
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.symmetric(vertical: 16),
        children: [
          // ── Search Input ─────────────────────────────────────
          Padding(
            padding: const EdgeInsets.symmetric(horizontal: 16),
            child: TextField(
              decoration: InputDecoration(
                hintText: 'Search dishes, restaurants...',
                prefixIcon: const Icon(Icons.search_rounded),
                filled: true,
                fillColor: Colors.grey.shade100,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(16),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
          ),
          const SizedBox(height: 20),

          // ── Category Pills ───────────────────────────────────
          SizedBox(
            height: 42,
            child: ListView(
              scrollDirection: Axis.horizontal,
              padding: const EdgeInsets.symmetric(horizontal: 16),
              children: const [
                _CategoryPill(label: 'All', icon: '🍽️', isSelected: true),
                _CategoryPill(label: 'Burger', icon: '🍔'),
                _CategoryPill(label: 'Pizza', icon: '🍕'),
                _CategoryPill(label: 'Sushi', icon: '🍣'),
                _CategoryPill(label: 'Tacos', icon: '🌮'),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Featured Restaurants Section ──────────────────────
          const Padding(
            padding: EdgeInsets.symmetric(horizontal: 16),
            child: Text('Popular Nearby', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          ),
          const SizedBox(height: 12),
          const _RestaurantCard(
            title: 'Burger Craft & Wings',
            tags: 'Burgers • American • \$',
            rating: '4.8',
            deliveryTime: '20-30 min',
            deliveryFee: 'Free Delivery',
            imageUrl: 'https://picsum.photos/600/300?random=10',
          ),
          const SizedBox(height: 16),
          const _RestaurantCard(
            title: 'Artisan Pizza Lab',
            tags: 'Italian • Pizza • \$\$',
            rating: '4.9',
            deliveryTime: '25-35 min',
            deliveryFee: '\$1.99 Delivery',
            imageUrl: 'https://picsum.photos/600/300?random=11',
          ),
        ],
      ),
    );
  }
}

class _CategoryPill extends StatelessWidget {
  final String label;
  final String icon;
  final bool isSelected;

  const _CategoryPill({required this.label, required this.icon, this.isSelected = false});

  @override
  Widget build(BuildContext context) {
    return Container(
      margin: const EdgeInsets.only(right: 10),
      padding: const EdgeInsets.symmetric(horizontal: 16, vertical: 8),
      decoration: BoxDecoration(
        color: isSelected ? Colors.orange : Colors.white,
        borderRadius: BorderRadius.circular(20),
        border: Border.all(color: isSelected ? Colors.orange : Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Text(icon, style: const TextStyle(fontSize: 14)),
          const SizedBox(width: 6),
          Text(
            label,
            style: TextStyle(
              color: isSelected ? Colors.white : Colors.black87,
              fontWeight: FontWeight.bold,
              fontSize: 13,
            ),
          ),
        ],
      ),
    );
  }
}

class _RestaurantCard extends StatelessWidget {
  final String title;
  final String tags;
  final String rating;
  final String deliveryTime;
  final String deliveryFee;
  final String imageUrl;

  const _RestaurantCard({
    required this.title,
    required this.tags,
    required this.rating,
    required this.deliveryTime,
    required this.deliveryFee,
    required this.imageUrl,
  });

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.symmetric(horizontal: 16),
      child: Card(
        clipBehavior: Clip.antiAlias,
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        elevation: 2,
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            Stack(
              children: [
                Image.network(imageUrl, height: 160, width: double.infinity, fit: BoxFit.cover),
                Positioned(
                  top: 12,
                  right: 12,
                  child: Container(
                    padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 4),
                    decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(8)),
                    child: Row(
                      children: [
                        const Icon(Icons.star, color: Colors.amber, size: 14),
                        const SizedBox(width: 4),
                        Text(rating, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 12)),
                      ],
                    ),
                  ),
                ),
              ],
            ),
            Padding(
              padding: const EdgeInsets.all(14),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(title, style: const TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 4),
                  Text(tags, style: TextStyle(color: Colors.grey.shade600, fontSize: 13)),
                  const SizedBox(height: 8),
                  Row(
                    children: [
                      const Icon(Icons.access_time_rounded, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(deliveryTime, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                      const SizedBox(width: 12),
                      const Icon(Icons.two_wheeler_rounded, size: 14, color: Colors.grey),
                      const SizedBox(width: 4),
                      Text(deliveryFee, style: const TextStyle(fontSize: 12, fontWeight: FontWeight.w500)),
                    ],
                  ),
                ],
              ),
            ),
          ],
        ),
      ),
    );
  }
}
```

## Recommended Libraries
- `google_maps_flutter` for live order tracking maps
- `geolocator` for user GPS coordinates
