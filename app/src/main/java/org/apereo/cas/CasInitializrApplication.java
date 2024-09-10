package org.apereo.cas;

import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.apereo.cas.initializr.event.CasInitializrEventListener;
import org.apereo.cas.initializr.info.DependencyAliasesInfoContributor;
import org.apereo.cas.initializr.metadata.CasOverlayInitializrMetadataFetcher;
import org.apereo.cas.initializr.metadata.InitializrMetadataFetcher;
import org.apereo.cas.initializr.rate.RateLimitInterceptor;
import org.apereo.cas.initializr.web.OverlayProjectGenerationController;
import org.apereo.cas.initializr.web.OverlayProjectMetadataController;
import org.apereo.cas.initializr.web.OverlayProjectRequestToDescriptionConverter;
import org.apereo.cas.initializr.web.SupportedVersionsEndpoint;
import org.apereo.cas.initializr.web.generator.CasInitializrProjectAssetGenerator;
import org.apereo.cas.initializr.web.generator.CasInitializrProjectGenerationInvoker;

import io.spring.initializr.metadata.DependencyMetadataProvider;
import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectMetadataController;
import io.spring.initializr.web.project.DefaultProjectRequestPlatformVersionTransformer;
import io.spring.initializr.web.project.ProjectRequestPlatformVersionTransformer;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.cache.annotation.EnableCaching;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.context.annotation.Bean;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.retry.annotation.EnableRetry;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.web.servlet.HandlerInterceptor;
import org.springframework.web.servlet.config.annotation.InterceptorRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

/**
 * {@code @ProjectGenerationConfiguration}-annotated types should not be
 * processed by the main ApplicationContext so make sure regular
 * classpath scanning is not enabled for packages
 * where such configuration classes reside.
 */
@SpringBootApplication(scanBasePackages = "org.apereo.cas.initializr")
@EnableConfigurationProperties(CasInitializrProperties.class)
@EnableCaching
@EnableRetry
public class CasInitializrApplication {

    public static void main(final String[] args) {
        SpringApplication.run(CasInitializrApplication.class, args);
    }

    @Bean
    public OverlayProjectGenerationController projectGenerationController(
        final CasInitializrProperties properties,
        final InitializrMetadataProvider metadataProvider,
        final ApplicationContext applicationContext,
        final ObjectProvider<ProjectRequestPlatformVersionTransformer> platformVersionTransformer) {
        var transformer = platformVersionTransformer.getIfAvailable(DefaultProjectRequestPlatformVersionTransformer::new);
        var converter = new OverlayProjectRequestToDescriptionConverter(transformer, properties);
        var invoker = new CasInitializrProjectGenerationInvoker(applicationContext, converter, new CasInitializrProjectAssetGenerator());
        return new OverlayProjectGenerationController(metadataProvider, invoker);
    }
    
    @Bean
    public ProjectMetadataController projectMetadataController(final InitializrMetadataProvider metadataProvider,
                                                               final DependencyMetadataProvider dependencyMetadataProvider,
                                                               final ConfigurableApplicationContext applicationContext) {
        return new OverlayProjectMetadataController(metadataProvider, dependencyMetadataProvider, applicationContext);
    }

    @Bean
    public CasInitializrEventListener casInitializrEventListener() {
        return new CasInitializrEventListener();
    }

    @Bean
    public HandlerInterceptor rateLimitInterceptor() {
        return new RateLimitInterceptor();
    }

    @Bean
    @Autowired
    public WebMvcConfigurer rateLimitingWebMvcConfigurer(
        @Qualifier("rateLimitInterceptor") final HandlerInterceptor rateLimitInterceptor) {
        return new WebMvcConfigurer() {
            @Override
            public void addInterceptors(final InterceptorRegistry registry) {
                registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/**");
            }
        };
    }

    @Bean
    public SupportedVersionsEndpoint supportedVersionsEndpoint(final CasInitializrProperties props) {
        return new SupportedVersionsEndpoint(props.getSupportedVersions());
    }

    @Bean
    public InitializrMetadataFetcher casOverlayInitializrMetadataFetcher(final MongoTemplate mongoTemplate) {
        return new CasOverlayInitializrMetadataFetcher(mongoTemplate);
    }
    
    @Bean
    public InfoContributor dependencyAliasesInfoContributor(final InitializrMetadataProvider provider,
                                                            @Qualifier("jCacheCacheManager")
                                                            final javax.cache.CacheManager jCacheCacheManager,
                                                            final ConfigurableApplicationContext applicationContext) {
        return new DependencyAliasesInfoContributor(provider, applicationContext, jCacheCacheManager);
    }

    @Bean
    public SecurityFilterChain filterChain(final HttpSecurity http) throws Exception {
        http.requiresChannel(c -> c.requestMatchers(r -> r.getHeader("X-Forwarded-Proto") != null).requiresSecure());
        http.csrf(AbstractHttpConfigurer::disable);
        http.headers(c -> {
            c.frameOptions(HeadersConfigurer.FrameOptionsConfig::sameOrigin);
            c.contentSecurityPolicy(s -> s.policyDirectives("frame-src https://apereo.github.io/cas"));
        });
        return http.build();
    }
    
}
