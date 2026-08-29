---
slug: dart-string-chunking-techniques-and-best-practices
title: "Chunking Strings in Dart: Every Practical Approach from Regex to Unicode-Safe Splitting"
authors: [admin]
tags: [dart, dart3, records, language-features]
---

# Chunking Strings in Dart: Every Practical Approach from Regex to Unicode-Safe Splitting

String chunking is a surprisingly common operation in Dart and Flutter applications.

You may need to split a long string into fixed-size pieces for:

* Formatting text into lines
* Creating previews
* Pagination
* Terminal output
* Protocol or network payloads
* Text processing
* Generating identifiers
* Breaking large content into manageable pieces
* Processing Unicode text
* Preparing data for APIs or databases
* Implementing custom text layouts

{/* truncate */}

For example, given:

```dart
const text = 'HelloWorld';
const size = 3;
```

we may want:

```text
Hel
loW
orl
d
```

Dart does not provide a dedicated `chunk()` method on `String`, but there are many ways to implement it.

This article explores the major approaches, from simple `substring()` loops to regex, iterators, `runes`, UTF-8 bytes, and Unicode grapheme clusters.

---

# 1. What Does "Chunking a String" Actually Mean?

Before choosing an implementation, it is important to define what a "character" means.

There are several different units you might want to chunk by:

1. **UTF-16 code units**
2. **Unicode code points**
3. **Grapheme clusters**
4. **UTF-8 bytes**
5. **Regex matches**

These are not always the same thing.

For ordinary ASCII text:

```text
HelloWorld
```

all of these approaches appear to behave identically.

However, consider:

```text
😀
```

or:

```text
👨‍👩‍👧‍👦
```

or:

```text
é
```

The internal representation becomes significantly more complicated.

Therefore, the "best" chunking technique depends on what your application considers a character.

---

# 2. Basic Example

Let's establish a common example:

```dart
const text = 'The quick brown fox jumps over the lazy dog';
const size = 5;
```

The expected result is:

```text
The q
uick 
brown
 fox 
jumps
 over
 the 
lazy 
dog
```

Most techniques below can produce this result.

---

# 3. RegExp Matching

One of the shortest approaches is to use `RegExp` to find groups of characters.

## Basic Implementation

```dart
String chunkString(String text, int size) {
  final regex = RegExp('.{1,$size}');
  return regex
      .allMatches(text)
      .map((match) => match.group(0)!)
      .join(' ');
}
```

Usage:

```dart
final result = chunkString('HelloWorld', 3);

print(result);
```

Output:

```text
Hel loW orl d
```

The regular expression:

```regex
.{1,3}
```

means:

> Match between 1 and 3 occurrences of any character.

## Returning a List

Usually, returning a `List<String>` is more useful than joining the chunks immediately:

```dart
List<String> chunkString(String text, int size) {
  final regex = RegExp('.{1,$size}');

  return regex
      .allMatches(text)
      .map((match) => match.group(0)!)
      .toList();
}
```

Result:

```dart
[
  'Hel',
  'loW',
  'orl',
  'd',
]
```

## Important Regex Caveat

The `.` pattern does not normally match newline characters.

For example:

```dart
final text = 'Hello\nWorld';
```

A pattern such as:

```dart
RegExp('.{1,3}')
```

does not treat the newline like an ordinary character.

If you need dot to match across lines, you can use a pattern such as:

```dart
final regex = RegExp('(?s).{1,$size}');
```

However, regex is generally not the best solution for ordinary fixed-size chunking.

### Advantages

* Very concise
* Familiar to developers who already use regex
* Useful when chunking is part of a more complicated pattern
* Convenient with `allMatches()`

### Disadvantages

* More overhead than a simple loop
* Regex behavior around Unicode requires care
* Newlines require special handling
* Less readable for such a simple operation
* Not usually the first choice for performance-sensitive code

---

# 4. Imperative Loop with `substring()`

For most ordinary Dart applications, a simple loop is one of the best solutions.

```dart
List<String> chunkString(String text, int size) {
  final chunks = <String>[];

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size < text.length)
        ? i + size
        : text.length;

    chunks.add(text.substring(i, end));
  }

  return chunks;
}
```

