package org.apereo.cas;

import org.apereo.cas.initializr.event.CasInitializrEventListener;
import org.apereo.cas.initializr.rate.RateLimitInterceptor;
import org.apereo.cas.initializr.web.OverlayProjectGenerationController;
import org.apereo.cas.initializr.web.OverlayProjectRequestToDescriptionConverter;
import org.apereo.cas.initializr.web.generator.CasInitializrProjectAssetGenerator;
import org.apereo.cas.initializr.web.generator.CasInitializrProjectGenerationInvoker;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.project.DefaultProjectRequestPlatformVersionTransformer;
import io.spring.initializr.web.project.ProjectRequestPlatformVersionTransformer;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;
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
public class CasInitializrApplication {

    public static void main(final String[] args) {
        SpringApplication.run(CasInitializrApplication.class, args);
    }

    @Bean
    public OverlayProjectGenerationController projectGenerationController(final InitializrMetadataProvider metadataProvider,
                                                                          final ApplicationContext applicationContext,
                                                                          final ObjectProvider<ProjectRequestPlatformVersionTransformer> platformVersionTransformer) {
        var transformer = platformVersionTransformer.getIfAvailable(DefaultProjectRequestPlatformVersionTransformer::new);
        var converter = new OverlayProjectRequestToDescriptionConverter(transformer);
        var invoker = new CasInitializrProjectGenerationInvoker(applicationContext, converter, new CasInitializrProjectAssetGenerator());
        return new OverlayProjectGenerationController(metadataProvider, invoker);
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
    public WebMvcConfigurer rateLimitingWebMvcConfigurer(@Qualifier("rateLimitInterceptor") final HandlerInterceptor rateLimitInterceptor) {
        return new WebMvcConfigurer() {
            @Override
            public void addInterceptors(final InterceptorRegistry registry) {
                registry.addInterceptor(rateLimitInterceptor).addPathPatterns("/**");
            }
        };
    }
}
