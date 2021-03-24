package org.apereo.cas.initializr.web;

import io.spring.initializr.web.project.WebProjectRequest;
import lombok.Getter;
import lombok.Setter;

@Getter
@Setter
public class OverlayProjectRequest extends WebProjectRequest {
    private String casVersion;
}
