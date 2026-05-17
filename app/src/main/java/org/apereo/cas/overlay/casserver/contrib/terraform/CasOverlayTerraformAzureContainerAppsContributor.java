package org.apereo.cas.overlay.casserver.contrib.terraform;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Path;

public class CasOverlayTerraformAzureContainerAppsContributor extends TemplatedProjectContributor {

    public CasOverlayTerraformAzureContainerAppsContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./terraform/azure", "classpath:overlay/terraform/azure/**");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isTerraformAzureContainerApps()) {
            super.contribute(projectRoot);
        }
    }

    @Override
    protected String determineOutputResourceFileName(final Resource resource, final String relativePath) throws IOException {
        var filename = super.determineOutputResourceFileName(resource, relativePath);
        return getOutputResourcePathWithParent(resource, filename, relativePath);
    }
}
