package org.apereo.cas.initializr.config;

import java.util.ArrayList;
import java.util.List;
import lombok.Getter;
import lombok.Setter;
import org.apereo.cas.initializr.web.SupportedVersionsEndpoint;
import org.springframework.boot.context.properties.ConfigurationProperties;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;

/**
 * Custom configuration that might be used by CI or UI, but not for initializr arguments.
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

}