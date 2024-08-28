package org.apereo.cas.initializr.info;

import org.apereo.cas.initializr.config.CasInitializrProperties;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.boot.actuate.info.Info;
import org.springframework.boot.actuate.info.InfoContributor;
import org.springframework.context.ConfigurableApplicationContext;

import java.util.LinkedHashMap;

@RequiredArgsConstructor
@Slf4j
public class DependencyAliasesInfoContributor implements InfoContributor {
    private final InitializrMetadataProvider metadataProvider;
    private final ConfigurableApplicationContext applicationContext;

    private final javax.cache.CacheManager jCacheCacheManager;

    @Override
    public void contribute(final Info.Builder builder) {
        var properties = applicationContext.getBean(CasInitializrProperties.class);

        val initializrMetadata = metadataProvider.get();
        var dependencies = initializrMetadata.getDependencies().getAll();
        if (dependencies.isEmpty()) {
            jCacheCacheManager.getCache("initializr.metadata").clear();
            dependencies = initializrMetadata.getDependencies().getAll();
        }

        var details = new LinkedHashMap<>();
        dependencies
            .stream()
            .filter(dependency -> !dependency.getAliases().isEmpty())
            .forEach(dependency -> details.put(dependency.getId(), dependency));
        if (!details.isEmpty()) {
            builder.withDetail("dependency-aliases", details);
        }
        builder.withDetail("supported-versions", properties.getSupportedVersions());
    }

}
