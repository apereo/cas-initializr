package org.apereo.cas.initializr.contrib;

import io.spring.initializr.generator.project.contributor.SingleResourceProjectContributor;

public class OverlayWebXmlContributor extends SingleResourceProjectContributor {
    public OverlayWebXmlContributor() {
        super("src/main/webapp/WEB-INF/web.xml", "classpath:common/webapp/web.xml");
    }
}
