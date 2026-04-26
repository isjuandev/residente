import 'package:dio/dio.dart';

import '../core/api_client.dart';
import '../offline/connectivity_service.dart';
import '../offline/hive_service.dart';
import 'disease.dart';

class DiseasesRepository {
  const DiseasesRepository({
    required ApiClient apiClient,
    required HiveService hiveService,
    required ConnectivityService connectivityService,
  })  : _apiClient = apiClient,
        _hiveService = hiveService,
        _connectivityService = connectivityService;

  final ApiClient _apiClient;
  final HiveService _hiveService;
  final ConnectivityService _connectivityService;

  Future<List<Specialty>> specialties() async {
    final response = await _apiClient.dio.get<List<dynamic>>('/specialties');
    return (response.data ?? [])
        .whereType<Map<String, dynamic>>()
        .map(Specialty.fromJson)
        .toList();
  }

  Future<DiseasePage> search({
    required String query,
    String? specialtySlug,
  }) async {
    if (!await _connectivityService.isOnline()) {
      final cached = await _hiveService.readDiseases();
      final filtered = _filterCached(cached, query, specialtySlug);
      return DiseasePage(
        data: filtered,
        total: filtered.length,
      );
    }

    try {
      final response = await _apiClient.dio.get<Map<String, dynamic>>(
        '/diseases/search',
        queryParameters: {
          'q': query.isEmpty ? ' ' : query,
          'limit': 20,
          if (specialtySlug != null && specialtySlug.isNotEmpty)
            'specialtySlug': specialtySlug,
        },
      );
      final page = DiseasePage.fromJson(response.data ?? {});
      for (final disease in page.data) {
        await _hiveService.cacheDisease(disease);
      }
      return page;
    } catch (_) {
      final cached = await _hiveService.readDiseases();
      final filtered = _filterCached(cached, query, specialtySlug);
      return DiseasePage(
        data: filtered,
        total: filtered.length,
      );
    }
  }

  Future<Disease> findBySlug(String slug) async {
    if (!await _connectivityService.isOnline()) {
      final cached = await _hiveService.readDisease(slug, allowExpired: true);
      if (cached != null) return cached;
    }

    try {
      final response = await _apiClient.dio.get<Map<String, dynamic>>(
        '/diseases/$slug',
      );
      final disease = Disease.fromJson(response.data ?? {});
      await _hiveService.cacheDisease(disease);
      return disease;
    } catch (_) {
      final cached = await _hiveService.readDisease(slug, allowExpired: true);
      if (cached != null) return cached;
      rethrow;
    }
  }

  Future<void> saveForOffline(Disease disease) {
    return _hiveService.cacheDisease(disease, savedOffline: true);
  }

  Future<void> submitFeedback({
    required String slug,
    required String rating,
    required List<String> reasons,
    String? comment,
  }) async {
    await _apiClient.dio.post<void>(
      '/diseases/$slug/feedback',
      data: {
        'rating': rating,
        'reasons': reasons,
        if (comment != null && comment.trim().isNotEmpty)
          'comment': comment.trim(),
      },
    );
  }

  Future<void> submitReport({
    required String slug,
    required String reason,
    required String comment,
  }) async {
    await _apiClient.dio.post<void>(
      '/diseases/$slug/reports',
      data: {
        'reason': reason,
        'comment': comment.trim(),
      },
    );
  }

  String errorMessage(Object error) {
    if (error is DioException) {
      return _apiClient.toApiException(error, 'No se pudo cargar').message;
    }
    return 'No se pudo cargar';
  }

  List<Disease> _filterCached(
    List<Disease> cached,
    String query,
    String? specialtySlug,
  ) {
    final normalized = query.toLowerCase().trim();
    return cached.where((disease) {
      final matchesSpecialty =
          specialtySlug == null || specialtySlug.isEmpty || disease.specialty.slug == specialtySlug;
      final matchesQuery = normalized.isEmpty ||
          disease.name.toLowerCase().contains(normalized) ||
          disease.description.toLowerCase().contains(normalized) ||
          disease.clinicalPresentations.any(
            (item) => item.toLowerCase().contains(normalized),
          );
      return matchesSpecialty && matchesQuery;
    }).toList();
  }
}
