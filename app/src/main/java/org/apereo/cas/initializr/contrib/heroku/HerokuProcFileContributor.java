package org.apereo.cas.initializr.contrib.heroku;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class HerokuProcFileContributor extends TemplatedProjectContributor {
    public HerokuProcFileContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./Procfile", "classpath:common/heroku/Procfile.mustache");
    }
}
