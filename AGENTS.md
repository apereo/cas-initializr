# AGENTS.md — CAS Initializr

## Architecture Overview

Multi-module Gradle project with two subprojects:
- **`app/`** — Spring Boot backend (Java 21+, Spring Initializr framework)
- **`ui/`** — React/TypeScript frontend built via Gradle + Node plugin, output copied into `app/build/resources/main/static`

The service generates CAS overlay projects (Gradle WAR overlays) on demand. It extends [Spring Initializr](https://github.com/spring-io/initializr) rather than replacing it. The two overlay types are `cas-overlay` (default) and `cas-config-server-overlay`, resolved from the `type` tag on each request.

Module/dependency metadata is **not embedded locally** — it is fetched at runtime from a MongoDB instance (collection pattern: `casmodules<version>`, e.g. `casmodules800`). The env var `CAS_MODULE_METADATA_MONGODB_URL` is required to run; without it the app will fail to start or serve dependency lists.

## Critical Build Commands

```bash
# Full build (includes React UI)
./gradlew clean build

# Skip UI build (faster iteration on backend)
./gradlew clean build -DskipUI

# Run locally (debug port 5005 open)
./gradlew bootRun

# Build Docker image
./gradlew bootBuildImage

# Print current version
./gradlew initializrVersion --q

# Print supported CAS versions JSON
./gradlew :app:versions-cas

# Skip test, javadoc, checks (CI-style fast build)
./gradlew --configure-on-demand --no-daemon clean build -x test -x javadoc -x check --parallel
```

## Version Token Expansion

`gradle.properties` defines version tokens (`casLatestVersion`, `springBootLatestVersion`, etc.) that are **expanded at `processResources` time** into `application-*.yml` and all `*.mustache` / `*.md` / `*.properties` files under `app/src/main/resources`. Never hard-code version numbers in those files — always use `@token@` (Ant filter) or `${token}` (YAML `expand`) syntax.

Supported CAS versions and their metadata (boot version, Tomcat version, Gradle version, etc.) are declared in `app/src/main/resources/application-initializr.yml` under `cas-initializr.supported-versions`.

## Contributor Pattern

All generated overlay file contributions implement `ProjectContributor`. The base class is `TemplatedProjectContributor`, which:
1. Resolves a classpath resource (usually a `.mustache` template under `app/src/main/resources/overlay/`)
2. Renders it with Mustache using a `Map<String, Object>` of template variables built in `prepareProjectTemplateVariables()`
3. Writes output to the generated project root

**To add a new file to generated overlays:**
- Create a `.mustache` template under `app/src/main/resources/overlay/<category>/`
- Create a contributor class extending `TemplatedProjectContributor`
- Register it as a `@Bean` in `CasInitializrConfiguration` (for all overlay types) or in `CasOverlayProjectGenerationConfiguration` / `CasConfigServerOverlayProjectGenerationConfiguration` (type-specific, annotated with `@ConditionalOnBuildSystem`)

## Spring Factories Registration

Project generation configurations and build system factories are registered via:
`app/src/main/resources/META-INF/spring.factories`

New `@ProjectGenerationConfiguration` classes **must** be added here to be discovered.

## Mustache Template Variables

Key boolean variables injected per version (used for conditional blocks in templates):
- `casVersion7`, `casVersion8` — exact major match
- `casVersion7OrAbove`, `casVersion80OrAbove` — cumulative range flags
- `gradleVersion8`, `gradleVersion9Compatible` — Gradle version guards
- `casServer` / `configServer` — overlay type flag
- `dockerSupported`, `helmSupported`, `puppeteerSupported`, `nativeImageSupported`, `githubActionsSupported`, `openRewriteSupported`, `sbomSupported` — feature flags from the HTTP request

## Key Request Parameters

Beyond standard Spring Initializr parameters (`dependencies`, `type`, `bootVersion`), CAS-specific params:
- `casVersion` — override resolved CAS version
- `dockerSupported`, `helmSupported`, `puppeteerSupported`, `nativeImageSupported`, `openRewriteSupported`, `sbomSupported`, `githubActionsSupported`, `commandlineShellSupported` (all boolean, default `true` except `nativeImageSupported`)
- `deploymentType` — `EXECUTABLE` (default) or `WEB`
- `dependencyCoordinates` — raw `groupId:artifactId[:version]` coordinates added beyond the metadata lookup

## Key Files & Directories

| Path | Purpose |
|------|---------|
| `app/src/main/resources/application-initializr.yml` | Supported CAS version matrix (expanded from `gradle.properties`) |
| `app/src/main/resources/overlay/` | Mustache templates for generated overlays |
| `app/src/main/resources/META-INF/spring.factories` | Contributor/BuildSystem discovery |
| `app/src/main/java/.../initializr/contrib/TemplatedProjectContributor.java` | Base class for all file contributors |
| `app/src/main/java/.../initializr/config/CasInitializrConfiguration.java` | Central `@ProjectGenerationConfiguration` bean wiring |
| `app/src/main/java/.../overlay/casserver/config/CasOverlayProjectGenerationConfiguration.java` | CAS-overlay-only beans |
| `app/src/main/java/.../initializr/metadata/CasOverlayInitializrMetadataFetcher.java` | MongoDB-backed dependency fetch, cached under `cas.modules` |
| `gradle.properties` | Single source of truth for all dependency/plugin/CAS versions |
| `ci/validate-initializr.sh` | Smoke-test script used in CI (boots the jar and curls endpoints) |

## Running Tests

```bash
./gradlew :app:test
```

Only one test class exists (`VersionUtilsTests`); production validation is primarily done via CI integration scripts in `ci/`.

## Actuator Endpoints (exposed without auth)

- `GET /actuator/supportedVersions` — JSON list of `SupportedVersion` records (used by CI matrix)
- `GET /actuator/info` — dependency aliases and supported versions
- `GET /dependencies` — flat dependency list
- `GET /` with `Accept: application/json` — full initializr metadata

