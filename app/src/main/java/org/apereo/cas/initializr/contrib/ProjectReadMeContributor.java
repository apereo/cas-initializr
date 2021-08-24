package org.apereo.cas.initializr.contrib;

import lombok.Getter;
import lombok.Setter;
import lombok.SneakyThrows;
import lombok.experimental.Accessors;
import lombok.val;
import org.springframework.context.ApplicationContext;

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

    @SneakyThrows
    @Override
    protected String postProcessRenderedTemplate(final String template) {
        if (appendFromResource == null) {
            return template;
        }
        try (val writer = new StringWriter()) {
            writer.write(template);
            val appendTemplate = renderTemplateFromResource(this.appendFromResource);
            writer.write(appendTemplate);
            return writer.toString();
        }
    }
}

