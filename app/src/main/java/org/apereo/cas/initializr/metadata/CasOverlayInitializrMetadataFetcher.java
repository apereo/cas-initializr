package org.apereo.cas.initializr.metadata;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.data.mongodb.core.MongoTemplate;
import java.util.Comparator;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class CasOverlayInitializrMetadataFetcher implements InitializrMetadataFetcher {
    private final MongoTemplate mongoTemplate;

    @Cacheable(value = "cas.modules", key = "#casVersion")
    @Override
    public List<CasDependency> fetch(final String casVersion) {
        try {
            val versionToUse = casVersion.replace("-SNAPSHOT", "")
                .replace(".", "")
                .replaceFirst("-RC\\d*", "");
            
            var collection = "casmodules" + versionToUse;
            log.info("Fetching CAS modules from collection {} for {}", collection, casVersion);
            var allDependencies = mongoTemplate.findAll(CasDependency.class, collection);
            allDependencies.sort(Comparator.comparing(o -> o.getDetails().getCategory()));
            return allDependencies;
        } catch (final Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }
}
