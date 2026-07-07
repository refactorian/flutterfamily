---
sidebar_position: 27
title: CLI & Server-Side Dart
description: Learn how to build CLI tools and HTTP servers in pure Dart using dart:io, the args package, shelf, and native compilation.
---

Dart isn't just for Flutter. It's a capable language for command-line tools, scripts, and HTTP servers. This chapter covers everything you need to build production-quality CLI apps and backend services in pure Dart.

---

## Why Server-Side / CLI Dart?

- **Same language everywhere** — share models, validation logic, and utilities between your Flutter app and your backend
- **Fast startup** — AOT-compiled Dart binaries start in milliseconds
- **Strong typing** — catches bugs at compile time, not in production logs
- **Async-first** — `dart:io`'s non-blocking I/O handles thousands of concurrent connections on a single thread
- **Small binaries** — `dart compile exe` produces a single self-contained executable with no runtime dependency

---

## Project Setup

```bash
# Create a CLI app
dart create my_cli
cd my_cli

# Create a server app
dart create --template=server-shelf my_server
cd my_server

dart pub get
dart run          # run in JIT mode (fast iteration)
dart compile exe bin/my_cli.dart -o my_cli  # compile to native binary
./my_cli          # run the binary — no Dart SDK needed!
```

```
my_cli/
├── bin/
│   └── my_cli.dart       ← entry point
├── lib/
│   └── src/
│       ├── commands/     ← one file per command
│       └── utils/
├── test/
└── pubspec.yaml
```

---

## `dart:io` — File System

```dart
import 'dart:io';

// ── Reading files ─────────────────────────────────────────────────────

// Read entire file as a string (synchronous — blocks the thread)
final content = File('data.txt').readAsStringSync();

// Read entire file as a string (async — preferred)
final content2 = await File('data.txt').readAsString();

// Read as bytes
final bytes = await File('image.png').readAsBytes();

// Read line by line (memory-efficient for large files)
final lines = await File('large.csv')
    .openRead()
    .transform(utf8.decoder)
    .transform(const LineSplitter())
    .toList();

// Stream lines (lazy — only reads what you consume)
final stream = File('huge.log')
    .openRead()
    .transform(utf8.decoder)
    .transform(const LineSplitter());

await for (final line in stream) {
  if (line.contains('ERROR')) print(line);
}

// ── Writing files ─────────────────────────────────────────────────────

// Write string (overwrites if exists)
await File('output.txt').writeAsString('Hello, Dart!\n');

// Append to file
await File('log.txt').writeAsString(
  '${DateTime.now()}: event\n',
  mode: FileMode.append,
);

// Write bytes
await File('output.bin').writeAsBytes(bytes);

// Write with a sink (for streaming large output)
final sink = File('output.txt').openWrite();
sink.writeln('Line 1');
sink.writeln('Line 2');
await sink.flush();
await sink.close();

// ── File & directory checks ───────────────────────────────────────────

final file = File('config.json');
print(await file.exists());        // true / false
print(await file.length());        // size in bytes
print(await file.lastModified());  // DateTime

// Copy, rename, delete
await file.copy('config.backup.json');
await file.rename('config_new.json');
await file.delete();

// ── Directories ───────────────────────────────────────────────────────

final dir = Directory('data');
await dir.create(recursive: true); // creates parent dirs too

// List contents
await for (final entity in dir.list()) {
  if (entity is File) {
    print('File: ${entity.path}');
  } else if (entity is Directory) {
    print('Dir:  ${entity.path}');
  }
}

// Recursive listing
await for (final entity in dir.list(recursive: true)) {
  print(entity.path);
}

// Find files by extension
final dartFiles = dir
    .listSync(recursive: true)
    .whereType<File>()
    .where((f) => f.path.endsWith('.dart'))
    .toList();

// Common paths
print(Directory.current.path);           // working directory
print(Platform.executable);              // path to dart binary
print(Platform.script.toFilePath());     // path to running script
```