Usage:

```dart
final chunks = chunkString('HelloWorld', 3);

print(chunks);
```

Output:

```text
[Hel, loW, orl, d]
```

## How It Works

The loop advances by `size`:

```dart
i += size
```

For a size of `3`:

```text
0 → 3 → 6 → 9
```

At each position we calculate the end:

```dart
final end = (i + size < text.length)
    ? i + size
    : text.length;
```

This prevents the final `substring()` call from going beyond the string.

## More Defensive Version

A production utility should validate the chunk size:

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(
      size,
      'size',
      'Chunk size must be greater than zero.',
    );
  }

  final chunks = <String>[];

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);
    chunks.add(text.substring(i, end));
  }

  return chunks;
}
```

### Advantages

* Simple
* Readable
* Fast
* No regex engine
* No additional packages
* Easy to customize

### Disadvantages

The important limitation is:

> `String.length` and `substring()` work with UTF-16 code-unit positions.

That matters for Unicode text containing characters represented by multiple UTF-16 code units.

---

# 5. `while` Loop with `substring()`

The same algorithm can be written using a `while` loop.

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final chunks = <String>[];
  var start = 0;

  while (start < text.length) {
    final end = (start + size).clamp(0, text.length);

    chunks.add(text.substring(start, end));

    start = end;
  }

  return chunks;
}
```

This style is particularly useful when the starting position or chunk boundaries become more complicated.

### Advantages

* Explicit control over the cursor
* Easy to adapt
* Avoids manually calculating the next index separately

### Disadvantages

* Slightly more verbose than the `for` loop
* Same UTF-16 considerations

---

# 6. `List.generate()`

Dart's collection utilities can also be used to create the chunks.

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final count = (text.length / size).ceil();

  return List.generate(
    count,
    (index) {
      final start = index * size;
      final end = (start + size).clamp(0, text.length);

      return text.substring(start, end);
    },
  );
}
```

Example:

```dart
final chunks = chunkString('HelloWorld', 3);
```

Result:

```dart
[Hel, loW, orl, d]
```

This approach is concise and declarative.

However, for a simple algorithm, a normal loop is generally easier to read.

---

# 7. `sync*` Generator

Dart supports generator functions, which make it possible to produce chunks lazily.

```dart
Iterable<String> chunkString(String text, int size) sync* {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);

    yield text.substring(i, end);
  }
}
```

Usage:

```dart
final chunks = chunkString('HelloWorld', 3);

for (final chunk in chunks) {
  print(chunk);
}
```

Output:

```text
Hel
loW
orl
d
```

You can materialize it when necessary:

```dart
final list = chunkString('HelloWorld', 3).toList();
```

## Why Use a Generator?

Generators are useful when the consumer does not necessarily need all chunks immediately.

For example:

```dart
for (final chunk in chunkString(largeText, 1000)) {
  process(chunk);
}
```

This gives you a clean streaming-style API.

### Advantages

* Lazy
* Memory efficient when consumed incrementally
* Excellent for large strings
* Composable with other `Iterable` operations

### Disadvantages

* Slightly more advanced
* Still uses UTF-16 indexes
* Calling `.toList()` removes most of the laziness benefit

---

# 8. Extension Method

If string chunking is something you use repeatedly, an extension can provide a clean API.

```dart
extension StringChunking on String {
  List<String> chunks(int size) {
    if (size <= 0) {
      throw ArgumentError.value(
        size,
        'size',
        'Chunk size must be greater than zero.',
      );
    }

    final result = <String>[];

    for (var i = 0; i < length; i += size) {
      final end = (i + size).clamp(0, length);
      result.add(substring(i, end));
    }

    return result;
  }
}
```

Now:

```dart
final chunks = 'HelloWorld'.chunks(3);
```

Result:

```dart
[Hel, loW, orl, d]
```

This produces a pleasant API:

```dart
final chunks = text.chunks(10);
```

For a reusable Dart utility library, this is often a good interface.

---

# 9. `runes` for Unicode Code Points

The previous approaches operate using Dart's string indexing model, which is based on UTF-16 code units.

If you want to chunk by Unicode code points, Dart provides:

```dart
text.runes
```

For example:

```dart
final text = 'Hello 😀 World';

