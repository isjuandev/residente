import 'dart:io';

import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'package:flutter/material.dart';

import '../core/api_client.dart';
import '../screens/disease_detail_screen.dart';

final rootNavigatorKey = GlobalKey<NavigatorState>();

@pragma('vm:entry-point')
Future<void> firebaseMessagingBackgroundHandler(RemoteMessage message) async {
  await Firebase.initializeApp();
}

class PushNotificationService {
  PushNotificationService({required ApiClient apiClient})
      : _apiClient = apiClient;

  final ApiClient _apiClient;
  final FirebaseMessaging _messaging = FirebaseMessaging.instance;
  bool _initialized = false;

  Future<void> initialize() async {
    if (_initialized) return;
    _initialized = true;

    await _messaging.requestPermission(
      alert: true,
      badge: true,
      sound: true,
      provisional: false,
    );

    await _registerCurrentToken();
    _messaging.onTokenRefresh.listen((token) => _registerToken(token));

    FirebaseMessaging.onMessage.listen(_handleForegroundMessage);
    FirebaseMessaging.onMessageOpenedApp.listen(_openFromMessage);

    final initialMessage = await _messaging.getInitialMessage();
    if (initialMessage != null) {
      _openFromMessage(initialMessage);
    }
  }

  Future<void> _registerCurrentToken() async {
    final token = await _messaging.getToken();
    if (token != null) {
      await _registerToken(token);
    }
  }

  Future<void> _registerToken(String token) async {
    await _apiClient.dio.post<void>(
      '/notifications/devices',
      data: {
        'token': token,
        'platform': Platform.isIOS ? 'IOS' : 'ANDROID',
      },
    );
  }

  void _handleForegroundMessage(RemoteMessage message) {
    final context = rootNavigatorKey.currentContext;
    if (context == null) return;

    final title = message.notification?.title ?? 'Residente';
    final body = message.notification?.body ?? 'Nueva actualización disponible';

    ScaffoldMessenger.of(context).showSnackBar(
      SnackBar(
        content: Text('$title\n$body'),
        action: message.data['slug'] == null
            ? null
            : SnackBarAction(
                label: 'Abrir',
                onPressed: () => _openFromMessage(message),
              ),
      ),
    );
  }

  void _openFromMessage(RemoteMessage message) {
    final slug = message.data['slug'];
    if (slug is! String || slug.isEmpty) return;

    final navigator = rootNavigatorKey.currentState;
    navigator?.push(
      MaterialPageRoute<void>(
        builder: (_) => DiseaseDetailScreen(slug: slug),
      ),
    );
  }
}
