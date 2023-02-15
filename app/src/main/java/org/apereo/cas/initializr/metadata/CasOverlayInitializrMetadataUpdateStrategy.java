package org.apereo.cas.initializr.metadata;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.spring.initializr.metadata.Dependency;
import io.spring.initializr.metadata.DependencyGroup;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;

import java.net.URL;
import java.util.List;
import java.util.UUID;

@Slf4j
public class CasOverlayInitializrMetadataUpdateStrategy implements InitializrMetadataUpdateStrategy {
    private static final String METADATA_URL = "https://apereocas-42e7.restdb.io/rest/casmodules";

    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    @Override
    public InitializrMetadata update(final InitializrMetadata current) {
        try {
            var url = new URL(METADATA_URL);
            var uc = url.openConnection();
            uc.setRequestProperty("x-api-key", System.getenv("RESTDB_CAS_API_KEY"));
            var dependencyMap = MAPPER.readValue(uc.getInputStream(),
                new TypeReference<List<CasDependency>>() {
                });
            dependencyMap.forEach(entry -> addDependencyToMetadata(current, entry));
            addDependencyToMetadata(current, dependencyMap.get(0));
        } catch (final Exception e) {
            log.error(e.getMessage(), e);
        }
        return current;
    }

    private static void addDependencyToMetadata(final InitializrMetadata current, final CasDependency entry) {
        var allGroups = current.getDependencies().getContent();
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

        var dependency = new Dependency();
        dependency.setBom("cas-bom");
        dependency.setDescription(entry.getDescription());
        dependency.setName(entry.getDetails().getTitle());
        dependency.setId(UUID.randomUUID().toString());
        dependency.setFacets(entry.getDetails().getFacets());
        dependency.setArtifactId(entry.getName());
        dependency.setGroupId(entry.getGroup());
        group.getContent().add(dependency);
    }

    @Getter
    @NoArgsConstructor
    @ToString
    @Setter
    public static class CasDependencyDetails {
        private String category;

        private String title;

        private List<String> aliases;

        private List<String> facets;
    }

    @Getter
    @NoArgsConstructor
    @ToString
    @Setter
    public static class CasDependency {
        private String name;

        private String version;

        private String group;

        private String description;

        private CasDependencyDetails details = new CasDependencyDetails();
    }
}
