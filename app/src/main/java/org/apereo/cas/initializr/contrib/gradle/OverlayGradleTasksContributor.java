package org.apereo.cas.initializr.contrib.gradle;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.apereo.cas.initializr.web.OverlayProjectDescription;

import lombok.extern.slf4j.Slf4j;
import org.springframework.context.ApplicationContext;

import java.io.IOException;

@Slf4j
public class OverlayGradleTasksContributor extends TemplatedProjectContributor {
    public OverlayGradleTasksContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/tasks.gradle", "classpath:common/gradle/tasks.gradle.mustache");
    }

    @Override
    protected String renderTemplateFromResource(final String resourcePattern,
                                                final OverlayProjectDescription project,
                                                final Object model) throws IOException {
        var type = project.getBuildSystem().resourceDirectory();
        var branch = project.resolveBranchName();
        var projectResource = String.format("classpath:%s/gradle/%s/tasks.gradle.mustache", type, branch);
        var template = super.renderTemplateFromResource(resourcePattern, project, model);
        if (resourceExists(projectResource)) {
            var toAppend = super.renderTemplateFromResource(projectResource, project, model);
            template = super.appendResource(toAppend, template, project);
        } else {
            projectResource = String.format("classpath:%s/gradle/default/tasks.gradle.mustache", type);
            if (resourceExists(projectResource)) {
                var toAppend = super.renderTemplateFromResource(projectResource, project, model);
                template = super.appendResource(toAppend, template, project);
            }
        }
        return template;
    }
}
