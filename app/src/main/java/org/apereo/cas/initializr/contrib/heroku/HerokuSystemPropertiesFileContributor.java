package org.apereo.cas.initializr.contrib.heroku;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class HerokuSystemPropertiesFileContributor extends TemplatedProjectContributor {
    public HerokuSystemPropertiesFileContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./system.properties", "classpath:common/heroku/system.properties.mustache");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isHerokuSupported()) {
            super.contribute(projectRoot);
        }
    }
}