---

## `dart:io` — Standard Input & Output

```dart
import 'dart:io';

// ── stdout / stderr ───────────────────────────────────────────────────

stdout.writeln('Normal output');
stderr.writeln('Error output');    // goes to stderr (separate stream)

// print() is shorthand for stdout.writeln()
print('Hello!');

// ANSI colour codes for terminals that support them
void printColour(String msg, {int colour = 37}) {
  stdout.writeln('\x1B[${colour}m$msg\x1B[0m');
}

printColour('Success!', colour: 32); // green
printColour('Warning!', colour: 33); // yellow
printColour('Error!',   colour: 31); // red

// ── stdin ─────────────────────────────────────────────────────────────

// Read a single line (blocks until user presses Enter)
stdout.write('Enter your name: ');
final name = stdin.readLineSync(); // String?
print('Hello, ${name ?? 'stranger'}!');

// Read with encoding
final line = stdin.readLineSync(encoding: utf8);

// Read all stdin (useful for piped input: cat file.txt | dart run app.dart)
final piped = await stdin
    .transform(utf8.decoder)
    .transform(const LineSplitter())
    .toList();

// Check if stdin is a terminal or piped
if (stdin.hasTerminal) {
  stdout.write('Interactive mode — enter commands:');
} else {
  // Reading from a pipe or file redirect
}

// ── Interactive prompt helper ─────────────────────────────────────────

String prompt(String question, {String? defaultValue}) {
  if (defaultValue != null) {
    stdout.write('$question [$defaultValue]: ');
  } else {
    stdout.write('$question: ');
  }
  final input = stdin.readLineSync()?.trim() ?? '';
  return input.isEmpty && defaultValue != null ? defaultValue : input;
}

bool confirm(String question, {bool defaultYes = false}) {
  final hint = defaultYes ? 'Y/n' : 'y/N';
  stdout.write('$question ($hint): ');
  final input = stdin.readLineSync()?.trim().toLowerCase() ?? '';
  if (input.isEmpty) return defaultYes;
  return input == 'y' || input == 'yes';
}

// Usage
final host = prompt('Server host', defaultValue: 'localhost');
final port = prompt('Port', defaultValue: '8080');
if (confirm('Start server?', defaultYes: true)) {
  print('Starting on $host:$port');
}
```

---

## Argument Parsing with `args`

The `args` package is the standard way to handle CLI arguments:

```yaml
# pubspec.yaml
dependencies:
  args: ^2.5.0
```

```dart
import 'package:args/args.dart';
import 'dart:io';

void main(List<String> arguments) {
  final parser = ArgParser()
    // Flags — boolean, no value
    ..addFlag('verbose',
        abbr: 'v',
        help: 'Enable verbose output',
        defaultsTo: false)
    ..addFlag('dry-run',
        abbr: 'n',
        help: 'Show what would happen without doing it',
        negatable: false)

    // Options — take a value
    ..addOption('output',
        abbr: 'o',
        help: 'Output file path',
        valueHelp: 'path',
        defaultsTo: 'output.txt')
    ..addOption('format',
        abbr: 'f',
        help: 'Output format',
        allowed: ['json', 'csv', 'text'],
        defaultsTo: 'text')

    // Multi-option — can be specified multiple times
    ..addMultiOption('tag',
        abbr: 't',
        help: 'Tags to apply (can repeat: -t foo -t bar)')

    // Separator for help text
    ..addSeparator('Advanced options:')
    ..addOption('timeout',
        help: 'Request timeout in seconds',
        defaultsTo: '30');

  // Parse — wrap in try/catch for invalid input
  late ArgResults args;
  try {
    args = parser.parse(arguments);
  } on FormatException catch (e) {
    stderr.writeln('Error: ${e.message}');
    stderr.writeln(parser.usage);
    exit(1);
  }

  // Access parsed values
  final verbose = args.flag('verbose');
  final dryRun  = args.flag('dry-run');
  final output  = args.option('output')!;
  final format  = args.option('format')!;
  final tags    = args.multiOption('tag');
  final timeout = int.parse(args.option('timeout')!);

  // Rest — positional arguments after flags
  final files = args.rest; // List<String>

  if (args.flag('help') || files.isEmpty) {
    print('Usage: my_cli [options] <files...>\n');
    print(parser.usage);
    exit(0);
  }

  if (verbose) print('Processing ${files.length} file(s)...');
  if (dryRun)  print('[DRY RUN] No changes will be made');

  for (final file in files) {
    if (verbose) print('  → $file');
    // process(file, output: output, format: format, tags: tags);
  }
}
```

