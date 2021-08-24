package org.apereo.cas.initializr.contrib.gradle;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import lombok.extern.slf4j.Slf4j;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

@Slf4j
@Setter
@Getter
@Accessors(chain = true)
public class OverlayGradlePropertiesContributor extends TemplatedProjectContributor {
    public OverlayGradlePropertiesContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle.properties", "classpath:common/gradle/gradle.properties.mustache");
    }
}