print(text.runes.length);
```

A code-point-based chunker can be implemented like this:

```dart
List<String> chunkByRunes(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final runes = text.runes.toList();
  final chunks = <String>[];

  for (var i = 0; i < runes.length; i += size) {
    final end = (i + size).clamp(0, runes.length);

    chunks.add(
      String.fromCharCodes(
        runes.sublist(i, end),
      ),
    );
  }

  return chunks;
}
```

Example:

```dart
final chunks = chunkByRunes('Hello 😀 World', 3);
```

This avoids splitting a supplementary Unicode code point such as `😀` into invalid UTF-16 fragments.

### Important Limitation

Unicode code points are not necessarily what users perceive as characters.

Consider:

```text
👨‍👩‍👧‍👦
```

This is a single user-perceived character, but it consists of multiple Unicode code points joined together.

So `runes` is better than raw UTF-16 chunking for code-point boundaries, but it is not fully user-perceived-character safe.

---

# 10. Chunking with `runes` Lazily

You can also combine `runes` with a generator:

```dart
Iterable<String> chunkByRunes(String text, int size) sync* {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final runes = text.runes;

  var chunk = <int>[];

  for (final rune in runes) {
    chunk.add(rune);

    if (chunk.length == size) {
      yield String.fromCharCodes(chunk);
      chunk = <int>[];
    }
  }

  if (chunk.isNotEmpty) {
    yield String.fromCharCodes(chunk);
  }
}
```

This is useful when you want Unicode code-point-aware lazy processing.

---

# 11. `characters` Package for Grapheme Clusters

For user-facing text, the most important concept is often not a code point but a **grapheme cluster**.

A grapheme cluster represents what users generally perceive as one character.

For example:

```text
👨‍👩‍👧‍👦
```

may consist of several Unicode code points but is displayed as one visual character.

Similarly:

```text
é
```

can be represented in different Unicode forms.

For this type of text processing, the [`characters`](https://pub.dev/packages/characters) package is the appropriate tool.

Add it to your project:

```yaml
dependencies:
  characters: ^1.4.0
```

Then:

```dart
import 'package:characters/characters.dart';
```

You can access grapheme clusters through:

```dart
text.characters
```

## Grapheme-Safe Chunking

```dart
List<String> chunkByCharacters(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final characters = text.characters;
  final chunks = <String>[];

  var chunk = <String>[];

  for (final character in characters) {
    chunk.add(character);

    if (chunk.length == size) {
      chunks.add(chunk.join());
      chunk = <String>[];
    }
  }

  if (chunk.isNotEmpty) {
    chunks.add(chunk.join());
  }

  return chunks;
}
```

Now `size` means:

> Number of user-perceived characters.

This is generally the safest approach when chunking text that will be displayed to users.

---

# 12. `characters` with `take()` and `skip()`

The `characters` API can also be combined with iterable operations.

```dart
List<String> chunkByCharacters(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final characters = text.characters;
  final chunks = <String>[];

  for (var i = 0; i < characters.length; i += size) {
    chunks.add(
      characters
          .skip(i)
          .take(size)
          .toList()
          .join(),
    );
  }

  return chunks;
}
```

This is expressive, but repeatedly calling `skip()` and `take()` can be less efficient than maintaining a single iteration.

For performance-sensitive code, prefer a single-pass implementation.

---

# 13. Lazy Grapheme-Safe Chunking

A generator provides an excellent API when processing large amounts of user-facing text.

```dart
import 'package:characters/characters.dart';

