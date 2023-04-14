package org.apereo.cas.overlay.casserver.contrib.puppeteer;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;

import lombok.val;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;

import java.io.File;
import java.io.IOException;
import java.nio.file.Path;

public class CasOverlayPuppeteerContributor extends TemplatedProjectContributor {

    public CasOverlayPuppeteerContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./puppeteer", "classpath:overlay/puppeteer/**");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isPuppeteerSupported()) {
            super.contribute(projectRoot);
        }
    }
    
    @Override
    protected String determineOutputResourceFileName(final Resource resource) throws IOException {
        val relativePathFile = new File(getRelativePath());
        var filename = super.determineOutputResourceFileName(resource);
        val parentFile = resource.isFile()
            ? resource.getFile().getParentFile()
            : new File(((ClassPathResource) resource).getPath()).getParentFile();
        val resourceParentName = parentFile.getName();
        if (!resourceParentName.equals(relativePathFile.getName())) {
            filename = "/" + resourceParentName + "/" + filename;
        }
        return filename;
    }
}
