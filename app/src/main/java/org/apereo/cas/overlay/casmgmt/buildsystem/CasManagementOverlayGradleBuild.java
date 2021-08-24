package org.apereo.cas.overlay.casmgmt.buildsystem;

import io.spring.initializr.generator.buildsystem.Build;
import io.spring.initializr.generator.buildsystem.BuildItemResolver;
import io.spring.initializr.generator.buildsystem.BuildSettings;
import io.spring.initializr.generator.buildsystem.gradle.GradleBuildSettings;

public class CasManagementOverlayGradleBuild extends Build {
    private final GradleBuildSettings.Builder settings = new GradleBuildSettings.Builder();

    public CasManagementOverlayGradleBuild(final BuildItemResolver buildItemResolver) {
        super(buildItemResolver);
    }

    @Override
    public BuildSettings.Builder<?> settings() {
        return settings;
    }

    @Override
    public BuildSettings getSettings() {
        return settings.build();
    }
}
