

**Residente**  
Prompts de desarrollo fase por fase

De cero a App Store y Web en producción

| 7 Fases | 28+ Prompts | 100% Listo para publicar |
| :---: | :---: | :---: |

Stack: Next.js 15 · Flutter · NestJS · PostgreSQL · Cloudflare R2  
Roles: Estudiante · Admin   |   Plataformas: Web · iOS · Android

# **Cómo usar este documento**

Cada sección corresponde a una fase de desarrollo. Dentro de cada fase encontrarás:

* Objetivo de la fase: qué debe estar funcionando al terminar.

* Entregables: lista concreta de lo que se produce.

* Prompts listos para usar: cópialo directamente en Claude o en tu AI de preferencia.

| Consejo:  Usa cada prompt en una conversación nueva. Antes de cada prompt, comparte el contexto relevante (el schema de Prisma, los archivos existentes, etc.) para que el AI genere código coherente con tu proyecto. |
| :---- |

| Stack base:  NestJS 10 · Next.js 15 · Flutter 3 · PostgreSQL · Prisma · Tailwind CSS v4 · Cloudflare R2 · GitHub Actions |
| :---- |

| FASE 1   Fundamentos del proyecto Monorepo · Base de datos · Auth · CI/CD inicial |
| :---- |

## **Objetivo de la fase**

Tener el esqueleto completo del proyecto corriendo en local y en staging, con auth funcional en web y mobile, y el pipeline de CI/CD configurado.

**Duración estimada:** 2–3 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Monorepo configurado** | Turborepo con apps/web, apps/mobile, apps/backend, packages/shared |
| **Schema Prisma** | Modelos: User, Role, Specialty, Disease, Algorithm, Favorite, MediaFile |
| **Auth backend** | NestJS: register, login, refresh token, guards por rol (STUDENT / ADMIN) |
| **Auth web** | Next.js 15: páginas de login/registro, middleware de protección de rutas |
| **Auth mobile** | Flutter: pantallas de login/registro, almacenamiento seguro de JWT |
| **CI/CD base** | GitHub Actions: lint \+ test en cada PR, deploy automático a staging |

## **Prompts**

| ⬜ PROMPT — Setup del monorepo |
| :---- |
| Eres un arquitecto de software senior. Necesito configurar un monorepo con Turborepo para una app llamada Residente. La estructura debe ser: apps/   web/        → Next.js 15 con App Router y Tailwind CSS v4   mobile/     → Flutter (Dart)   backend/    → NestJS con Prisma y PostgreSQL packages/   shared/     → tipos TypeScript compartidos entre web y backend Configura: 1\. turbo.json con pipelines para build, dev, test, lint 2\. package.json raíz con workspaces 3\. .github/workflows/ci.yml con lint \+ test en cada PR 4\. .env.example con todas las variables necesarias Stack: Node 20, pnpm 9, TypeScript 5.4. Dame el código completo de cada archivo de configuración. |

| ⬜ PROMPT — Schema de Prisma completo |
| :---- |
| Genera el schema.prisma completo para Residente, una app de algoritmos médicos. Modelos requeridos: \- User: id, email, passwordHash, role (STUDENT | ADMIN), createdAt, updatedAt \- Specialty: id, name, slug, icon (emoji), order \- Disease: id, name, slug, description, specialtyId, clinicalPresentations (String\[\]), isPublished, createdAt, updatedAt \- Algorithm: id, diseaseId, flowchartUrl, steps (Json), tables (Json), references (String\[\]), version, updatedAt \- Favorite: id, userId, diseaseId, createdAt \- MediaFile: id, key (S3), url, mimeType, sizeBytes, uploadedBy, createdAt Incluye: \- Relaciones correctas con @relation \- Índices para búsqueda por name y clinicalPresentations en Disease \- Índice único en Favorite (userId, diseaseId) \- Enum Role \- Seed script en prisma/seed.ts con 5 especialidades y 3 enfermedades de ejemplo |

| ⬜ PROMPT — Módulo de Auth en NestJS |
| :---- |
| Implementa el módulo de autenticación completo en NestJS para Residente: Tecnologías: NestJS 10, Prisma, bcrypt, @nestjs/jwt, class-validator Endpoints requeridos: POST /auth/register → { email, password } → { accessToken, refreshToken, user } POST /auth/login    → { email, password } → { accessToken, refreshToken, user } POST /auth/refresh  → { refreshToken }    → { accessToken } GET  /auth/me       → (Bearer token)      → user actual Implementa: 1\. AuthModule, AuthService, AuthController con validación con DTOs 2\. JwtStrategy y JwtAuthGuard 3\. RolesGuard con decorador @Roles(Role.ADMIN) 4\. accessToken expira en 15min, refreshToken en 7 días almacenado en DB 5\. Hash de contraseñas con bcrypt rounds=12 6\. Manejo de errores con HttpException apropiados Dame todos los archivos con su path relativo desde src/. |

