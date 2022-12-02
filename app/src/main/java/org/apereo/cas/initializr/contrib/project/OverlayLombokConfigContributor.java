package org.apereo.cas.initializr.contrib.project;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class OverlayLombokConfigContributor extends TemplatedProjectContributor {
    public OverlayLombokConfigContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./lombok.config", "classpath:common/lombok.config.mustache");
    }
}
