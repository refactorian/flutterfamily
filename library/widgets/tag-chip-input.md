---
id: tag-chip-input
title: Tag / Chip Input Field
sidebar_label: Tag Chip Input
---

# Tag / Chip Input Field

A tags input widget where users type text, press Enter or comma, and a `Chip` is created. Tags can be removed with a delete icon. Supports max tag count, duplicate detection, and validation. Common in interest selectors, skill tags, and search filters.

## Features
- ⌨️ Type + Enter/comma to create a tag
- ❌ Tap `×` to remove a tag
- 🚫 Duplicate detection (case-insensitive)
- 🔢 Max tag count enforcement
- ✅ Optional tag validator function
- 🎨 Configurable chip color and text style
- 📣 `onChanged` callback with current tag list

## Widget Code

```dart
import 'package:flutter/material.dart';
import 'package:flutter/services.dart';

class TagChipInput extends StatefulWidget {
  final List<String> initialTags;
  final int? maxTags;
  final String hintText;
  final Color? chipColor;
  final Color? chipTextColor;
  final String? Function(String tag)? validator;
  final ValueChanged<List<String>>? onChanged;
  final String label;

  const TagChipInput({
    super.key,
    this.initialTags = const [],
    this.maxTags,
    this.hintText = 'Add tag, press Enter...',
    this.chipColor,
    this.chipTextColor,
    this.validator,
    this.onChanged,
    this.label = 'Tags',
  });

  @override
  State<TagChipInput> createState() => _TagChipInputState();
}

class _TagChipInputState extends State<TagChipInput> {
  late List<String> _tags;
  final _controller = TextEditingController();
  final _focusNode = FocusNode();
  String? _errorMessage;

  @override
  void initState() {
    super.initState();
    _tags = List.from(widget.initialTags);
  }

  @override
  void dispose() {
    _controller.dispose();
    _focusNode.dispose();
    super.dispose();
  }

  void _addTag(String value) {
    final tag = value.trim().replaceAll(',', '');
    if (tag.isEmpty) {
      _controller.clear();
      return;
    }

    setState(() => _errorMessage = null);

    // Max tags check
    if (widget.maxTags != null && _tags.length >= widget.maxTags!) {
      setState(() => _errorMessage =
          'Maximum ${widget.maxTags} tags allowed');
      return;
    }

    // Duplicate check
    if (_tags.any((t) => t.toLowerCase() == tag.toLowerCase())) {
      setState(() => _errorMessage = '"$tag" is already added');
      _controller.clear();
      return;
    }

    // Custom validator
    final error = widget.validator?.call(tag);
    if (error != null) {
      setState(() => _errorMessage = error);
      return;
    }

    setState(() => _tags.add(tag));
    widget.onChanged?.call(List.unmodifiable(_tags));
    _controller.clear();
  }

  void _removeTag(String tag) {
    setState(() {
      _tags.remove(tag);
      _errorMessage = null;
    });
    widget.onChanged?.call(List.unmodifiable(_tags));
  }

  @override
  Widget build(BuildContext context) {
    final cs = Theme.of(context).colorScheme;
    final chipBg = widget.chipColor ?? cs.primaryContainer;
    final chipText = widget.chipTextColor ?? cs.onPrimaryContainer;
    final isAtMax =
        widget.maxTags != null && _tags.length >= widget.maxTags!;

    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        if (widget.label.isNotEmpty) ...[
          Text(
            widget.label,
            style: Theme.of(context).textTheme.labelLarge?.copyWith(
              fontWeight: FontWeight.w600,
            ),
          ),
          const SizedBox(height: 8),
        ],
        GestureDetector(
          onTap: () => _focusNode.requestFocus(),
          child: AnimatedContainer(
            duration: const Duration(milliseconds: 200),
            padding: const EdgeInsets.symmetric(horizontal: 12, vertical: 8),
            decoration: BoxDecoration(
              borderRadius: BorderRadius.circular(12),
              border: Border.all(
                color: _focusNode.hasFocus
                    ? cs.primary
                    : cs.outline,
                width: _focusNode.hasFocus ? 2 : 1,
              ),
              color: cs.surfaceContainerHighest.withOpacity(0.3),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                // ── Chips ──────────────────────────────────────
                if (_tags.isNotEmpty)
                  Wrap(
                    spacing: 8,
                    runSpacing: 6,
                    children: _tags.map((tag) {
                      return Chip(
                        label: Text(
                          tag,
                          style: TextStyle(
                            color: chipText,
                            fontSize: 13,
                            fontWeight: FontWeight.w500,
                          ),
                        ),
                        backgroundColor: chipBg,
                        deleteIconColor: chipText.withOpacity(0.7),
                        visualDensity: VisualDensity.compact,
                        side: BorderSide.none,
                        shape: RoundedRectangleBorder(
                          borderRadius: BorderRadius.circular(8),
                        ),
                        onDeleted: () => _removeTag(tag),
                      );
                    }).toList(),
                  ),

                // ── Text field ─────────────────────────────────
                if (!isAtMax)
                  Padding(
                    padding: EdgeInsets.only(top: _tags.isNotEmpty ? 4 : 0),
                    child: RawKeyboardListener(
                      focusNode: FocusNode(),
                      onKey: (event) {
                        if (event is RawKeyDownEvent &&
                            event.logicalKey ==
                                LogicalKeyboardKey.backspace &&
                            _controller.text.isEmpty &&
                            _tags.isNotEmpty) {
                          _removeTag(_tags.last);
                        }
                      },
                      child: TextField(
                        controller: _controller,
                        focusNode: _focusNode,
                        decoration: InputDecoration(
                          hintText: widget.hintText,
                          hintStyle: TextStyle(
                            color: cs.onSurfaceVariant,
                            fontSize: 14,
                          ),
                          border: InputBorder.none,
                          isDense: true,
                          contentPadding:
                              const EdgeInsets.symmetric(vertical: 4),
                        ),
                        onChanged: (v) {
                          if (v.endsWith(',') || v.endsWith(' ')) {
                            _addTag(v);
                          }
                          setState(() {}); // refresh focus border
                        },
                        onSubmitted: _addTag,
                        textInputAction: TextInputAction.done,
                      ),
                    ),
                  ),
              ],
            ),
          ),
        ),

        // ── Error / hint ───────────────────────────────────────
        AnimatedSize(
          duration: const Duration(milliseconds: 200),
          child: _errorMessage != null
              ? Padding(
                  padding: const EdgeInsets.only(top: 6, left: 4),
                  child: Text(
                    _errorMessage!,
                    style: TextStyle(
                      color: cs.error,
                      fontSize: 12,
                    ),
                  ),
                )
              : widget.maxTags != null
                  ? Padding(
                      padding: const EdgeInsets.only(top: 6, left: 4),
                      child: Text(
                        '${_tags.length} / ${widget.maxTags} tags',
                        style: TextStyle(
                          color: cs.onSurfaceVariant,
                          fontSize: 12,
                        ),
                      ),
                    )
                  : const SizedBox.shrink(),
        ),
      ],
    );
  }
}
```

