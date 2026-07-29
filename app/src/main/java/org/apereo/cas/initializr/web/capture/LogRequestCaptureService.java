package org.apereo.cas.initializr.web.capture;

import lombok.extern.slf4j.Slf4j;
import tools.jackson.databind.ObjectMapper;
import tools.jackson.databind.json.JsonMapper;

@Slf4j
public class LogRequestCaptureService implements RequestCaptureSerice {
    private static final ObjectMapper MAPPER = new JsonMapper();

    @Override
    public void capture(CapturedRequest request) {
        log.info("Request from {}:\n{}\n", request.getIp(),
                MAPPER.writerWithDefaultPrettyPrinter().writeValueAsString(request));
    }
}
