package org.apereo.cas.overlay;

import io.spring.initializr.generator.buildsystem.BuildSystem;

/**
 * This is {@link OverlayBuildSystem}.
 *
 * @author Misagh Moayyed
 * @since 6.6.0
 */
public interface OverlayBuildSystem extends BuildSystem {

    String resourceDirectory();
}
