import 'package:hive/hive.dart';

import '../diseases/disease.dart';

class HiveService {
  static const _diseaseBoxName = 'residente_diseases';
  static const _favoritesBoxName = 'residente_favorites';
  static const _pendingFavoritesBoxName = 'residente_pending_favorites';
  static const _ttl = Duration(hours: 24);

  Box<Map>? _diseases;
  Box<String>? _favorites;
  Box<Map>? _pendingFavorites;

  Future<void> init() async {
    _diseases ??= await Hive.openBox<Map>(_diseaseBoxName);
    _favorites ??= await Hive.openBox<String>(_favoritesBoxName);
    _pendingFavorites ??= await Hive.openBox<Map>(_pendingFavoritesBoxName);
  }

  Future<void> cacheDisease(Disease disease, {bool savedOffline = false}) async {
    await init();
    await _diseases!.put(disease.slug, {
      'data': disease.toJson(),
      'cachedAt': DateTime.now().toIso8601String(),
      'savedOffline': savedOffline,
    });
  }

  Future<Disease?> readDisease(String slug, {bool allowExpired = false}) async {
    await init();
    final entry = _diseases!.get(slug);
    if (entry == null) return null;

    final cachedAt = DateTime.tryParse(entry['cachedAt'].toString());
    final expired = cachedAt == null || DateTime.now().difference(cachedAt) > _ttl;
    if (expired && allowExpired != true && entry['savedOffline'] != true) {
      return null;
    }

    final data = Map<String, dynamic>.from(entry['data'] as Map);
    return Disease.fromJson(data);
  }

  Future<List<Disease>> readDiseases({bool savedOnly = false}) async {
    await init();
    final diseases = <Disease>[];
    for (final entry in _diseases!.values) {
      if (savedOnly && entry['savedOffline'] != true) continue;
      final cachedAt = DateTime.tryParse(entry['cachedAt'].toString());
      final expired = cachedAt == null || DateTime.now().difference(cachedAt) > _ttl;
      if (expired && entry['savedOffline'] != true) continue;
      diseases.add(Disease.fromJson(Map<String, dynamic>.from(entry['data'] as Map)));
    }
    return diseases;
  }

  Future<void> markDiseaseOffline(String slug) async {
    await init();
    final entry = _diseases!.get(slug);
    if (entry == null) return;
    await _diseases!.put(slug, {...entry, 'savedOffline': true});
  }

  Future<Set<String>> readFavoriteIds() async {
    await init();
    return _favorites!.values.toSet();
  }

  Future<void> setFavorite(String diseaseId, bool isFavorite) async {
    await init();
    if (isFavorite) {
      await _favorites!.put(diseaseId, diseaseId);
    } else {
      await _favorites!.delete(diseaseId);
    }
  }

  Future<void> queueFavorite(String diseaseId, bool isFavorite) async {
    await init();
    await _pendingFavorites!.put(diseaseId, {
      'diseaseId': diseaseId,
      'isFavorite': isFavorite,
      'createdAt': DateTime.now().toIso8601String(),
    });
  }

  Future<List<Map<String, dynamic>>> pendingFavorites() async {
    await init();
    return _pendingFavorites!.values
        .map((entry) => Map<String, dynamic>.from(entry))
        .toList();
  }

  Future<void> removePendingFavorite(String diseaseId) async {
    await init();
    await _pendingFavorites!.delete(diseaseId);
  }
}
