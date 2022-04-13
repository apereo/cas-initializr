package org.apereo.cas.overlay.bootadminserver.buildsystem;

import org.apereo.cas.overlay.OverlayBuildSystem;

public class CasSpringBootAdminServerOverlayBuildSystem implements OverlayBuildSystem {
    public static final String ID = "cas-bootadmin-server-overlay";

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
        return "bootadmin-overlay";
    }
}
