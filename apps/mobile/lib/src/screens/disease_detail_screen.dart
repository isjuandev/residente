import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/providers.dart';
import '../diseases/disease.dart';
import '../diseases/disease_search_notifier.dart';
import '../favorites/favorites_notifier.dart';
import '../offline/offline_banner.dart';
import '../ui/error_screen.dart';
import '../ui/snack_bar_helper.dart';

class DiseaseDetailScreen extends ConsumerWidget {
  const DiseaseDetailScreen({required this.slug, super.key});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final detail = ref.watch(diseaseDetailProvider(slug));

    return Scaffold(
      appBar: AppBar(
        title: const Text('Detalle'),
        actions: const [
          Padding(
            padding: EdgeInsets.only(right: 12),
            child: Center(child: OfflineIndicator()),
          ),
        ],
      ),
      body: detail.when(
        data: (disease) => RefreshIndicator(
          onRefresh: () => ref.refresh(diseaseDetailProvider(slug).future),
          child: ListView(
            padding: const EdgeInsets.all(20),
            children: [
              Row(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Expanded(
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          '${disease.specialty.icon} ${disease.specialty.name}',
                          style: const TextStyle(
                            color: Color(0xFF1A5276),
                            fontWeight: FontWeight.w800,
                          ),
                        ),
                        const SizedBox(height: 8),
                        Text(
                          disease.name,
                          style: Theme.of(context)
                              .textTheme
                              .headlineSmall
                              ?.copyWith(fontWeight: FontWeight.w800),
                        ),
                        const SizedBox(height: 10),
                        Text(disease.description),
                      ],
                    ),
                  ),
                  _FavoriteIcon(diseaseId: disease.id),
                ],
              ),
              const SizedBox(height: 12),
              Align(
                alignment: Alignment.centerLeft,
                child: FilledButton.tonalIcon(
                  onPressed: () async {
                    await ref
                        .read(diseasesRepositoryProvider)
                        .saveForOffline(disease);
                    if (context.mounted) {
                      showAppSnackBar(context, 'Guardado para uso offline');
                    }
                  },
                  icon: const Icon(Icons.download_for_offline_outlined),
                  label: const Text('Guardar offline'),
                ),
              ),
              const SizedBox(height: 20),
              _Section(
                title: 'Presentaciones',
                child: Wrap(
                  spacing: 8,
                  runSpacing: 8,
                  children: disease.clinicalPresentations
                      .map((item) => Chip(label: Text(item)))
                      .toList(),
                ),
              ),
              _Section(
                title: 'Flujograma',
                child: _Flowchart(url: disease.flowchartUrl),
              ),
              _Section(
                title: 'Pasos',
                child: _Steps(steps: disease.steps),
              ),
              _Section(
                title: 'Tablas clínicas',
                child: _Tables(tables: disease.tables),
              ),
              _Section(
                title: 'Referencias',
                child: _References(references: disease.references),
              ),
              _Section(
                title: 'Feedback',
                child: _AlgorithmFeedback(slug: disease.slug),
              ),
            ],
          ),
        ),
        error: (error, _) => ErrorScreen(
          message: error.toString(),
          onRetry: () => ref.invalidate(diseaseDetailProvider(slug)),
        ),
        loading: () => const Center(child: CircularProgressIndicator()),
      ),
    );
  }
}

class _AlgorithmFeedback extends ConsumerWidget {
  const _AlgorithmFeedback({required this.slug});

