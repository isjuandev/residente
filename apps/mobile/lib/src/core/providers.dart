import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../auth/auth_repository.dart';
import '../billing/billing_repository.dart';
import '../auth/token_storage.dart';
import '../diseases/diseases_repository.dart';
import '../favorites/favorites_repository.dart';
import '../offline/connectivity_service.dart';
import '../offline/hive_service.dart';
import '../notifications/push_notification_service.dart';
import 'api_client.dart';

final tokenStorageProvider = Provider<TokenStorage>((ref) => TokenStorage());
final hiveServiceProvider = Provider<HiveService>((ref) => HiveService());
final connectivityServiceProvider = Provider<ConnectivityService>(
  (ref) => ConnectivityService(),
);

final isOnlineProvider = StreamProvider<bool>((ref) async* {
  final service = ref.watch(connectivityServiceProvider);
  yield await service.isOnline();
  yield* service.isOnlineStream;
});

final apiClientProvider = Provider<ApiClient>((ref) {
  return ApiClient(tokenStorage: ref.watch(tokenStorageProvider));
});

final authRepositoryProvider = Provider<AuthRepository>((ref) {
  return AuthRepository(
    apiClient: ref.watch(apiClientProvider),
    tokenStorage: ref.watch(tokenStorageProvider),
  );
});

final diseasesRepositoryProvider = Provider<DiseasesRepository>((ref) {
  return DiseasesRepository(
    apiClient: ref.watch(apiClientProvider),
    hiveService: ref.watch(hiveServiceProvider),
    connectivityService: ref.watch(connectivityServiceProvider),
  );
});

final favoritesRepositoryProvider = Provider<FavoritesRepository>((ref) {
  return FavoritesRepository(
    apiClient: ref.watch(apiClientProvider),
    hiveService: ref.watch(hiveServiceProvider),
    connectivityService: ref.watch(connectivityServiceProvider),
  );
});

final billingRepositoryProvider = Provider<BillingRepository>((ref) {
  return BillingRepository(apiClient: ref.watch(apiClientProvider));
});

final pushNotificationServiceProvider = Provider<PushNotificationService>((ref) {
  return PushNotificationService(apiClient: ref.watch(apiClientProvider));
});
