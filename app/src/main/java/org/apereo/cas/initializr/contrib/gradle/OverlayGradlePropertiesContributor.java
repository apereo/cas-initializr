package org.apereo.cas.initializr.contrib.gradle;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

@Setter
@Getter
@Accessors(chain = true)
public class OverlayGradlePropertiesContributor extends TemplatedProjectContributor {
    public OverlayGradlePropertiesContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle.properties", "classpath:common/gradle/gradle.properties.mustache");
    }
}