```bash
# Example invocations
dart run bin/my_cli.dart --verbose --format json -o result.json file1.txt file2.txt
dart run bin/my_cli.dart -v -n --tag alpha --tag beta input.csv
./my_cli --help
```

---

## Sub-Commands with `args`

Real CLI tools use sub-commands (`git commit`, `git push`):

```dart
import 'package:args/command_runner.dart';
import 'dart:io';

// ── Define commands ───────────────────────────────────────────────────

class ServeCommand extends Command {
  @override
  String get name        => 'serve';
  @override
  String get description => 'Start the HTTP server';

  ServeCommand() {
    argParser
      ..addOption('port', abbr: 'p', defaultsTo: '8080')
      ..addOption('host', defaultsTo: 'localhost')
      ..addFlag('hot-reload', defaultsTo: false);
  }

  @override
  Future<void> run() async {
    final port = int.parse(argResults!.option('port')!);
    final host = argResults!.option('host')!;
    print('Serving on http://$host:$port');
    // await startServer(host: host, port: port);
  }
}

class BuildCommand extends Command {
  @override
  String get name        => 'build';
  @override
  String get description => 'Build the project for production';

  BuildCommand() {
    argParser.addOption('target',
        allowed: ['web', 'linux', 'windows', 'macos'],
        defaultsTo: 'web');
  }

  @override
  Future<void> run() async {
    final target = argResults!.option('target')!;
    print('Building for $target...');
    // await buildProject(target);
  }
}

class MigrateCommand extends Command {
  @override
  String get name        => 'migrate';
  @override
  String get description => 'Run database migrations';

  MigrateCommand() {
    addSubcommand(MigrateUpCommand());
    addSubcommand(MigrateDownCommand());
  }

  @override
  String get usageFooter => '\nRun a specific migration direction.';
}

class MigrateUpCommand extends Command {
  @override String get name        => 'up';
  @override String get description => 'Apply pending migrations';
  @override Future<void> run() async => print('Running migrations up...');
}

class MigrateDownCommand extends Command {
  @override String get name        => 'down';
  @override String get description => 'Roll back last migration';
  @override Future<void> run() async => print('Rolling back migration...');
}

// ── Wire up with CommandRunner ─────────────────────────────────────────

Future<void> main(List<String> args) async {
  final runner = CommandRunner('mytool', 'A Dart CLI toolkit')
    ..addCommand(ServeCommand())
    ..addCommand(BuildCommand())
    ..addCommand(MigrateCommand());

  try {
    await runner.run(args);
  } on UsageException catch (e) {
    stderr.writeln(e.message);
    exit(64); // EX_USAGE
  }
}
```

```bash
dart run bin/mytool.dart serve --port 3000
dart run bin/mytool.dart build --target linux
dart run bin/mytool.dart migrate up
dart run bin/mytool.dart --help
dart run bin/mytool.dart serve --help
```

---

## Running External Processes

