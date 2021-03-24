package org.apereo.cas.initializr.web;

import io.spring.initializr.generator.project.MutableProjectDescription;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.metadata.InitializrMetadata;
import io.spring.initializr.web.project.ProjectRequest;
import io.spring.initializr.web.project.ProjectRequestToDescriptionConverter;
import lombok.RequiredArgsConstructor;

@RequiredArgsConstructor
public class OverlayProjectRequestToDescriptionConverter implements ProjectRequestToDescriptionConverter<OverlayProjectRequest> {
    private final ProjectRequestToDescriptionConverter<ProjectRequest> defaultConverter;

    @Override
    public ProjectDescription convert(final OverlayProjectRequest request, final InitializrMetadata metadata) {
        var description = (MutableProjectDescription) defaultConverter.convert(request, metadata);
        var overlayDescription = new OverlayProjectDescription(description);
        overlayDescription.setCasVersion(request.getCasVersion());
        return overlayDescription;
    }
}
