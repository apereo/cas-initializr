package org.apereo.cas.initializr.contrib.openrewrite;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.apereo.cas.initializr.web.VersionUtils;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ConfigurableApplicationContext;
import java.io.IOException;
import java.nio.file.Path;

@Slf4j
public class OpenRewriteContributor extends TemplatedProjectContributor {
    public OpenRewriteContributor(final ConfigurableApplicationContext applicationContext) {
        super(applicationContext, "./openrewrite.gradle", "classpath:overlay/openrewrite/openrewrite.gradle.mustache");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var project = applicationContext.getBean(OverlayProjectDescription.class);
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        var casVersion = VersionUtils.parse(project.getCasVersion());
        var type = overlayRequest.getBuildSystem().id();
        if (overlayRequest.isOpenRewriteSupported() && type.equalsIgnoreCase(CasOverlayBuildSystem.ID) && casVersion.getMajor() >= 7) {
            super.contribute(projectRoot);
        }
    }
}