```dart
import 'dart:io';

// ── Simple: run and wait ──────────────────────────────────────────────

// Run a command and get all output at once
final result = await Process.run('git', ['status']);
print(result.stdout);         // stdout as String
print(result.stderr);         // stderr as String
print(result.exitCode);       // 0 = success

// Check exit code
if (result.exitCode != 0) {
  throw Exception('git failed: ${result.stderr}');
}

// ── Streaming: real-time output ───────────────────────────────────────

// Start a long-running process and stream its output
final process = await Process.start(
  'dart', ['run', 'bin/server.dart'],
  // Inherit environment variables
  environment: {...Platform.environment, 'PORT': '3000'},
);

// Stream stdout in real time
process.stdout
    .transform(utf8.decoder)
    .transform(const LineSplitter())
    .listen((line) => print('[server] $line'));

// Stream stderr
process.stderr
    .transform(utf8.decoder)
    .transform(const LineSplitter())
    .listen((line) => stderr.writeln('[server ERR] $line'));

// Wait for process to exit
final exitCode = await process.exitCode;
print('Process exited with code $exitCode');

// ── Sending input to a process ────────────────────────────────────────

final proc = await Process.start('cat', []);
proc.stdin.writeln('Hello from Dart!');
await proc.stdin.close();
print(await proc.stdout.transform(utf8.decoder).join()); // Hello from Dart!

// ── Shell helper ─────────────────────────────────────────────────────

Future<String> shell(String command, {String? workingDir}) async {
  final parts  = command.split(' ');
  final result = await Process.run(
    parts.first,
    parts.sublist(1),
    workingDirectory: workingDir,
    runInShell: true, // use system shell — handles PATH, etc.
  );
  if (result.exitCode != 0) {
    throw ProcessException(
      parts.first,
      parts.sublist(1),
      result.stderr.toString(),
      result.exitCode,
    );
  }
  return result.stdout.toString().trim();
}

// Usage
final branch  = await shell('git rev-parse --abbrev-ref HEAD');
final version = await shell('dart --version');
print('On branch: $branch');
```

---

## Environment Variables & Platform

```dart
import 'dart:io';

// ── Environment variables ─────────────────────────────────────────────

// Read a variable
final dbUrl  = Platform.environment['DATABASE_URL'];
final apiKey = Platform.environment['API_KEY'];

// Safe read with default
String env(String key, {String? fallback}) {
  final value = Platform.environment[key];
  if (value != null && value.isNotEmpty) return value;
  if (fallback != null) return fallback;
  throw StateError('Required environment variable "$key" is not set');
}

// Usage
final port    = int.parse(env('PORT',    fallback: '8080'));
final host    = env('HOST',    fallback: 'localhost');
final dbUrl2  = env('DATABASE_URL');      // throws if not set

// ── Platform detection ────────────────────────────────────────────────

print(Platform.operatingSystem);     // 'linux', 'macos', 'windows', 'android', 'ios'
print(Platform.operatingSystemVersion);
print(Platform.numberOfProcessors);
print(Platform.localHostname);
print(Platform.localeName);          // e.g. 'en_US'
print(Platform.executable);          // path to dart binary
print(Platform.version);             // Dart SDK version

// Platform-specific behaviour
final configDir = switch (Platform.operatingSystem) {
  'windows' => Platform.environment['APPDATA']!,
  'macos'   => '${Platform.environment['HOME']}/.config',
  _         => '${Platform.environment['HOME']}/.config',
};

// ── Exit codes ────────────────────────────────────────────────────────

// Standard Unix exit codes
// 0  — success
// 1  — general error
// 2  — misuse of shell command
// 64 — usage error (EX_USAGE)
// 65 — data error (EX_DATAERR)
// 70 — internal software error (EX_SOFTWARE)
// 126 — command cannot execute
// 127 — command not found

exit(0);   // success
exit(1);   // failure — terminates immediately, no cleanup!

// For cleanup before exit, use addShutdownHook or try/finally in main
```

---

## Signal Handling

