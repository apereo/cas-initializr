package org.apereo.cas.initializr.web.capture;

import com.fasterxml.jackson.annotation.JsonInclude;
import lombok.AllArgsConstructor;
import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import lombok.With;
import lombok.experimental.SuperBuilder;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;

@Document
@Getter
@NoArgsConstructor
@ToString
@Setter
@SuperBuilder
@With
@AllArgsConstructor
public class CapturedRequest {
    @Id
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String id;
    private String ip;
    private String method;
    private String path;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String securityFetchSite;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String language;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String origin;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String userAgent;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private String referrer;
    @JsonInclude(JsonInclude.Include.NON_EMPTY)
    private LocalDateTime expiresAt;
    private MultiValueMap<String, String> parameters;
    private boolean throttled;
    private boolean preview;
}
