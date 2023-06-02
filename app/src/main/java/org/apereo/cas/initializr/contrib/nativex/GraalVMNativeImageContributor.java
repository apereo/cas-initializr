package org.apereo.cas.initializr.contrib.nativex;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;

@RequiredArgsConstructor
public class GraalVMNativeImageContributor implements ProjectContributor {
    private final ConfigurableApplicationContext applicationContext;

    private final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var overlayRequest = applicationContext.getBean(OverlayProjectDescription.class);

        if (!overlayRequest.isNativeImageSupported()) {
            return;
        }

        Files.createDirectories(projectRoot.resolve("src/main/graal"));
        Files.createDirectories(projectRoot.resolve("src/main/resources/META-INF/native-image"));
        Files.createDirectories(projectRoot.resolve("src/main/resources/META-INF/spring"));

        contributeResource(projectRoot,
            "./src/main/java/org/apereo/cas/CasOverlayRuntimeHints.java",
            "classpath:overlay/src/main/default/CasOverlayRuntimeHints.java.mustache");

        contributeResource(projectRoot,
            "./src/main/resources/META-INF/spring/aot.factories",
            "classpath:overlay/nativex/aot.factories.mustache");
    }

    private void contributeResource(final Path projectRoot, final String relativePath, final String resourcePattern) throws IOException {
        var output = projectRoot.resolve(relativePath);
        if (!Files.exists(output)) {
            Files.createDirectories(output.getParent());
            Files.createFile(output);
        }
        var resource = resolver.getResource(resourcePattern);
        FileCopyUtils.copy(resource.getInputStream(), Files.newOutputStream(output, StandardOpenOption.APPEND));
    }
}
