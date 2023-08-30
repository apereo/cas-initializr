package org.apereo.cas.initializr.contrib.project;

import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import lombok.RequiredArgsConstructor;
import org.apache.commons.io.FileUtils;
import org.jooq.lambda.Unchecked;
import org.springframework.context.ConfigurableApplicationContext;
import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;

/**
 * This contributor creates a {@code .java-version}
 * file that is used by the <a href="https://www.jenv.be/">jEnv tool</a>.
 */
@RequiredArgsConstructor
public class SdkmanJavaVersionContributor implements ProjectContributor {
    private final ConfigurableApplicationContext applicationContext;

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var properties = applicationContext.getBean(CasInitializrProperties.class);

        var output = projectRoot.resolve(".sdkmanrc");
        if (!Files.exists(output)) {
            var project = applicationContext.getBean(OverlayProjectDescription.class);
            properties.getSupportedVersions()
                .stream()
                .filter(version -> version.getType().equals(project.getBuildSystem().overlayType())
                                   && version.getVersion().equals(project.getCasVersion()))
                .findFirst()
                .ifPresent(Unchecked.consumer(version -> {
                    Files.createFile(output);
                    FileUtils.write(output.toFile(), String.format("java=%s", version.getJavaVersion()), StandardCharsets.UTF_8);
                }));
        }
    }
}