  final String slug;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: [
        const Text('Ayúdanos a mejorar este algoritmo.'),
        const SizedBox(height: 12),
        Wrap(
          spacing: 8,
          runSpacing: 8,
          children: [
            FilledButton.tonalIcon(
              onPressed: () => _showFeedbackSheet(context, ref, 'USEFUL'),
              icon: const Icon(Icons.thumb_up_alt_outlined),
              label: const Text('Útil'),
            ),
            FilledButton.tonalIcon(
              onPressed: () => _showFeedbackSheet(context, ref, 'NOT_USEFUL'),
              icon: const Icon(Icons.thumb_down_alt_outlined),
              label: const Text('No útil'),
            ),
            OutlinedButton.icon(
              onPressed: () => _showReportSheet(context, ref),
              icon: const Icon(Icons.report_problem_outlined),
              label: const Text('Reportar error'),
            ),
          ],
        ),
      ],
    );
  }

  Future<void> _showFeedbackSheet(
    BuildContext context,
    WidgetRef ref,
    String rating,
  ) async {
    final commentController = TextEditingController();
    final selectedReasons = <String>{};
    final reasons = rating == 'USEFUL'
        ? ['Claro', 'Completo', 'Rápido de aplicar', 'Buen soporte']
        : ['Confuso', 'Incompleto', 'Difícil de aplicar', 'Falta evidencia'];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    rating == 'USEFUL'
                        ? '¿Qué fue útil?'
                        : '¿Qué podemos mejorar?',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  Wrap(
                    spacing: 8,
                    children: reasons
                        .map(
                          (reason) => FilterChip(
                            label: Text(reason),
                            selected: selectedReasons.contains(reason),
                            onSelected: (selected) {
                              setState(() {
                                selected
                                    ? selectedReasons.add(reason)
                                    : selectedReasons.remove(reason);
                              });
                            },
                          ),
                        )
                        .toList(),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: commentController,
                    maxLines: 3,
                    decoration: const InputDecoration(
                      labelText: 'Comentario opcional',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () async {
                      try {
                        await ref
                            .read(diseasesRepositoryProvider)
                            .submitFeedback(
                              slug: slug,
                              rating: rating,
                              reasons: selectedReasons.toList(),
                              comment: commentController.text,
                            );
                        if (sheetContext.mounted)
                          Navigator.of(sheetContext).pop();
                        if (context.mounted) {
                          showAppSnackBar(context, 'Gracias por tu feedback');
                        }
                      } catch (error) {
                        if (context.mounted) {
                          showAppSnackBar(
                            context,
                            ref
                                .read(diseasesRepositoryProvider)
                                .errorMessage(error),
                          );
                        }
                      }
                    },
                    child: const Text('Enviar feedback'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
    commentController.dispose();
  }

  Future<void> _showReportSheet(BuildContext context, WidgetRef ref) async {
    final commentController = TextEditingController();
    var reason = 'Dato clínico incorrecto';
    const reasons = [
      'Dato clínico incorrecto',
      'Referencia desactualizada',
      'Error en flujograma',
      'Otro',
    ];

    await showModalBottomSheet<void>(
      context: context,
      isScrollControlled: true,
      builder: (sheetContext) {
        return StatefulBuilder(
          builder: (context, setState) {
            return Padding(
              padding: EdgeInsets.fromLTRB(
                20,
                20,
                20,
                MediaQuery.of(context).viewInsets.bottom + 20,
              ),
              child: Column(
                mainAxisSize: MainAxisSize.min,
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  Text(
                    'Reportar error',
                    style: Theme.of(context)
                        .textTheme
                        .titleMedium
                        ?.copyWith(fontWeight: FontWeight.w800),
                  ),
                  const SizedBox(height: 12),
                  DropdownButtonFormField<String>(
                    initialValue: reason,
                    items: reasons
                        .map(
                          (item) => DropdownMenuItem(
                            value: item,
                            child: Text(item),
                          ),
                        )
                        .toList(),
                    onChanged: (value) {
                      if (value != null) setState(() => reason = value);
                    },
                    decoration: const InputDecoration(
                      labelText: 'Tipo de error',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 12),
                  TextField(
                    controller: commentController,
                    maxLines: 4,
                    decoration: const InputDecoration(
                      labelText: 'Describe el error',
                      border: OutlineInputBorder(),
                    ),
                  ),
                  const SizedBox(height: 16),
                  FilledButton(
                    onPressed: () async {
                      if (commentController.text.trim().length < 10) {
                        showAppSnackBar(
                          context,
                          'Describe el error con más detalle',
                        );
                        return;
                      }

                      try {
                        await ref.read(diseasesRepositoryProvider).submitReport(
                              slug: slug,
                              reason: reason,
                              comment: commentController.text,
                            );
                        if (sheetContext.mounted)
                          Navigator.of(sheetContext).pop();
                        if (context.mounted) {
                          showAppSnackBar(context, 'Reporte enviado');
                        }
                      } catch (error) {
                        if (context.mounted) {
                          showAppSnackBar(
                            context,
                            ref
                                .read(diseasesRepositoryProvider)
                                .errorMessage(error),
                          );
                        }
                      }
                    },
                    child: const Text('Enviar reporte'),
                  ),
                ],
              ),
            );
          },
        );
      },
    );
    commentController.dispose();
  }
}

class _FavoriteIcon extends ConsumerWidget {
  const _FavoriteIcon({required this.diseaseId});

  final String diseaseId;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final isFavorite = ref.watch(favoritesProvider).contains(diseaseId);
    return AnimatedScale(
      duration: const Duration(milliseconds: 180),
      scale: isFavorite ? 1.22 : 1,
      child: IconButton.filledTonal(
        onPressed: () => ref.read(favoritesProvider.notifier).toggle(diseaseId),
        icon: Icon(isFavorite ? Icons.favorite : Icons.favorite_border),
      ),
    );
  }
}

class _Section extends StatelessWidget {
  const _Section({required this.title, required this.child});

  final String title;
  final Widget child;

  @override
  Widget build(BuildContext context) {
    return Padding(
      padding: const EdgeInsets.only(bottom: 18),
      child: Card(
        elevation: 0,
        shape: RoundedRectangleBorder(
          borderRadius: BorderRadius.circular(8),
          side: const BorderSide(color: Color(0xFFE2E8F0)),
        ),
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [
              Text(
                title,
                style: const TextStyle(
                  color: Color(0xFF1A5276),
                  fontSize: 18,
                  fontWeight: FontWeight.w800,
                ),
              ),
              const SizedBox(height: 12),
              child,
            ],
          ),
        ),
      ),
    );
  }
}

