package org.apereo.cas.initializr.web;


import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.config.SupportedVersion;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;

import io.spring.initializr.metadata.DependencyMetadataProvider;
import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectMetadataController;
import io.spring.initializr.web.mapper.DependencyMetadataV21JsonMapper;
import io.spring.initializr.web.mapper.InitializrMetadataVersion;
import io.spring.initializr.web.project.InvalidProjectRequestException;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;

import java.util.Comparator;
import java.util.stream.Collectors;

public class OverlayProjectMetadataController extends ProjectMetadataController {
    private final DependencyMetadataProvider dependencyMetadataProvider;

    private final ConfigurableApplicationContext applicationContext;

    public OverlayProjectMetadataController(final InitializrMetadataProvider metadataProvider,
                                            final DependencyMetadataProvider dependencyMetadataProvider,
                                            final ConfigurableApplicationContext applicationContext) {
        super(metadataProvider, dependencyMetadataProvider);
        this.dependencyMetadataProvider = dependencyMetadataProvider;
        this.applicationContext = applicationContext;
    }

    @RequestMapping(path = "/dependencies", produces = "application/vnd.initializr.v2.2+json")
    @Override
    public ResponseEntity<String> dependenciesV22(@RequestParam(required = false) String bootVersion) {
        return dependenciesFor(InitializrMetadataVersion.V2_2, bootVersion);
    }

    @RequestMapping(path = "/dependencies", produces = {"application/vnd.initializr.v2.1+json", "application/json"})
    @Override
    public ResponseEntity<String> dependenciesV21(@RequestParam(required = false) String bootVersion) {
        return dependenciesFor(InitializrMetadataVersion.V2_1, bootVersion);
    }


    private ResponseEntity<String> dependenciesFor(InitializrMetadataVersion version, String casVersion) {
        var metadata = this.metadataProvider.get();

        var properties = applicationContext.getBean(CasInitializrProperties.class);
        var supportedVersions = properties.getSupportedVersions()
            .stream()
            .filter(ver -> ver.getType().equals(CasOverlayBuildSystem.TYPE))
            .map(SupportedVersion::getVersion)
            .sorted(Comparator.reverseOrder())
            .collect(Collectors.toList());

        var versionToChoose = (casVersion != null)
            ? VersionUtils.parse(casVersion)
            : VersionUtils.parse(supportedVersions.get(0));
        var platform = metadata.getConfiguration().getEnv().getPlatform();
        if (!platform.isCompatibleVersion(versionToChoose)) {
            throw new InvalidProjectRequestException("Invalid CAS version '" + casVersion
                                                     + "', CAS compatibility range is " + platform.determineCompatibilityRangeRequirement());
        }
        var dependencyMetadata = this.dependencyMetadataProvider.get(metadata, versionToChoose);
        var content = new DependencyMetadataV21JsonMapper().write(dependencyMetadata);
        return ResponseEntity.ok()
            .contentType(version.getMediaType())
            .eTag(createUniqueId(content))
            .cacheControl(determineCacheControlFor(metadata))
            .body(content);
    }
}
