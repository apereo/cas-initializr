package org.apereo.cas.initializr.contrib;

import org.apereo.cas.initializr.web.OverlayProjectDescription;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.io.StringWriter;

/**
 * This is {@link ProjectReadMeContributor}.
 *
 * @author Misagh Moayyed
 */
@Setter
@Getter
@Accessors(chain = true)
public class ProjectReadMeContributor extends TemplatedProjectContributor {
    private String appendFromResource;

    public ProjectReadMeContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./README.md", "classpath:common/README.md.mustache");
    }

    @Override
    protected String postProcessRenderedTemplate(final String template,
                                                 final OverlayProjectDescription project,
                                                 final Object model) throws IOException {
        if (appendFromResource == null) {
            return template;
        }
        try (var writer = new StringWriter()) {
            writer.write(template);
            var appendTemplate = renderTemplateFromResource(appendFromResource, project, model);
            writer.write(appendTemplate);
            return writer.toString();
        }
    }
}

