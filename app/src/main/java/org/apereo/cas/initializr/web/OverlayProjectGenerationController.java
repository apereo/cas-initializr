package org.apereo.cas.initializr.web;

import io.spring.initializr.metadata.InitializrMetadataProvider;
import io.spring.initializr.web.controller.ProjectGenerationController;
import io.spring.initializr.web.project.InvalidProjectRequestException;
import io.spring.initializr.web.project.ProjectGenerationInvoker;
import jakarta.servlet.http.HttpServletRequest;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apereo.cas.initializr.web.capture.ClientIpResolver;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.context.request.RequestContextHolder;
import org.springframework.web.context.request.ServletRequestAttributes;

import java.util.Map;
import java.util.Optional;

@Slf4j
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
    public ResponseEntity handleUnsupportedVersion(final HttpServletRequest request, final UnsupportedVersionException e) {
        var body = Map.of("ip", ClientIpResolver.resolve(request), "version", e.getVersion(), "error", e.getMessage());
        log.warn("Bad request: {}", body);
        return ResponseEntity.badRequest().body(body);
    }
}
