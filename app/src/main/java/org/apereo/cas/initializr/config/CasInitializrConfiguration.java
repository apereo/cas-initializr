package org.apereo.cas.initializr.config;

import org.apereo.cas.initializr.contrib.ApplicationYamlPropertiesContributor;
import org.apereo.cas.initializr.contrib.ChainingMultipleResourcesProjectContributor;
import org.apereo.cas.initializr.contrib.ChainingSingleResourceProjectContributor;
import org.apereo.cas.initializr.contrib.IgnoreRulesContributor;
import org.apereo.cas.initializr.contrib.OverlayLombokConfigContributor;
import org.apereo.cas.initializr.contrib.OverlayOverrideConfigurationContributor;
import org.apereo.cas.initializr.contrib.OverlaySpringFactoriesContributor;
import org.apereo.cas.initializr.contrib.OverlayWebXmlContributor;
import org.apereo.cas.initializr.contrib.ProjectLicenseContributor;
import org.apereo.cas.initializr.contrib.docker.jib.OverlayGradleJibContributor;
import org.apereo.cas.initializr.contrib.docker.jib.OverlayGradleJibEntrypointContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperConfigurationContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperExecutablesContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleSettingsContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuProcFileContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuSystemPropertiesFileContributor;
import org.apereo.cas.initializr.metadata.CasOverlayInitializrMetadataUpdateStrategy;
import org.apereo.cas.initializr.web.generator.CasInitializrProjectAssetGenerator;

import io.spring.initializr.generator.project.ProjectAssetGenerator;
import io.spring.initializr.generator.project.ProjectGenerationConfiguration;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

import java.nio.file.Path;

@ProjectGenerationConfiguration
public class CasInitializrConfiguration {
    @Autowired
    private ConfigurableApplicationContext applicationContext;

    @Bean
    public ProjectContributor projectLicenseContributor() {
        return new ProjectLicenseContributor();
    }

    @Bean
    public ProjectContributor overlayLombokConfigContributor() {
        return new OverlayLombokConfigContributor(applicationContext);
    }

    @Bean
    public ProjectContributor ignoreRulesContributor() {
        return new IgnoreRulesContributor();
    }

    @Bean
    public ProjectContributor applicationYamlPropertiesContributor() {
        return new ApplicationYamlPropertiesContributor();
    }

    @Bean
    public ChainingSingleResourceProjectContributor herokuContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new HerokuProcFileContributor(applicationContext));
        chain.addContributor(new HerokuSystemPropertiesFileContributor(applicationContext));
        return chain;
    }

    @Bean
    public ChainingMultipleResourcesProjectContributor gradleWrapperContributor() {
        var chain = new ChainingMultipleResourcesProjectContributor();
        chain.addContributor(new GradleWrapperConfigurationContributor());
        chain.addContributor(new GradleWrapperExecutablesContributor());
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayGradleBuildContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayGradleSettingsContributor(applicationContext));
        chain.addContributor(new OverlayWebXmlContributor());
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayOverrideSpringConfigContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayOverrideConfigurationContributor());
        chain.addContributor(new OverlaySpringFactoriesContributor());
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayJibConfigurationContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayGradleJibContributor());
        chain.addContributor(new OverlayGradleJibEntrypointContributor(applicationContext));
        return chain;
    }

    @Bean
    public InitializrMetadataUpdateStrategy initializrMetadataUpdateStrategy() {
        return new CasOverlayInitializrMetadataUpdateStrategy();
    }
}
