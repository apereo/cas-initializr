package org.apereo.cas.initializr.metadata;

import org.apereo.cas.initializr.web.VersionUtils;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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
            var parsedVersion = VersionUtils.parse(casVersion);
            var versionToUse = determineVersionToUse(casVersion);
            var allDependencies = getFetchDependencies(versionToUse);
            var count = 0;
            while (count < 2 && allDependencies.isEmpty()) {
                log.warn("No CAS modules found for {}", casVersion);
                count++;
                versionToUse = parsedVersion.getMajor() + "" + parsedVersion.getMinor() + "" + (parsedVersion.getPatch() - count);
                allDependencies = getFetchDependencies(versionToUse);
            }
            allDependencies.sort(Comparator.comparing(o -> o.getDetails().getCategory()));
            return allDependencies;
        } catch (final Exception e) {
            throw new RuntimeException(e.getMessage(), e);
        }
    }

    private List<CasDependency> getFetchDependencies(final String versionToUse) {
        var collection = "casmodules" + versionToUse;
        log.info("Fetching CAS modules from collection {} for {}", collection, versionToUse);
        return mongoTemplate.findAll(CasDependency.class, collection);
    }

    private String determineVersionToUse(final String casVersion) {
        return casVersion.replace("-SNAPSHOT", "")
            .replace(".", "")
            .replaceFirst("-RC\\d*", "")
            .replaceFirst("-M\\d*", "");
    }
}
