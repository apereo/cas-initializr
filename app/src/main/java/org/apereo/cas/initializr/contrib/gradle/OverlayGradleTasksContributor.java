package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;

@Slf4j
public class OverlayGradleTasksContributor extends TemplatedProjectContributor {
    public OverlayGradleTasksContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/tasks.gradle", "classpath:common/gradle/tasks.gradle.mustache");
    }
}
