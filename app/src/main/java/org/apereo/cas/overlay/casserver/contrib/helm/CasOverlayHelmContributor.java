package org.apereo.cas.overlay.casserver.contrib.helm;

import org.apereo.cas.initializr.web.OverlayProjectDescription;

import io.spring.initializr.generator.project.contributor.MultipleResourcesProjectContributor;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class CasOverlayHelmContributor extends MultipleResourcesProjectContributor {

    private final ConfigurableApplicationContext applicationContext;

    public CasOverlayHelmContributor(final ConfigurableApplicationContext applicationContext) {
        super("classpath:overlay/helmcharts/", filename -> filename.endsWith(".sh"));
        this.applicationContext = applicationContext;
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        if (overlayRequest.isHelmSupported()) {
            super.contribute(projectRoot);
        }
    }
}
