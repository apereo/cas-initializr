package org.apereo.cas.initializr.metadata;

import org.apereo.cas.initializr.config.CasInitializrProperties;

import com.fasterxml.jackson.core.type.TypeReference;
import com.fasterxml.jackson.databind.DeserializationFeature;
import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.Data;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.apache.commons.lang3.StringUtils;
import org.springframework.cache.annotation.Cacheable;

import java.io.Serializable;
import java.net.HttpURLConnection;
import java.net.URL;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.Map;

@Slf4j
@RequiredArgsConstructor
public class OverlayConfigurationPropertiesProvider {
    private static final ObjectMapper MAPPER = new ObjectMapper()
        .configure(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES, false);

    private final CasInitializrProperties initializrProperties;

    @Cacheable(cacheNames = "cas.properties", key = "#casVersion")
    public CasConfigurationSearchResults propertiesFor(final String casVersion) {
        try {
            if (StringUtils.isNotBlank(initializrProperties.getMetadataUrl()) &&
                StringUtils.isNotBlank(initializrProperties.getMetadataApiKey())) {
                var findUrl = initializrProperties.getMetadataUrl().trim().concat("/action/findOne");
                var url = new URL(findUrl);
                var uc = (HttpURLConnection) url.openConnection();
                uc.setRequestMethod("POST");
                uc.setConnectTimeout(15000);
                uc.setReadTimeout(15000);
                uc.setRequestProperty("Content-Type", "application/json");
                uc.setRequestProperty("api-key", initializrProperties.getMetadataApiKey());
                uc.setDoOutput(true);
                log.info("Getting CAS properties for {}", casVersion);
                var coords = "{\"filter\":{\"version\":\"" + casVersion + "\"},\"collection\":\"casconfig\",\"database\":\"apereocas\",\"dataSource\":\"cascluster\"}";
                var out = coords.getBytes(StandardCharsets.UTF_8);
                uc.setFixedLengthStreamingMode(out.length);
                uc.connect();
                try (var os = uc.getOutputStream()) {
                    os.write(out);
                }
                var results = MAPPER.readValue(uc.getInputStream(), Map.class);
                if (results.containsKey("document")) {
                    var document = (Map) results.get("document");
                    if (document != null && !document.isEmpty()) {
                        var propertiesMap = (Map) (document.get("payload"));
                        var casProperties = MAPPER.convertValue(propertiesMap.get("properties"), new TypeReference<List<CasConfigurationProperty>>() {
                        });
                        var casPropertyHints = MAPPER.convertValue(propertiesMap.get("hints"), new TypeReference<List<CasConfigurationPropertyHint>>() {
                        });
                        return new CasConfigurationSearchResults(casProperties, casPropertyHints);
                    }
                }
            } else {
                log.warn("Initializr metadata URL or api key are undefined");
            }
        } catch (final Exception e) {
            log.error(e.getMessage(), e);
        }
        return CasConfigurationSearchResults.EMPTY;
    }

    @Data
    public static class CasConfigurationSearchResults implements Serializable {
        static CasConfigurationSearchResults EMPTY = new CasConfigurationSearchResults(List.of(), List.of());

        private final List<CasConfigurationProperty> casProperties;

        private final List<CasConfigurationPropertyHint> casPropertyHints;
    }

    @Data
    static class CasConfigurationProperty implements Serializable {
        private String name;

        private String type;

        private String description;

        private boolean deprecated;

        private Object defaultValue;
    }

    @Data
    static class CasConfigurationPropertyHint implements Serializable {
        private String name;

        private List<CasConfigurationPropertyHintValue> values;
    }

    @Data
    static class CasConfigurationPropertyHintValue implements Serializable {
        private String value;

        private String description;
    }
}
