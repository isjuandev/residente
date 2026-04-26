import 'package:flutter/material.dart';
import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:hive_flutter/hive_flutter.dart';
import 'package:sentry_flutter/sentry_flutter.dart';

import 'src/app.dart';
import 'src/core/api_exception.dart';
import 'src/notifications/push_notification_service.dart';

Future<void> main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await Firebase.initializeApp();
  FirebaseMessaging.onBackgroundMessage(firebaseMessagingBackgroundHandler);
  await Hive.initFlutter();

  const sentryDsn = String.fromEnvironment('SENTRY_DSN');
  if (sentryDsn.isEmpty) {
    runApp(const ProviderScope(child: ResidenteApp()));
    return;
  }

  await SentryFlutter.init(
    (options) {
      options.dsn = sentryDsn;
      options.environment = const String.fromEnvironment(
        'SENTRY_ENVIRONMENT',
        defaultValue: 'development',
      );
      options.release = const String.fromEnvironment('SENTRY_RELEASE');
      options.tracesSampleRate = double.tryParse(
            const String.fromEnvironment(
              'SENTRY_TRACES_SAMPLE_RATE',
              defaultValue: '0.1',
            ),
          ) ??
          0.1;
      options.beforeSend = (event, hint) {
        final exception = hint?.exception;
        if (exception is ApiException &&
            exception.statusCode != null &&
            exception.statusCode! < 500) {
          return null;
        }
        return event;
      };
    },
    appRunner: () => runApp(const ProviderScope(child: ResidenteApp())),
  );
}
