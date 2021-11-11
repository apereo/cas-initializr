package org.apereo.cas.initializr.web;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.language.Language;
import io.spring.initializr.generator.packaging.Packaging;
import io.spring.initializr.generator.project.MutableProjectDescription;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.generator.version.Version;
import io.spring.initializr.metadata.Dependency;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.metadata.support.MetadataBuildItemMapper;
import io.spring.initializr.web.project.InvalidProjectRequestException;
import io.spring.initializr.web.project.ProjectRequest;
import io.spring.initializr.web.project.ProjectRequestPlatformVersionTransformer;
import io.spring.initializr.web.project.ProjectRequestToDescriptionConverter;
import org.springframework.util.Assert;

import java.util.List;
import java.util.stream.Collectors;

public class OverlayProjectRequestToDescriptionConverter implements ProjectRequestToDescriptionConverter<OverlayProjectRequest> {
    private final ProjectRequestPlatformVersionTransformer platformVersionTransformer;

    public OverlayProjectRequestToDescriptionConverter(
        final ProjectRequestPlatformVersionTransformer platformVersionTransformer) {
        Assert.notNull(platformVersionTransformer, "PlatformVersionTransformer must not be null");
        this.platformVersionTransformer = platformVersionTransformer;
    }

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
        dependencies.forEach(dep -> {
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
        return depIds.stream().map(it -> {
            var dependency = metadata.getDependencies().get(it);
            return dependency.resolve(platformVersion);
        }).collect(Collectors.toList());
    }

    @Override
    public ProjectDescription convert(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var description = new OverlayProjectDescription();
        convert(request, description, metadata);
        return description;
    }

    public void convert(final OverlayProjectRequest request, final OverlayProjectDescription description, final InitializrMetadata metadata) {
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
        description.setPlatformVersion(getSpringBootPlatformVersion(request, metadata));
        description.setVersion(request.getVersion());
        description.setCasVersion(casVersion.toString());
        description.setSpringBootVersion(getSpringBootPlatformVersion(request, metadata).toString());

        resolvedDependencies.forEach(dependency -> description.addDependency(dependency.getId(),
            MetadataBuildItemMapper.toDependency(dependency)));
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
        var versionText = request.getCasVersion() != null ? request.getCasVersion()
            : metadata.getConfiguration().getEnv().getBoms().get("cas-bom").getVersion();
        if (versionText.matches("\\d.\\d.\\d.\\d")) {
            versionText = versionText.substring(0, versionText.lastIndexOf('.'));
        }
        var version = Version.safeParse(versionText);
        return this.platformVersionTransformer.transform(version, metadata);
    }

    private Version getSpringBootPlatformVersion(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var versionText = request.getBootVersion() != null ? request.getBootVersion()
            : metadata.getBootVersions().getDefault().getId();
        if (versionText.matches("\\d.\\d.\\d.\\d")) {
            versionText = versionText.substring(0, versionText.lastIndexOf('.'));
        }
        var version = Version.parse(versionText);
        return this.platformVersionTransformer.transform(version, metadata);
    }
}
