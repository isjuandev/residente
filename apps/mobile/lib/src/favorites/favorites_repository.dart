import '../core/api_client.dart';
import '../offline/connectivity_service.dart';
import '../offline/hive_service.dart';

class FavoritesRepository {
  const FavoritesRepository({
    required ApiClient apiClient,
    required HiveService hiveService,
    required ConnectivityService connectivityService,
  })  : _apiClient = apiClient,
        _hiveService = hiveService,
        _connectivityService = connectivityService;

  final ApiClient _apiClient;
  final HiveService _hiveService;
  final ConnectivityService _connectivityService;

  Future<List<String>> listFavoriteDiseaseIds() async {
    final local = await _hiveService.readFavoriteIds();
    if (!await _connectivityService.isOnline()) return local.toList();

    try {
      final response = await _apiClient.dio.get<Map<String, dynamic>>('/favorites');
      final data = response.data?['data'] as List<dynamic>? ?? [];
      final remote = data
          .whereType<Map<String, dynamic>>()
          .map((item) => item['diseaseId'].toString())
          .toList();
      for (final id in remote) {
        await _hiveService.setFavorite(id, true);
      }
      return remote;
    } catch (_) {
      return local.toList();
    }
  }

  Future<void> add(String diseaseId) async {
    await _hiveService.setFavorite(diseaseId, true);
    if (!await _connectivityService.isOnline()) {
      await _hiveService.queueFavorite(diseaseId, true);
      return;
    }
    try {
      await _apiClient.dio.post<void>('/favorites', data: {'diseaseId': diseaseId});
    } catch (_) {
      await _hiveService.queueFavorite(diseaseId, true);
    }
  }

  Future<void> remove(String diseaseId) async {
    await _hiveService.setFavorite(diseaseId, false);
    if (!await _connectivityService.isOnline()) {
      await _hiveService.queueFavorite(diseaseId, false);
      return;
    }
    try {
      await _apiClient.dio.delete<void>('/favorites', data: {'diseaseId': diseaseId});
    } catch (_) {
      await _hiveService.queueFavorite(diseaseId, false);
    }
  }

  Future<void> syncPending() async {
    if (!await _connectivityService.isOnline()) return;
    final pending = await _hiveService.pendingFavorites();
    for (final item in pending) {
      final diseaseId = item['diseaseId'].toString();
      final isFavorite = item['isFavorite'] == true;
      if (isFavorite) {
        await _apiClient.dio.post<void>('/favorites', data: {'diseaseId': diseaseId});
      } else {
        await _apiClient.dio.delete<void>('/favorites', data: {'diseaseId': diseaseId});
      }
      await _hiveService.removePendingFavorite(diseaseId);
    }
  }
}
