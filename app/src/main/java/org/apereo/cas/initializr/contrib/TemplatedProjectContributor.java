package org.apereo.cas.initializr.contrib;

import lombok.RequiredArgsConstructor;
import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.metadata.InitializrMetadataFetcher;
import org.apereo.cas.initializr.web.OverlayProjectDescription;
import org.apereo.cas.initializr.web.UnsupportedVersionException;
import org.apereo.cas.initializr.web.VersionUtils;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayGradleBuild;
import org.apereo.cas.overlay.configserver.buildsystem.CasConfigServerOverlayBuildSystem;
import com.github.mustachejava.DefaultMustacheFactory;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.metadata.InitializrMetadataProvider;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.ToString;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang3.StringUtils;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.ClassPathResource;
import org.springframework.core.io.Resource;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;
import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.File;
import java.io.IOException;
import java.io.InputStream;
import java.io.InputStreamReader;
import java.io.OutputStream;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.TreeMap;
import java.util.stream.Collectors;
import java.util.stream.IntStream;

@Slf4j
@Getter
@Accessors(chain = true)
@RequiredArgsConstructor
public abstract class TemplatedProjectContributor implements ProjectContributor {
    private static final int MIN_CAS_MAJOR_VERSION = 7;
    private static final int MAX_CAS_MAJOR_VERSION = 100;
    private static final int MIN_GRADLE_MAJOR_VERSION = 8;
    private static final int MAX_GRADLE_MAJOR_VERSION = 100;
    private static final int MIN_CAS_MINOR_VERSION = 0;
    private static final int MAX_CAS_MINOR_VERSION = 20;

    protected final ApplicationContext applicationContext;

    protected final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    private final Map<String, Object> variables = new HashMap<>();

    private final Map<String, String> pathsAndResourcesMap;
    

    public TemplatedProjectContributor(final ApplicationContext applicationContext,
                                       final String relativePath, final String resourcePattern) {
        this(applicationContext, Map.of(relativePath, resourcePattern));
    }

    protected static String generateAppUrl() {
        var builder = ServletUriComponentsBuilder.fromCurrentServletMapping();
        builder.scheme("https");
        return builder.build().toString();
    }

    private static void handleApplicationServerType(final OverlayProjectDescription project, final Map<String, Object> defaults) {
        var dependencies = project.getRequestedDependencies();

        var appServer = "-tomcat";
        if (dependencies.containsKey("webapp-jetty")) {
            appServer = "-jetty";
        } else if (dependencies.containsKey("webapp-undertow")) {
            appServer = "-undertow";
        }

        if (dependencies.containsKey("webapp") || project.getDeploymentType() == OverlayProjectDescription.DeploymentTypes.WEB) {
            appServer = "";
        }

        defaults.put("appServer", appServer);
        defaults.put("executable", project.getDeploymentType() == OverlayProjectDescription.DeploymentTypes.EXECUTABLE);
    }

    protected static void createTemplateFile(final Path output, final String template) throws IOException {
        log.info("Processing template file {}", output.toFile().getAbsolutePath());
        copyResourceToOutput(new BufferedInputStream(new ByteArrayInputStream(template.getBytes(StandardCharsets.UTF_8))),
            Files.newOutputStream(output, StandardOpenOption.APPEND));
        val filename = output.getFileName().toFile().getName();
        val result = output.toFile().setExecutable(filename.endsWith(".sh") || filename.endsWith(".bat"));
        log.debug("{} was marked as executable: {}", filename, result);
    }

    protected List<CasDependency> handleProjectRequestedDependencies(final OverlayProjectDescription project) {
        val fetcher = applicationContext.getBean(InitializrMetadataFetcher.class);

        var provider = getInitializrMetadata();
        var configuration = provider.getConfiguration();
        var boms = configuration.getEnv().getBoms();
        
        var casVersion = project.resolveCasVersion(boms.get("cas-bom"));
        var availableDependencies = fetcher.fetch(casVersion);
        log.info("Available overlay dependencies for {}: {}", project.getVersion(), availableDependencies.size());
        
        var dependencies = project.getRequestedDependencies()
            .values()
            .stream()
            .filter(dep -> !CasOverlayGradleBuild.WEBAPP_ARTIFACTS.contains(dep.getArtifactId()))
            .filter(dep -> availableDependencies.stream().anyMatch(dependency -> dependency.getName().equalsIgnoreCase(dep.getArtifactId())
                && dependency.getGroup().equalsIgnoreCase(dep.getGroupId())))
            .map(dep -> new CasDependency(dep.getGroupId(), dep.getArtifactId()))
            .collect(Collectors.toList());
        log.debug("Requested overlay dependencies: {}", dependencies);
        return dependencies;
    }

