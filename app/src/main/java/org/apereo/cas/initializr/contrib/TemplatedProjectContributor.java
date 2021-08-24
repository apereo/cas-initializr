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

import org.apereo.cas.initializr.web.OverlayProjectDescription;
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

    private static void handleApplicationServerType(final ProjectDescription project, final Map<String, Object> defaults) {
        var dependencies = project.getRequestedDependencies();
        var appServer = "-tomcat";
        if (dependencies.containsKey("webapp-jetty")) {
            appServer = "-jetty";
        } else if (dependencies.containsKey("webapp-undertow")) {
            appServer = "-undertow";
        }
        defaults.put("appServer", appServer);
    }

    protected static void createTemplateFile(final Path output, final String template) throws IOException {
        FileCopyUtils.copy(new BufferedInputStream(new ByteArrayInputStream(template.getBytes(StandardCharsets.UTF_8))),
                Files.newOutputStream(output, StandardOpenOption.APPEND));
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        var output = projectRoot.resolve(relativePath);
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
        var resource = resolver.getResource(resourcePattern);
        var mf = new DefaultMustacheFactory();
        var mustache = mf.compile(new InputStreamReader(resource.getInputStream()), resource.getFilename());
        try (var writer = new StringWriter()) {
            var project = applicationContext.getBean(OverlayProjectDescription.class);
            var templateVariables = prepareProjectTemplateVariables(project);
            var model = contributeInternal(project);
            if (model instanceof Map) {
                ((Map<String, Object>) model).putAll(templateVariables);
            }
            mustache.execute(writer, model).flush();
            return writer.toString();
        }
    }

    protected Map<String, Object> prepareProjectTemplateVariables(final OverlayProjectDescription project) {
        var provider = applicationContext.getBean(InitializrMetadataProvider.class);

        var templateVariables = new HashMap<>(provider.get().defaults());
        var configuration = provider.get().getConfiguration();
        var boms = configuration.getEnv().getBoms();

        templateVariables.put("casMgmtVersion", boms.get("cas-mgmt-bom").getVersion());
        
        templateVariables.put("casVersion", project.resolveCasVersion(boms.get("cas-bom")));
        templateVariables.put("springBootVersion", project.getPlatformVersion().toString());

        var type = project.getBuildSystem().id();
        templateVariables.put("buildSystemId", type);
        templateVariables.put("containerImageName", StringUtils.remove(type, "-overlay"));

        templateVariables.put("initializrUrl", generateAppUrl());
        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID) || type.equalsIgnoreCase(CasManagementOverlayBuildSystem.ID)) {
            handleApplicationServerType(project, templateVariables);
            templateVariables.put("hasDockerFile", Boolean.TRUE);
        }
        if (type.equalsIgnoreCase(CasManagementOverlayBuildSystem.ID)) {
            templateVariables.put("managementServer", Boolean.TRUE);
            templateVariables.put("appName", "cas-management");
        }
        if (type.equalsIgnoreCase(CasOverlayBuildSystem.ID)) {
            templateVariables.put("casServer", Boolean.TRUE);
            templateVariables.put("appName", "cas");
        }
        if (type.equalsIgnoreCase(CasSpringBootAdminServerOverlayBuildSystem.ID)) {
            templateVariables.put("springBootAdminServer", Boolean.TRUE);
            templateVariables.put("appName", "casbootadminserver");
        }
        if (type.equalsIgnoreCase(CasConfigServerOverlayBuildSystem.ID)) {
            templateVariables.put("configServer", Boolean.TRUE);
            templateVariables.put("appName", "casconfigserver");
        }
        if (type.equalsIgnoreCase(CasDiscoveryServerOverlayBuildSystem.ID)) {
            templateVariables.put("discoveryServer", Boolean.TRUE);
            templateVariables.put("appName", "casdiscoveryserver");
        }

        templateVariables.putAll(getVariables());
        templateVariables.put("dependencies", handleProjectRequestedDependencies(project));
        return templateVariables;
    }

    public TemplatedProjectContributor putVariable(final String key, final Object value) {
        variables.put(key, value);
        return this;
    }

    protected static List<CasDependency> handleProjectRequestedDependencies(final ProjectDescription project) {
        var dependencies = project.getRequestedDependencies()
                .values()
                .stream()
                .filter(dep -> !CasOverlayGradleBuild.WEBAPP_ARTIFACTS.contains(dep.getArtifactId()))
                .map(dep -> new CasDependency(dep.getGroupId(), dep.getArtifactId()))
                .collect(Collectors.toList());
        log.debug("Requested overlay dependencies: {}", dependencies);
        return dependencies;
    }

    protected Object contributeInternal(final ProjectDescription project) {
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