```dart
import 'dart:io';

Future<void> main() async {
  // Handle Ctrl+C gracefully
  ProcessSignal.sigint.watch().listen((signal) async {
    print('\nShutting down gracefully...');
    await cleanup();
    exit(0);
  });

  // Handle SIGTERM (sent by process managers like Docker, systemd)
  if (!Platform.isWindows) {
    ProcessSignal.sigterm.watch().listen((signal) async {
      print('Received SIGTERM — shutting down...');
      await cleanup();
      exit(0);
    });
  }

  print('Running... Press Ctrl+C to stop');
  await runForever();
}

Future<void> cleanup() async {
  // Close DB connections, flush logs, etc.
  print('Cleanup complete.');
}

Future<void> runForever() async {
  // Keep the process alive
  await Completer<void>().future;
}
```

---

## HTTP Server with `shelf`

`shelf` is the most popular pure-Dart HTTP server library:

```yaml
dependencies:
  shelf:            ^1.4.0
  shelf_router:     ^1.1.0
  shelf_static:     ^1.1.0
```

```dart
import 'dart:io';
import 'dart:convert';
import 'package:shelf/shelf.dart';
import 'package:shelf/shelf_io.dart' as io;
import 'package:shelf_router/shelf_router.dart';

// ── In-memory data store (replace with a real DB) ─────────────────────

final _users = <String, Map<String, dynamic>>{
  '1': {'id': '1', 'name': 'Alice', 'email': 'alice@example.com'},
  '2': {'id': '2', 'name': 'Bob',   'email': 'bob@example.com'},
};

// ── Helpers ───────────────────────────────────────────────────────────

Response jsonResponse(Object body, {int status = 200}) => Response(
      status,
      body:    jsonEncode(body),
      headers: {'content-type': 'application/json'},
    );

Response notFound(String message) =>
    jsonResponse({'error': message}, status: 404);

Response badRequest(String message) =>
    jsonResponse({'error': message}, status: 400);

// ── Middleware ────────────────────────────────────────────────────────

Middleware get loggingMiddleware => (Handler handler) {
      return (Request request) async {
        final start    = DateTime.now();
        final response = await handler(request);
        final elapsed  = DateTime.now().difference(start).inMilliseconds;
        print('${request.method} ${request.url} '
            '→ ${response.statusCode} (${elapsed}ms)');
        return response;
      };
    };

Middleware get corsMiddleware => (Handler handler) {
      return (Request request) async {
        if (request.method == 'OPTIONS') {
          return Response.ok('', headers: _corsHeaders);
        }
        final response = await handler(request);
        return response.change(headers: _corsHeaders);
      };
    };

const _corsHeaders = {
  'access-control-allow-origin':  '*',
  'access-control-allow-methods': 'GET, POST, PUT, DELETE, OPTIONS',
  'access-control-allow-headers': 'content-type, authorization',
};

// ── Route handlers ────────────────────────────────────────────────────

// GET /users
Response getUsers(Request request) {
  return jsonResponse(_users.values.toList());
}

// GET /users/:id
Response getUser(Request request, String id) {
  final user = _users[id];
  if (user == null) return notFound('User $id not found');
  return jsonResponse(user);
}

// POST /users
Future<Response> createUser(Request request) async {
  final body = await request.readAsString();

  late Map<String, dynamic> data;
  try {
    data = jsonDecode(body) as Map<String, dynamic>;
  } on FormatException {
    return badRequest('Invalid JSON');
  }

  final name  = data['name']  as String?;
  final email = data['email'] as String?;
  if (name == null || email == null) {
    return badRequest('name and email are required');
  }

  final id   = (_users.length + 1).toString();
  final user = {'id': id, 'name': name, 'email': email};
  _users[id] = user;

  return jsonResponse(user, status: 201);
}

// PUT /users/:id
Future<Response> updateUser(Request request, String id) async {
  if (!_users.containsKey(id)) return notFound('User $id not found');

  final body = await request.readAsString();
  late Map<String, dynamic> data;
  try {
    data = jsonDecode(body) as Map<String, dynamic>;
  } on FormatException {
    return badRequest('Invalid JSON');
  }

  _users[id] = {..._users[id]!, ...data, 'id': id};
  return jsonResponse(_users[id]!);
}

// DELETE /users/:id
Response deleteUser(Request request, String id) {
  if (_users.remove(id) == null) return notFound('User $id not found');
  return Response(204); // No Content
}

// ── Router ────────────────────────────────────────────────────────────

Router buildRouter() {
  final router = Router();

  router.get('/health',        (Request r) => jsonResponse({'status': 'ok'}));
  router.get('/users',          getUsers);
  router.get('/users/<id>',     getUser);
  router.post('/users',         createUser);
  router.put('/users/<id>',     updateUser);
  router.delete('/users/<id>',  deleteUser);

  // 404 fallback
  router.all('/<ignored|.*>',
      (Request r) => notFound('Route not found: ${r.url}'));

  return router;
}

// ── Entry point ───────────────────────────────────────────────────────

Future<void> main() async {
  final port    = int.parse(Platform.environment['PORT'] ?? '8080');
  final host    = Platform.environment['HOST']           ?? 'localhost';

  final handler = const Pipeline()
      .addMiddleware(loggingMiddleware)
      .addMiddleware(corsMiddleware)
      .addHandler(buildRouter().call);

  final server = await io.serve(handler, host, port);
  print('Server listening on http://${server.address.host}:${server.port}');

  // Graceful shutdown
  ProcessSignal.sigint.watch().listen((_) async {
    print('\nShutting down...');
    await server.close(force: false);
    exit(0);
  });
}
```

