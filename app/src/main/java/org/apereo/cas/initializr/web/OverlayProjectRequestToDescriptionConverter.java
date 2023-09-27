package org.apereo.cas.initializr.web;

import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.config.SupportedVersion;
import org.apereo.cas.overlay.casmgmt.buildsystem.CasManagementOverlayBuildSystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.language.Language;
import io.spring.initializr.generator.packaging.Packaging;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.generator.version.Version;
import io.spring.initializr.metadata.Dependency;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.metadata.support.MetadataBuildItemMapper;
import io.spring.initializr.web.project.InvalidProjectRequestException;
import io.spring.initializr.web.project.ProjectRequest;
import io.spring.initializr.web.project.ProjectRequestPlatformVersionTransformer;
import io.spring.initializr.web.project.ProjectRequestToDescriptionConverter;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.BooleanUtils;
import org.springframework.util.StringUtils;

import java.util.Arrays;
import java.util.List;
import java.util.Objects;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
public class OverlayProjectRequestToDescriptionConverter implements ProjectRequestToDescriptionConverter<OverlayProjectRequest> {
    private final ProjectRequestPlatformVersionTransformer platformVersionTransformer;

    private final CasInitializrProperties properties;

    private static void validateType(final String type, final InitializrMetadata metadata) {
        if (type != null) {
            var typeFromMetadata = metadata.getTypes().get(type);
            if (typeFromMetadata == null) {
                throw new InvalidProjectRequestException("Unknown type '" + type + "' check project metadata");
            }
            if (!typeFromMetadata.getTags().containsKey("build")) {
                throw new InvalidProjectRequestException(
                    "Invalid type '" + type + "' (missing build tag) check project metadata");
            }
        }
    }

    private static void validateLanguage(final String language, final InitializrMetadata metadata) {
        if (language != null) {
            var languageFromMetadata = metadata.getLanguages().get(language);
            if (languageFromMetadata == null) {
                throw new InvalidProjectRequestException("Unknown language '" + language + "' check project metadata");
            }
        }
    }

    private static void validatePackaging(final String packaging, final InitializrMetadata metadata) {
        if (packaging != null) {
            var packagingFromMetadata = metadata.getPackagings().get(packaging);
            if (packagingFromMetadata == null) {
                throw new InvalidProjectRequestException(
                    "Unknown packaging '" + packaging + "' check project metadata");
            }
        }
    }

    private static void validateDependencies(final ProjectRequest request, final InitializrMetadata metadata) {
        var dependencies = request.getDependencies();
        dependencies
            .stream()
            .filter(StringUtils::hasText)
            .forEach(dep -> {
                var dependency = metadata.getDependencies().get(dep);
                if (dependency == null) {
                    throw new InvalidProjectRequestException("Unknown dependency '" + dep + "' check project metadata");
                }
            });
    }

    private static void validateDependencyRange(final Version platformVersion, final List<Dependency> resolvedDependencies) {
        resolvedDependencies.forEach(dep -> {
            if (!dep.match(platformVersion)) {
                throw new InvalidProjectRequestException(
                    "Dependency '" + dep.getId() + "' is not compatible " + "with Spring Boot " + platformVersion);
            }
        });
    }

    private static BuildSystem getBuildSystem(final ProjectRequest request, final InitializrMetadata metadata) {
        var typeFromMetadata = metadata.getTypes().get(request.getType());
        return BuildSystem.forId(typeFromMetadata.getTags().get("build"));
    }

    private static List<Dependency> getResolvedDependencies(final ProjectRequest request, final Version platformVersion,
                                                            final InitializrMetadata metadata) {
        var depIds = request.getDependencies();
        return depIds
            .stream()
            .filter(StringUtils::hasText)
            .map(it -> {
                var dependency = metadata.getDependencies().get(it);
                return dependency != null ? dependency.resolve(platformVersion) : null;
            })
            .filter(Objects::nonNull)
            .collect(Collectors.toList());
    }

    private static String determineCasVersion(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        if (request.getCasVersion() != null) {
            return request.getCasVersion();
        }
        var type = request.getType();
        var boms = metadata.getConfiguration().getEnv().getBoms();
        if (type.equals(CasManagementOverlayBuildSystem.ID)) {
            return boms.get("cas-mgmt-bom").getVersion();
        }
        return boms.get("cas-bom").getVersion();
    }

    @Override
    public ProjectDescription convert(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var description = new OverlayProjectDescription();
        convert(request, description, metadata);
        description.setCasVersion(determineCasVersion(request, metadata));
        return description;
    }

