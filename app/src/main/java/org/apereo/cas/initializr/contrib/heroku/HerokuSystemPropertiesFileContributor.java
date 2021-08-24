package org.apereo.cas.initializr.contrib.heroku;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class HerokuSystemPropertiesFileContributor extends TemplatedProjectContributor {
    public HerokuSystemPropertiesFileContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./system.properties", "classpath:common/heroku/system.properties.mustache");
    }
}
