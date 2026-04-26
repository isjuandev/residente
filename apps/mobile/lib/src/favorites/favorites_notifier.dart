import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/providers.dart';
import 'favorites_repository.dart';

class FavoritesNotifier extends StateNotifier<Set<String>> {
  FavoritesNotifier(this._repository) : super(<String>{});

  final FavoritesRepository _repository;

  Future<void> load() async {
    try {
      state = (await _repository.listFavoriteDiseaseIds()).toSet();
    } catch (_) {
      state = <String>{};
    }
  }

  Future<void> syncPending() async {
    await _repository.syncPending();
    await load();
  }

  Future<void> toggle(String diseaseId) async {
    final wasFavorite = state.contains(diseaseId);
    state = {
      ...state.where((id) => id != diseaseId),
      if (!wasFavorite) diseaseId,
    };

    try {
      if (wasFavorite) {
        await _repository.remove(diseaseId);
      } else {
        await _repository.add(diseaseId);
      }
    } catch (_) {
      state = {
        ...state.where((id) => id != diseaseId),
        if (wasFavorite) diseaseId,
      };
    }
  }
}

final favoritesProvider =
    StateNotifierProvider<FavoritesNotifier, Set<String>>((ref) {
  return FavoritesNotifier(ref.watch(favoritesRepositoryProvider))..load();
});
