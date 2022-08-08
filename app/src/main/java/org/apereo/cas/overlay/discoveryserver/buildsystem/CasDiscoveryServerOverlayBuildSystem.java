package org.apereo.cas.overlay.discoveryserver.buildsystem;

import org.apereo.cas.overlay.OverlayBuildSystem;

public class CasDiscoveryServerOverlayBuildSystem implements OverlayBuildSystem {
    public static final String ID = "cas-discovery-server-overlay";

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
        return "discoveryserver-overlay";
    }
}
