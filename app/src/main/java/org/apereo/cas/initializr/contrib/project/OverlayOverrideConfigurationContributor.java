package org.apereo.cas.initializr.contrib.project;

import io.spring.initializr.generator.project.contributor.ProjectContributor;
import lombok.RequiredArgsConstructor;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@RequiredArgsConstructor
public class OverlayOverrideConfigurationContributor implements ProjectContributor {
    private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        contributeResource(projectRoot,
                "./src/main/java/org/apereo/cas/config/CasOverlayOverrideConfiguration.java",
                "classpath:common/src/main/default/CasOverlayOverrideConfiguration.java");

        contributeResource(projectRoot,
                "./src/main/resources/META-INF/spring/org.springframework.boot.autoconfigure.AutoConfiguration.imports",
                "classpath:common/src/main/default/org.springframework.boot.autoconfigure.AutoConfiguration.imports");


        contributeResource(projectRoot,
                "./src/test/java/org/apereo/cas/config/CasOverlayOverrideConfigurationTests.java",
                "classpath:common/src/test/default/CasOverlayOverrideConfigurationTests.java");
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
