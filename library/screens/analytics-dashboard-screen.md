---
id: analytics-dashboard-screen
title: Analytics Dashboard Screen
sidebar_label: Analytics Dashboard
---

# Analytics Dashboard Screen

A data-rich analytics dashboard with KPI metric cards, a custom bar chart drawn with `CustomPainter`, a scrollable activity list, and a date-range chip selector. No third-party chart packages required.

## Features
- 📊 KPI summary cards (Revenue, Users, Orders, Conversion)
- 📈 Custom bar chart with animated fill using `CustomPainter`
- 📅 Date range chip selector (7d / 30d / 90d)
- 📋 Recent activity feed list
- 🎨 Color-coded metric trend indicators (+/- deltas)
- 💡 Pure Flutter — no external chart library

## Flutter Code

```dart
import 'package:flutter/material.dart';

// ── Models ─────────────────────────────────────────────────────────────────

class MetricCard {
  final String title;
  final String value;
  final String delta;
  final bool isPositive;
  final IconData icon;
  final Color color;

  const MetricCard({
    required this.title,
    required this.value,
    required this.delta,
    required this.isPositive,
    required this.icon,
    required this.color,
  });
}

class ActivityItem {
  final String title;
  final String subtitle;
  final String time;
  final IconData icon;
  final Color color;

  const ActivityItem({
    required this.title,
    required this.subtitle,
    required this.time,
    required this.icon,
    required this.color,
  });
}

// ── Screen ─────────────────────────────────────────────────────────────────

class AnalyticsDashboardScreen extends StatefulWidget {
  const AnalyticsDashboardScreen({super.key});

  @override
  State<AnalyticsDashboardScreen> createState() =>
      _AnalyticsDashboardScreenState();
}

class _AnalyticsDashboardScreenState extends State<AnalyticsDashboardScreen>
    with SingleTickerProviderStateMixin {
  int _selectedRange = 0; // 0=7d, 1=30d, 2=90d
  late AnimationController _chartController;
  late Animation<double> _chartAnimation;

  final List<String> _ranges = ['7 Days', '30 Days', '90 Days'];

  final List<MetricCard> _metrics = const [
    MetricCard(
      title: 'Revenue',
      value: '\$48,295',
      delta: '+12.5%',
      isPositive: true,
      icon: Icons.attach_money_rounded,
      color: Color(0xFF6366F1),
    ),
    MetricCard(
      title: 'New Users',
      value: '3,842',
      delta: '+8.1%',
      isPositive: true,
      icon: Icons.people_outline_rounded,
      color: Color(0xFF0EA5E9),
    ),
    MetricCard(
      title: 'Orders',
      value: '1,294',
      delta: '-3.2%',
      isPositive: false,
      icon: Icons.shopping_bag_outlined,
      color: Color(0xFFF59E0B),
    ),
    MetricCard(
      title: 'Conversion',
      value: '4.7%',
      delta: '+0.4%',
      isPositive: true,
      icon: Icons.trending_up_rounded,
      color: Color(0xFF10B981),
    ),
  ];

  // Bar chart data (7 bars = Mon–Sun)
  final List<double> _chartData = [0.4, 0.6, 0.5, 0.8, 0.7, 0.9, 0.65];
  final List<String> _chartLabels = [
    'Mon',
    'Tue',
    'Wed',
    'Thu',
    'Fri',
    'Sat',
    'Sun',
  ];

  final List<ActivityItem> _activities = const [
    ActivityItem(
      title: 'New subscription',
      subtitle: 'sarah@example.com upgraded to Pro',
      time: '2m ago',
      icon: Icons.star_rounded,
      color: Color(0xFF6366F1),
    ),
    ActivityItem(
      title: 'Order placed',
      subtitle: 'Order #4821 — \$149.00',
      time: '14m ago',
      icon: Icons.shopping_bag_outlined,
      color: Color(0xFF0EA5E9),
    ),
    ActivityItem(
      title: 'New user registered',
      subtitle: 'mark.t@example.com joined',
      time: '1h ago',
      icon: Icons.person_add_outlined,
      color: Color(0xFF10B981),
    ),
    ActivityItem(
      title: 'Refund requested',
      subtitle: 'Order #4780 — \$89.00',
      time: '3h ago',
      icon: Icons.refresh_rounded,
      color: Color(0xFFF59E0B),
    ),
    ActivityItem(
      title: 'Server alert',
      subtitle: 'API response time > 800ms',
      time: '5h ago',
      icon: Icons.warning_amber_rounded,
      color: Colors.red,
    ),
  ];

  @override
  void initState() {
    super.initState();
    _chartController = AnimationController(
      vsync: this,
      duration: const Duration(milliseconds: 900),
    );
    _chartAnimation = CurvedAnimation(
      parent: _chartController,
      curve: Curves.easeOutCubic,
    );
    _chartController.forward();
  }

  @override
  void dispose() {
    _chartController.dispose();
    super.dispose();
  }

  void _changeRange(int index) {
    setState(() => _selectedRange = index);
    _chartController.forward(from: 0);
  }

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    final cs = theme.colorScheme;

    return Scaffold(
      backgroundColor: cs.surface,
      appBar: AppBar(
        title: const Text('Analytics'),
        backgroundColor: cs.surface,
        surfaceTintColor: Colors.transparent,
        actions: [
          IconButton(
            icon: const Icon(Icons.calendar_today_outlined),
            onPressed: () {},
          ),
          IconButton(
            icon: const Icon(Icons.more_vert_rounded),
            onPressed: () {},
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            // ── Greeting ────────────────────────────────────────
            Text(
              'Good morning, Alex 👋',
              style: theme.textTheme.titleMedium?.copyWith(
                color: cs.onSurfaceVariant,
              ),
            ),
            const SizedBox(height: 4),
            Text(
              'Here\'s what\'s happening today',
              style: theme.textTheme.headlineSmall?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 24),

            // ── Metric cards ─────────────────────────────────────
            GridView.count(
              crossAxisCount: 2,
              shrinkWrap: true,
              physics: const NeverScrollableScrollPhysics(),
              mainAxisSpacing: 12,
              crossAxisSpacing: 12,
              childAspectRatio: 1.55,
              children: _metrics
                  .map((m) => _MetricCardWidget(metric: m))
                  .toList(),
            ),
            const SizedBox(height: 24),

            // ── Chart section ─────────────────────────────────────
            Container(
              padding: const EdgeInsets.all(20),
              decoration: BoxDecoration(
                color: cs.surfaceContainerHighest.withValues(alpha: 0.4),
                borderRadius: BorderRadius.circular(16),
              ),
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Row(
                    mainAxisAlignment: MainAxisAlignment.spaceBetween,
                    children: [
                      Text(
                        'Revenue Overview',
                        style: theme.textTheme.titleMedium?.copyWith(
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                      const SizedBox(width: 8),
                      // Range chips
                      Flexible(
                        child: SingleChildScrollView(
                          scrollDirection: Axis.horizontal,
                          child: Row(
                            children: List.generate(_ranges.length, (i) {
                              final selected = i == _selectedRange;
                              return GestureDetector(
                                onTap: () => _changeRange(i),
                                child: AnimatedContainer(
                                  duration: const Duration(milliseconds: 200),
                                  margin: const EdgeInsets.only(left: 6),
                                  padding: const EdgeInsets.symmetric(
                                    horizontal: 10,
                                    vertical: 4,
                                  ),
                                  decoration: BoxDecoration(
                                    color: selected
                                        ? cs.primary
                                        : Colors.transparent,
                                    borderRadius: BorderRadius.circular(20),
                                  ),
                                  child: Text(
                                    _ranges[i],
                                    style: TextStyle(
                                      fontSize: 11,
                                      fontWeight: FontWeight.w600,
                                      color: selected
                                          ? Colors.white
                                          : cs.onSurfaceVariant,
                                    ),
                                  ),
                                ),
                              );
                            }),
                          ),
                        ),
                      ),
                    ],
                  ),
                  const SizedBox(height: 24),
                  SizedBox(
                    height: 150,
                    child: AnimatedBuilder(
                      animation: _chartAnimation,
                      builder: (context, _) {
                        return CustomPaint(
                          size: const Size(double.infinity, 150),
                          painter: _BarChartPainter(
                            data: _chartData,
                            labels: _chartLabels,
                            progress: _chartAnimation.value,
                            barColor: cs.primary,
                            labelColor: cs.onSurfaceVariant,
                          ),
                        );
                      },
                    ),
                  ),
                ],
              ),
            ),
            const SizedBox(height: 24),

            // ── Recent Activity ──────────────────────────────────
            Text(
              'Recent Activity',
              style: theme.textTheme.titleMedium?.copyWith(
                fontWeight: FontWeight.bold,
              ),
            ),
            const SizedBox(height: 12),
            ..._activities.map((a) => _ActivityTile(item: a)),
          ],
        ),
      ),
    );
  }
}

// ── Metric card widget ─────────────────────────────────────────────────────

class _MetricCardWidget extends StatelessWidget {
  final MetricCard metric;
  const _MetricCardWidget({required this.metric});

  @override
  Widget build(BuildContext context) {
    final theme = Theme.of(context);
    return Container(
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(
        color: metric.color.withValues(alpha: 0.08),
        borderRadius: BorderRadius.circular(16),
        border: Border.all(color: metric.color.withValues(alpha: 0.15)),
      ),
      child: Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        mainAxisAlignment: MainAxisAlignment.spaceBetween,
        children: [
          Row(
            mainAxisAlignment: MainAxisAlignment.spaceBetween,
            children: [
              Container(
                padding: const EdgeInsets.all(6),
                decoration: BoxDecoration(
                  color: metric.color.withValues(alpha: 0.15),
                  borderRadius: BorderRadius.circular(8),
                ),
                child: Icon(metric.icon, color: metric.color, size: 18),
              ),
              Container(
                padding: const EdgeInsets.symmetric(horizontal: 6, vertical: 2),
                decoration: BoxDecoration(
                  color: metric.isPositive
                      ? Colors.green.withValues(alpha: 0.12)
                      : Colors.red.withValues(alpha: 0.12),
                  borderRadius: BorderRadius.circular(20),
                ),
                child: Text(
                  metric.delta,
                  style: TextStyle(
                    color: metric.isPositive ? Colors.green : Colors.red,
                    fontSize: 11,
                    fontWeight: FontWeight.w600,
                  ),
                ),
              ),
            ],
          ),
          Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                metric.value,
                style: theme.textTheme.titleLarge?.copyWith(
                  fontWeight: FontWeight.bold,
                ),
              ),
              Text(
                metric.title,
                style: TextStyle(
                  color: Theme.of(context).colorScheme.onSurfaceVariant,
                  fontSize: 12,
                ),
              ),
            ],
          ),
        ],
      ),
    );
  }
}

// ── Bar chart painter ──────────────────────────────────────────────────────

class _BarChartPainter extends CustomPainter {
  final List<double> data;
  final List<String> labels;
  final double progress;
  final Color barColor;
  final Color labelColor;

  _BarChartPainter({
    required this.data,
    required this.labels,
    required this.progress,
    required this.barColor,
    required this.labelColor,
  });

  @override
  void paint(Canvas canvas, Size size) {
    const labelHeight = 20.0;
    const barSpacing = 8.0;
    final chartHeight = size.height - labelHeight;
    final barWidth =
        (size.width - barSpacing * (data.length - 1)) / data.length;
    final paint = Paint();

    final labelStyle = TextStyle(color: labelColor, fontSize: 11);

    for (int i = 0; i < data.length; i++) {
      final x = i * (barWidth + barSpacing);
      final barH = chartHeight * data[i] * progress;
      final y = chartHeight - barH;

      // Bar background
      paint.color = barColor.withValues(alpha: 0.1);
      canvas.drawRRect(
        RRect.fromLTRBR(
          x,
          0,
          x + barWidth,
          chartHeight,
          const Radius.circular(4),
        ),
        paint,
      );

      // Filled bar
      paint.color = barColor;
      final gradient = Paint()
        ..shader = LinearGradient(
          colors: [barColor.withValues(alpha: 0.6), barColor],
          begin: Alignment.topCenter,
          end: Alignment.bottomCenter,
        ).createShader(Rect.fromLTWH(x, y, barWidth, barH));
      canvas.drawRRect(
        RRect.fromLTRBR(
          x,
          y,
          x + barWidth,
          chartHeight,
          const Radius.circular(4),
        ),
        gradient,
      );

      // Label
      final textPainter = TextPainter(
        text: TextSpan(text: labels[i], style: labelStyle),
        textDirection: TextDirection.ltr,
      )..layout();
      textPainter.paint(
        canvas,
        Offset(x + (barWidth - textPainter.width) / 2, chartHeight + 4),
      );
    }
  }

  @override
  bool shouldRepaint(_BarChartPainter old) =>
      old.progress != progress || old.data != data;
}

// ── Activity tile ──────────────────────────────────────────────────────────

class _ActivityTile extends StatelessWidget {
  final ActivityItem item;
  const _ActivityTile({required this.item});

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 12),
      child: Row(
        children: [
          Container(
            width: 42,
            height: 42,
            decoration: BoxDecoration(
              color: item.color.withValues(alpha: 0.12),
              borderRadius: BorderRadius.circular(12),
            ),
            child: Icon(item.icon, color: item.color, size: 20),
          ),
          const SizedBox(width: 12),
          Expanded(
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                Text(
                  item.title,
                  style: const TextStyle(fontWeight: FontWeight.w600),
                ),
                Text(
                  item.subtitle,
                  style: TextStyle(
                    color: Theme.of(context).colorScheme.onSurfaceVariant,
                    fontSize: 13,
                  ),
                ),
              ],
            ),
          ),
          Text(
            item.time,
            style: TextStyle(
              color: Theme.of(context).colorScheme.onSurfaceVariant,
              fontSize: 12,
            ),
          ),
        ],
      ),
    );
  }
}
```

## Dependencies

No extra packages. For richer charts consider:
- `fl_chart: ^0.68.0` — highly customizable
- `syncfusion_flutter_charts` — enterprise-grade

## Customization Tips

- Replace `_chartData` with real API data and add line chart variant
- Use `StreamBuilder` to update metrics in real-time (Firestore / WebSocket)
- Add `RefreshIndicator` to allow pull-to-refresh on the `SingleChildScrollView`
