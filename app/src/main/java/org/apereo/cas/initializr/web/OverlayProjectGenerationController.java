package org.apereo.cas.initializr.web;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectGenerationController;
import io.spring.initializr.web.project.ProjectGenerationInvoker;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;

import java.io.IOException;
import java.util.Map;

public class OverlayProjectGenerationController extends ProjectGenerationController<OverlayProjectRequest> {


    public OverlayProjectGenerationController(
        final InitializrMetadataProvider metadataProvider,
        final ProjectGenerationInvoker<OverlayProjectRequest> projectGenerationInvoker) {
        super(metadataProvider, projectGenerationInvoker);
    }

    @Override
    public OverlayProjectRequest projectRequest(final Map<String, String> parameters) {
        var request = new OverlayProjectRequest();
        request.getParameters().putAll(parameters);
        request.initialize(getMetadata());
        request.setBootVersion(null);
        return request;
    }

    @ExceptionHandler({UnsupportedVersionException.class})
    public ResponseEntity handleUnsupportedVersion(final UnsupportedVersionException e) {
        var body = Map.of("version", e.getVersion(), "error", e.getMessage());
        return ResponseEntity
            .badRequest()
            .body(body);
    }
}
