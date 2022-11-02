package org.apereo.cas.overlay.configserver.buildsystem;

import org.apereo.cas.overlay.OverlayBuildSystem;

public class CasConfigServerOverlayBuildSystem implements OverlayBuildSystem {
    public static final String ID = "cas-config-server-overlay";

    @Override
    public String id() {
        return ID;
    }

    @Override
    public String toString() {
        return id();
    }

    @Override
    public String overlayType() {
        return "cas";
    }

    @Override
    public String resourceDirectory() {
        return "configserver-overlay";
    }
}
