package org.apereo.cas.overlay.casmgmt.buildsystem;

import io.spring.initializr.generator.buildsystem.BuildSystem;

public class CasManagementOverlayBuildSystem implements BuildSystem {
    public static final String ID = "cas-management-overlay";

    @Override
    public String id() {
        return ID;
    }

    @Override
    public String toString() {
        return id();
    }
}
