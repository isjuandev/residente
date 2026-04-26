import 'package:flutter/material.dart';

import 'empty_state.dart';

class ErrorScreen extends StatelessWidget {
  const ErrorScreen({
    required this.message,
    this.onRetry,
    this.withScaffold = false,
    super.key,
  });

  final String message;
  final VoidCallback? onRetry;
  final bool withScaffold;

  @override
  Widget build(BuildContext context) {
    final child = EmptyState(
      title: 'No pudimos cargar la información',
      message: message,
      actionLabel: onRetry == null ? null : 'Reintentar',
      onAction: onRetry,
    );

    if (!withScaffold) return child;

    return Scaffold(body: child);
  }
}
