package org.apereo.cas.overlay.bootadminserver.buildsystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.buildsystem.BuildSystemFactory;

public class CasSpringBootAdminServerOverlayBuildSystemFactory implements BuildSystemFactory {

    @Override
    public BuildSystem createBuildSystem(final String id) {
        return createBuildSystem(id, null);
    }

    @Override
    public BuildSystem createBuildSystem(final String id, final String dialect) {
        if (CasSpringBootAdminServerOverlayBuildSystem.ID.equals(id)) {
            return new CasSpringBootAdminServerOverlayBuildSystem();
        }
        return null;
    }

}