Iterable<String> chunkByCharacters(
  String text,
  int size,
) sync* {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  var chunk = StringBuffer();
  var count = 0;

  for (final character in text.characters) {
    chunk.write(character);
    count++;

    if (count == size) {
      yield chunk.toString();

      chunk = StringBuffer();
      count = 0;
    }
  }

  if (count > 0) {
    yield chunk.toString();
  }
}
```

Usage:

```dart
for (final chunk in chunkByCharacters(text, 10)) {
  process(chunk);
}
```

This gives you:

* Unicode-aware boundaries
* Lazy processing
* No need to construct a complete list first
* Clean integration with `Iterable`

---

# 14. Chunking by UTF-8 Bytes

Sometimes "chunk size" does not mean characters at all.

Network protocols, file formats, storage systems, and APIs may operate on **bytes**.

Dart can encode strings as UTF-8 using:

```dart
utf8.encode(text)
```

from:

```dart
import 'dart:convert';
```

Example:

```dart
final bytes = utf8.encode('Hello 😀');
```

You can chunk the encoded bytes:

```dart
import 'dart:convert';

List<List<int>> chunkBytes(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final bytes = utf8.encode(text);
  final chunks = <List<int>>[];

  for (var i = 0; i < bytes.length; i += size) {
    final end = (i + size).clamp(0, bytes.length);

    chunks.add(bytes.sublist(i, end));
  }

  return chunks;
}
```

However, there is an important distinction:

> A byte chunk is not necessarily valid UTF-8 text by itself.

A multibyte UTF-8 character may be split across two chunks.

Therefore, byte chunking is appropriate when the consumer understands byte streams, not when each chunk must independently be valid human-readable text.

---

# 15. Chunking UTF-8 While Preserving Valid Text

If each chunk must independently decode into valid UTF-8, you cannot simply split the byte array at arbitrary positions.

A safer approach is to determine the UTF-8 boundaries before creating chunks.

However, if the actual requirement is:

> "Give me text chunks that contain at most N bytes."

then a character-aware algorithm should accumulate encoded byte lengths while preserving complete Unicode characters.

For example:

```dart
import 'dart:convert';

Iterable<String> chunkUtf8(String text, int maxBytes) sync* {
  if (maxBytes <= 0) {
    throw ArgumentError.value(maxBytes);
  }

  var buffer = StringBuffer();
  var byteLength = 0;

  for (final rune in text.runes) {
    final character = String.fromCharCode(rune);
    final characterBytes = utf8.encode(character);

    if (buffer.isNotEmpty &&
        byteLength + characterBytes.length > maxBytes) {
      yield buffer.toString();

      buffer = StringBuffer();
      byteLength = 0;
    }

    buffer.write(character);
    byteLength += characterBytes.length;
  }

  if (buffer.isNotEmpty) {
    yield buffer.toString();
  }
}
```

For production code involving complex Unicode text, consider whether grapheme clusters rather than individual code points should be preserved.

---

# 16. `StringBuffer` for Incremental Chunk Construction

If you are constructing chunks incrementally, `StringBuffer` can be useful.

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final chunks = <String>[];
  final buffer = StringBuffer();
  var count = 0;

  for (final character in text.runes) {
    buffer.writeCharCode(character);
    count++;

    if (count == size) {
      chunks.add(buffer.toString());

      buffer.clear();
      count = 0;
    }
  }

  if (count > 0) {
    chunks.add(buffer.toString());
  }

  return chunks;
}
```

`StringBuffer` becomes particularly useful when the chunking algorithm involves transformation or conditional logic rather than simply slicing an existing string.

For direct substring extraction, however, `substring()` is usually simpler.

---

# 17. Recursive Chunking

A recursive implementation is possible:

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  if (text.isEmpty) {
    return [];
  }

  final end = size.clamp(0, text.length);

  return [
    text.substring(0, end),
    ...chunkString(text.substring(end), size),
  ];
}
```

This is interesting as an algorithmic example, but it is generally **not recommended** for production string chunking.

Why?

* Creates additional intermediate strings
* Uses recursive calls
* Can consume significant stack space
* Less efficient for large strings
* More complicated than an iterative solution

Recursion is useful for demonstrating the concept, not usually for implementing this utility.

---

# 18. `split()` Is Usually Not the Right Tool

Developers sometimes try:

```dart
text.split('');
```

This should not be confused with fixed-size chunking.

For example:

```dart
'Hello'.split('');
```

produces individual pieces:

```text
H
e
l
l
o
```

It does not directly produce:

```text
He
ll
o
```

You could combine the resulting elements, but that introduces unnecessary work and Unicode considerations.

For fixed-size chunking, use an indexing approach, `runes`, or `characters` depending on your requirements.

---

# 19. Chunking an `Iterable`

Once you understand string chunking, the same concept can be generalized to any iterable.

For example:

```dart
Iterable<List<T>> chunkIterable<T>(
  Iterable<T> values,
  int size,
) sync* {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  var chunk = <T>[];

  for (final value in values) {
    chunk.add(value);

    if (chunk.length == size) {
      yield chunk;
      chunk = <T>[];
    }
  }

  if (chunk.isNotEmpty) {
    yield chunk;
  }
}
```

Usage:

```dart
final numbers = [1, 2, 3, 4, 5, 6, 7];

