package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import io.spring.initializr.generator.project.contributor.MultipleResourcesProjectContributor;
import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class GradleWrapperConfigurationContributor extends TemplatedProjectContributor {

    public GradleWrapperConfigurationContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/wrapper", "classpath:common/gradle/wrapper/**");
    }
}
