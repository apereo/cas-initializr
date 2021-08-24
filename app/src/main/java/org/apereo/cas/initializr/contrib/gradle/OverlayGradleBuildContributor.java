package org.apereo.cas.initializr.contrib.gradle;

import lombok.extern.slf4j.Slf4j;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

@Slf4j
public class OverlayGradleBuildContributor extends TemplatedProjectContributor {
    public OverlayGradleBuildContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./build.gradle", "classpath:common/gradle/build.gradle.mustache");
    }
}
