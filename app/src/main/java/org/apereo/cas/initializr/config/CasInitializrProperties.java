package org.apereo.cas.initializr.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

import java.util.ArrayList;
import java.util.List;

/**
 * Custom configuration that might be used by CI or UI, but not for initializr arguments.
 *
 * @author Hal Deadman
 */
@ConfigurationProperties(value = "cas-initializr")
@Getter
@Setter
public class CasInitializrProperties {

    private List<SupportedVersion> supportedVersions = new ArrayList<>();

}
