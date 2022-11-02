package org.apereo.cas.overlay.casmgmt.contrib.docker;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;

/**
 * This is {@link CasManagementOverlayDockerContributor}.
 *
 * @author Misagh Moayyed
 */
public class CasManagementOverlayDockerContributor extends TemplatedProjectContributor {

    public CasManagementOverlayDockerContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./", "classpath:mgmt-overlay/docker/**");
    }
}

