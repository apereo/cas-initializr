package org.apereo.cas.initializr.web.capture;

import org.springframework.util.MultiValueMap;

public record CapturedRequest(String ip,
                              String method,
                              String path,
                              String userAgent,
                              String referrer,
                              MultiValueMap<String, String> parameters) {
}
