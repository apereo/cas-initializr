package org.apereo.cas.initializr.contrib.project;

import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.apereo.cas.initializr.web.VersionUtils;

import io.spring.initializr.generator.project.contributor.ProjectContributor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@RequiredArgsConstructor
public class OverlayOverrideConfigurationContributor implements ProjectContributor {
    private final ConfigurableApplicationContext applicationContext;

    private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    @Override
    public void contribute(Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);
        var version = VersionUtils.parse(overlayRequest.getCasVersion());
        var folderName = version.getMajor() <= 6 ? version.getMajor() : "default";

        contributeResource(projectRoot,
            "./src/main/java/org/apereo/cas/config/CasOverlayOverrideConfiguration.java",
            "classpath:common/" + String.format("src/main/%s/CasOverlayOverrideConfiguration.java", folderName));

        if (version.getMajor() <= 6) {
            contributeResource(projectRoot,
                "./src/main/resources/META-INF/spring.factories",
                "classpath:common/src/main/6/spring.factories");
        } else {
            contributeResource(projectRoot,
                "./src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports",
                "classpath:common/src/main/default/org.springframework.boot.autoconfigure.AutoConfiguration.imports");
        }
    }

    private void contributeResource(final Path projectRoot, final String relativePath, final String resourcePattern) throws IOException {
        Path output = projectRoot.resolve(relativePath);
        if (!Files.exists(output)) {
            Files.createDirectories(output.getParent());
            Files.createFile(output);
        }
        Resource resource = resolver.getResource(resourcePattern);
        FileCopyUtils.copy(resource.getInputStream(), Files.newOutputStream(output, StandardOpenOption.APPEND));
    }
}
