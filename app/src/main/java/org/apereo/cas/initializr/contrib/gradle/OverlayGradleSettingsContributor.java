package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

public class OverlayGradleSettingsContributor extends TemplatedProjectContributor {
    public OverlayGradleSettingsContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./settings.gradle", "classpath:common/gradle/settings.gradle.mustache");
    }
}
