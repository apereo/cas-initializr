package org.apereo.cas.overlay.discoveryserver.buildsystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.buildsystem.BuildSystemFactory;

public class CasDiscoveryServerOverlayBuildSystemFactory implements BuildSystemFactory {

    @Override
    public BuildSystem createBuildSystem(final String id) {
        return createBuildSystem(id, null);
    }

    @Override
    public BuildSystem createBuildSystem(final String id, final String dialect) {
        if (CasDiscoveryServerOverlayBuildSystem.ID.equals(id)) {
            return new CasDiscoveryServerOverlayBuildSystem();
        }
        return null;
    }

}
