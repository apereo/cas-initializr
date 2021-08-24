package org.apereo.cas.initializr.web.generator;

import io.spring.initializr.generator.project.ProjectAssetGenerator;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.generator.project.ProjectDirectoryFactory;
import io.spring.initializr.generator.project.ProjectGenerationContext;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import lombok.val;
import org.eclipse.jgit.api.Git;
import org.eclipse.jgit.lib.ConfigConstants;
import org.springframework.util.FileSystemUtils;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.util.stream.Collectors;

/**
 * This is {@link CasInitializrProjectAssetGenerator}.
 *
 * @author Misagh Moayyed
 */
public class CasInitializrProjectAssetGenerator implements ProjectAssetGenerator<Path> {
    private final ProjectDirectoryFactory projectDirectoryFactory;

    public CasInitializrProjectAssetGenerator(ProjectDirectoryFactory projectDirectoryFactory) {
        this.projectDirectoryFactory = projectDirectoryFactory;
    }

    public CasInitializrProjectAssetGenerator() {
        this(null);
    }

    private static Path resolveProjectDirectory(Path rootDir, ProjectDescription description) {
        if (description.getBaseDirectory() != null) {
            return rootDir.resolve(description.getBaseDirectory());
        }
        return rootDir;
    }

    private static void delete(final Path projectRoot, final String path) throws IOException {
        FileSystemUtils.deleteRecursively(projectRoot.resolve(path));
    }

    private static void cleanUpAndFinalize(final Path projectRoot) throws Exception {
        delete(projectRoot, "src/test");
        delete(projectRoot, "src/main/resources/application.properties");
        delete(projectRoot, "src/main/java/org/apereo/cas/cas");
        val git = Git.init()
            .setDirectory(projectRoot.toFile())
            .call();
        git.add().setUpdate(false).addFilepattern(".").call();
        var config = git.getRepository().getConfig();
        config.setBoolean(ConfigConstants.CONFIG_CORE_SECTION, null, ConfigConstants.CONFIG_KEY_AUTOCRLF, true);
        config.setBoolean(ConfigConstants.CONFIG_CORE_SECTION, null, ConfigConstants.CONFIG_KEY_FILEMODE, false);
        config.save();
        git.commit()
            .setSign(false)
            .setAuthor("cas-initializr", "info@apereo.org")
            .setMessage("Project created by Apereo CAS Initializr")
            .call();
        git.close();
    }

    @Override
    public Path generate(final ProjectGenerationContext context) throws IOException {
        try {
            var description = context.getBean(ProjectDescription.class);
            var projectRoot = resolveProjectDirectoryFactory(context).createProjectDirectory(description);
            var projectDirectory = initializerProjectDirectory(projectRoot, description);
            var contributors = context.getBeanProvider(ProjectContributor.class).orderedStream().collect(Collectors.toList());
            for (var contributor : contributors) {
                contributor.contribute(projectDirectory);
            }
            cleanUpAndFinalize(projectDirectory);
            return projectRoot;
        } catch (final Exception e) {
            throw new IOException(e);
        }
    }

    private ProjectDirectoryFactory resolveProjectDirectoryFactory(ProjectGenerationContext context) {
        return this.projectDirectoryFactory != null ? this.projectDirectoryFactory
            : context.getBean(ProjectDirectoryFactory.class);
    }

    private Path initializerProjectDirectory(Path rootDir, ProjectDescription description) throws Exception {
        var projectDirectory = resolveProjectDirectory(rootDir, description);
        Files.createDirectories(projectDirectory);
        return projectDirectory;
    }

}
