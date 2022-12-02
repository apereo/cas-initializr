package org.apereo.cas.initializr.contrib.project;

import io.spring.initializr.generator.project.contributor.ProjectContributor;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;

public class LocalEtcCasDirectoryContributor implements ProjectContributor {
    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var output = projectRoot.resolve("etc/cas/.ignore");
        if (!Files.exists(output)) {
            Files.createDirectories(output.getParent());
            Files.createFile(output);
        }

    }
}
