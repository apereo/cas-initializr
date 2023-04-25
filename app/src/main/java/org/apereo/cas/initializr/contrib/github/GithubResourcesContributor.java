package org.apereo.cas.initializr.contrib.github;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import org.springframework.context.ApplicationContext;
import org.springframework.core.io.Resource;

import java.io.IOException;
import java.nio.file.Path;

/**
 * This is {@link GithubResourcesContributor}.
 *
 * @author Misagh Moayyed
 * @since 7.0.0
 */
public class GithubResourcesContributor extends TemplatedProjectContributor {
    public GithubResourcesContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./.github", "classpath:common/.github/**");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isGithubActionsSupported()) {
            super.contribute(projectRoot);
        }
    }

    @Override
    protected String determineOutputResourceFileName(final Resource resource) throws IOException {
        var filename = super.determineOutputResourceFileName(resource);
        return getOutputResourcePathWithParent(resource, filename);
    }
}
