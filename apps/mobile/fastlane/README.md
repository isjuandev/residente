# Mobile Release

## Android Signing

If the native folders are missing locally, generate them first:

```sh
flutter create --platforms=android,ios --org com.residente .
```

1. Generate the release keystore:

```sh
keytool -genkey -v -keystore android/keystores/residente-release.jks -storetype JKS -keyalg RSA -keysize 2048 -validity 10000 -alias residente
```

2. Copy `android/key.properties.template` to `android/key.properties`.
3. Fill `storePassword`, `keyPassword`, `keyAlias`, and `storeFile`.
4. Store the keystore as a base64 GitHub secret named `ANDROID_KEYSTORE_BASE64`.

## Android Release

```sh
bundle exec fastlane android internal
```

Required env vars:

- `MOBILE_API_URL`
- `MOBILE_SENTRY_DSN`
- `MOBILE_SENTRY_ENVIRONMENT`
- `BUILD_NAME`
- `BUILD_NUMBER`
- `GOOGLE_PLAY_SERVICE_ACCOUNT_JSON`

## iOS Release

```sh
bundle exec fastlane ios testflight
```

Required env vars:

- `MOBILE_API_URL`
- `MOBILE_SENTRY_DSN`
- `MOBILE_SENTRY_ENVIRONMENT`
- `BUILD_NAME`
- `BUILD_NUMBER`
- `APPLE_ID`
- `APP_STORE_CONNECT_TEAM_ID`
- `APP_STORE_CONNECT_API_KEY_ID`
- `APP_STORE_CONNECT_API_ISSUER_ID`
- `APP_STORE_CONNECT_API_KEY_CONTENT`
- `IOS_DISTRIBUTION_CERTIFICATE_BASE64`
- `IOS_DISTRIBUTION_CERTIFICATE_PASSWORD`
- `IOS_PROVISIONING_PROFILE_BASE64`
