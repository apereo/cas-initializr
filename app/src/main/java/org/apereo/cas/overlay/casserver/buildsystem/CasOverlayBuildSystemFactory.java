package org.apereo.cas.overlay.casserver.buildsystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;
import io.spring.initializr.generator.buildsystem.BuildSystemFactory;

public class CasOverlayBuildSystemFactory implements BuildSystemFactory {

    @Override
    public BuildSystem createBuildSystem(final String id) {
        return createBuildSystem(id, null);
    }

    @Override
    public BuildSystem createBuildSystem(final String id, final String dialect) {
        if (CasOverlayBuildSystem.ID.equals(id)) {
            return new CasOverlayBuildSystem();
        }
        return null;
    }

}
