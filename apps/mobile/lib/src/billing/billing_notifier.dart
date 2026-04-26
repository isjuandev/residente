import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';
import 'package:in_app_purchase/in_app_purchase.dart';

import '../core/providers.dart';
import 'billing_repository.dart';

class BillingState {
  const BillingState({
    this.status = const BillingStatus(plan: 'FREE', isPro: false),
    this.product,
    this.isLoading = false,
    this.errorMessage,
  });

  final BillingStatus status;
  final ProductDetails? product;
  final bool isLoading;
  final String? errorMessage;

  BillingState copyWith({
    BillingStatus? status,
    ProductDetails? product,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return BillingState(
      status: status ?? this.status,
      product: product ?? this.product,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

class BillingNotifier extends StateNotifier<BillingState> {
  BillingNotifier(this._repository) : super(const BillingState()) {
    _subscription = _repository.purchaseStream.listen(_handlePurchases);
    refresh();
  }

  final BillingRepository _repository;
  late final StreamSubscription<List<PurchaseDetails>> _subscription;

  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final status = await _repository.status();
      final product = await _repository.loadProProduct();
      state = state.copyWith(status: status, product: product, isLoading: false);
    } catch (_) {
      state = state.copyWith(isLoading: false, errorMessage: 'No se pudo cargar tu plan');
    }
  }

  Future<void> buyPro() async {
    final product = state.product;
    if (product == null) {
      state = state.copyWith(errorMessage: 'La compra no está disponible en este dispositivo');
      return;
    }
    await _repository.buyPro(product);
  }

  Future<void> _handlePurchases(List<PurchaseDetails> purchases) async {
    for (final purchase in purchases) {
      if (purchase.status == PurchaseStatus.purchased || purchase.status == PurchaseStatus.restored) {
        final status = await _repository.verifyReceipt(purchase);
        state = state.copyWith(status: status, clearError: true);
      }
      if (purchase.status == PurchaseStatus.error) {
        state = state.copyWith(errorMessage: 'No se pudo completar la compra');
      }
    }
  }

  @override
  void dispose() {
    _subscription.cancel();
    super.dispose();
  }
}

final billingProvider = StateNotifierProvider<BillingNotifier, BillingState>((ref) {
  return BillingNotifier(ref.watch(billingRepositoryProvider));
});
