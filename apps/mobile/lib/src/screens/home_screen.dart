import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_notifier.dart';
import '../billing/billing_notifier.dart';
import '../diseases/disease.dart';
import '../diseases/disease_search_notifier.dart';
import '../favorites/favorites_notifier.dart';
import '../offline/offline_banner.dart';
import '../ui/empty_state.dart';
import 'disease_detail_screen.dart';
import 'favorites_screen.dart';

class HomeScreen extends ConsumerWidget {
  const HomeScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final search = ref.watch(diseaseSearchProvider);
    final billing = ref.watch(billingProvider);
    final notifier = ref.read(diseaseSearchProvider.notifier);

    return Scaffold(
      appBar: AppBar(
        title: const Text('Residente'),
        actions: [
          const Padding(
            padding: EdgeInsets.only(right: 8),
            child: Center(child: OfflineIndicator()),
          ),
          IconButton(
            tooltip: 'Favoritos',
            onPressed: () {
              Navigator.of(context).push(
                MaterialPageRoute<void>(
                  builder: (_) => const FavoritesScreen(),
                ),
              );
            },
            icon: const Icon(Icons.favorite_border),
          ),
          IconButton(
            tooltip: 'Salir',
            onPressed: () => ref.read(authProvider.notifier).logout(),
            icon: const Icon(Icons.logout),
          ),
        ],
      ),
      body: RefreshIndicator(
        onRefresh: notifier.refresh,
        child: ListView(
          padding: const EdgeInsets.all(20),
          children: [
            Text(
              'Algoritmos médicos',
              style: Theme.of(context).textTheme.headlineSmall?.copyWith(
                    color: const Color(0xFF1A5276),
                    fontWeight: FontWeight.w800,
                  ),
            ),
            const SizedBox(height: 8),
            const Text('Busca por diagnóstico, síntoma o presentación clínica.'),
            if (!billing.status.isPro) ...[
              const SizedBox(height: 12),
              Card(
                color: const Color(0xFFFFF3CD),
                elevation: 0,
                child: ListTile(
                  title: const Text('Plan FREE'),
                  subtitle: const Text('Actualiza a PRO para acceso completo.'),
                  trailing: TextButton(
                    onPressed: () => ref.read(billingProvider.notifier).buyPro(),
                    child: const Text('PRO'),
                  ),
                ),
              ),
            ],
            const SizedBox(height: 20),
            TextField(
              onChanged: notifier.setQuery,
              decoration: InputDecoration(
                hintText: 'Buscar enfermedades',
                prefixIcon: const Icon(Icons.search),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(8),
                  borderSide: const BorderSide(color: Color(0xFFE2E8F0)),
                ),
              ),
            ),
            const SizedBox(height: 16),
            _SpecialtyChips(
              specialties: search.specialties,
              selectedSlug: search.specialtySlug,
              onSelected: notifier.setSpecialty,
            ),
            const SizedBox(height: 20),
            if (search.isLoading)
              const Center(child: Padding(
                padding: EdgeInsets.all(32),
                child: CircularProgressIndicator(),
              ))
            else if (search.errorMessage != null)
              EmptyState(
                title: 'No pudimos buscar',
                message: search.errorMessage!,
                actionLabel: 'Reintentar',
                onAction: notifier.refresh,
              )
            else if (search.results.isEmpty)
              const EmptyState(
                title: 'Sin resultados',
                message: 'Prueba con otro diagnóstico, síntoma o especialidad.',
              )
            else
              ...search.results.map((disease) => DiseaseCard(disease: disease)),
          ],
        ),
      ),
    );
  }
}

class _SpecialtyChips extends StatelessWidget {
  const _SpecialtyChips({
    required this.specialties,
    required this.selectedSlug,
    required this.onSelected,
  });

  final List<Specialty> specialties;
  final String? selectedSlug;
  final ValueChanged<String?> onSelected;

  @override
  Widget build(BuildContext context) {
    return SingleChildScrollView(
      scrollDirection: Axis.horizontal,
      child: Row(
        children: [
          Padding(
            padding: const EdgeInsets.only(right: 8),
            child: ChoiceChip(
              label: const Text('Todas'),
              selected: selectedSlug == null,
              onSelected: (_) => onSelected(null),
            ),
          ),
          ...specialties.map(
            (specialty) => Padding(
              padding: const EdgeInsets.only(right: 8),
              child: ChoiceChip(
                label: Text('${specialty.icon} ${specialty.name}'),
                selected: selectedSlug == specialty.slug,
                onSelected: (_) => onSelected(specialty.slug),
              ),
            ),
          ),
        ],
      ),
    );
  }
}

class DiseaseCard extends ConsumerWidget {
  const DiseaseCard({required this.disease, super.key});

  final Disease disease;

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favorites = ref.watch(favoritesProvider);
    final isFavorite = favorites.contains(disease.id);

    return Card(
      elevation: 0,
      margin: const EdgeInsets.only(bottom: 12),
      shape: RoundedRectangleBorder(
        borderRadius: BorderRadius.circular(8),
        side: const BorderSide(color: Color(0xFFE2E8F0)),
      ),
      child: InkWell(
        borderRadius: BorderRadius.circular(8),
        onTap: () {
          Navigator.of(context).push(
            MaterialPageRoute<void>(
              builder: (_) => DiseaseDetailScreen(slug: disease.slug),
            ),
          );
        },
        child: Padding(
          padding: const EdgeInsets.all(16),
          child: Row(
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
                        fontWeight: FontWeight.w700,
                      ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      disease.name,
                      style: Theme.of(context).textTheme.titleMedium?.copyWith(
                            fontWeight: FontWeight.w800,
                          ),
                    ),
                    const SizedBox(height: 6),
                    Text(
                      disease.description,
                      maxLines: 2,
                      overflow: TextOverflow.ellipsis,
                    ),
                  ],
                ),
              ),
              AnimatedScale(
                duration: const Duration(milliseconds: 180),
                scale: isFavorite ? 1.18 : 1,
                child: IconButton(
                  onPressed: () {
                    ref.read(favoritesProvider.notifier).toggle(disease.id);
                  },
                  icon: Icon(
                    isFavorite ? Icons.favorite : Icons.favorite_border,
                    color: isFavorite ? Colors.red : const Color(0xFF1A5276),
                  ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}
