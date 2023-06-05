package org.apereo.cas.initializr.contrib.project;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.springframework.context.ConfigurableApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class OverlayWebXmlContributor extends TemplatedProjectContributor {
    public OverlayWebXmlContributor(final ConfigurableApplicationContext applicationContext) {
        super(applicationContext, "src/main/webapp/WEB-INF/web.xml", "classpath:common/webapp/web.xml");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().getDeploymentType() == OverlayProjectDescription.DeploymentTypes.WEB) {
            super.contribute(projectRoot);
        }
    }
}
