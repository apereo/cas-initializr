package org.apereo.cas.initializr.web;

import java.util.List;
import lombok.RequiredArgsConstructor;
import org.apereo.cas.initializr.config.SupportedVersion;
import org.springframework.boot.actuate.endpoint.annotation.Endpoint;
import org.springframework.boot.actuate.endpoint.annotation.ReadOperation;

/**
 * Actuator that CI uses to get supported version matrix.
 * @author Hal Deadman
 */
@Endpoint(id = "supportedVersions")
@RequiredArgsConstructor
public class SupportedVersionsEndpoint
{
    private final List<SupportedVersion> supportedVersions;

    @ReadOperation
    public List<SupportedVersion> getSupportedVersions() {
        return supportedVersions;
    }
}
