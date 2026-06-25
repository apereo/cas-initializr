package org.apereo.cas.initializr.web.capture;

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
    private String id;
    private String ip;
    private String method;
    private String path;
    private String userAgent;
    private String referrer;
    private LocalDateTime expiresAt;
    private MultiValueMap<String, String> parameters;
    private boolean throttled;
}
