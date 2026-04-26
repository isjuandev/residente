import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../diseases/disease_search_notifier.dart';
import '../favorites/favorites_notifier.dart';
import '../ui/empty_state.dart';
import 'home_screen.dart';

class FavoritesScreen extends ConsumerWidget {
  const FavoritesScreen({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final favoriteIds = ref.watch(favoritesProvider);
    final search = ref.watch(diseaseSearchProvider);
    final favorites = search.results
        .where((disease) => favoriteIds.contains(disease.id))
        .toList();

    return Scaffold(
      appBar: AppBar(title: const Text('Favoritos')),
      body: RefreshIndicator(
        onRefresh: () async {
          await ref.read(favoritesProvider.notifier).load();
          await ref.read(diseaseSearchProvider.notifier).refresh();
        },
        child: favorites.isEmpty
            ? ListView(
                padding: const EdgeInsets.all(24),
                children: const [
                  SizedBox(height: 80),
                  EmptyState(
                    title: 'Sin favoritos',
                    message:
                        'Guarda enfermedades para encontrarlas más rápido.',
                  ),
                ],
              )
            : ListView(
                padding: const EdgeInsets.all(20),
                children: favorites
                    .map((disease) => DiseaseCard(disease: disease))
                    .toList(),
              ),
      ),
    );
  }
}
