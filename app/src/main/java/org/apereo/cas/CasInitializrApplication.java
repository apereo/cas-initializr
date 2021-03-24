package org.apereo.cas;

import org.apereo.cas.initializr.web.OverlayProjectGenerationController;
import org.apereo.cas.initializr.web.OverlayProjectRequestToDescriptionConverter;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.project.DefaultProjectRequestPlatformVersionTransformer;
import io.spring.initializr.web.project.DefaultProjectRequestToDescriptionConverter;
import io.spring.initializr.web.project.ProjectGenerationInvoker;
import io.spring.initializr.web.project.ProjectRequestPlatformVersionTransformer;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;
import org.springframework.context.annotation.Bean;

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
    public OverlayProjectGenerationController projectGenerationController(InitializrMetadataProvider metadataProvider,
                                                                          ApplicationContext applicationContext,
                                                                          ObjectProvider<ProjectRequestPlatformVersionTransformer> platformVersionTransformer) {
        var defaultConverter = new DefaultProjectRequestToDescriptionConverter(platformVersionTransformer
            .getIfAvailable(DefaultProjectRequestPlatformVersionTransformer::new));
        var converter = new OverlayProjectRequestToDescriptionConverter(defaultConverter);
        var projectGenerationInvoker = new ProjectGenerationInvoker<>(applicationContext, converter);
        return new OverlayProjectGenerationController(metadataProvider, projectGenerationInvoker);
    }
}
