import 'package:in_app_purchase/in_app_purchase.dart';

import '../core/api_client.dart';

class BillingStatus {
  const BillingStatus({
    required this.plan,
    required this.isPro,
    this.currentPeriodEnd,
  });

  final String plan;
  final bool isPro;
  final DateTime? currentPeriodEnd;

  factory BillingStatus.fromJson(Map<String, dynamic> json) {
    return BillingStatus(
      plan: json['plan'] as String? ?? 'FREE',
      isPro: json['isPro'] == true,
      currentPeriodEnd: json['currentPeriodEnd'] == null
          ? null
          : DateTime.tryParse(json['currentPeriodEnd'].toString()),
    );
  }
}

class BillingRepository {
  BillingRepository({required ApiClient apiClient}) : _apiClient = apiClient;

  static const proProductId = 'residente_pro_monthly';

  final ApiClient _apiClient;
  final InAppPurchase _iap = InAppPurchase.instance;

  Stream<List<PurchaseDetails>> get purchaseStream => _iap.purchaseStream;

  Future<BillingStatus> status() async {
    final response = await _apiClient.dio.get<Map<String, dynamic>>('/billing/status');
    return BillingStatus.fromJson(response.data ?? {});
  }

  Future<ProductDetails?> loadProProduct() async {
    final available = await _iap.isAvailable();
    if (!available) return null;
    final response = await _iap.queryProductDetails({proProductId});
    if (response.productDetails.isEmpty) return null;
    return response.productDetails.first;
  }

  Future<void> buyPro(ProductDetails product) {
    final param = PurchaseParam(productDetails: product);
    return _iap.buyNonConsumable(purchaseParam: param);
  }

  Future<BillingStatus> verifyReceipt(PurchaseDetails purchase) async {
    final response = await _apiClient.dio.post<Map<String, dynamic>>(
      '/billing/iap/verify',
      data: {
        'platform': purchase.verificationData.source == 'app_store' ? 'ios' : 'android',
        'productId': purchase.productID,
        'receipt': purchase.verificationData.serverVerificationData,
      },
    );
    if (purchase.pendingCompletePurchase) {
      await _iap.completePurchase(purchase);
    }
    return BillingStatus.fromJson(response.data ?? {});
  }
}
