package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class GradleWrapperConfigurationContributor extends TemplatedProjectContributor {

    public GradleWrapperConfigurationContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/wrapper", "classpath:common/gradle/wrapper/**");
    }
}
