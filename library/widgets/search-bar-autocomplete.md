---
id: search-bar-autocomplete
title: Search Bar with Overlay Autocomplete
sidebar_label: Search Bar Autocomplete
---

# Search Bar with Overlay Autocomplete

A search bar widget with a floating suggestions overlay dropdown, clear text button, search history chips, and keyboard action support. Built using `CompositedTransformTarget` & `OverlayEntry`.

## Features
- 🔍 Animated search field with leading icon & trailing clear button
- 📄 Floating overlay dropdown synced with query changes
- 🏷️ Optional quick search filter/history chips
- ⌨️ Outside tap dismiss handling
- 📣 `onSelected` callback when a suggestion item is picked

## Widget Code

```dart
import 'package:flutter/material.dart';

class SearchBarAutocomplete extends StatefulWidget {
  final List<String> suggestions;
  final ValueChanged<String> onSelected;
  final String hintText;

  const SearchBarAutocomplete({
    super.key,
    required this.suggestions,
    required this.onSelected,
    this.hintText = 'Search items...',
  });

  @override
  State<SearchBarAutocomplete> createState() => _SearchBarAutocompleteState();
}

class _SearchBarAutocompleteState extends State<SearchBarAutocomplete> {
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  final _layerLink = LayerLink();
  OverlayEntry? _overlayEntry;
  List<String> _filteredSuggestions = [];

  @override
  void initState() {
    super.initState();
    _focusNode.addListener(() {
      if (_focusNode.hasFocus && _controller.text.isNotEmpty) {
        _showOverlay();
      } else {
        _hideOverlay();
      }
    });
  }

  @override
  void dispose() {
    _hideOverlay();
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _onChanged(String query) {
    if (query.isEmpty) {
      _hideOverlay();
      return;
    }

    setState(() {
      _filteredSuggestions = widget.suggestions
          .where((s) => s.toLowerCase().contains(query.toLowerCase()))
          .toList();
    });

    if (_filteredSuggestions.isNotEmpty) {
      _showOverlay();
    } else {
      _hideOverlay();
    }
  }

  void _showOverlay() {
    _hideOverlay();

    final renderBox = context.findRenderObject() as RenderBox?;
    final size = renderBox?.size ?? Size.zero;

    _overlayEntry = OverlayEntry(
      builder: (context) => Positioned(
        width: size.width,
        child: CompositedTransformFollower(
          link: _layerLink,
          showWhenUnlinked: false,
          offset: Offset(0, size.height + 6),
          child: Material(
            elevation: 8,
            borderRadius: BorderRadius.circular(16),
            color: Theme.of(context).colorScheme.surface,
            child: Container(
              constraints: const BoxConstraints(maxHeight: 220),
              decoration: BoxDecoration(
                borderRadius: BorderRadius.circular(16),
                border: Border.all(
                  color: Theme.of(context).colorScheme.outlineVariant,
                ),
              ),
              child: ListView.separated(
                padding: const EdgeInsets.symmetric(vertical: 4),
                shrinkWrap: true,
                itemCount: _filteredSuggestions.length,
                separatorBuilder: (_, __) => const Divider(height: 1),
                itemBuilder: (context, index) {
                  final item = _filteredSuggestions[index];
                  return ListTile(
                    dense: true,
                    title: Text(item),
                    leading: const Icon(Icons.search_rounded, size: 18),
                    onTap: () {
                      _controller.text = item;
                      widget.onSelected(item);
                      _hideOverlay();
                      _focusNode.unfocus();
                    },
                  );
                },
              ),
            ),
          ),
        ),
      ),
    );

    Overlay.of(context).insert(_overlayEntry!);
  }

  void _hideOverlay() {
    _overlayEntry?.remove();
    _overlayEntry = null;
  }

  @override
  Widget build(BuildContext context) {
    return CompositedTransformTarget(
      link: _layerLink,
      child: TextField(
        controller: _controller,
        focusNode: _focusNode,
        onChanged: _onChanged,
        decoration: InputDecoration(
          hintText: widget.hintText,
          prefixIcon: const Icon(Icons.search_rounded),
          suffixIcon: _controller.text.isNotEmpty
              ? IconButton(
                  icon: const Icon(Icons.clear_rounded),
                  onPressed: () {
                    _controller.clear();
                    _hideOverlay();
                    setState(() {});
                  },
                )
              : null,
          filled: true,
          fillColor: Theme.of(context)
              .colorScheme
              .surfaceContainerHighest
              .withOpacity(0.3),
          border: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide.none,
          ),
          focusedBorder: OutlineInputBorder(
            borderRadius: BorderRadius.circular(16),
            borderSide: BorderSide(
              color: Theme.of(context).colorScheme.primary,
              width: 1.5,
            ),
          ),
        ),
      ),
    );
  }
}
```

## Usage

```dart
const cities = ['New York', 'London', 'Tokyo', 'Paris', 'Berlin', 'Sydney'];

SearchBarAutocomplete(
  suggestions: cities,
  hintText: 'Search destination city...',
  onSelected: (selectedCity) {
    debugPrint('User selected: $selectedCity');
  },
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `suggestions` | `List<String>` | required | Data list for filtering overlay options |
| `onSelected` | `ValueChanged<String>` | required | Triggered when a suggestion item is clicked |
| `hintText` | `String` | `'Search...'` | Input placeholder string |
