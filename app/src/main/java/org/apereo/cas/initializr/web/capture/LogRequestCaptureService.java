package org.apereo.cas.initializr.web.capture;

import lombok.extern.slf4j.Slf4j;

@Slf4j
public class LogRequestCaptureService implements RequestCaptureSerice {

    @Override
    public void capture(CapturedRequest request) {
        log.info("Request: {}", request);
    }
}
