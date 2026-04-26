class Specialty {
  const Specialty({
    required this.id,
    required this.name,
    required this.slug,
    required this.icon,
    required this.order,
  });

  final String id;
  final String name;
  final String slug;
  final String icon;
  final int order;

  factory Specialty.fromJson(Map<String, dynamic> json) {
    return Specialty(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      icon: json['icon'] as String? ?? '',
      order: json['order'] as int? ?? 0,
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'icon': icon,
      'order': order,
    };
  }
}

class AlgorithmStep {
  const AlgorithmStep({
    required this.title,
    this.order,
    this.description,
    this.actions = const [],
  });

  final int? order;
  final String title;
  final String? description;
  final List<String> actions;

  factory AlgorithmStep.fromJson(Map<String, dynamic> json) {
    return AlgorithmStep(
      order: json['order'] as int?,
      title: json['title'] as String,
      description: json['description'] as String?,
      actions: (json['actions'] as List<dynamic>? ?? [])
          .map((item) => item.toString())
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'order': order,
      'title': title,
      'description': description,
      'actions': actions,
    };
  }
}

class Disease {
  const Disease({
    required this.id,
    required this.name,
    required this.slug,
    required this.description,
    required this.specialty,
    required this.clinicalPresentations,
    this.flowchartUrl,
    this.steps = const [],
    this.tables,
    this.references = const [],
  });

  final String id;
  final String name;
  final String slug;
  final String description;
  final Specialty specialty;
  final List<String> clinicalPresentations;
  final String? flowchartUrl;
  final List<AlgorithmStep> steps;
  final Object? tables;
  final List<String> references;

  factory Disease.fromJson(Map<String, dynamic> json) {
    final algorithm = json['algorithm'] as Map<String, dynamic>?;
    final rawSteps = algorithm?['steps'] ?? json['steps'];
    final rawReferences = algorithm?['references'] ?? json['references'];

    return Disease(
      id: json['id'] as String,
      name: json['name'] as String,
      slug: json['slug'] as String,
      description: json['description'] as String? ?? '',
      specialty: Specialty.fromJson(json['specialty'] as Map<String, dynamic>),
      clinicalPresentations:
          (json['clinicalPresentations'] as List<dynamic>? ?? [])
              .map((item) => item.toString())
              .toList(),
      flowchartUrl:
          (algorithm?['flowchartUrl'] ?? json['flowchartUrl']) as String?,
      steps: (rawSteps as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(AlgorithmStep.fromJson)
          .toList(),
      tables: algorithm?['tables'] ?? json['tables'],
      references: (rawReferences as List<dynamic>? ?? [])
          .map((item) => item.toString())
          .toList(),
    );
  }

  Map<String, dynamic> toJson() {
    return {
      'id': id,
      'name': name,
      'slug': slug,
      'description': description,
      'specialty': specialty.toJson(),
      'clinicalPresentations': clinicalPresentations,
      'algorithm': {
        'flowchartUrl': flowchartUrl,
        'steps': steps.map((step) => step.toJson()).toList(),
        'tables': tables,
        'references': references,
      },
    };
  }
}

class DiseasePage {
  const DiseasePage({
    required this.data,
    required this.total,
  });

  final List<Disease> data;
  final int total;

  factory DiseasePage.fromJson(Map<String, dynamic> json) {
    final meta = json['meta'] as Map<String, dynamic>? ?? {};
    return DiseasePage(
      data: (json['data'] as List<dynamic>? ?? [])
          .whereType<Map<String, dynamic>>()
          .map(Disease.fromJson)
          .toList(),
      total: meta['total'] as int? ?? 0,
    );
  }
}
