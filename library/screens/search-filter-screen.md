---
id: search-filter-screen
title: Search & Advanced Filter Screen
sidebar_label: Search & Filter Screen
---

# Search & Advanced Filter Screen

A complete search discovery and filtering screen layout featuring query text field, recent searches list, category filter chips, interactive price range slider (`RangeSlider`), rating selector, and a sticky "Apply Filters" modal sheet.

## Features
- 🔍 Debounced search input field with instant query reset button
- 🏷️ Filter chips for categories (All, Fashion, Tech, Home)
- 🎚️ Dual-thumb `RangeSlider` for price filtering ($0 - $500+)
- ⭐ Rating star pill selectors (4.0+, 4.5+)
- 📋 Results list grid with result count header and sort dropdown

## Screen Code

```dart
import 'package:flutter/material.dart';

class SearchFilterScreen extends StatefulWidget {
  const SearchFilterScreen({super.key});

  @override
  State<SearchFilterScreen> createState() => _SearchFilterScreenState();
}

class _SearchFilterScreenState extends State<SearchFilterScreen> {
  final _searchController = TextEditingController();
  RangeValues _priceRange = const RangeValues(20, 250);
  String _selectedCategory = 'All';
  double _minRating = 4.0;
  String _sortBy = 'Popularity';

  final List<String> _categories = ['All', 'Fashion', 'Tech', 'Home', 'Beauty'];
  final List<String> _recentSearches = [
    'Wireless Earbuds',
    'Leather Jacket',
    'Smart Watch',
  ];

  @override
  void dispose() {
    _searchController.dispose();
    super.dispose();
  }

  void _openFilterModal() {
    showModalBottomSheet(
      context: context,
      isScrollControlled: true,
      shape: const RoundedRectangleBorder(
        borderRadius: BorderRadius.vertical(top: Radius.circular(24)),
      ),
      builder: (_) => StatefulBuilder(
        builder: (context, setModalState) {
          return Padding(
            padding: const EdgeInsets.all(24),
            child: Column(
              mainAxisSize: MainAxisSize.min,
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Filter Products',
                      style: TextStyle(
                        fontSize: 20,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                    TextButton(
                      onPressed: () {
                        setModalState(() {
                          _priceRange = const RangeValues(0, 500);
                          _selectedCategory = 'All';
                          _minRating = 0;
                        });
                      },
                      child: const Text('Reset All'),
                    ),
                  ],
                ),
                const Divider(),
                const SizedBox(height: 12),

                // ── Category Filter ─────────────────────────────
                const Text(
                  'Category',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Wrap(
                  spacing: 8,
                  children: _categories.map((cat) {
                    final selected = _selectedCategory == cat;
                    return FilterChip(
                      label: Text(cat),
                      selected: selected,
                      onSelected: (val) =>
                          setModalState(() => _selectedCategory = cat),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 20),

                // ── Price Range Slider ──────────────────────────
                Row(
                  mainAxisAlignment: MainAxisAlignment.spaceBetween,
                  children: [
                    const Text(
                      'Price Range',
                      style: TextStyle(fontWeight: FontWeight.bold),
                    ),
                    Text(
                      '\$${_priceRange.start.round()} - \$${_priceRange.end.round()}',
                      style: TextStyle(
                        color: Theme.of(context).colorScheme.primary,
                        fontWeight: FontWeight.bold,
                      ),
                    ),
                  ],
                ),
                RangeSlider(
                  values: _priceRange,
                  min: 0,
                  max: 500,
                  divisions: 50,
                  onChanged: (values) =>
                      setModalState(() => _priceRange = values),
                ),
                const SizedBox(height: 20),

                // ── Rating Filter ───────────────────────────────
                const Text(
                  'Minimum Rating',
                  style: TextStyle(fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 8),
                Row(
                  children: [3.0, 4.0, 4.5].map((r) {
                    final selected = _minRating == r;
                    return Padding(
                      padding: const EdgeInsets.only(right: 8),
                      child: ChoiceChip(
                        label: Row(
                          mainAxisSize: MainAxisSize.min,
                          children: [
                            const Icon(
                              Icons.star,
                              size: 14,
                              color: Colors.amber,
                            ),
                            const SizedBox(width: 4),
                            Text('$r+'),
                          ],
                        ),
                        selected: selected,
                        onSelected: (_) => setModalState(() => _minRating = r),
                      ),
                    );
                  }).toList(),
                ),
                const SizedBox(height: 24),

                SizedBox(
                  width: double.infinity,
                  height: 48,
                  child: FilledButton(
                    onPressed: () {
                      setState(() {});
                      Navigator.pop(context);
                    },
                    child: const Text('Apply Filters'),
                  ),
                ),
              ],
            ),
          );
        },
      ),
    );
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      appBar: AppBar(
        titleSpacing: 0,
        title: Padding(
          padding: const EdgeInsets.only(right: 16),
          child: TextField(
            controller: _searchController,
            onChanged: (v) => setState(() {}),
            decoration: InputDecoration(
              hintText: 'Search products, brands...',
              prefixIcon: const Icon(Icons.search_rounded),
              suffixIcon: _searchController.text.isNotEmpty
                  ? IconButton(
                      icon: const Icon(Icons.clear_rounded),
                      onPressed: () {
                        _searchController.clear();
                        setState(() {});
                      },
                    )
                  : null,
              filled: true,
              isDense: true,
              border: OutlineInputBorder(
                borderRadius: BorderRadius.circular(14),
                borderSide: BorderSide.none,
              ),
            ),
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.tune_rounded),
            onPressed: _openFilterModal,
          ),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Recent Searches (Shown when input empty) ──────────────
          if (_searchController.text.isEmpty) ...[
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text(
                  'Recent Searches',
                  style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16),
                ),
                TextButton(
                  onPressed: () => setState(() => _recentSearches.clear()),
                  child: const Text('Clear'),
                ),
              ],
            ),
            Wrap(
              spacing: 8,
              children: _recentSearches.map((term) {
                return Chip(
                  label: Text(term),
                  deleteIcon: const Icon(Icons.close, size: 14),
                  onDeleted: () => setState(() => _recentSearches.remove(term)),
                );
              }).toList(),
            ),
          ] else ...[
            // ── Active Results Header ──────────────────────────────
            Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                Text(
                  'Results for "${_searchController.text}"',
                  style: const TextStyle(
                    fontWeight: FontWeight.bold,
                    fontSize: 16,
                  ),
                ),
                DropdownButton<String>(
                  value: _sortBy,
                  underline: const SizedBox(),
                  icon: const Icon(Icons.sort_rounded, size: 18),
                  items: ['Popularity', 'Price Low to High', 'Newest']
                      .map(
                        (s) => DropdownMenuItem(
                          value: s,
                          child: Text(s, style: const TextStyle(fontSize: 13)),
                        ),
                      )
                      .toList(),
                  onChanged: (val) => setState(() => _sortBy = val!),
                ),
              ],
            ),
            const SizedBox(height: 12),

            // ── Results Mock Grid ──────────────────────────────────
            GridView.builder(
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              gridDelegate: const SliverGridDelegateWithFixedCrossAxisCount(
                crossAxisCount: 2,
                childAspectRatio: 0.75,
                crossAxisSpacing: 12,
                mainAxisSpacing: 12,
              ),
              itemCount: 4,
              itemBuilder: (context, index) {
                return Card(
                  clipBehavior: Clip.antiAlias,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(14),
                  ),
                  child: Column(
                    crossAxisAlignment: CrossAxisAlignment.start,
                    children: [
                      Expanded(
                        child: Image.network(
                          'https://picsum.photos/300/300?random=${index + 50}',
                          fit: BoxFit.cover,
                          width: double.infinity,
                        ),
                      ),
                      Padding(
                        padding: const EdgeInsets.all(10),
                        child: Column(
                          crossAxisAlignment: CrossAxisAlignment.start,
                          children: [
                            Text(
                              'Product Item ${index + 1}',
                              style: const TextStyle(
                                fontWeight: FontWeight.bold,
                              ),
                            ),
                            const SizedBox(height: 2),
                            const Text(
                              '\$89.99',
                              style: TextStyle(
                                color: Colors.indigo,
                                fontWeight: FontWeight.w600,
                              ),
                            ),
                          ],
                        ),
                      ),
                    ],
                  ),
                );
              },
            ),
          ],
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
  MaterialPageRoute(builder: (_) => const SearchFilterScreen()),
);
```
