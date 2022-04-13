package org.apereo.cas.overlay.casmgmt.buildsystem;

import org.apereo.cas.overlay.OverlayBuildSystem;

public class CasManagementOverlayBuildSystem implements OverlayBuildSystem {
    public static final String ID = "cas-management-overlay";

    @Override
    public String id() {
        return ID;
    }

    @Override
    public String toString() {
        return id();
    }

    @Override
    public String resourceDirectory() {
        return "mgmt-overlay";
    }

}
