import 'package:dio/dio.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import '../auth/token_storage.dart';
import 'api_exception.dart';

class ApiClient {
  ApiClient({
    required TokenStorage tokenStorage,
    Dio? dio,
    String? baseUrl,
  })  : _tokenStorage = tokenStorage,
        dio = dio ??
            Dio(
              BaseOptions(
                baseUrl: baseUrl ?? const String.fromEnvironment(
                  'API_URL',
                  defaultValue: 'http://10.0.2.2:3001/api',
                ),
                connectTimeout: const Duration(seconds: 10),
                receiveTimeout: const Duration(seconds: 15),
                headers: {'Content-Type': 'application/json'},
              ),
            ) {
    this.dio.interceptors.add(
          InterceptorsWrapper(
            onRequest: _onRequest,
            onError: _onError,
          ),
        );
  }

  final Dio dio;
  final TokenStorage _tokenStorage;
  Future<bool>? _refreshFuture;

  Future<void> _onRequest(
    RequestOptions options,
    RequestInterceptorHandler handler,
  ) async {
    if (options.extra['skipAuth'] == true) {
      handler.next(options);
      return;
    }

    final accessToken = await _tokenStorage.readAccessToken();
    if (accessToken != null) {
      options.headers['Authorization'] = 'Bearer $accessToken';
    }

    handler.next(options);
  }

  Future<void> _onError(
    DioException error,
    ErrorInterceptorHandler handler,
  ) async {
    final statusCode = error.response?.statusCode;
    final alreadyRetried = error.requestOptions.extra['retried'] == true;

    if (statusCode != 401 ||
        alreadyRetried ||
        error.requestOptions.extra['skipAuth'] == true) {
      handler.reject(_friendlyError(error));
      return;
    }

    final refreshed = await refreshAccessToken();
    if (!refreshed) {
      handler.reject(_friendlyError(error));
      return;
    }

    final accessToken = await _tokenStorage.readAccessToken();
    final retryOptions = error.requestOptions;
    retryOptions.extra['retried'] = true;
    retryOptions.headers['Authorization'] = 'Bearer $accessToken';

    try {
      final response = await dio.fetch<dynamic>(retryOptions);
      handler.resolve(response);
    } on DioException catch (retryError) {
      handler.reject(_friendlyError(retryError));
    }
  }

  Future<bool> refreshAccessToken() async {
    final currentRefresh = _refreshFuture;
    if (currentRefresh != null) {
      return currentRefresh;
    }

    final nextRefresh = _refreshAccessToken();
    _refreshFuture = nextRefresh;

    try {
      return await nextRefresh;
    } finally {
      _refreshFuture = null;
    }
  }

  Future<bool> _refreshAccessToken() async {
    try {
      final refreshToken = await _tokenStorage.readRefreshToken();
      if (refreshToken == null) return false;

      final response = await dio.post<Map<String, dynamic>>(
        '/auth/refresh',
        data: {'refreshToken': refreshToken},
        options: Options(extra: {'skipAuth': true}),
      );
      final accessToken = response.data?['accessToken'] as String?;
      if (accessToken == null) return false;

      await _tokenStorage.saveAccessToken(accessToken);
      return true;
    } catch (_) {
      await _tokenStorage.clear();
      return false;
    }
  }

  ApiException toApiException(Object error, String fallback) {
    if (error is DioException) {
      final friendly = error.error;
      if (friendly is ApiException) {
        return friendly;
      }
      final data = error.response?.data;
      if (data is Map<String, dynamic>) {
        final message = data['message'] ?? data['error'];
        if (message is String) {
          return ApiException(message, statusCode: error.response?.statusCode);
        }
        if (message is List) {
          return ApiException(
            message.join(', '),
            statusCode: error.response?.statusCode,
          );
        }
      }
    }

    return ApiException(fallback);
  }

  DioException _friendlyError(DioException error) {
    _captureServerError(error);

    return error.copyWith(
      error: ApiException(
        _friendlyMessage(error),
        statusCode: error.response?.statusCode,
      ),
    );
  }

  void _captureServerError(DioException error) {
    final statusCode = error.response?.statusCode;
    if (statusCode == null || statusCode < 500) return;

    Sentry.captureException(
      error,
      stackTrace: error.stackTrace,
      withScope: (scope) {
        scope.setTag('http.status_code', '$statusCode');
        scope.setTag('http.method', error.requestOptions.method);
        scope.setTag('http.path', error.requestOptions.path);
        scope.setContexts('http.response', {
          'statusCode': statusCode,
          'baseUrl': error.requestOptions.baseUrl,
        });
      },
    );
  }

  String _friendlyMessage(DioException error) {
    final statusCode = error.response?.statusCode;
    if (statusCode == 400) return 'Revisa los datos e intenta nuevamente.';
    if (statusCode == 401) return 'Tu sesión expiró. Ingresa nuevamente.';
    if (statusCode == 403) return 'No tienes permisos para realizar esta acción.';
    if (statusCode == 404) return 'No encontramos la información solicitada.';
    if (statusCode != null && statusCode >= 500) {
      return 'El servidor no respondió correctamente. Intenta más tarde.';
    }

    if (error.type == DioExceptionType.connectionTimeout ||
        error.type == DioExceptionType.receiveTimeout ||
        error.type == DioExceptionType.sendTimeout) {
      return 'La conexión tardó demasiado. Revisa tu internet.';
    }

    if (error.type == DioExceptionType.connectionError) {
      return 'No hay conexión disponible.';
    }

    return 'Ocurrió un problema inesperado. Intenta nuevamente.';
  }
}
