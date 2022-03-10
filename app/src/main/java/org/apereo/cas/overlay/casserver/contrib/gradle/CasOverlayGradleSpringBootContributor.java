package org.apereo.cas.overlay.casserver.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class CasOverlayGradleSpringBootContributor extends TemplatedProjectContributor {

    public CasOverlayGradleSpringBootContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "gradle/springboot.gradle", "classpath:overlay/gradle/springboot.gradle.mustache");
    }
}
