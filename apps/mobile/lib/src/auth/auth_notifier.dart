import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/api_exception.dart';
import '../core/providers.dart';
import 'app_user.dart';
import 'auth_repository.dart';

enum AuthStatus {
  checking,
  authenticated,
  unauthenticated,
}

class AuthState {
  const AuthState({
    required this.status,
    this.user,
    this.errorMessage,
    this.isSubmitting = false,
  });

  const AuthState.checking()
      : status = AuthStatus.checking,
        user = null,
        errorMessage = null,
        isSubmitting = false;

  final AuthStatus status;
  final AppUser? user;
  final String? errorMessage;
  final bool isSubmitting;

  bool get isAuthenticated => status == AuthStatus.authenticated;

  AuthState copyWith({
    AuthStatus? status,
    AppUser? user,
    String? errorMessage,
    bool? clearError,
    bool? isSubmitting,
  }) {
    return AuthState(
      status: status ?? this.status,
      user: user ?? this.user,
      errorMessage: clearError == true ? null : errorMessage ?? this.errorMessage,
      isSubmitting: isSubmitting ?? this.isSubmitting,
    );
  }
}

class AuthNotifier extends StateNotifier<AuthState> {
  AuthNotifier(this._authRepository) : super(const AuthState.checking()) {
    bootstrap();
  }

  final AuthRepository _authRepository;

  Future<void> bootstrap() async {
    state = const AuthState.checking();
    final user = await _authRepository.me();
    state = AuthState(
      status: user == null ? AuthStatus.unauthenticated : AuthStatus.authenticated,
      user: user,
    );
  }

  Future<bool> login({
    required String email,
    required String password,
  }) {
    return _submit(() => _authRepository.login(email: email, password: password));
  }

  Future<bool> register({
    required String email,
    required String password,
  }) {
    return _submit(
      () => _authRepository.register(email: email, password: password),
    );
  }

  Future<void> logout() async {
    await _authRepository.logout();
    state = const AuthState(status: AuthStatus.unauthenticated);
  }

  void clearError() {
    state = state.copyWith(clearError: true);
  }

  Future<bool> _submit(Future<AppUser> Function() action) async {
    state = state.copyWith(isSubmitting: true, clearError: true);
    try {
      final user = await action();
      state = AuthState(status: AuthStatus.authenticated, user: user);
      return true;
    } on ApiException catch (error) {
      state = AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: error.message,
      );
      return false;
    } catch (_) {
      state = const AuthState(
        status: AuthStatus.unauthenticated,
        errorMessage: 'Ocurrió un error inesperado',
      );
      return false;
    }
  }
}

final authProvider = StateNotifierProvider<AuthNotifier, AuthState>((ref) {
  return AuthNotifier(ref.watch(authRepositoryProvider));
});