    protected OverlayProjectDescription getOverlayProjectDescription() {
        return applicationContext.getBean(OverlayProjectDescription.class);
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        pathsAndResourcesMap.forEach((relativePath, resourcePattern) -> {
            try {
                if (resourcePattern.endsWith("/**")) {
                    val resources = resolver.getResources(resourcePattern);
                    for (val resource : resources) {
                        if (resource.isReadable()) {
                            val output = determineOutputResourcePath(projectRoot, resource, relativePath);
                            log.info("Output file {}", output.toFile().getAbsolutePath());
                            createFileAndParentDirectories(output);
                            if (resource.getFilename().endsWith(".mustache")) {
                                var templateVariables = getProjectTemplateVariables();
                                var template = renderTemplate(resource, templateVariables);
                                var project = applicationContext.getBean(OverlayProjectDescription.class);
                                template = postProcessRenderedTemplate(template, project, templateVariables);
                                createTemplateFile(output, template);
                            } else {
                                if (!output.toFile().exists()) {
                                    Files.createFile(output);
                                }
                                copyResourceToOutput(resource.getInputStream(), Files.newOutputStream(output));
                            }
                            if (output.endsWith(".sh") || output.endsWith(".bat")) {
                                output.toFile().setExecutable(true);
                            }
                        }
                    }
                } else {
                    processTemplatedFile(projectRoot.resolve(relativePath), resourcePattern);
                }
            } catch (final Exception e) {
                throw new IllegalArgumentException(e);
            }
        });
    }

    protected static void copyResourceToOutput(final InputStream resource, final OutputStream output) throws IOException {
        FileCopyUtils.copy(resource, output);
    }

    protected Path determineOutputResourcePath(final Path projectRoot, final Resource resource,
                                               final String relativePath) throws IOException {
        val filename = determineOutputResourceFileName(resource, relativePath);
        return projectRoot.resolve(StringUtils.appendIfMissing(relativePath, "/") + filename);
    }

    protected String determineOutputResourceFileName(final Resource resource, final String relativePath) throws IOException {
        return StringUtils.remove(resource.getFilename(), ".mustache");
    }

    protected Map<String, Object> getProjectTemplateVariables() {
        var project = applicationContext.getBean(OverlayProjectDescription.class);
        var templateVariables = prepareProjectTemplateVariables(project);
        var model = contributeInternal(project);
        if (model instanceof Map mapModule) {
            mapModule.putAll(templateVariables);
        }
        return templateVariables;
    }

    protected void processTemplatedFile(final Path output,
                                      final String resourcePattern) throws IOException {
        createFileAndParentDirectories(output);
        var templateVariables = getProjectTemplateVariables();
        var project = applicationContext.getBean(OverlayProjectDescription.class);
        var template = renderTemplateFromResource(resourcePattern, project, templateVariables);
        template = postProcessRenderedTemplate(template, project, templateVariables);
        createTemplateFile(output, template);
    }

    protected static void createFileAndParentDirectories(final Path output) throws IOException {
        if (!Files.exists(output)) {
            Files.createDirectories(output.getParent());
            Files.createFile(output);
        }
    }

    protected String postProcessRenderedTemplate(final String template,
                                                 final OverlayProjectDescription project,
                                                 final Object model) throws IOException {
        return template;
    }

    protected String renderTemplateFromResource(final String resourcePattern,
                                                final OverlayProjectDescription project,
                                                final Object model) throws IOException {
        var resource = resolver.getResource(resourcePattern);
        return renderTemplate(resource, model);
    }

    protected static String renderTemplate(final Resource resource, final Object model) throws IOException {
        log.debug("Rendering template [{}], using model [{}]", resource, model);
        try (var writer = new StringWriter()) {
            var mf = new DefaultMustacheFactory();
            var mustache = mf.compile(new InputStreamReader(resource.getInputStream()), resource.getFilename());
            mustache.execute(writer, model).flush();
            return writer.toString();
        }
    }

    protected InitializrMetadata getInitializrMetadata() {
        var provider = applicationContext.getBean(InitializrMetadataProvider.class);
        return provider.get();
    }
    
