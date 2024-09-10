package org.apereo.cas.initializr.metadata;

import lombok.RequiredArgsConstructor;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.mongodb.core.MongoTemplate;
import java.util.Comparator;
import java.util.List;

@RequiredArgsConstructor
public class CasOverlayInitializrMetadataFetcher implements InitializrMetadataFetcher {
    private final MongoTemplate mongoTemplate;

    @Cacheable(value = "cas.modules", key = "#casVersion")
    @Override
    public List<CasDependency> fetch(final String casVersion) {
        try {
            var collection = "casmodules" + casVersion.replace("-SNAPSHOT", "").replace(".", "");
            var allDependencies = mongoTemplate.findAll(CasDependency.class, collection);
            allDependencies.sort(Comparator.comparing(o -> o.getDetails().getCategory()));
            return allDependencies;
        } catch (final Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
