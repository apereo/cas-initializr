package org.apereo.cas.overlay.casserver.buildsystem;

import org.apereo.cas.overlay.OverlayBuildSystem;

public class CasOverlayBuildSystem implements OverlayBuildSystem {
    public static final String ID = "cas-overlay";

    public static final String TYPE = "cas";

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
        return TYPE;
    }

    @Override
    public String resourceDirectory() {
        return "overlay";
    }
}
