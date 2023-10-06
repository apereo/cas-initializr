package org.apereo.cas.initializr.contrib.openrewrite;

import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.io.FilenameUtils;
import org.apache.commons.lang3.RegExUtils;
import org.apache.commons.lang3.StringUtils;
import org.jooq.lambda.Unchecked;
import org.springframework.context.ConfigurableApplicationContext;
import java.io.IOException;
import java.nio.file.Path;
import java.util.HashMap;

@Slf4j
public class OpenRewriteContributor extends TemplatedProjectContributor {
    public OpenRewriteContributor(final ConfigurableApplicationContext applicationContext) {
        super(applicationContext, "./openrewrite", "classpath:overlay/openrewrite/CASUpgrade.yml.mustache");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        var properties = applicationContext.getBean(CasInitializrProperties.class);
        var project = applicationContext.getBean(OverlayProjectDescription.class);

        var type = overlayRequest.getBuildSystem().id();
        if (overlayRequest.isOpenRewriteSupported() && type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            getPathsAndResourcesMap().forEach((relativePath, resourcePattern) -> {
                try {
                    val resource = resolver.getResource(resourcePattern);
                    properties.getSupportedVersions()
                        .stream()
                        .filter(version -> overlayRequest.getBuildSystem().overlayType().equalsIgnoreCase(version.getType()))
                        .forEach(Unchecked.consumer(version -> {
                            var initialName = StringUtils.remove(resource.getFilename(), ".mustache");
                            initialName = RegExUtils.removeAll(initialName, "-SNAPSHOT");

                            val recipeName = FilenameUtils.removeExtension(initialName) + RegExUtils.removeAll(version.getVersion(), "\\.|-SNAPSHOT"); ;
                            val filename = recipeName + "." + FilenameUtils.getExtension(initialName);
                            val resourcePath = getOutputResourcePathWithParent(resource, filename, relativePath);
                            val output = projectRoot.resolve(StringUtils.appendIfMissing(relativePath, "/") + resourcePath);
                            log.info("Output file {}", output.toFile().getAbsolutePath());
                            createFileAndParentDirectories(output);

                            var templateVariables = new HashMap<>();
                            templateVariables.put("recipeName", recipeName);
                            templateVariables.put("tomcatVersion", version.getTomcatVersion());
                            templateVariables.put("casVersion", version.getVersion());
                            templateVariables.put("javaVersion", version.getJavaVersion());
                            templateVariables.put("jibVersion", version.getPlugins().getJibVersion());
                            templateVariables.put("gradleVersion", version.getGradleVersion());
                            templateVariables.put("springBootVersion", version.getBootVersion());
                            var template = renderTemplate(resource, templateVariables);
                            template = postProcessRenderedTemplate(template, project, templateVariables);
                            createTemplateFile(output, template);
                        }));
                } catch (final Exception e) {
                    throw new IllegalArgumentException(e);
                }
            });
        }
    }
}
