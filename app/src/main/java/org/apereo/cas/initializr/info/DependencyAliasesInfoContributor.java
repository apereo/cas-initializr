package org.apereo.cas.initializr.info;

import org.apereo.cas.initializr.config.CasInitializrProperties;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.LinkedHashMap;

@RequiredArgsConstructor
public class DependencyAliasesInfoContributor implements InfoContributor {
    private final InitializrMetadataProvider metadataProvider;

    private final ConfigurableApplicationContext applicationContext;

    @Override
    public void contribute(final Info.Builder builder) {
        var properties = applicationContext.getBean(CasInitializrProperties.class);

        var details = new LinkedHashMap<>();
        metadataProvider.get().getDependencies().getAll()
            .stream()
            .filter(dependency -> !dependency.getAliases().isEmpty())
            .forEach(dependency -> details.put(dependency.getId(), dependency));
        if (!details.isEmpty()) {
            builder.withDetail("dependency-aliases", details);
        }
        builder.withDetail("supported-versions", properties.getSupportedVersions());
    }
}
