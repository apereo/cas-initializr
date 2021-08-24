package org.apereo.cas.overlay.casmgmt.buildsystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.buildsystem.BuildSystemFactory;

public class CasManagementOverlayBuildSystemFactory implements BuildSystemFactory {

    @Override
    public BuildSystem createBuildSystem(final String id) {
        return createBuildSystem(id, null);
    }

    @Override
    public BuildSystem createBuildSystem(final String id, final String dialect) {
        if (CasManagementOverlayBuildSystem.ID.equals(id)) {
            return new CasManagementOverlayBuildSystem();
        }
        return null;
    }

}
