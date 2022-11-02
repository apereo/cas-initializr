package org.apereo.cas.overlay.casserver.contrib.docker;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

public class CasOverlayDockerContributor extends TemplatedProjectContributor {

    public CasOverlayDockerContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./", "classpath:overlay/docker/**");
    }

}
