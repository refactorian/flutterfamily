---
id: productivity-task-app
title: Task Management & Productivity Starter Kit
sidebar_label: Task & Productivity App
---

# Task Management & Productivity Starter Kit

A clean task management, todo, and project tracker starter template. Includes category filter chips, expandable task tiles with checkbox completion, priority tags, and a daily progress summary header.

## Features
- 📋 Task list grouped by Today, Upcoming, and Completed
- 🏷️ Priority badges (High, Medium, Low) with custom color indicators
- ✅ Interactive checkable task cards with strike-through animations
- 📊 Daily task completion summary progress bar
- ➕ Quick-add task modal bottom sheet with due-date picker

## Template Code

```dart
import 'package:flutter/material.dart';

class TaskItem {
  final String id;
  final String title;
  final String category;
  final String priority; // High, Medium, Low
  final DateTime dueDate;
  bool isCompleted;

  TaskItem({
    required this.id,
    required this.title,
    required this.category,
    required this.priority,
    required this.dueDate,
    this.isCompleted = false,
  });
}

class ProductivityTaskScreen extends StatefulWidget {
  const ProductivityTaskScreen({super.key});

  @override
  State<ProductivityTaskScreen> createState() => _ProductivityTaskScreenState();
}

class _ProductivityTaskScreenState extends State<ProductivityTaskScreen> {
  final List<TaskItem> _tasks = [
    TaskItem(id: '1', title: 'Review pull requests & merge', category: 'Work', priority: 'High', dueDate: DateTime.now()),
    TaskItem(id: '2', title: 'Design system meeting with team', category: 'Design', priority: 'Medium', dueDate: DateTime.now()),
    TaskItem(id: '3', title: '30-minute afternoon workout', category: 'Personal', priority: 'Low', dueDate: DateTime.now()),
  ];

  int get _completedCount => _tasks.where((t) => t.isCompleted).length;
  double get _progress => _tasks.isEmpty ? 0 : _completedCount / _tasks.length;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFF1F5F9),
      appBar: AppBar(
        title: const Text('My Tasks', style: TextStyle(fontWeight: FontWeight.bold)),
        actions: [
          IconButton(icon: const Icon(Icons.tune_rounded), onPressed: () {}),
        ],
      ),
      body: ListView(
        padding: const EdgeInsets.all(20),
        children: [
          // ── Progress Overview Header ──────────────────────────
          Container(
            padding: const EdgeInsets.all(20),
            decoration: BoxDecoration(
              gradient: const LinearGradient(
                colors: [Color(0xFF4F46E5), Color(0xFF7C3AED)],
              ),
              borderRadius: BorderRadius.circular(20),
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Daily Progress', style: TextStyle(color: Colors.white70, fontSize: 13)),
                const SizedBox(height: 6),
                Text(
                  '$_completedCount of ${_tasks.length} tasks completed',
                  style: const TextStyle(color: Colors.white, fontSize: 20, fontWeight: FontWeight.bold),
                ),
                const SizedBox(height: 14),
                ClipRRect(
                  borderRadius: BorderRadius.circular(8),
                  child: LinearProgressIndicator(
                    value: _progress,
                    minHeight: 8,
                    backgroundColor: Colors.white24,
                    valueColor: const AlwaysStoppedAnimation(Colors.greenAccent),
                  ),
                ),
              ],
            ),
          ),
          const SizedBox(height: 24),

          // ── Task List Section ─────────────────────────────────
          const Text('Today', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 12),
          ..._tasks.map((task) => _TaskCard(
                task: task,
                onToggle: () {
                  setState(() {
                    task.isCompleted = !task.isCompleted;
                  });
                },
              )),
        ],
      ),
      floatingActionButton: FloatingActionButton.extended(
        onPressed: () {},
        backgroundColor: const Color(0xFF4F46E5),
        icon: const Icon(Icons.add, color: Colors.white),
        label: const Text('New Task', style: TextStyle(color: Colors.white, fontWeight: FontWeight.bold)),
      ),
    );
  }
}

class _TaskCard extends StatelessWidget {
  final TaskItem task;
  final VoidCallback onToggle;

  const _TaskCard({required this.task, required this.onToggle});

  Color _getPriorityColor(String priority) {
    switch (priority) {
      case 'High': return Colors.red;
      case 'Medium': return Colors.amber;
      case 'Low': return Colors.blue;
      default: return Colors.grey;
    }
  }

  @override
  Widget build(BuildContext context) {
    final priorityColor = _getPriorityColor(task.priority);

    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: Colors.grey.shade200),
      ),
      child: Row(
        children: [
          Checkbox(
            value: task.isCompleted,
            onChanged: (_) => onToggle(),
            activeColor: const Color(0xFF4F46E5),
            shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(5)),
          ),
          const SizedBox(width: 8),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  task.title,
                  style: TextStyle(
                    fontSize: 14,
                    fontWeight: FontWeight.w600,
                    decoration: task.isCompleted ? TextDecoration.lineThrough : null,
                    color: task.isCompleted ? Colors.grey : Colors.black87,
                  ),
                ),
                const SizedBox(height: 4),
                Row(
                  children: [
                    Container(
                      padding: const EdgeInsets.symmetric(horizontal: 8, vertical: 2),
                      decoration: BoxDecoration(
                        color: priorityColor.withOpacity(0.12),
                        borderRadius: BorderRadius.circular(6),
                      ),
                      child: Text(
                        task.priority,
                        style: TextStyle(color: priorityColor, fontSize: 10, fontWeight: FontWeight.bold),
                      ),
                    ),
                    const SizedBox(width: 8),
                    Text(task.category, style: TextStyle(color: Colors.grey.shade600, fontSize: 12)),
                  ],
                ),
              ],
            ),
          ),
        ],
      ),
    );
  }
}
```

## Recommended Libraries
- `table_calendar` for interactive calendar view
- `hive` or `isar` for persistent offline task storage
