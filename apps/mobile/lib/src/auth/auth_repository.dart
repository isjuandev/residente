import 'package:dio/dio.dart';

import '../core/api_client.dart';
import 'app_user.dart';
import 'auth_tokens.dart';
import 'token_storage.dart';

class AuthRepository {
  const AuthRepository({
    required ApiClient apiClient,
    required TokenStorage tokenStorage,
  })  : _apiClient = apiClient,
        _tokenStorage = tokenStorage;

  final ApiClient _apiClient;
  final TokenStorage _tokenStorage;

  Future<AppUser> register({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.dio.post<Map<String, dynamic>>(
        '/auth/register',
        data: {
          'email': email,
          'password': password,
        },
        options: Options(extra: {'skipAuth': true}),
      );

      return _saveAuthResponse(response.data);
    } catch (error) {
      throw _apiClient.toApiException(error, 'No se pudo crear la cuenta');
    }
  }

  Future<AppUser> login({
    required String email,
    required String password,
  }) async {
    try {
      final response = await _apiClient.dio.post<Map<String, dynamic>>(
        '/auth/login',
        data: {
          'email': email,
          'password': password,
        },
        options: Options(extra: {'skipAuth': true}),
      );

      return _saveAuthResponse(response.data);
    } catch (error) {
      throw _apiClient.toApiException(error, 'Credenciales inválidas');
    }
  }

  Future<AppUser?> me() async {
    final tokens = await _tokenStorage.readTokens();
    if (tokens == null) {
      return null;
    }

    try {
      final response = await _apiClient.dio.get<Map<String, dynamic>>(
        '/auth/me',
      );

      final data = response.data;
      if (data == null) {
        return null;
      }

      return AppUser.fromJson(data);
    } catch (_) {
      await _tokenStorage.clear();
      return null;
    }
  }

  Future<void> logout() {
    return _tokenStorage.clear();
  }

  Future<AppUser> _saveAuthResponse(Map<String, dynamic>? data) async {
    if (data == null) {
      throw _apiClient.toApiException(Object(), 'Respuesta inválida');
    }

    final tokens = AuthTokens(
      accessToken: data['accessToken'] as String,
      refreshToken: data['refreshToken'] as String,
    );
    await _tokenStorage.saveTokens(tokens);

    return AppUser.fromJson(data['user'] as Map<String, dynamic>);
  }
}
