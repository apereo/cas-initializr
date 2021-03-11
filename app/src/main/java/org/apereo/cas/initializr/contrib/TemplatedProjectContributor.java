package org.apereo.cas.initializr.contrib;

import com.github.mustachejava.DefaultMustacheFactory;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.metadata.InitializrMetadataProvider;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apache.commons.lang.StringUtils;
import org.apereo.cas.overlay.bootadminserver.buildsystem.CasSpringBootAdminServerOverlayBuildSystem;
import org.apereo.cas.overlay.casmgmt.buildsystem.CasManagementOverlayBuildSystem;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayGradleBuild;
import org.apereo.cas.overlay.configserver.buildsystem.CasConfigServerOverlayBuildSystem;
import org.apereo.cas.overlay.discoveryserver.buildsystem.CasDiscoveryServerOverlayBuildSystem;
import org.springframework.context.ApplicationContext;
import org.springframework.core.io.support.PathMatchingResourcePatternResolver;
import org.springframework.util.FileCopyUtils;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.io.BufferedInputStream;
import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.io.InputStreamReader;
import java.io.StringWriter;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RequiredArgsConstructor
@Slf4j
@Setter
@Getter
@Accessors(chain = true)
public abstract class TemplatedProjectContributor implements ProjectContributor {
    protected final ApplicationContext applicationContext;

    protected final PathMatchingResourcePatternResolver resolver = new PathMatchingResourcePatternResolver();

    private final String relativePath;

    private final String resourcePattern;

    private final Map<String, Object> variables = new HashMap<>();

    protected static String generateAppUrl() {
        var builder = ServletUriComponentsBuilder.fromCurrentServletMapping();
        builder.scheme("https");
        return builder.build().toString();
    }

    private static void handleApplicationServerType(ProjectDescription project, Map<String, Object> defaults) {
        val dependencies = project.getRequestedDependencies();
        var appServer = "-tomcat";
        if (dependencies.containsKey("webapp-jetty")) {
            appServer = "-jetty";
        } else if (dependencies.containsKey("webapp-undertow")) {
            appServer = "-undertow";
        }
        defaults.put("appServer", appServer);
    }

    protected static void createTemplateFile(Path output, String template) throws IOException {
        FileCopyUtils.copy(new BufferedInputStream(new ByteArrayInputStream(template.getBytes(StandardCharsets.UTF_8))),
                Files.newOutputStream(output, StandardOpenOption.APPEND));
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        val output = projectRoot.resolve(relativePath);
        if (!Files.exists(output)) {
            Files.createDirectories(output.getParent());
            Files.createFile(output);
        }
        var template = renderTemplateFromResource(resourcePattern);
        template = postProcessRenderedTemplate(template);
        createTemplateFile(output, template);
    }

    protected String postProcessRenderedTemplate(final String template) {
        return template;
    }

    protected String renderTemplateFromResource(final String resourcePattern) throws IOException {
        val resource = resolver.getResource(resourcePattern);
        val mf = new DefaultMustacheFactory();
        val mustache = mf.compile(new InputStreamReader(resource.getInputStream()), resource.getFilename());
        try (val writer = new StringWriter()) {
            val project = applicationContext.getBean(ProjectDescription.class);

            val templateVariables = prepareProjectTemplateVariables(project);
            val model = contributeInternal(project);
            if (model instanceof Map) {
                ((Map<String, Object>) model).putAll(templateVariables);
            }
            mustache.execute(writer, model).flush();
            return writer.toString();
        }
    }

    protected Map<String, Object> prepareProjectTemplateVariables(final ProjectDescription project) {
        val provider = applicationContext.getBean(InitializrMetadataProvider.class);

        val templateVariables = new HashMap<>(provider.get().defaults());
        var configuration = provider.get().getConfiguration();
        var boms = configuration.getEnv().getBoms();

        templateVariables.put("casVersion", boms.get("cas-bom").getVersion());
        templateVariables.put("casMgmtVersion", boms.get("cas-mgmt-bom").getVersion());
        templateVariables.put("springBootVersion", templateVariables.get("bootVersion"));

        val type = project.getBuildSystem().id();
        templateVariables.put("buildSystemId", type);
        templateVariables.put("containerImageName", StringUtils.remove(type, "-overlay"));

        templateVariables.put("initializrUrl", generateAppUrl());
        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID) || type.equalsIgnoreCase(CasManagementOverlayBuildSystem.ID)) {
            handleApplicationServerType(project, templateVariables);
            templateVariables.put("hasDockerFile", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasManagementOverlayBuildSystem.ID)) {
            templateVariables.put("managementServer", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            templateVariables.put("casServer", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasSpringBootAdminServerOverlayBuildSystem.ID)) {
            templateVariables.put("springBootAdminServer", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasConfigServerOverlayBuildSystem.ID)) {
            templateVariables.put("configServer", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasDiscoveryServerOverlayBuildSystem.ID)) {
            templateVariables.put("discoveryServer", Boolean.TRUE);
        }

        templateVariables.putAll(getVariables());
        templateVariables.put("dependencies", handleProjectRequestedDependencies(project));
        return templateVariables;
    }

    public TemplatedProjectContributor putVariable(final String key, final Object value) {
        variables.put(key, value);
        return this;
    }

    protected List<CasDependency> handleProjectRequestedDependencies(final ProjectDescription project) {
        val dependencies = project.getRequestedDependencies()
                .values()
                .stream()
                .filter(dep -> !CasOverlayGradleBuild.WEBAPP_ARTIFACTS.contains(dep.getArtifactId()))
                .map(dep -> new CasDependency(dep.getGroupId(), dep.getArtifactId()))
                .collect(Collectors.toList());
        log.debug("Requested overlay dependencies: {}", dependencies);
        return dependencies;
    }

    protected Object contributeInternal(ProjectDescription project) {
        return new HashMap<>();
    }

    @Getter
    @AllArgsConstructor
    @ToString
    public static class CasDependency {
        private final String groupId;

        private final String artifactId;
    }
}
