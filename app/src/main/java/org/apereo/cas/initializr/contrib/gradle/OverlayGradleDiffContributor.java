package org.apereo.cas.initializr.contrib.gradle;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

@Setter
@Getter
@Accessors(chain = true)
public class OverlayGradleDiffContributor extends TemplatedProjectContributor {
    public OverlayGradleDiffContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/diff.gradle", "classpath:common/gradle/diff.gradle.mustache");
    }
}
