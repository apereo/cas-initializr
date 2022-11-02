package org.apereo.cas.initializr.web.generator;

import org.apereo.cas.initializr.web.OverlayProjectRequest;

import io.spring.initializr.generator.project.ProjectAssetGenerator;
import io.spring.initializr.generator.project.ProjectDescription;
import io.spring.initializr.web.project.ProjectGenerationInvoker;
import io.spring.initializr.web.project.ProjectRequestToDescriptionConverter;
import org.springframework.context.ApplicationContext;

import java.nio.file.Path;

/**
 * This is {@link CasInitializrProjectGenerationInvoker}.
 *
 * @author Misagh Moayyed
 */
public class CasInitializrProjectGenerationInvoker extends ProjectGenerationInvoker<OverlayProjectRequest> {

    private final ProjectAssetGenerator<Path> projectAssetGenerator;

    public CasInitializrProjectGenerationInvoker(final ApplicationContext parentApplicationContext,
                                                 final ProjectRequestToDescriptionConverter requestConverter,
                                                 final ProjectAssetGenerator<Path> projectAssetGenerator) {
        super(parentApplicationContext, requestConverter);
        this.projectAssetGenerator = projectAssetGenerator;
    }

    @Override
    protected ProjectAssetGenerator<Path> getProjectAssetGenerator(final ProjectDescription description) {
        return this.projectAssetGenerator;
    }


}
