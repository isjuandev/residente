import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:flutter_test/flutter_test.dart';
import 'package:residente_mobile/src/app.dart';

void main() {
  testWidgets('renders app title', (tester) async {
    await tester.pumpWidget(
      const ProviderScope(child: ResidenteApp()),
    );

    expect(find.text('Residente'), findsOneWidget);
  });
}