```bash
dart run bin/server.dart
# Server listening on http://localhost:8080

# Test it
curl http://localhost:8080/users
curl http://localhost:8080/users/1
curl -X POST http://localhost:8080/users \
     -H 'Content-Type: application/json' \
     -d '{"name":"Carol","email":"carol@example.com"}'
curl -X DELETE http://localhost:8080/users/1
```

---

## Building & Distributing CLI Tools

```bash
# Compile to a self-contained native binary
dart compile exe bin/my_cli.dart -o my_cli

# The binary runs without Dart SDK installed
./my_cli --help

# Cross-compilation is not supported — compile on the target platform
# Use Docker for Linux builds on macOS/Windows:
docker run --rm -v $(pwd):/app dart:stable \
    dart compile exe /app/bin/my_cli.dart -o /app/my_cli_linux

# Publish a CLI tool globally via pub.dev
# pubspec.yaml — mark as executable:
# executables:
#   my_cli: my_cli    ← runs bin/my_cli.dart

dart pub global activate my_cli     # install from pub.dev
dart pub global activate --source path . # install from local path
my_cli --version                    # run it from anywhere
```

---

## Summary

| Task | API / Package |
|------|--------------|
| Read file | `File('path').readAsString()` |
| Write file | `File('path').writeAsString(content)` |
| Stream file lines | `.openRead().transform(utf8.decoder).transform(LineSplitter())` |
| List directory | `Directory('path').list(recursive: true)` |
| Read user input | `stdin.readLineSync()` |
| Write to stderr | `stderr.writeln(msg)` |
| Parse CLI args | `ArgParser` from `package:args` |
| Sub-commands | `CommandRunner` + `Command` from `package:args` |
| Run a process | `Process.run(cmd, args)` |
| Stream process output | `Process.start(cmd, args)` |
| Environment variables | `Platform.environment['KEY']` |
| Platform detection | `Platform.operatingSystem` |
| Signal handling | `ProcessSignal.sigint.watch().listen(...)` |
| HTTP server | `shelf` + `shelf_router` |
| Compile to binary | `dart compile exe bin/app.dart -o app` |
| Publish CLI tool | `dart pub global activate <package>` |
