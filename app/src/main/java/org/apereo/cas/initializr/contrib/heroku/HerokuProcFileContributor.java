package org.apereo.cas.initializr.contrib.heroku;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class HerokuProcFileContributor extends TemplatedProjectContributor {
    public HerokuProcFileContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./Procfile", "classpath:common/heroku/Procfile.mustache");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isHerokuSupported()) {
            super.contribute(projectRoot);
        }
    }
}
