package org.apereo.cas.overlay.casserver.config;

import io.spring.initializr.generator.buildsystem.BuildItemResolver;
import io.spring.initializr.generator.condition.ConditionalOnBuildSystem;
import io.spring.initializr.generator.project.ProjectGenerationConfiguration;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.generator.spring.build.BuildCustomizer;
import lombok.val;
import org.apereo.cas.initializr.contrib.ChainingSingleResourceProjectContributor;
import org.apereo.cas.initializr.contrib.ProjectReadMeContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleBuildContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradlePropertiesContributor;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayBuildSystem;
import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayGradleBuild;
import org.apereo.cas.overlay.casserver.contrib.CasOverlayAllReferencePropertiesContributor;
import org.apereo.cas.overlay.casserver.contrib.CasOverlayCasReferencePropertiesContributor;
import org.apereo.cas.overlay.casserver.contrib.CasOverlayConfigurationDirectoriesContributor;
import org.apereo.cas.overlay.casserver.contrib.CasOverlayConfigurationPropertiesContributor;
import org.apereo.cas.overlay.casserver.contrib.CasOverlayLoggingConfigurationContributor;
import org.apereo.cas.overlay.casserver.contrib.docker.CasOverlayDockerContributor;
import org.apereo.cas.overlay.casserver.contrib.gradle.CasOverlayGradleSpringBootContributor;
import org.apereo.cas.overlay.casserver.contrib.helm.CasOverlayHelmContributor;
import org.apereo.cas.overlay.casserver.customize.DefaultDependenciesBuildCustomizer;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.stream.Collectors;

@ProjectGenerationConfiguration
@ConditionalOnBuildSystem(CasOverlayBuildSystem.ID)
public class CasOverlayProjectGenerationConfiguration {
    @Autowired
    private ConfigurableApplicationContext applicationContext;

    @Bean
    public CasOverlayDockerContributor casOverlayDockerContributor() {
        return new CasOverlayDockerContributor();
    }

    @Bean
    public CasOverlayHelmContributor casOverlayHelmContributor() {
        return new CasOverlayHelmContributor();
    }

    @Bean
    public ChainingSingleResourceProjectContributor casOverlayGradleConfigurationContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new CasOverlayAllReferencePropertiesContributor(applicationContext));
        chain.addContributor(new CasOverlayCasReferencePropertiesContributor(applicationContext));
        chain.addContributor(new OverlayGradleBuildContributor(applicationContext));
        chain.addContributor(new CasOverlayConfigurationDirectoriesContributor());
        chain.addContributor(new CasOverlayGradleSpringBootContributor());
        chain.addContributor(new CasOverlayConfigurationPropertiesContributor(applicationContext));
        chain.addContributor(new CasOverlayLoggingConfigurationContributor());
        return chain;
    }

    @Bean
    public ProjectContributor overlayProjectReadMeContributor() {
        return new ProjectReadMeContributor(applicationContext)
                .setAppendFromResource("classpath:overlay/README.md.mustache");
    }

    @Bean
    public ProjectContributor overlayGradlePropertiesContributor() {
        return new OverlayGradlePropertiesContributor(applicationContext);
    }

    @Bean
    public CasOverlayGradleBuild gradleBuild(ObjectProvider<BuildCustomizer<CasOverlayGradleBuild>> buildCustomizers,
                                             ObjectProvider<BuildItemResolver> buildItemResolver) {
        var build = new CasOverlayGradleBuild(buildItemResolver.getIfAvailable());
        val customizers = buildCustomizers.orderedStream().collect(Collectors.toList());
        customizers.forEach(c -> c.customize(build));
        return build;
    }

    @Bean
    public BuildCustomizer<CasOverlayGradleBuild> defaultDependenciesBuildCustomizer() {
        return new DefaultDependenciesBuildCustomizer(applicationContext);
    }

}
