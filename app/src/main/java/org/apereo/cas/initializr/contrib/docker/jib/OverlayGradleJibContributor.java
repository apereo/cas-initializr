package org.apereo.cas.initializr.contrib.docker.jib;

import io.spring.initializr.generator.project.contributor.SingleResourceProjectContributor;

public class OverlayGradleJibContributor extends SingleResourceProjectContributor {
    public OverlayGradleJibContributor() {
        this("classpath:common/jib/jib.gradle");
    }

    private OverlayGradleJibContributor(final String resourcePattern) {
        super("gradle/jib.gradle", resourcePattern);
    }
}
