package org.apereo.cas.overlay.casserver.customize;

import org.apereo.cas.overlay.casserver.buildsystem.CasOverlayGradleBuild;
import io.spring.initializr.generator.spring.build.BuildCustomizer;
import lombok.RequiredArgsConstructor;
import org.springframework.context.ConfigurableApplicationContext;
import org.springframework.core.Ordered;

@RequiredArgsConstructor
public class DefaultDependenciesBuildCustomizer implements BuildCustomizer<CasOverlayGradleBuild> {
    protected final ConfigurableApplicationContext applicationContext;

    @Override
    public void customize(final CasOverlayGradleBuild build) {
    }

    @Override
    public int getOrder() {
        return Ordered.HIGHEST_PRECEDENCE;
    }
}
