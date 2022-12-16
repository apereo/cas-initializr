package org.apereo.cas.initializr.contrib.docker.jib;

import org.apereo.cas.initializr.web.OverlayProjectDescription;

import io.spring.initializr.generator.project.contributor.SingleResourceProjectContributor;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class OverlayGradleJibContributor extends SingleResourceProjectContributor {
    private final ConfigurableApplicationContext applicationContext;

    public OverlayGradleJibContributor(final ConfigurableApplicationContext applicationContext) {
        super("gradle/jib.gradle", "classpath:common/jib/jib.gradle");
        this.applicationContext = applicationContext;
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        if (overlayRequest.isDockerSupported()) {
            super.contribute(projectRoot);
        }
    }
}
