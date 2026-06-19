package org.apereo.cas.initializr.web.capture;

import org.springframework.util.MultiValueMap;

import java.time.LocalDateTime;

public record CapturedRequest(String ip,
                              String method,
                              String path,
                              String userAgent,
                              String referrer,
                              LocalDateTime expiresAt,
                              MultiValueMap<String, String> parameters) {
}
