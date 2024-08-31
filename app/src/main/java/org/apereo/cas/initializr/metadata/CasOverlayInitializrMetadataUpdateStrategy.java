package org.apereo.cas.initializr.metadata;

import io.spring.initializr.metadata.Dependency;
import io.spring.initializr.metadata.DependencyGroup;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.RegExUtils;
import org.springframework.retry.annotation.Backoff;
import org.springframework.retry.annotation.Retryable;
import java.util.ArrayList;
import java.util.List;

@Slf4j
@RequiredArgsConstructor
public class CasOverlayInitializrMetadataUpdateStrategy implements InitializrMetadataUpdateStrategy {
    private final InitializrMetadataFetcher fetcher;

    @Override
    @Retryable(maxAttempts = 5, backoff = @Backoff(delay = 1000))
    public synchronized InitializrMetadata update(final InitializrMetadata metadata) {
        try {
            var casVersion = metadata.getConfiguration().getEnv().getBoms().get("cas-bom").getVersion();
            var allDependencies = new ArrayList<>(fetcher.fetch(casVersion));
            allDependencies.forEach(entry -> addDependencyToMetadata(metadata, entry));
            if (!allDependencies.isEmpty()) {
                metadata.getDependencies().validate();
            }
            log.info("Loaded CAS modules: {}", metadata.getDependencies().getAll().size());
            return metadata;
        } catch (Exception e) {
            throw new RuntimeException(e);
        }
    }

    private static void addDependencyToMetadata(final InitializrMetadata current, final CasDependency entry) {
        var allGroups = current.getDependencies().getContent();
        if (entry.getDetails().isSelectable()) {
            var group = allGroups
                .stream()
                .filter(g -> g.getName().equals(entry.getDetails().getCategory()))
                .findFirst()
                .orElseGet(() -> {
                    var newGroup = DependencyGroup.create(entry.getDetails().getCategory());
                    newGroup.setBom("cas-bom");
                    allGroups.add(newGroup);
                    return newGroup;
                });

            if (group.getContent().stream().noneMatch(d -> d.getName().equals(entry.getDetails().getTitle()))) {
                var dependency = new Dependency();
                dependency.setBom("cas-bom");
                dependency.setDescription(entry.getDescription());
                dependency.setName(entry.getDetails().getTitle());

                var id = RegExUtils.removeAll(entry.getName(), "^cas-server-");

                dependency.setId(id);
                dependency.setFacets(ObjectUtils.defaultIfNull(entry.getDetails().getFacets(), List.of()));
                dependency.setArtifactId(entry.getName());
                dependency.setGroupId(entry.getGroup());
                dependency.setAliases(ObjectUtils.defaultIfNull(entry.getDetails().getAliases(), List.of()));
                group.getContent().add(dependency);
            }
        }
    }

}
