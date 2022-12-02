package org.apereo.cas.initializr.config;

import org.apereo.cas.initializr.contrib.project.ApplicationYamlPropertiesContributor;
import org.apereo.cas.initializr.contrib.ChainingMultipleResourcesProjectContributor;
import org.apereo.cas.initializr.contrib.ChainingSingleResourceProjectContributor;
import org.apereo.cas.initializr.contrib.project.IgnoreRulesContributor;
import org.apereo.cas.initializr.contrib.project.JenvJavaVersionContributor;
import org.apereo.cas.initializr.contrib.project.LocalEtcCasDirectoryContributor;
import org.apereo.cas.initializr.contrib.project.OverlayLombokConfigContributor;
import org.apereo.cas.initializr.contrib.project.OverlayOverrideConfigurationContributor;
import org.apereo.cas.initializr.contrib.project.OverlaySpringFactoriesContributor;
import org.apereo.cas.initializr.contrib.project.OverlayWebXmlContributor;
import org.apereo.cas.initializr.contrib.project.ProjectLicenseContributor;
import org.apereo.cas.initializr.contrib.docker.jib.OverlayGradleJibContributor;
import org.apereo.cas.initializr.contrib.docker.jib.OverlayGradleJibEntrypointContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperConfigurationContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperExecutablesContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleSettingsContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleSpringBootContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleTasksContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuProcFileContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuSystemPropertiesFileContributor;
import org.apereo.cas.initializr.metadata.CasOverlayInitializrMetadataUpdateStrategy;
import org.apereo.cas.initializr.web.ui.InitializrHomeController;

import io.spring.initializr.generator.project.ProjectGenerationConfiguration;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;

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
    public ProjectContributor jenvJavaVersionContributor() {
        return new JenvJavaVersionContributor(applicationContext);
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
        chain.addContributor(new OverlayGradleTasksContributor(applicationContext));
        chain.addContributor(new OverlayWebXmlContributor());
        chain.addContributor(new OverlayGradleSpringBootContributor(applicationContext));
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
        chain.addContributor(new LocalEtcCasDirectoryContributor());
        return chain;
    }

    @Bean
    public InitializrHomeController initializrHomeController() {
        return new InitializrHomeController();
    }

    @Bean
    public InitializrMetadataUpdateStrategy initializrMetadataUpdateStrategy() {
        return new CasOverlayInitializrMetadataUpdateStrategy();
    }
}
