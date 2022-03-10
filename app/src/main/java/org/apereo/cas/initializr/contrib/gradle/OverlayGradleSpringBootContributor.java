package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class OverlayGradleSpringBootContributor extends TemplatedProjectContributor {

    public OverlayGradleSpringBootContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "gradle/springboot.gradle", "classpath:common/gradle/springboot.gradle.mustache");
    }
}
