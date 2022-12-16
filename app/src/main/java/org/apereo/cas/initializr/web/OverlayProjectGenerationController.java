package org.apereo.cas.initializr.web;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectGenerationController;
import io.spring.initializr.web.project.ProjectGenerationInvoker;
import lombok.val;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.Optional;

public class OverlayProjectGenerationController extends ProjectGenerationController<OverlayProjectRequest> {


    public OverlayProjectGenerationController(
        final InitializrMetadataProvider metadataProvider,
        final ProjectGenerationInvoker<OverlayProjectRequest> projectGenerationInvoker) {
        super(metadataProvider, projectGenerationInvoker);
    }

    @Override
    public OverlayProjectRequest projectRequest(final Map<String, String> headers) {
        val requestAttributes = (ServletRequestAttributes) RequestContextHolder.getRequestAttributes();
        val httpRequest = Optional.ofNullable(requestAttributes).map(ServletRequestAttributes::getRequest).orElse(null);

        var request = new OverlayProjectRequest();
        request.getParameters().putAll(headers);
        request.getParameters().putAll(httpRequest.getParameterMap());
        
        request.initialize(getMetadata());
        request.setBootVersion(null);
        return request;
    }

    @ExceptionHandler({UnsupportedVersionException.class})
    public ResponseEntity handleUnsupportedVersion(final UnsupportedVersionException e) {
        var body = Map.of("version", e.getVersion(), "error", e.getMessage());
        return ResponseEntity.badRequest().body(body);
    }
}
