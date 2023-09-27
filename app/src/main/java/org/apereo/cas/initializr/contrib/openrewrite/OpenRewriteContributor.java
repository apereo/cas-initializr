package org.apereo.cas.initializr.contrib.openrewrite;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import org.springframework.context.ConfigurableApplicationContext;
import java.io.IOException;
import java.nio.file.Path;

public class OpenRewriteContributor extends TemplatedProjectContributor {
    public OpenRewriteContributor(final ConfigurableApplicationContext applicationContext) {
        super(applicationContext, "./openrewrite", "classpath:overlay/openrewrite/**");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        var type = overlayRequest.getBuildSystem().id();
        if (overlayRequest.isOpenRewriteSupported() && type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            super.contribute(projectRoot);
        }
    }
}