final chunks = chunkIterable(numbers, 3);

print(chunks.toList());
```

Result:

```text
[[1, 2, 3], [4, 5, 6], [7]]
```

This pattern is useful far beyond strings.

It can be used for:

* Database records
* API requests
* Batch processing
* File processing
* Pagination
* Background jobs

---

# 20. A Generic Reusable Chunking Utility

You can make the previous implementation reusable throughout a Dart project:

```dart
Iterable<List<T>> chunk<T>(
  Iterable<T> items,
  int size,
) sync* {
  if (size <= 0) {
    throw ArgumentError.value(
      size,
      'size',
      'Chunk size must be greater than zero.',
    );
  }

  var buffer = <T>[];

  for (final item in items) {
    buffer.add(item);

    if (buffer.length == size) {
      yield buffer;
      buffer = <T>[];
    }
  }

  if (buffer.isNotEmpty) {
    yield buffer;
  }
}
```

Then strings can be treated as a sequence of whatever unit you choose.

For code points:

```dart
final chunks = chunk(text.runes, 10)
    .map(String.fromCharCodes);
```

For grapheme clusters:

```dart
final chunks = chunk(text.characters, 10)
    .map((chunk) => chunk.join());
```

This separates two concerns:

1. **How elements are represented**
2. **How elements are grouped**

That is a powerful design pattern for reusable Dart utilities.

---

# 21. Handling Invalid Chunk Sizes

Every implementation should decide what happens when:

```dart
size == 0
```

or:

```dart
size < 0
```

Never allow this to silently enter a loop such as:

```dart
for (var i = 0; i < text.length; i += size)
```

because:

```dart
i += 0;
```

never advances.

A good API should fail immediately:

```dart
if (size <= 0) {
  throw ArgumentError.value(
    size,
    'size',
    'Chunk size must be greater than zero.',
  );
}
```

This makes bugs much easier to diagnose.

---

# 22. What Happens with an Empty String?

For most utility APIs, the natural result is:

```dart
chunkString('', 3)
```

→

```dart
[]
```

This is generally preferable to:

```dart
['']
```

because a chunk represents an actual piece of input, and an empty input contains no pieces.

However, this is an API-design decision. If your application needs different semantics, document them explicitly.

---

# 23. What Happens When the Size Is Larger Than the String?

For:

```dart
chunkString('Hello', 100)
```

the expected result is usually:

```dart
['Hello']
```

not:

```dart
['Hello', '', '', ...]
```

The final chunk simply contains whatever remains.

---

# 24. Choosing the Right Approach

Here is a practical comparison.

| Approach                | Unit                |          Unicode Safety |     Lazy | Extra Package | Typical Use                |
| ----------------------- | ------------------- | ----------------------: | -------: | ------------: | -------------------------- |
| `RegExp`                | Regex matches       |                 Depends |       No |            No | Pattern-based processing   |
| `substring()` loop      | UTF-16 code units   |                     Low |       No |            No | Simple ASCII/general data  |
| `while` + `substring()` | UTF-16 code units   |                     Low |       No |            No | Custom indexing            |
| `List.generate()`       | UTF-16 code units   |                     Low |       No |            No | Declarative implementation |
| `sync*` + `substring()` | UTF-16 code units   |                     Low |      Yes |            No | Large data/lazy processing |
| `runes`                 | Unicode code points |                  Better | Optional |            No | Unicode-aware processing   |
| `characters`            | Grapheme clusters   |      Best for user text | Optional |           Yes | UI/user-facing text        |
| UTF-8 bytes             | Bytes               | Not text-safe by itself | Optional |            No | Network/file protocols     |
| Recursion               | Depends             |                 Depends |       No |            No | Educational/algorithmic    |

---

# 25. Performance Considerations

For ordinary ASCII strings, a simple loop is generally the best balance of:

* Performance
* Readability
* Maintainability
* Zero dependencies

For example:

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(size);
  }

  final result = <String>[];

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);
    result.add(text.substring(i, end));
  }

  return result;
}
```

