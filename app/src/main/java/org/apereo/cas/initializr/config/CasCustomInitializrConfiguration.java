package org.apereo.cas.initializr.config;

import java.util.ArrayList;
import java.util.List;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import lombok.Getter;
import lombok.Setter;

import org.apereo.cas.initializr.info.DependencyAliasesInfoContributor;
import org.apereo.cas.initializr.web.SupportedVersionsEndpoint;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * Custom configuration that might be used by CI or UI, but not for initializr arguments.
 * @author Hal Deadman
 */
@EnableConfigurationProperties(CasCustomInitializrConfiguration.class)
@ConfigurationProperties(value = "cas-initializr")
@Getter
@Setter
public class CasCustomInitializrConfiguration {

    private List<SupportedVersion> supportedVersions = new ArrayList<>();

    /**
     * Controller used by CI to get supported version information for overlay matrix.
     * @return SupportedVersionsEndpoint
     */
    @Bean
    public SupportedVersionsEndpoint supportedVersionsEndpoint() {
        return new SupportedVersionsEndpoint(supportedVersions);
    }

    @Autowired
    @Bean
    public InfoContributor dependencyAliasesInfoContributor(final InitializrMetadataProvider provider) {
        return new DependencyAliasesInfoContributor(provider);
    }

}
