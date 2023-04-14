package org.apereo.cas.initializr.metadata;

import org.apereo.cas.initializr.config.CasInitializrProperties;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import io.spring.initializr.metadata.Dependency;
import io.spring.initializr.metadata.DependencyGroup;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.web.support.InitializrMetadataUpdateStrategy;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.RequiredArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.ObjectUtils;
import org.apache.commons.lang3.RegExUtils;
import org.apache.commons.lang3.StringUtils;

import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class CasOverlayInitializrMetadataUpdateStrategy implements InitializrMetadataUpdateStrategy {
    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final CasInitializrProperties initializrProperties;

    @Override
    public InitializrMetadata update(final InitializrMetadata current) {
        try {
            if (StringUtils.isNotBlank(initializrProperties.getMetadataUrl()) &&
                StringUtils.isNotBlank(initializrProperties.getMetadataApiKey())) {

                var findUrl = initializrProperties.getMetadataUrl().trim().concat("/action/find");
//                log.info("Fetching CAS modules from {}", findUrl.substring(0, 6));
                
                var url = new URL(findUrl);
                var uc = (HttpURLConnection) url.openConnection();
                uc.setRequestMethod("POST");
                uc.setConnectTimeout(5000);
                uc.setReadTimeout(5000);
                uc.setRequestProperty("Content-Type", "application/json");
                uc.setRequestProperty("api-key", initializrProperties.getMetadataApiKey());
                uc.setDoOutput(true);
                var coords = "{\"collection\":\"casmodules\",\"database\":\"apereocas\",\"dataSource\":\"cascluster\"}";
                var out = coords.getBytes(StandardCharsets.UTF_8);
                uc.setFixedLengthStreamingMode(out.length);
                uc.connect();
                try(var os = uc.getOutputStream()) {
                    os.write(out);
                }
                var dependencyMap = MAPPER.readValue(uc.getInputStream(), Map.class);
                var allDependencies = MAPPER.convertValue(dependencyMap.get("documents"), new TypeReference<List<CasDependency>>() {});
                allDependencies.sort(Comparator.comparing(o -> o.getDetails().getCategory()));
                allDependencies.forEach(entry -> addDependencyToMetadata(current, entry));
                current.getDependencies().validate();
            } else {
                log.warn("Initializr metadata URL or api key are undefined");
            }
        } catch (final Exception e) {
            log.error(e.getMessage(), e);
        }
        return current;
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

    @Getter
    @NoArgsConstructor
    @ToString
    @Setter
    public static class CasDependencyDetails {
        private String category;

        private String title;

        private List<String> aliases;

        private List<String> facets;

        private boolean selectable = true;
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
