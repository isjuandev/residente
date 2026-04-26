import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'auth/auth_notifier.dart';
import 'core/providers.dart';
import 'favorites/favorites_notifier.dart';
import 'offline/offline_banner.dart';
import 'notifications/push_notification_service.dart';
import 'screens/home_screen.dart';
import 'screens/login_screen.dart';
import 'screens/splash_screen.dart';

class ResidenteApp extends ConsumerWidget {
  const ResidenteApp({super.key});

  @override
  Widget build(BuildContext context, WidgetRef ref) {
    final auth = ref.watch(authProvider);
    ref.listen(isOnlineProvider, (previous, next) {
      if (next.valueOrNull == true) {
        ref.read(favoritesProvider.notifier).syncPending();
      }
    });
    ref.listen(authProvider, (previous, next) {
      Sentry.configureScope((scope) {
        final user = next.user;
        if (user == null) {
          scope.setUser(null);
          return;
        }

        scope.setUser(
          SentryUser(
            id: user.id,
            email: user.email,
            data: {'role': user.role},
          ),
        );
        scope.setTag('user.role', user.role);
      });

      if (next.status == AuthStatus.authenticated) {
        ref.read(pushNotificationServiceProvider).initialize();
      }
    });

    return MaterialApp(
      navigatorKey: rootNavigatorKey,
      title: 'Residente',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        colorScheme: ColorScheme.fromSeed(
          seedColor: const Color(0xFF1A5276),
          primary: const Color(0xFF1A5276),
        ),
        scaffoldBackgroundColor: const Color(0xFFF8FAFC),
        useMaterial3: true,
      ),
      home: Column(
        children: [
          const OfflineBanner(),
          Expanded(
            child: switch (auth.status) {
              AuthStatus.checking => const SplashScreen(),
              AuthStatus.authenticated => const HomeScreen(),
              AuthStatus.unauthenticated => const LoginScreen(),
            },
          ),
        ],
      ),
    );
  }
}
