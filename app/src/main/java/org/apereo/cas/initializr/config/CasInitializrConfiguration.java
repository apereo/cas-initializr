package org.apereo.cas.initializr.config;

import org.apereo.cas.initializr.contrib.ChainingMultipleResourcesProjectContributor;
import org.apereo.cas.initializr.contrib.ChainingSingleResourceProjectContributor;
import org.apereo.cas.initializr.contrib.github.GithubResourcesContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperConfigurationContributor;
import org.apereo.cas.initializr.contrib.gradle.GradleWrapperExecutablesContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleSettingsContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleSpringBootContributor;
import org.apereo.cas.initializr.contrib.gradle.OverlayGradleTasksContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuProcFileContributor;
import org.apereo.cas.initializr.contrib.heroku.HerokuSystemPropertiesFileContributor;
import org.apereo.cas.initializr.contrib.nativex.GraalVMNativeImageContributor;
import org.apereo.cas.initializr.contrib.openrewrite.OpenRewriteContributor;
import org.apereo.cas.initializr.contrib.project.ApplicationYamlPropertiesContributor;
import org.apereo.cas.initializr.contrib.project.IgnoreRulesContributor;
import org.apereo.cas.initializr.contrib.project.JenvJavaVersionContributor;
import org.apereo.cas.initializr.contrib.project.LocalEtcCasDirectoryContributor;
import org.apereo.cas.initializr.contrib.project.OverlayLombokConfigContributor;
import org.apereo.cas.initializr.contrib.project.OverlayOverrideConfigurationContributor;
import org.apereo.cas.initializr.contrib.project.OverlayWebXmlContributor;
import org.apereo.cas.initializr.contrib.project.ProjectLicenseContributor;
import org.apereo.cas.initializr.contrib.project.SdkmanJavaVersionContributor;
import org.apereo.cas.initializr.metadata.CasOverlayInitializrMetadataUpdateStrategy;
import org.apereo.cas.initializr.metadata.InitializrMetadataFetcher;
import org.apereo.cas.initializr.web.ui.InitializrHomeController;
import org.apereo.cas.overlay.casserver.contrib.docker.CasOverlayDockerContributor;
import io.spring.initializr.generator.project.ProjectGenerationConfiguration;
import io.spring.initializr.generator.project.contributor.ProjectContributor;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.autoconfigure.cache.JCacheManagerCustomizer;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.core.Ordered;
import org.springframework.core.annotation.Order;
import javax.cache.configuration.MutableConfiguration;
import javax.cache.expiry.CreatedExpiryPolicy;
import javax.cache.expiry.Duration;
import java.util.concurrent.TimeUnit;

@ProjectGenerationConfiguration
@Slf4j
public class CasInitializrConfiguration {

    @Bean
    public ChainingSingleResourceProjectContributor openRewriteContributor(
        final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OpenRewriteContributor(applicationContext));
        return chain;
    }
    
    @Bean
    public ProjectContributor projectLicenseContributor() {
        return new ProjectLicenseContributor();
    }

    @Bean
    public ProjectContributor overlayLombokConfigContributor(final ConfigurableApplicationContext applicationContext) {
        return new OverlayLombokConfigContributor(applicationContext);
    }

    @Bean
    public ProjectContributor ignoreRulesContributor() {
        return new IgnoreRulesContributor();
    }
    
    @Bean
    public ProjectContributor jenvJavaVersionContributor(final ConfigurableApplicationContext applicationContext) {
        return new JenvJavaVersionContributor(applicationContext);
    }

    @Bean
    public ProjectContributor sdkmanJavaVersionContributor(final ConfigurableApplicationContext applicationContext) {
        return new SdkmanJavaVersionContributor(applicationContext);
    }

    @Bean
    public ProjectContributor applicationYamlPropertiesContributor() {
        return new ApplicationYamlPropertiesContributor();
    }

    @Bean
    public ChainingSingleResourceProjectContributor herokuContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new HerokuProcFileContributor(applicationContext));
        chain.addContributor(new HerokuSystemPropertiesFileContributor(applicationContext));
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor nativeImageContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new GraalVMNativeImageContributor(applicationContext));
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor githubContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new GithubResourcesContributor(applicationContext));
        return chain;
    }
    
    @Bean
    public ChainingMultipleResourcesProjectContributor gradleWrapperContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingMultipleResourcesProjectContributor();
        chain.addContributor(new GradleWrapperConfigurationContributor(applicationContext));
        chain.addContributor(new GradleWrapperExecutablesContributor());
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayGradleBuildContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayGradleSettingsContributor(applicationContext));
        chain.addContributor(new OverlayGradleTasksContributor(applicationContext));
        chain.addContributor(new OverlayWebXmlContributor(applicationContext));
        chain.addContributor(new OverlayGradleSpringBootContributor(applicationContext));
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayOverrideSpringConfigContributor(final ConfigurableApplicationContext applicationContext) {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new OverlayOverrideConfigurationContributor(applicationContext));
        return chain;
    }

    @Bean
    public ChainingSingleResourceProjectContributor overlayConfigurationContributor() {
        var chain = new ChainingSingleResourceProjectContributor();
        chain.addContributor(new LocalEtcCasDirectoryContributor());
        return chain;
    }

    @Bean
    public InitializrHomeController initializrHomeController() {
        return new InitializrHomeController();
    }
    
    @Bean
    public InitializrMetadataUpdateStrategy initializrMetadataUpdateStrategy(
        final InitializrMetadataFetcher fetcher) {
        return new CasOverlayInitializrMetadataUpdateStrategy(fetcher);
    }

    @Bean
    public CasOverlayDockerContributor casOverlayDockerContributor(final ConfigurableApplicationContext applicationContext) {
        return new CasOverlayDockerContributor(applicationContext);
    }

    @Bean
    @Order(Ordered.HIGHEST_PRECEDENCE)
    public JCacheManagerCustomizer initializrMetadataCacheManagerCustomizer(final CasInitializrProperties properties) {
        return cacheManager -> {
            var cacheDuration = new Duration(TimeUnit.MINUTES,
                properties.getMetadataCacheDuration().toMinutes());
            
            var config = new MutableConfiguration<>()
                .setStoreByValue(false)
                .setManagementEnabled(true)
                .setStatisticsEnabled(true)
                .setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(cacheDuration));
            log.info("Initialize metadata is cached for {}", cacheDuration);
            cacheManager.createCache("initializr.metadata", config);

            var propertiesConfig = new MutableConfiguration<>()
                .setStoreByValue(false)
                .setManagementEnabled(true)
                .setStatisticsEnabled(true)
                .setExpiryPolicyFactory(CreatedExpiryPolicy.factoryOf(cacheDuration));
            log.info("CAS modules metadata is cached for {}", cacheDuration);
            cacheManager.createCache("cas.modules", propertiesConfig);
        };
    }
}