There is little reason to introduce regex for a problem this simple unless you already need pattern matching.

For very large data, consider a lazy generator:

```dart
Iterable<String> chunkString(String text, int size) sync* {
  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);
    yield text.substring(i, end);
  }
}
```

This allows consumers to process chunks without immediately constructing a complete list.

---

# 26. The Unicode Problem You Should Not Ignore

Consider:

```dart
const text = '😀😀😀';
```

A naive implementation based on `substring()` may not behave according to your intuitive definition of "character" because Dart strings use UTF-16 internally.

This is one of the most important distinctions when implementing text utilities.

There are three increasingly meaningful levels:

```text
UTF-16 code units
        ↓
Unicode code points
        ↓
Grapheme clusters
```

For example:

```text
👨‍👩‍👧‍👦
```

may be perceived as:

```text
1 character
```

while internally containing multiple Unicode code points and UTF-16 code units.

Therefore:

### If you're processing machine-oriented ASCII-like data

Use:

```dart
substring()
```

### If you need Unicode code points

Use:

```dart
runes
```

### If you're processing user-visible text

Use:

```dart
characters
```

---

# 27. Recommended Production Implementations

Rather than keeping dozens of implementations in your codebase, three versions cover most real-world scenarios.

## Simple String Chunking

For ordinary data:

```dart
List<String> chunkString(String text, int size) {
  if (size <= 0) {
    throw ArgumentError.value(
      size,
      'size',
      'Chunk size must be greater than zero.',
    );
  }

  final chunks = <String>[];

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);
    chunks.add(text.substring(i, end));
  }

  return chunks;
}
```

---

## Lazy String Chunking

For large strings:

```dart
Iterable<String> chunkString(
  String text,
  int size,
) sync* {
  if (size <= 0) {
    throw ArgumentError.value(
      size,
      'size',
      'Chunk size must be greater than zero.',
    );
  }

  for (var i = 0; i < text.length; i += size) {
    final end = (i + size).clamp(0, text.length);
    yield text.substring(i, end);
  }
}
```

---

## User-Facing Unicode Text

For UI and human-readable text:

```dart
import 'package:characters/characters.dart';

Iterable<String> chunkCharacters(
  String text,
  int size,
) sync* {
  if (size <= 0) {
    throw ArgumentError.value(
      size,
      'size',
      'Chunk size must be greater than zero.',
    );
  }

  var buffer = StringBuffer();
  var count = 0;

  for (final character in text.characters) {
    buffer.write(character);
    count++;

    if (count == size) {
      yield buffer.toString();

      buffer = StringBuffer();
      count = 0;
    }
  }

  if (count > 0) {
    yield buffer.toString();
  }
}
```

---

# 28. A Useful API Design: `chunk()` vs `chunkCharacters()`

If you're building a reusable Dart package, naming matters.

Avoid making users guess what "character" means.

For example:

```dart
text.chunk(10)
```

could imply UTF-16 positions.

Instead, explicitly communicate the semantics:

```dart
text.chunkCodeUnits(10);
text.chunkRunes(10);
text.chunkCharacters(10);
text.chunkBytes(10);
```

A more complete API could look like:

```dart
text.chunkCodeUnits(10);
text.chunkRunes(10);
text.chunkGraphemes(10);
text.chunkUtf8(1024);
```

This makes the behavior explicit and prevents subtle Unicode bugs.

---

# 29. Testing Your Chunking Function

A production implementation should test more than:

```text
HelloWorld
```

At minimum, test:

### Exact multiple

```dart
chunkString('abcdef', 2);
```

Expected:

