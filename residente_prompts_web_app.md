# Residente - Prompts por fases (sin duplicados)

Fuente: `residente_prompts.md`  
Criterio: ordenados por fase. Cada prompt aparece una sola vez en: `Compartidos`, `Web` o `App (Flutter)`.

## Fase 1 - Fundamentos del proyecto

### Compartidos

#### PROMPT - Setup del monorepo
```text
Eres un arquitecto de software senior. Necesito configurar un monorepo con Turborepo para una app llamada Residente. La estructura debe ser: apps/ web/ → Next.js 15 con App Router y Tailwind CSS v4 mobile/ → Flutter (Dart) backend/ → NestJS con Prisma y PostgreSQL packages/ shared/ → tipos TypeScript compartidos entre web y backend. Configura: 1) turbo.json con pipelines para build, dev, test, lint 2) package.json raíz con workspaces 3) .github/workflows/ci.yml con lint + test en cada PR 4) .env.example con todas las variables necesarias. Stack: Node 20, pnpm 9, TypeScript 5.4. Dame el código completo de cada archivo de configuración.
```

#### PROMPT - Schema de Prisma completo
```text
Genera el schema.prisma completo para Residente, una app de algoritmos médicos. Modelos requeridos: User, Specialty, Disease, Algorithm, Favorite, MediaFile. Incluye relaciones correctas, índices para búsqueda por name y clinicalPresentations en Disease, índice único en Favorite (userId, diseaseId), enum Role y seed script en prisma/seed.ts con 5 especialidades y 3 enfermedades de ejemplo.
```

#### PROMPT - Módulo de Auth en NestJS
```text
Implementa el módulo de autenticación completo en NestJS para Residente. Endpoints: POST /auth/register, POST /auth/login, POST /auth/refresh, GET /auth/me. Incluye AuthModule/AuthService/AuthController con DTOs, JwtStrategy, JwtAuthGuard, RolesGuard con @Roles(Role.ADMIN), accessToken 15 min, refreshToken 7 días en DB, bcrypt rounds=12 y manejo de errores con HttpException. Dame todos los archivos con path relativo desde src/.
```

### Web

#### PROMPT - Auth en Next.js 15
```text
Implementa autenticación en Next.js 15 (App Router) para Residente consumiendo la API de NestJS. Usa next-auth v5 (beta) con JWT o cookies httpOnly. Requerimientos: /login, /register, middleware para proteger /app/*, hook useUser(), logout y manejo de errores de API. Tailwind CSS v4, diseño médico (#1A5276, blanco, grises). Dame todos los archivos con path relativo desde app/.
```

### App (Flutter)

#### PROMPT - Auth en Flutter
```text
Implementa autenticación en Flutter para Residente consumiendo la API REST de NestJS. Paquetes: flutter_secure_storage, http o dio, provider o riverpod. Incluye LoginScreen, RegisterScreen, AuthProvider/AuthNotifier, storage seguro de tokens, interceptor con refresh, splash con sesión activa y logout. Dame todos los archivos Dart con path relativo desde lib/.
```

## Fase 2 - Core de contenido

### Compartidos

#### PROMPT - API de enfermedades (NestJS)
```text
Implementa el módulo de enfermedades en NestJS para Residente. Endpoints: GET /diseases, GET /diseases/:slug, POST /diseases (ADMIN), PUT /diseases/:id (ADMIN), DELETE /diseases/:id (ADMIN), GET /diseases/search?q=. Incluye paginación con metadata, búsqueda insensitive, isPublished para STUDENT, DTOs con class-validator, respuesta transformada y rate limiting 10 req/s por IP. Dame archivos desde src/diseases/.
```

#### PROMPT - Upload de media a Cloudflare R2
```text
Implementa upload de archivos en NestJS para Residente hacia Cloudflare R2 usando SDK S3. Incluye POST /media/upload (ADMIN), validaciones de tipo y tamaño, key única, guardado en MediaFile, retorno {id,url,key}, DELETE /media/:id (ADMIN) y variables R2 requeridas. Dame MediaModule, MediaService, MediaController y DTO completo.
```

### Web

#### PROMPT - Página de detalle de enfermedad (Next.js)
```text
Crea /app/diseases/[slug]/page.tsx en Next.js 15. Mostrar: nombre, especialidad, presentaciones, flujograma (SVG inline o imagen con zoom modal), pasos, tablas clínicas, referencias y botón favorito. Incluye generateStaticParams, metadata dinámica, loading skeleton y diseño médico.
```

#### PROMPT - Barra de búsqueda con filtros (Next.js)
```text
Implementa búsqueda principal en Next.js 15 con debounce 300ms, GET /diseases/search, dropdown con resultados, navegación a detalle, filtros por especialidad desde GET /specialties, estados vacío/sin resultados, sync con URL y accesibilidad de combobox. Usa SWR o TanStack Query.
```

### App (Flutter)

#### PROMPT - Pantallas de búsqueda y detalle en Flutter
```text
Implementa HomeScreen, DiseaseDetailScreen y FavoritesScreen en Flutter con búsqueda debounce, chips de especialidades, cards de resultados, pull-to-refresh, flowchart con InteractiveViewer, pasos, tablas, referencias y favorito con animación. Usa Riverpod y dio.
```

