package org.apereo.cas.overlay.casserver.contrib.docker;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class CasOverlayDockerContributor extends TemplatedProjectContributor {

    public CasOverlayDockerContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./", "classpath:overlay/docker/**");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isDockerSupported()) {
            super.contribute(projectRoot);
        }
    }
}