## Usage

### Skill tags with max limit

```dart
TagChipInput(
  label: 'Skills',
  hintText: 'Add a skill, press Enter...',
  maxTags: 5,
  initialTags: const ['Flutter', 'Dart'],
  onChanged: (tags) => debugPrint('Tags: $tags'),
)
```

### Interest selector with validation

```dart
TagChipInput(
  label: 'Interests',
  hintText: 'Type an interest...',
  chipColor: const Color(0xFF6366F1),
  chipTextColor: Colors.white,
  validator: (tag) {
    if (tag.length < 2) return 'Tag must be at least 2 characters';
    if (tag.length > 20) return 'Tag too long (max 20 chars)';
    return null;
  },
  onChanged: (tags) => setState(() => _selectedInterests = tags),
)
```

## Parameters

| Parameter | Type | Default | Description |
|---|---|---|---|
| `initialTags` | `List<String>` | `[]` | Pre-filled tags |
| `maxTags` | `int?` | `null` (unlimited) | Maximum number of tags |
| `hintText` | `String` | `'Add tag...'` | Input placeholder text |
| `chipColor` | `Color?` | `primaryContainer` | Chip background color |
| `chipTextColor` | `Color?` | `onPrimaryContainer` | Chip text and icon color |
| `validator` | `Function?` | `null` | Returns error string or null |
| `onChanged` | `ValueChanged<List<String>>?` | `null` | Called on any tag list change |
| `label` | `String` | `'Tags'` | Label above the field |

## Customization Tips

- Add a suggestions dropdown by wrapping in `Autocomplete` and filtering a predefined list
- Persist tags to `SharedPreferences` for user-specific saved filters
- Use a different separator (e.g. semicolon) by adjusting the `onChanged` check for `v.endsWith(';')`