## Fase 3 - Panel de administración

### Web

#### PROMPT - Layout del panel admin (Next.js)
```text
Crea layout /admin en Next.js 15 protegido por rol ADMIN con sidebar, header, contenido scrolleable y breadcrumbs. Rutas: dashboard, diseases, specialties, media, users. Paleta #1A5276 y #F8F9FA.
```

#### PROMPT - CRUD completo de enfermedades (admin)
```text
Implementa /admin/diseases con tabla, paginación, búsqueda, filtros, acciones inline, creación/edición con formulario, sección de algoritmo (upload, pasos, tablas, referencias), preview y acciones guardar/publicar. Usa react-hook-form + zod.
```

#### PROMPT - Componente de upload con drag & drop
```text
Crea FlowchartUploader con estados de DnD/upload, validaciones, preview SVG/imagen, barra de progreso real con XMLHttpRequest, integración a POST /media/upload, reemplazar/eliminar y errores claros.
```

#### PROMPT - Constructor de tablas clínicas (admin)
```text
Crea TableBuilder para construir tablas clínicas con agregar/eliminar filas/columnas/tablas, preview en tiempo real, reordenamiento con @dnd-kit/sortable y valor Array<{title,headers,rows}> con onChange.
```

### App (Flutter)

_No hay prompts específicos de App en esta fase._

## Fase 4 - Pulido UX y offline

### Web

#### PROMPT - SEO y metadata en Next.js
```text
Implementa SEO completo en Next.js 15: metadata base, metadata dinámica por enfermedad, OG image con ImageResponse, sitemap dinámico, robots.txt, JSON-LD MedicalCondition y BreadcrumbList schema.
```

### App (Flutter)

#### PROMPT - Modo offline en Flutter con Hive
```text
Implementa modo offline en Flutter con Hive: cache de enfermedades vistas, favoritos local-first, TTL 24h, banner sin conexión, sincronización al volver internet, HiveService, ConnectivityService, OfflineBanner, indicador offline y botón guardar para offline.
```

### Compartidos

#### PROMPT - Sistema de errores y empty states
```text
Implementa sistema de errores y estados vacíos para Web (error.tsx, not-found.tsx, EmptyState) y Flutter (ErrorScreen, EmptyState, interceptor HTTP global, helper SnackBar), con mensajes en español amigables.
```

## Fase 5 - Testing y QA

### Compartidos

#### PROMPT - Tests unitarios del backend
```text
Escribe tests unitarios con Jest para AuthService, DiseasesService y MediaService, con escenarios de éxito/error y mocks de Prisma/Jwt/bcrypt/S3 según corresponda.
```

### Web

#### PROMPT - Tests E2E con Playwright
```text
Escribe E2E web con Playwright: auth, search, disease-detail y admin; incluye config, fixtures de auth y test-data.
```

### App (Flutter)

_No hay prompt específico de tests Flutter en el documento fuente._

## Fase 6 - Producción y monetización

### Compartidos

#### PROMPT - Configuración de producción en Railway
```text
Configura deploy de producción: backend NestJS en Railway (railway.toml, env vars, PostgreSQL, migraciones, /health), frontend Next.js en Vercel (vercel.json, env, dominio) y workflow de deploy en GitHub Actions con smoke test.
```

#### PROMPT - Sistema de suscripciones (Wompi + Stripe)
```text
Implementa monetización FREE/PRO con backend (tablas, Stripe checkout/webhook, guard, status, portal), web (/pricing, upgrade, success/cancel, banner FREE) y Flutter (in-app purchase + verificación de receipt).
```

#### PROMPT - Monitoreo con Sentry
```text
Integra Sentry en backend NestJS, frontend Next.js y Flutter, con enriquecimiento de contexto, filtros de errores esperados y configuración de alertas (error rate, latency, nuevos tipos de error).
```

### App (Flutter)

#### PROMPT - Checklist y config para App Store y Play Store
```text
Genera configuración Flutter para publicación en Play Store y App Store: gradle/signing, key.properties template, workflows CI para Android/iOS, fastlane, plist/export options, especificaciones de assets (íconos/screenshots/feature graphic) y privacy policy template.
```

### Web

_No hay prompt exclusivo de Web adicional en esta fase (aparte de los compartidos)._ 

## Fase 7 - Lanzamiento y crecimiento

### Compartidos

#### PROMPT - Sistema de feedback in-app
```text
Implementa feedback in-app en páginas de enfermedad (web/mobile) con rating útil/no útil, razones, comentario, reporte de errores; backend con tablas AlgorithmFeedback/AlgorithmReport, endpoints y vista admin de pendientes.
```

#### PROMPT - Notificaciones push con FCM
```text
Implementa push notifications con FCM: backend con UserDevice, registro de token, envío por usuario/broadcast y hook al publicar enfermedad; Flutter con firebase_messaging, permisos, registro, handlers foreground/background y refresh de token; web con service worker, permisos y navegación al click.
```

### Web

_No hay prompt exclusivo de Web en esta fase (todos son compartidos)._ 

### App (Flutter)

_No hay prompt exclusivo de App en esta fase (todos son compartidos)._ 
