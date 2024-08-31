package org.apereo.cas.initializr.web;


import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.config.SupportedVersion;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import io.spring.initializr.metadata.DependencyMetadataProvider;
import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectMetadataController;
import io.spring.initializr.web.mapper.InitializrMetadataV22JsonMapper;
import io.spring.initializr.web.mapper.InitializrMetadataVersion;
import io.spring.initializr.web.project.InvalidProjectRequestException;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import java.util.Comparator;

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
    public ResponseEntity<String> dependenciesV22(@RequestParam(required = false) final String casVersion) {
        return dependenciesFor(InitializrMetadataVersion.V2_2, casVersion);
    }

    @RequestMapping(path = "/dependencies", produces = {"application/vnd.initializr.v2.1+json", "application/json"})
    @Override
    public ResponseEntity<String> dependenciesV21(@RequestParam(required = false) final String casVersion) {
        return dependenciesFor(InitializrMetadataVersion.V2_1, casVersion);
    }

    @Override
    @GetMapping(path = { "/", "/metadata/client" }, produces = "application/hal+json")
    public ResponseEntity<String> serviceCapabilitiesHal() {
        return initializrCapabilitiesFor();
    }

    private ResponseEntity<String> initializrCapabilitiesFor() {
        var appUrl = generateAppUrl();
        var metadata = this.metadataProvider.get();
        var content = new InitializrMetadataV22JsonMapper().write(metadata, appUrl);
        return ResponseEntity.ok()
            .contentType(HAL_JSON_CONTENT_TYPE)
            .eTag(createUniqueId(content))
            .varyBy("Accept")
            .cacheControl(determineCacheControlFor(metadata))
            .body(content);
    }

    private ResponseEntity<String> dependenciesFor(final InitializrMetadataVersion version, final String casVersion) {
        var metadata = this.metadataProvider.get();

        var properties = applicationContext.getBean(CasInitializrProperties.class);
        var supportedVersions = properties.getSupportedVersions()
            .stream()
            .filter(ver -> ver.getType().equals(CasOverlayBuildSystem.TYPE))
            .map(SupportedVersion::getVersion)
            .sorted(Comparator.reverseOrder())
            .toList();

        var versionToChoose = (casVersion != null)
            ? VersionUtils.parse(casVersion)
            : VersionUtils.parse(supportedVersions.get(0));
        var platform = metadata.getConfiguration().getEnv().getPlatform();
        if (!platform.isCompatibleVersion(versionToChoose)) {
            throw new InvalidProjectRequestException("Invalid CAS version '" + casVersion
                + "', CAS compatibility range is " + platform.determineCompatibilityRangeRequirement());
        }
        dependencyMetadataProvider.get(metadata, versionToChoose);
        var content = new InitializrMetadataV22JsonMapper().write(metadata, generateAppUrl());
        return ResponseEntity.ok()
            .contentType(version.getMediaType())
            .eTag(createUniqueId(content))
            .cacheControl(determineCacheControlFor(metadata))
            .body(content);
    }
}