    protected Map<String, Object> prepareProjectTemplateVariables(final OverlayProjectDescription project) {
        var properties = applicationContext.getBean(CasInitializrProperties.class);
        
        var provider = getInitializrMetadata();
        var templateVariables = new TreeMap<>(provider.defaults());
        var configuration = provider.getConfiguration();
        var boms = configuration.getEnv().getBoms();

        var type = project.getBuildSystem().id();
        templateVariables.put("type", type);

        properties.getSupportedVersions()
            .stream()
            .filter(version -> version.getType().equals(project.getBuildSystem().overlayType())
                && version.getVersion().equals(project.getCasVersion()))
            .findFirst()
            .ifPresentOrElse(version -> {
                templateVariables.put("tomcatVersion", version.getTomcatVersion());
                templateVariables.put("javaVersion", version.getJavaVersion());
                templateVariables.put("jibVersion", version.getPlugins().getJibVersion());
                templateVariables.put("openRewriteVersion", version.getPlugins().getOpenRewriteVersion());
                templateVariables.put("containerBaseImageName", version.getContainerBaseImage());
                templateVariables.put("gradleVersion", version.getGradleVersion());
                templateVariables.put("branch", version.getBranch());

                var gradleVersion = VersionUtils.parse(version.getGradleVersion());
                IntStream.rangeClosed(MIN_GRADLE_MAJOR_VERSION, MAX_GRADLE_MAJOR_VERSION).forEach(value -> {
                    if (gradleVersion.getMajor() == value) {
                        templateVariables.put("gradleVersion" + value, Boolean.TRUE);
                    }
                    if (gradleVersion.getMajor() >= value) {
                        templateVariables.put("gradleVersion" + value + "Compatible", Boolean.TRUE);
                    }
                });
            }, () -> {
                throw new UnsupportedVersionException(project.getCasVersion(),
                    "Unsupported version " + project.getCasVersion() + " for project type " + project.getBuildSystem().overlayType());
            });

        var casVersion = project.resolveCasVersion(boms.get("cas-bom"));
        templateVariables.put("casVersion", casVersion);

        var parsedCasVersion = VersionUtils.parse(casVersion);
        IntStream.rangeClosed(MIN_CAS_MAJOR_VERSION, MAX_CAS_MAJOR_VERSION).forEach(value -> {
            if (parsedCasVersion.getMajor() == value) {
                templateVariables.put("casVersion" + parsedCasVersion.getMajor(), Boolean.TRUE);
                templateVariables.put("casVersion" + parsedCasVersion.getMajor() + parsedCasVersion.getMinor(), Boolean.TRUE);
                IntStream.rangeClosed(MIN_CAS_MINOR_VERSION, MAX_CAS_MINOR_VERSION).forEach(minor -> {
                    if (minor <= parsedCasVersion.getMinor()) {
                        templateVariables.put("casVersion" + parsedCasVersion.getMajor() + minor + "OrAbove", Boolean.TRUE);
                    }
                });
            }
            if (parsedCasVersion.getMajor() >= value) {
                templateVariables.put("casVersion" + value + "OrAbove", Boolean.TRUE);
                templateVariables.put("casVersion" + parsedCasVersion.getMajor() + parsedCasVersion.getMinor() + "OrAbove", Boolean.TRUE);
            }
        });

        templateVariables.put("springBootVersion", project.getSpringBootVersion());
        templateVariables.put("buildSystemId", type);

        val dockerSupported = getOverlayProjectDescription().isDockerSupported();
        templateVariables.put("dockerSupported", dockerSupported);

        templateVariables.put("containerImageName", StringUtils.remove(type, "-overlay"));
        templateVariables.put("containerImageOrg", "apereo");

        templateVariables.put("initializrUrl", generateAppUrl());

        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            handleApplicationServerType(project, templateVariables);
            templateVariables.put("dockerSupported", dockerSupported);
        }
        templateVariables.put("githubActionsSupported", getOverlayProjectDescription().isGithubActionsSupported());

        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID) && parsedCasVersion.getMajor() >= 7 && parsedCasVersion.getMinor() >= 1) {
            templateVariables.put("sbomSupported", getOverlayProjectDescription().isSbomSupported());
            templateVariables.put("nativeImageSupported", getOverlayProjectDescription().isNativeImageSupported());
        }

        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            templateVariables.put("puppeteerSupported", getOverlayProjectDescription().isPuppeteerSupported());
            templateVariables.put("openRewriteSupported", getOverlayProjectDescription().isOpenRewriteSupported());
            templateVariables.put("shellSupported", getOverlayProjectDescription().isCommandlineShellSupported());
            templateVariables.put("casServer", Boolean.TRUE);
            templateVariables.put("appName", "cas");
        }
        if (type.equalsIgnoreCase(CasConfigServerOverlayBuildSystem.ID)) {
            templateVariables.put("configServer", Boolean.TRUE);
            templateVariables.put("appName", "casconfigserver");
        }

        templateVariables.putAll(getVariables());
        templateVariables.put("dependencies", handleProjectRequestedDependencies(project));
        return templateVariables;
    }

    protected Object contributeInternal(final ProjectDescription project) {
        return new HashMap<>();
    }

    protected boolean resourceExists(final String projectResource) {
        try {
            var resource = resolver.getResource(projectResource);
            return resource.getInputStream().available() > MIN_CAS_MINOR_VERSION;
        } catch (Exception e) {
            return false;
        }
    }

    protected static String appendResource(final String appendTemplate,
                                           final String originalTemplate,
                                           final OverlayProjectDescription project) throws IOException {
        try (var writer = new StringWriter()) {
            writer.write(originalTemplate);
            writer.write(appendTemplate);
            return writer.toString();
        }
    }

    protected String getOutputResourcePathWithParent(final Resource resource,
                                                     final String filename,
                                                     final String relativePath) throws IOException {
        val relativePathFile = new File(relativePath);
        val parentFile = resource.isFile()
            ? resource.getFile().getParentFile()
            : new File(((ClassPathResource) resource).getPath()).getParentFile();
        val resourceParentName = parentFile.getName();
        if (!resourceParentName.equals(relativePathFile.getName())) {
            return "/" + resourceParentName + "/" + filename;
        }
        return filename;
    }

    @Getter
    @AllArgsConstructor
    @ToString
    public static class CasDependency {
        private final String groupId;

        private final String artifactId;
    }
}
