import 'dart:async';

import 'package:flutter_riverpod/flutter_riverpod.dart';

import '../core/providers.dart';
import 'disease.dart';
import 'diseases_repository.dart';

class DiseaseSearchState {
  const DiseaseSearchState({
    this.query = '',
    this.specialtySlug,
    this.specialties = const [],
    this.results = const [],
    this.isLoading = false,
    this.errorMessage,
  });

  final String query;
  final String? specialtySlug;
  final List<Specialty> specialties;
  final List<Disease> results;
  final bool isLoading;
  final String? errorMessage;

  DiseaseSearchState copyWith({
    String? query,
    String? specialtySlug,
    bool clearSpecialty = false,
    List<Specialty>? specialties,
    List<Disease>? results,
    bool? isLoading,
    String? errorMessage,
    bool clearError = false,
  }) {
    return DiseaseSearchState(
      query: query ?? this.query,
      specialtySlug: clearSpecialty ? null : specialtySlug ?? this.specialtySlug,
      specialties: specialties ?? this.specialties,
      results: results ?? this.results,
      isLoading: isLoading ?? this.isLoading,
      errorMessage: clearError ? null : errorMessage ?? this.errorMessage,
    );
  }
}

class DiseaseSearchNotifier extends StateNotifier<DiseaseSearchState> {
  DiseaseSearchNotifier(this._repository) : super(const DiseaseSearchState()) {
    refresh();
  }

  final DiseasesRepository _repository;
  Timer? _debounce;

  Future<void> refresh() async {
    state = state.copyWith(isLoading: true, clearError: true);
    try {
      final specialties = await _repository.specialties();
      final page = await _repository.search(
        query: state.query,
        specialtySlug: state.specialtySlug,
      );
      state = state.copyWith(
        specialties: specialties,
        results: page.data,
        isLoading: false,
      );
    } catch (error) {
      state = state.copyWith(
        isLoading: false,
        errorMessage: _repository.errorMessage(error),
      );
    }
  }

  void setQuery(String value) {
    state = state.copyWith(query: value, clearError: true);
    _debounce?.cancel();
    _debounce = Timer(const Duration(milliseconds: 300), refresh);
  }

  void setSpecialty(String? slug) {
    state = state.copyWith(
      specialtySlug: slug,
      clearSpecialty: slug == null || slug.isEmpty,
      clearError: true,
    );
    refresh();
  }

  @override
  void dispose() {
    _debounce?.cancel();
    super.dispose();
  }
}

final diseaseSearchProvider =
    StateNotifierProvider<DiseaseSearchNotifier, DiseaseSearchState>((ref) {
  return DiseaseSearchNotifier(ref.watch(diseasesRepositoryProvider));
});

final diseaseDetailProvider =
    FutureProvider.family<Disease, String>((ref, slug) {
  return ref.watch(diseasesRepositoryProvider).findBySlug(slug);
});