class _Flowchart extends StatelessWidget {
  const _Flowchart({required this.url});

  final String? url;

  @override
  Widget build(BuildContext context) {
    if (url == null || url!.isEmpty) {
      return const SizedBox(
        height: 160,
        child: Center(child: Text('Flujograma pendiente')),
      );
    }

    return SizedBox(
      height: 320,
      child: ClipRRect(
        borderRadius: BorderRadius.circular(8),
        child: InteractiveViewer(
          minScale: 0.7,
          maxScale: 4,
          child: Image.network(url!, fit: BoxFit.contain),
        ),
      ),
    );
  }
}

class _Steps extends StatelessWidget {
  const _Steps({required this.steps});

  final List<AlgorithmStep> steps;

  @override
  Widget build(BuildContext context) {
    if (steps.isEmpty) return const Text('Pasos pendientes.');
    return Column(
      children: [
        for (final entry in steps.asMap().entries)
          ListTile(
            contentPadding: EdgeInsets.zero,
            leading: CircleAvatar(
              backgroundColor: const Color(0xFF1A5276),
              foregroundColor: Colors.white,
              child: Text('${entry.value.order ?? entry.key + 1}'),
            ),
            title: Text(entry.value.title),
            subtitle: Text([
              if (entry.value.description != null) entry.value.description!,
              ...entry.value.actions,
            ].join('\n')),
          ),
      ],
    );
  }
}

class _Tables extends StatelessWidget {
  const _Tables({required this.tables});

  final Object? tables;

  @override
  Widget build(BuildContext context) {
    if (tables == null) return const Text('Tablas pendientes.');
    if (tables is Map) {
      return Column(
        crossAxisAlignment: CrossAxisAlignment.start,
        children: (tables! as Map).entries.map((entry) {
          final value = entry.value;
          return Padding(
            padding: const EdgeInsets.only(bottom: 10),
            child: Text(
              '${entry.key}: ${value is List ? value.join(', ') : value}',
            ),
          );
        }).toList(),
      );
    }
    return Text(tables.toString());
  }
}

class _References extends StatelessWidget {
  const _References({required this.references});

  final List<String> references;

  @override
  Widget build(BuildContext context) {
    if (references.isEmpty) return const Text('Referencias pendientes.');
    return Column(
      crossAxisAlignment: CrossAxisAlignment.start,
      children: references
          .map(
            (reference) => Padding(
              padding: const EdgeInsets.only(bottom: 8),
              child: Text('• $reference'),
            ),
          )
          .toList(),
    );
  }
}