    public void convert(final OverlayProjectRequest request, final OverlayProjectDescription description,
                        final InitializrMetadata metadata) {
        validate(request, metadata);
        var casVersion = getCasPlatformVersion(request, metadata);
        var resolvedDependencies = getResolvedDependencies(request, casVersion, metadata);
        validateDependencyRange(casVersion, resolvedDependencies);

        description.setApplicationName(request.getApplicationName());
        description.setArtifactId(request.getArtifactId());
        description.setBaseDirectory(request.getBaseDir());
        description.setBuildSystem(getBuildSystem(request, metadata));
        description.setDescription(request.getDescription());
        description.setGroupId(request.getGroupId());
        description.setLanguage(Language.forId(request.getLanguage(), request.getJavaVersion()));
        description.setName(request.getName());
        description.setPackageName(request.getPackageName());
        description.setPackaging(Packaging.forId(request.getPackaging()));

        val springBootPlatformVersion = getSpringBootPlatformVersion(request, casVersion, metadata);
        description.setPlatformVersion(springBootPlatformVersion);
        description.setVersion(request.getVersion());
        description.setCasVersion(casVersion.toString());
        description.setSpringBootVersion(springBootPlatformVersion.toString());

        description.setHelmSupported(getBooleanParameter(request, "helmSupported", Boolean.TRUE));
        description.setDockerSupported(getBooleanParameter(request, "dockerSupported", Boolean.TRUE));
        description.setHerokuSupported(getBooleanParameter(request, "herokuSupported", Boolean.TRUE));
        description.setPuppeteerSupported(getBooleanParameter(request, "puppeteerSupported", Boolean.TRUE));
        description.setGithubActionsSupported(getBooleanParameter(request, "githubActionsSupported", Boolean.TRUE));
        description.setNativeImageSupported(getBooleanParameter(request, "nativeImageSupported", Boolean.FALSE));
        description.setCommandlineShellSupported(getBooleanParameter(request, "commandlineShellSupported", Boolean.TRUE));
        description.setOpenRewriteSupported(getBooleanParameter(request, "openRewriteSupported", Boolean.TRUE));

        if (request.getParameters().containsKey("deploymentType")) {
            var deploymentType = OverlayProjectDescription.DeploymentTypes.valueOf(getStringParameter(request, "deploymentType").toUpperCase());
            description.setDeploymentType(deploymentType);
        }

        if (request.getParameters().containsKey("dependencyCoordinates")) {
            val coordinates = (Object[]) request.getParameters().get("dependencyCoordinates");
            Arrays.stream(coordinates).forEach(coords -> {
                var gav = coords.toString().split(":");
                var dependency = new Dependency();
                if (gav.length == 1) {
                    dependency.setGroupId("org.apereo.cas");
                    dependency.setArtifactId(gav[0]);
                    dependency.setId(gav[0]);
                    dependency.setName(gav[0]);
                } else {
                    dependency.setGroupId(gav[0]);
                    dependency.setArtifactId(gav[1]);
                    dependency.setId(gav[1]);
                    dependency.setName(gav[1]);
                    if (gav.length == 3) {
                        dependency.setVersion(gav[2]);
                    }
                }
                resolvedDependencies.add(dependency);
            });
        }
        resolvedDependencies.forEach(dependency -> description.addDependency(dependency.getId(), MetadataBuildItemMapper.toDependency(dependency)));
        log.info("Requested overlay project description {}", description);
    }

    private Boolean getBooleanParameter(final OverlayProjectRequest request, final String name, final Boolean defaultValue) {
        if (request.getParameters().containsKey(name)) {
            var value = request.getParameters().get(name);
            if (value.getClass().isArray()) {
                value = ((Object[]) value)[0];
            }
            return BooleanUtils.toBoolean(value.toString());
        }
        return defaultValue;

    }

    private String getStringParameter(final OverlayProjectRequest request, final String name) {
        if (request.getParameters().containsKey(name)) {
            var value = request.getParameters().get(name);
            if (value.getClass().isArray()) {
                value = ((Object[]) value)[0];
            }
            return value.toString();
        }
        return "";
    }

    private void validate(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        validatePlatformVersion(request, metadata);
        validateType(request.getType(), metadata);
        validateLanguage(request.getLanguage(), metadata);
        validatePackaging(request.getPackaging(), metadata);
        validateDependencies(request, metadata);
    }

    private void validatePlatformVersion(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var platformVersion = getCasPlatformVersion(request, metadata);
        var platform = metadata.getConfiguration().getEnv().getPlatform();
        if (platformVersion != null && !platform.isCompatibleVersion(platformVersion)) {
            throw new InvalidProjectRequestException("Invalid version '" + platformVersion
                                                     + "', Compatibility range is " + platform.determineCompatibilityRangeRequirement());
        }
    }

    private Version getCasPlatformVersion(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var versionText = determineCasVersion(request, metadata);
        return this.platformVersionTransformer.transform(VersionUtils.parse(versionText), metadata);
    }

    private Version getSpringBootPlatformVersion(final OverlayProjectRequest request,
                                                 final Version casVersion,
                                                 final InitializrMetadata metadata) {
        var versionText = request.getBootVersion();
        if (!StringUtils.hasText(versionText)) {
            log.debug("Spring Boot version unspecified for {}", casVersion);
            versionText = properties.getSupportedVersions()
                .stream()
                .filter(version -> VersionUtils.parse(version.getVersion()).equals(casVersion))
                .map(SupportedVersion::getBootVersion)
                .findFirst()
                .orElseThrow();
        }
        log.info("Resolving Spring Boot version {} for {}", versionText, casVersion);
        return this.platformVersionTransformer.transform(VersionUtils.parse(versionText), metadata);
    }
}