| ⬜ PROMPT — Auth en Next.js 15 |
| :---- |
| Implementa autenticación en Next.js 15 (App Router) para Residente consumiendo la API de NestJS. Usa: next-auth v5 (beta) con JWT strategy, o implementación custom con cookies httpOnly. Requerimientos: 1\. Página /login con formulario (email \+ password), validación con react-hook-form \+ zod 2\. Página /register igual 3\. Middleware que proteja /app/\* y redirija a /login si no hay sesión 4\. Hook useUser() que retorna el usuario actual desde el contexto 5\. Botón de logout que limpia la sesión 6\. Manejo de errores de API (credenciales inválidas, email en uso) Stack visual: Tailwind CSS v4, sin librerías de componentes externas. Diseño limpio y médico (azul oscuro \#1A5276, blanco, grises). Dame todos los archivos con su path relativo desde app/. |

| ⬜ PROMPT — Auth en Flutter |
| :---- |
| Implementa autenticación en Flutter para Residente consumiendo la API REST de NestJS. Paquetes: flutter\_secure\_storage, http o dio, provider o riverpod para estado. Requerimientos: 1\. Pantalla LoginScreen con campos email/password, validación y feedback de errores 2\. Pantalla RegisterScreen análoga 3\. AuthProvider/AuthNotifier que gestiona tokens, usuario actual y estado de carga 4\. Almacenamiento seguro de accessToken y refreshToken con flutter\_secure\_storage 5\. Interceptor HTTP que adjunta Bearer token y refresca automáticamente si expira 6\. Splash screen que verifica si hay sesión activa y redirige a Home o Login 7\. Logout que limpia secure storage Dame todos los archivos Dart con su path relativo desde lib/. |

| FASE 2   Core de contenido API de enfermedades · Búsqueda · Flujogramas · Favoritos |
| :---- |

## **Objetivo de la fase**

Estudiantes pueden buscar enfermedades, filtrar por especialidad, ver el algoritmo completo con flujograma y tablas, y guardar favoritos.

**Duración estimada:** 3–4 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **API de Diseases** | CRUD completo con paginación, filtro por especialidad, búsqueda full-text |
| **API de Search** | Búsqueda por nombre de enfermedad y por presentaciones clínicas |
| **Upload de media** | Endpoint para subir imágenes/SVG a S3/R2, retorna URL pública |
| **Vista de algoritmo web** | Página /app/diseases/\[slug\] con flujograma \+ tablas \+ referencias |
| **Búsqueda web** | Barra de búsqueda con debounce, resultados en tiempo real, filtros |
| **Vista mobile** | Screens equivalentes en Flutter: lista, detalle, favoritos |
| **API de Favorites** | Toggle favorito por usuario, listado de favoritos |

## **Prompts**

| ⬜ PROMPT — API de enfermedades (NestJS) |
| :---- |
| Implementa el módulo de enfermedades en NestJS para Residente. Endpoints: GET  /diseases          → lista paginada, filtros: specialtyId, search, page, limit GET  /diseases/:slug    → detalle completo con algorithm relacionado POST /diseases          → crear (solo ADMIN) PUT  /diseases/:id      → editar (solo ADMIN) DELETE /diseases/:id    → eliminar (solo ADMIN) GET  /diseases/search?q=texto → búsqueda por name \+ clinicalPresentations Requerimientos: \- Paginación con metadata (total, page, totalPages) \- Búsqueda full-text usando Prisma con mode: 'insensitive' \- Solo retornar diseases con isPublished=true para STUDENT \- DTO de creación con class-validator: name, description, specialtyId, clinicalPresentations\[\] \- Transformar la respuesta: incluir specialty anidada, excluir campos internos \- Rate limiting en endpoints públicos (10 req/s por IP) Dame todos los archivos con path desde src/diseases/. |

| ⬜ PROMPT — Upload de media a Cloudflare R2 |
| :---- |
| Implementa el servicio de upload de archivos para Residente en NestJS. Destino: Cloudflare R2 (compatible con SDK S3 de AWS). Requerimientos: 1\. Endpoint POST /media/upload (multipart/form-data), solo ADMIN 2\. Validar: solo image/png, image/jpeg, image/svg+xml; máximo 5MB 3\. Generar key única: {type}/{uuid}.{ext} (ej: flowcharts/abc-123.svg) 4\. Subir a R2 con @aws-sdk/client-s3 5\. Guardar registro en tabla MediaFile (Prisma) 6\. Retornar { id, url, key } 7\. Endpoint DELETE /media/:id (ADMIN) que borra de R2 y de DB Variables de entorno necesarias: R2\_ACCOUNT\_ID, R2\_ACCESS\_KEY\_ID, R2\_SECRET\_ACCESS\_KEY, R2\_BUCKET, R2\_PUBLIC\_URL Dame MediaModule, MediaService, MediaController y el DTO completo. |

| ⬜ PROMPT — Página de detalle de enfermedad (Next.js) |
| :---- |
| Crea la página /app/diseases/\[slug\]/page.tsx en Next.js 15 (App Router) para Residente. La página muestra: 1\. Nombre de la enfermedad \+ especialidad (badge de color) 2\. Presentaciones clínicas (tags) 3\. Flujograma: si flowchartUrl termina en .svg → renderizar inline con \<img\>; si es imagen → renderizar con next/image con zoom al hacer click (modal/lightbox sin librerías externas) 4\. Sección de pasos del algoritmo: lista ordenada con íconos numerados 5\. Tablas clínicas: renderizar las tablas del JSON (formato: { headers: string\[\], rows: string\[\]\[\] }) 6\. Referencias bibliográficas al final 7\. Botón de Favorito (toggle, llama al API) Requerimientos técnicos: \- generateStaticParams para SSG de todas las enfermedades publicadas \- Metadata dinámica (title, description para SEO) \- Loading skeleton mientras carga \- Diseño visual limpio, tipografía legible, paleta azul médica Dame el componente completo y todos los sub-componentes necesarios. |

| ⬜ PROMPT — Barra de búsqueda con filtros (Next.js) |
| :---- |
| Implementa el componente de búsqueda principal de Residente en Next.js 15\. Comportamiento: 1\. Input de texto con debounce de 300ms 2\. Mientras escribe: llama a GET /diseases/search?q={query} 3\. Resultados en dropdown: muestra nombre, especialidad (badge), primeras 2 presentaciones clínicas 4\. Al hacer click en resultado → navega a /app/diseases/\[slug\] 5\. Filtro por especialidad: chips/tabs horizontales (Todas, Cardiología, Neurología, etc.) obtenidos de GET /specialties 6\. Estado vacío: "Busca por enfermedad o presentación clínica (ej: 'dolor torácico')" 7\. Estado sin resultados: "Sin resultados para '{query}'" Técnico: \- useSearchParams para sincronizar búsqueda con URL (?q=\&specialty=) \- SWR o TanStack Query para fetching \- Accesibilidad: role="combobox", aria-expanded, navegación con teclado Dame SearchBar.tsx y todos los sub-componentes con sus estilos Tailwind. |

| ⬜ PROMPT — Pantallas de búsqueda y detalle en Flutter |
| :---- |
| Implementa las pantallas principales de Residente en Flutter. Pantalla 1 — HomeScreen: \- AppBar con logo y botón de perfil \- SearchBar que al escribir llama a la API con debounce 300ms \- Lista de especialidades como chips horizontales scrolleables \- Lista de enfermedades resultado con Card: nombre, especialidad, 2 presentaciones clínicas \- Pull-to-refresh Pantalla 2 — DiseaseDetailScreen: \- Hero con nombre y especialidad \- Si flowchartUrl: mostrar imagen con InteractiveViewer (zoom con pinch) \- Sección de pasos numerados \- Tablas renderizadas con Table widget nativo \- Referencias expandibles \- FAB de favorito (toggle con animación) Pantalla 3 — FavoritesScreen: \- Lista de favoritos del usuario \- Swipe to remove Usa Riverpod para estado, dio para HTTP. Dame todos los archivos Dart con path desde lib/. |

| FASE 3   Panel de administración CRUD de contenido · Editor de algoritmos · Gestión de media |
| :---- |

## **Objetivo de la fase**

El admin puede crear, editar y publicar enfermedades y algoritmos desde un panel web, subir flujogramas como imágenes/SVG, y gestionar el catálogo completo sin tocar código.

**Duración estimada:** 2–3 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Layout admin** | Sidebar con navegación, header con usuario y logout, rutas protegidas por rol ADMIN |
| **CRUD enfermedades** | Tabla con paginación, búsqueda, acciones inline (editar/publicar/eliminar) |
| **Editor de algoritmo** | Form para subir flujograma, editor de pasos, constructor de tablas, referencias |
| **Gestión de especialidades** | CRUD de especialidades con orden y emoji icon |
| **Upload de media** | Drag & drop de imágenes/SVG con preview, barra de progreso |
| **Dashboard de stats** | Contador de enfermedades, especialidades, usuarios registrados |

## **Prompts**

| ⬜ PROMPT — Layout del panel admin (Next.js) |
| :---- |
| Crea el layout del panel de administración de Residente en Next.js 15 (App Router). Ruta base: /admin (protegida con middleware que verifica role \=== 'ADMIN') Layout: 1\. Sidebar fijo a la izquierda (240px): logo, nav links con íconos (Dashboard, Enfermedades, Especialidades, Media, Usuarios), indicador de ruta activa 2\. Header top (64px): título de sección actual, avatar del admin con dropdown (perfil, logout) 3\. Main content area: scrollable, con breadcrumbs automáticos Nav items: \- /admin → Dashboard \- /admin/diseases → Enfermedades \- /admin/specialties → Especialidades \- /admin/media → Biblioteca de medios \- /admin/users → Usuarios (solo lectura) Paleta: sidebar con fondo \#1A5276 (texto blanco), content area fondo \#F8F9FA. Dame app/admin/layout.tsx y todos los componentes de UI necesarios. |

| ⬜ PROMPT — CRUD completo de enfermedades (admin) |
| :---- |
| Implementa el módulo de gestión de enfermedades del admin de Residente. Página /admin/diseases: 1\. Tabla con columnas: Nombre, Especialidad, Presentaciones clínicas (primeras 2), Estado (Publicada/Borrador), Fecha, Acciones 2\. Paginación server-side (15 por página) 3\. Búsqueda por nombre en tiempo real 4\. Filtro por especialidad y por estado 5\. Acciones inline: toggle publicar/despublicar, editar (va a /admin/diseases/\[id\]/edit), eliminar (confirm dialog) 6\. Botón "Nueva enfermedad" → /admin/diseases/new Página /admin/diseases/new y /admin/diseases/\[id\]/edit (mismo componente): 1\. Form con: nombre, slug (auto-generado y editable), descripción (textarea), especialidad (select), presentaciones clínicas (tag input: escribir \+ Enter para agregar), estado 2\. Sección de algoritmo: upload de flujograma (drag & drop SVG/imagen), editor de pasos (lista ordenable con drag & drop), constructor de tablas (agregar/quitar filas y columnas), campo de referencias 3\. Preview del algoritmo a la derecha en desktop 4\. Botones: Guardar borrador / Publicar Usa react-hook-form \+ zod. Dame todos los archivos con path. |

| ⬜ PROMPT — Componente de upload con drag & drop |
| :---- |
| Crea el componente FlowchartUploader para Residente admin en Next.js. Requerimientos: 1\. Zona drag & drop con estados: idle, drag-over, uploading, success, error 2\. También permite click para abrir selector de archivo 3\. Acepta solo: image/png, image/jpeg, image/svg+xml (máximo 5MB) 4\. Al soltar/seleccionar: preview inmediato del archivo    \- Si es SVG: renderizar inline (sanitizar con DOMPurify antes)    \- Si es imagen: mostrar con \<img\> 5\. Barra de progreso durante el upload (usando XMLHttpRequest para tener progreso real) 6\. Llama a POST /media/upload, retorna la URL pública 7\. Botón de reemplazar y de eliminar 8\. Manejo de errores con mensajes claros Dame FlowchartUploader.tsx completamente funcional con Tailwind CSS. |

| ⬜ PROMPT — Constructor de tablas clínicas (admin) |
| :---- |
| Crea el componente TableBuilder para el editor de algoritmos de Residente. El componente permite al admin construir tablas clínicas de forma visual: 1\. Botón "Agregar tabla" que crea una nueva tabla vacía (1 col, 1 fila) 2\. Cada tabla tiene:    \- Campo de título    \- Cabecera editable (cada celda es un input)    \- Filas editables (cada celda es un input, con tipo texto)    \- Botones: \+ columna (derecha), \+ fila (abajo), eliminar columna (×), eliminar fila (×)    \- Botón eliminar tabla completa 3\. Preview en tiempo real de cómo se verá la tabla para el estudiante 4\. Drag & drop para reordenar tablas (usando @dnd-kit/sortable) 5\. El valor del componente es: Array\<{ title: string, headers: string\[\], rows: string\[\]\[\] }\> 6\. Expone onChange para integrar con react-hook-form Dame TableBuilder.tsx completamente funcional. |

| FASE 4   Pulido de UX y offline Modo offline mobile · Onboarding · Animaciones · Accesibilidad |
| :---- |

## **Objetivo de la fase**

La app se siente rápida y profesional. Mobile funciona sin conexión con contenido cacheado. Web tiene SEO completo. Ambas cumplen estándares de accesibilidad.

**Duración estimada:** 2–3 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Modo offline Flutter** | Cache local con Hive o SQLite: enfermedades vistas \+ favoritos disponibles sin internet |
| **Onboarding web y mobile** | Pantallas de bienvenida para usuarios nuevos, tour de características |
| **Animaciones Flutter** | Hero transitions, page transitions suaves, feedback háptico |
| **SEO web completo** | sitemap.xml, robots.txt, OpenGraph, JSON-LD Schema.org para condiciones médicas |
| **Accesibilidad** | WCAG 2.1 AA: contraste, lectores de pantalla, navegación por teclado |
| **Empty states & errores** | Ilustraciones para estados vacíos, pantalla de error global con retry |

## **Prompts**

| ⬜ PROMPT — Modo offline en Flutter con Hive |
| :---- |
| Implementa el modo offline para Residente en Flutter usando Hive como almacenamiento local. Estrategia de cache: 1\. Cuando el usuario ve una enfermedad, guardarla en Hive automáticamente 2\. Los favoritos siempre se leen de local primero (sync en background) 3\. La lista de enfermedades más reciente se cachea con TTL de 24 horas 4\. Si no hay internet al abrir la app: mostrar contenido cacheado con banner "Modo sin conexión" 5\. Sincronización automática cuando se recupera la conexión Requerimientos: \- HiveService que encapsula todas las operaciones de lectura/escritura \- ConnectivityService que escucha cambios de red con connectivity\_plus \- OfflineBanner widget que aparece automáticamente \- Indicador en DiseaseCard si la enfermedad está disponible offline \- Botón "Guardar para offline" en DiseaseDetailScreen Dame todos los archivos Dart necesarios con su path desde lib/. |

| ⬜ PROMPT — SEO y metadata en Next.js |
| :---- |
| Implementa SEO completo para Residente en Next.js 15\. 1\. Metadata base en app/layout.tsx: title template "Residente | {page}", description, openGraph, twitter card 2\. Metadata dinámica en /app/diseases/\[slug\]: title \= nombre de enfermedad, description \= primeras 100 chars de description, openGraph image generada con next/og 3\. Ruta app/og/disease/route.tsx: genera imagen OG dinámica con nombre de enfermedad, especialidad y logo de Residente usando ImageResponse 4\. sitemap.xml dinámico: app/sitemap.ts que retorna todas las enfermedades publicadas 5\. robots.txt: app/robots.ts 6\. JSON-LD Schema.org en cada página de enfermedad: MedicalCondition con name, description, associatedAnatomy 7\. Breadcrumbs con BreadcrumbList schema Dame todos los archivos con path completo. |

| ⬜ PROMPT — Sistema de errores y empty states |
| :---- |
| Implementa el sistema de manejo de errores y estados vacíos para Residente. Para Next.js (Web): 1\. app/error.tsx: error boundary global con mensaje amigable y botón "Reintentar" 2\. app/not-found.tsx: página 404 con buscador integrado 3\. Componente EmptyState.tsx reutilizable con props: icon (SVG), title, description, actionLabel, onAction 4\. Estados vacíos específicos: sin resultados de búsqueda, sin favoritos, sin conexión Para Flutter (Mobile): 1\. Widget ErrorScreen reutilizable: ícono, título, descripción, botón retry con callback 2\. Widget EmptyState reutilizable análogo al de web 3\. Interceptor de errores HTTP global: 401 → logout, 429 → "Demasiadas solicitudes", 5xx → ErrorScreen, sin internet → modo offline 4\. SnackBar helper para errores no críticos (usando ScaffoldMessenger) Para ambos: mensajes de error en español, amigables y sin jerga técnica. Dame todos los archivos con path. |

| FASE 5   Testing y QA Unit tests · Integration tests · E2E · Performance |
| :---- |

## **Objetivo de la fase**

El 80% del código crítico tiene cobertura de tests. Los flujos principales (auth, búsqueda, visualización de algoritmo) pasan E2E automatizados. La app pasa Lighthouse \> 90 en web.

**Duración estimada:** 2–3 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Unit tests backend** | Jest: AuthService, DiseasesService, MediaService con mocks de Prisma |
| **Integration tests API** | Supertest: flujos completos de endpoints con DB de test |
| **Unit tests Flutter** | flutter\_test: providers, servicios HTTP mockeados |
| **E2E web** | Playwright: registro, login, búsqueda, ver algoritmo, favorito |
| **E2E mobile** | Integration test de Flutter: flujo completo en emulador |
| **Performance web** | Lighthouse CI integrado en GitHub Actions, umbral mínimo 90 |

## **Prompts**

| ⬜ PROMPT — Tests unitarios del backend |
| :---- |
| Escribe los tests unitarios completos para el backend de Residente con Jest. 1\. AuthService.spec.ts:    \- register: éxito, email duplicado, password débil    \- login: éxito, usuario no encontrado, password incorrecta    \- refreshToken: éxito, token expirado, token inválido    Mockear: PrismaService, JwtService, bcrypt 2\. DiseasesService.spec.ts:    \- findAll: paginación correcta, filtro por especialidad, solo publicadas para STUDENT    \- findBySlug: encontrada, no encontrada (404)    \- search: por nombre, por presentación clínica, sin resultados    \- create: éxito, slug duplicado    Mockear: PrismaService 3\. MediaService.spec.ts:    \- upload: éxito, archivo muy grande, tipo no permitido    \- delete: éxito, archivo no encontrado    Mockear: S3Client, PrismaService Usa @nestjs/testing, jest.fn(), jest.spyOn(). Dame todos los archivos .spec.ts. |

| ⬜ PROMPT — Tests E2E con Playwright |
| :---- |
| Escribe los tests E2E con Playwright para Residente web. Setup: \- playwright.config.ts: baseURL=http://localhost:3000, 2 workers, screenshots en fallo \- fixtures/auth.ts: helpers para login como STUDENT y como ADMIN \- test-data.ts: datos de seed para tests Tests requeridos: 1\. auth.spec.ts:    \- Registro exitoso con redirección al home    \- Login exitoso    \- Login con credenciales inválidas → mensaje de error visible    \- Acceso a /app/\* sin sesión redirige a /login 2\. search.spec.ts:    \- Buscar "dolor torácico" → aparecen resultados relacionados    \- Filtrar por especialidad "Cardiología" → solo enfermedades cardíacas    \- Buscar término sin resultados → empty state visible    \- Navegar al resultado con teclado (Enter) 3\. disease-detail.spec.ts:    \- Abrir enfermedad → flujograma visible    \- Click en flujograma → modal de zoom    \- Toggle favorito → ícono cambia, persiste al recargar 4\. admin.spec.ts:    \- Crear enfermedad → aparece en lista    \- Publicar/despublicar → badge de estado cambia Dame todos los archivos con path desde tests/. |

| FASE 6   Producción y monetización Deployment · Suscripciones · Analytics · Monitoreo |
| :---- |

## **Objetivo de la fase**

La app está publicada en App Store y Google Play, el web está en producción con dominio propio, y existe un modelo básico de monetización (plan gratuito con límites / plan premium).

**Duración estimada:** 3–4 semanas

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Infraestructura producción** | Railway o Render para NestJS \+ PostgreSQL, Vercel para Next.js, CDN para R2 |
| **Variables y secretos** | Gestión de secrets en GitHub Actions y plataformas de deploy |
| **Plan de suscripción** | Tabla SubscriptionPlan, integración con Stripe o Wompi (Colombia) |
| **Analytics web** | Integración de Plausible o Posthog (privacy-friendly), eventos clave |
| **Push notifications** | Firebase Cloud Messaging para Flutter, notificaciones de nuevo contenido |
| **App Store submission** | Checklist completo: íconos, screenshots, metadata, privacy policy |
| **Monitoreo** | Sentry para errores, uptime monitoring, alertas |

## **Prompts**

| ⬜ PROMPT — Configuración de producción en Railway |
| :---- |
| Configura el deployment de producción para Residente. Backend (NestJS) en Railway: 1\. railway.toml con build command, start command, healthcheck en /health 2\. Variables de entorno necesarias (lista completa) 3\. Configuración de PostgreSQL addon en Railway 4\. Migraciones automáticas en cada deploy (prisma migrate deploy) 5\. Endpoint GET /health que verifica DB connection y retorna { status, db, uptime } Frontend (Next.js) en Vercel: 1\. vercel.json: headers de seguridad (CSP, HSTS, X-Frame-Options) 2\. Variables de entorno en Vercel (NEXT\_PUBLIC\_API\_URL, etc.) 3\. Configuración de dominio personalizado GitHub Actions — deploy workflow: 1\. .github/workflows/deploy.yml 2\. Al hacer merge a main: test → build → deploy backend a Railway → deploy frontend a Vercel 3\. Smoke test post-deploy: verificar /health y cargar una enfermedad Dame todos los archivos de configuración. |

| ⬜ PROMPT — Sistema de suscripciones (Wompi \+ Stripe) |
| :---- |
| Implementa el sistema de monetización para Residente. Modelo de negocio: \- Plan FREE: acceso a 10 enfermedades, sin favoritos ilimitados, sin offline \- Plan PRO ($9.99/mes o $79.99/año): acceso ilimitado, favoritos, offline, sin anuncios Backend (NestJS): 1\. Tabla SubscriptionPlan y UserSubscription en Prisma 2\. Integración con Stripe: crear checkout session, webhook para activar plan 3\. SubscriptionGuard que verifica el plan del usuario en endpoints premium 4\. Endpoint GET /subscription/status → retorna plan actual, vencimiento 5\. Endpoint POST /subscription/portal → Stripe Customer Portal Web (Next.js): 1\. Página /pricing con tabla comparativa de planes 2\. Botón "Upgrade" que llama al checkout de Stripe 3\. Banner no intrusivo para usuarios FREE cuando intentan acceder a contenido premium 4\. Página /subscription/success y /subscription/cancel Flutter: 1\. In-app purchases con flutter\_inapp\_purchase (App Store \+ Play Store) 2\. Verificación de receipt con el backend Dame la implementación completa con todos los archivos. |

| ⬜ PROMPT — Checklist y config para App Store y Play Store |
| :---- |
| Genera la configuración completa de Flutter para publicar Residente en App Store y Google Play. Android (Play Store): 1\. android/app/build.gradle: applicationId, versionCode y versionName, signing config 2\. android/key.properties template (no incluir valores reales) 3\. .github/workflows/deploy-android.yml: build signed APK/AAB, subir a Play Store con fastlane 4\. Fastfile para Android: lane :deploy que sube a producción iOS (App Store): 1\. ios/Runner/Info.plist: permisos mínimos necesarios, NSAppTransportSecurity 2\. Exportoptions.plist para distribución App Store 3\. .github/workflows/deploy-ios.yml: build con xcode, subir con altool o fastlane 4\. Fastfile para iOS: lane :deploy Assets requeridos (dame las especificaciones exactas de tamaño): \- Íconos: todos los tamaños para iOS y Android \- Screenshots: tamaños requeridos por App Store y Play Store \- Feature graphic (Play Store) Privacy Policy template en Markdown (que cumpla los requisitos mínimos de ambas stores). Dame todos los archivos de configuración con sus paths. |

| ⬜ PROMPT — Monitoreo con Sentry |
| :---- |
| Integra Sentry en todos los layers de Residente para monitoreo de errores en producción. Backend (NestJS): 1\. Instalar y configurar @sentry/nestjs 2\. SentryInterceptor global que captura excepciones no manejadas 3\. Enriquecer errores con: userId, tenantId, endpoint, payload (sin datos sensibles) 4\. Ignorar: 401, 403, 404 (no son errores del sistema) Frontend (Next.js): 1\. sentry.client.config.ts, sentry.server.config.ts, sentry.edge.config.ts 2\. Error boundary que reporta a Sentry con contexto de usuario 3\. next.config.js con withSentryConfig Flutter: 1\. Configuración de @sentry\_flutter 2\. runZonedGuarded para capturar errores no manejados 3\. SentryNavigatorObserver para tracking de navegación 4\. Enriquecer con userId y versión de app Alertas en Sentry (dame la configuración como JSON): \- Alert si error rate \> 1% en 5 min \- Alert si P95 latency \> 2s \- Alert si nuevo tipo de error aparece Dame todos los archivos con path. |

| FASE 7   Lanzamiento y crecimiento Beta · Feedback · Iteración · Growth loops |
| :---- |

## **Objetivo de la fase**

La app tiene usuarios reales, un sistema de feedback estructurado, y un roadmap priorizado basado en datos de uso reales.

**Duración estimada:** 2–4 semanas (continuo)

## **Entregables**

| Entregable | Descripción |
| :---- | :---- |
| **Beta cerrada** | Invitar 20–50 estudiantes de medicina, sistema de referidos |
| **In-app feedback** | Widget de reporte de errores en algoritmos, rating de utilidad |
| **Feature flags** | Sistema para activar features por porcentaje de usuarios (% rollout) |
| **Notificaciones de nuevo contenido** | FCM: "Nueva enfermedad en Cardiología" cuando admin publica |
| **Dashboard de analytics** | Enfermedades más buscadas, especialidades más populares, retención |
| **Roadmap público** | Página /roadmap con features votadas por usuarios |

## **Prompts**

| ⬜ PROMPT — Sistema de feedback in-app |
| :---- |
| Implementa el sistema de feedback in-app para Residente. En cada página de enfermedad (web y mobile) agregar: 1\. Widget discreto "¿Fue útil este algoritmo?" con:    \- Botones 👍 / 👎    \- Si 👎: dropdown con razones (Información desactualizada, Flujograma poco claro, Faltan detalles, Otro)    \- Opción de dejar comentario libre (máx 500 chars)    \- Solo disponible para usuarios autenticados 2\. Botón "Reportar error" en el algoritmo → modal con campos: tipo de error (dropdown), descripción Backend (NestJS): \- Tabla AlgorithmFeedback: userId, diseaseId, rating (UP/DOWN), reason, comment, createdAt \- Tabla AlgorithmReport: userId, diseaseId, errorType, description, status (PENDING/REVIEWED/RESOLVED) \- Endpoint POST /feedback: guardar feedback \- Endpoint POST /reports: guardar reporte \- En /admin: página que lista reportes pendientes con botón "Marcar como revisado" Dame implementación completa web \+ backend \+ Flutter. |

| ⬜ PROMPT — Notificaciones push con FCM |
| :---- |
| Implementa notificaciones push para Residente usando Firebase Cloud Messaging. Backend (NestJS): 1\. Tabla UserDevice: userId, fcmToken, platform (IOS/ANDROID/WEB), createdAt 2\. Endpoint POST /devices/register: guardar/actualizar FCM token del usuario 3\. NotificationsService con método sendToUser(userId, title, body, data) 4\. Hook en DiseasesService: cuando admin publica una enfermedad, enviar notificación a todos los usuarios con la especialidad en favoritos 5\. Endpoint POST /admin/notifications/broadcast: enviar a todos (solo ADMIN) Flutter: 1\. Inicializar firebase\_messaging en main.dart 2\. Solicitar permisos en el primer login 3\. Registrar token en backend al obtenerlo 4\. Handler para notificaciones en foreground (SnackBar) y background (navegar a disease al tocar) 5\. Renovar token cuando firebase lo invalida (onTokenRefresh) Web (Next.js): 1\. Service worker para notificaciones web push 2\. Solicitar permiso en /app después del login 3\. Handler para mostrar notificación y navegar al hacer click Dame todos los archivos con path. |

# **Apéndice — Variables de entorno**

Archivo .env.example completo para el backend NestJS:

| Variable | Ejemplo / descripción |
| :---- | :---- |
| **DATABASE\_URL** | postgresql://user:password@localhost:5432/Residente |
| **JWT\_SECRET** | supersecretkey\_change\_in\_production |
| **JWT\_REFRESH\_SECRET** | another\_supersecret\_for\_refresh |
| **JWT\_EXPIRY** | 15m |
| **JWT\_REFRESH\_EXPIRY** | 7d |
| **R2\_ACCOUNT\_ID** | tu\_account\_id\_de\_cloudflare |
| **R2\_ACCESS\_KEY\_ID** | tu\_access\_key |
| **R2\_SECRET\_ACCESS\_KEY** | tu\_secret\_key |
| **R2\_BUCKET** | Residente-media |
| **R2\_PUBLIC\_URL** | https://media.tudominio.com |
| **STRIPE\_SECRET\_KEY** | sk\_live\_... |
| **STRIPE\_WEBHOOK\_SECRET** | whsec\_... |
| **SENTRY\_DSN** | https://...@sentry.io/... |
| **CORS\_ORIGINS** | https://tudominio.com,https://admin.tudominio.com |

