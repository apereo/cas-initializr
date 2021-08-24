package org.apereo.cas.overlay.bootadminserver.config;

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
import org.apereo.cas.overlay.bootadminserver.buildsystem.CasSpringBootAdminServerOverlayBuildSystem;
import org.apereo.cas.overlay.bootadminserver.buildsystem.CasSpringBootAdminServerOverlayGradleBuild;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

import java.util.stream.Collectors;

@ProjectGenerationConfiguration
@ConditionalOnBuildSystem(CasSpringBootAdminServerOverlayBuildSystem.ID)
public class CasSpringBootAdminServerOverlayProjectGenerationConfiguration {
    @Autowired
    private ConfigurableApplicationContext applicationContext;

    @Bean
    public ProjectContributor overlayGradlePropertiesContributor() {
        return new OverlayGradlePropertiesContributor(applicationContext);
    }

    @Bean
    public ProjectContributor overlayProjectReadMeContributor() {
        return new ProjectReadMeContributor(applicationContext);
    }

    @Bean
    public ChainingSingleResourceProjectContributor bootAdminOverlayGradleConfigurationContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayGradleBuildContributor(applicationContext));
        return chain;
    }

    @Bean
    public CasSpringBootAdminServerOverlayGradleBuild gradleBuild(ObjectProvider<BuildCustomizer<CasSpringBootAdminServerOverlayGradleBuild>> buildCustomizers,
                                                                  ObjectProvider<BuildItemResolver> buildItemResolver) {
        var build = new CasSpringBootAdminServerOverlayGradleBuild(buildItemResolver.getIfAvailable());
        val customizers = buildCustomizers.orderedStream().collect(Collectors.toList());
        customizers.forEach(c -> c.customize(build));
        return build;
    }
}