```dart
['ab', 'cd', 'ef']
```

### Remainder

```dart
chunkString('abcdefg', 2);
```

Expected:

```dart
['ab', 'cd', 'ef', 'g']
```

### Size larger than string

```dart
chunkString('abc', 10);
```

Expected:

```dart
['abc']
```

### Empty string

```dart
chunkString('', 3);
```

Expected:

```dart
[]
```

### Size of one

```dart
chunkString('abc', 1);
```

Expected:

```dart
['a', 'b', 'c']
```

### Invalid size

```dart
chunkString('abc', 0);
```

Expected:

```dart
ArgumentError
```

### Unicode

```dart
chunkString('😀😀😀', 2);
```

This test is particularly important because it exposes assumptions about what constitutes a character.

### Grapheme clusters

Also test strings containing:

```text
👨‍👩‍👧‍👦
```

and combining characters such as:

```text
é
```

when using user-facing text.

---

# 30. Common Mistakes

## Mistake 1: Allowing `size == 0`

This can cause an infinite loop:

```dart
for (var i = 0; i < text.length; i += size)
```

Always validate the input.

---

## Mistake 2: Assuming `String.length` Means Characters

It doesn't necessarily mean "user-visible characters."

Dart's `String.length` is based on UTF-16 code units.

---

## Mistake 3: Using `runes` and Assuming Unicode Is Completely Solved

`runes` handles Unicode code points, but a grapheme cluster can contain multiple code points.

For user-facing text, prefer `characters`.

---

## Mistake 4: Splitting UTF-8 Bytes and Immediately Decoding Every Chunk

Arbitrarily splitting UTF-8 bytes can divide a multibyte character.

Byte chunking and text chunking are different problems.

---

## Mistake 5: Using Regex for Everything

This works:

```dart
RegExp('.{1,10}')
```

but a simple loop is usually clearer for fixed-size chunking.

Regex becomes more valuable when the chunking rules themselves are pattern-based.

---

# 31. Final Recommendation

There is no single "best" string-chunking algorithm in Dart.

Choose based on what your `size` actually represents.

### Use `substring()` when:

* You're working with ordinary machine data
* Your input is ASCII or otherwise known to be safe
* You want the simplest implementation
* Performance and simplicity matter

```dart
text.substring(start, end);
```

### Use `runes` when:

* You need Unicode code-point boundaries
* You are processing international text
* You need to avoid splitting supplementary Unicode characters

```dart
text.runes
```

### Use `characters` when:

* The text is displayed to users
* You care about what users perceive as characters
* You're working with emoji
* You're handling combining marks
* You're building internationalized Flutter UI

```dart
text.characters
```

### Use UTF-8 bytes when:

* Your chunk size is measured in bytes
* You're implementing network/file protocols
* The downstream consumer works with binary data

```dart
utf8.encode(text)
```

### Use `RegExp` when:

* Chunking is part of a larger pattern-matching operation
* You already need regex semantics
* Conciseness is more important than the overhead and complexity

### Use `sync*` when:

* The input is large
* You want lazy processing
* You don't need all chunks in memory simultaneously

---

# Conclusion

String chunking looks like a tiny problem:

```dart
'HelloWorld' → ['Hel', 'loW', 'orl', 'd']
```

but the correct implementation depends heavily on what a "character" means for your application.

For straightforward Dart code, a `for` loop with `substring()` is usually the cleanest solution.

For Unicode code-point-aware processing, use `runes`.

For user-facing text, use the `characters` package and work with grapheme clusters.

For protocols and storage systems, think in bytes rather than characters.

The most important lesson is therefore not which chunking technique is shortest. It is to **choose the correct unit of text before choosing the algorithm**.

```text
Machine-oriented text
        │
        ▼
   substring()
        │
        ▼
UTF-16 code units

Unicode-aware processing
        │
        ▼
      runes
        │
        ▼
Unicode code points

User-facing text
        │
        ▼
   characters
        │
        ▼
Grapheme clusters

Binary / protocol data
        │
        ▼
   UTF-8 bytes
```

Once that distinction is clear, choosing the appropriate Dart implementation becomes straightforward.
