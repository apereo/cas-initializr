package org.apereo.cas.initializr.metadata;

import org.apereo.cas.initializr.config.CasInitializrProperties;
import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.Comparator;
import java.util.List;
import java.util.Map;

@RequiredArgsConstructor
public class CasOverlayInitializrMetadataFetcher implements InitializrMetadataFetcher {
    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);
    
    private final CasInitializrProperties initializrProperties;

    @Cacheable(value = "cas.modules", key = "#casVersion")
    @Override
    public List<CasDependency> fetch(final String casVersion) {
        if (StringUtils.isNotBlank(initializrProperties.getMetadataUrl()) &&
            StringUtils.isNotBlank(initializrProperties.getMetadataApiKey())) {
            try {
                return loadAllDependencies(casVersion);
            } catch (final Exception e) {
                throw new RuntimeException(e.getMessage(), e);
            }
        }
        return List.of();
    }

    private List<CasDependency> loadAllDependencies(final String casVersion) throws Exception {
        var findUrl = initializrProperties.getMetadataUrl().trim().concat("/action/find");
        var url = new URL(findUrl);
        var uc = (HttpURLConnection) url.openConnection();
        uc.setRequestMethod("POST");
        uc.setConnectTimeout(10000);
        uc.setReadTimeout(10000);
        uc.setRequestProperty("Content-Type", "application/json");
        uc.setRequestProperty("api-key", initializrProperties.getMetadataApiKey());
        uc.setDoOutput(true);
        
        var collection = casVersion.replace("-SNAPSHOT", "").replace(".", "");
        var coords = "{\"collection\":\"casmodules%s\",\"database\":\"apereocas\",\"dataSource\":\"cascluster\"}".formatted(collection);

        var out = coords.getBytes(StandardCharsets.UTF_8);
        uc.setFixedLengthStreamingMode(out.length);
        uc.connect();
        try(var os = uc.getOutputStream()) {
            os.write(out);
        }
        var dependencyMap = MAPPER.readValue(uc.getInputStream(), Map.class);
        var allDependencies = MAPPER.convertValue(dependencyMap.get("documents"), new TypeReference<List<CasDependency>>() {});
        allDependencies.sort(Comparator.comparing(o -> o.getDetails().getCategory()));
        return allDependencies;
    }
}
