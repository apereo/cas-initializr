package org.apereo.cas.initializr.contrib.gradle;

import lombok.Getter;
import lombok.Setter;
import lombok.experimental.Accessors;
import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

@Setter
@Getter
@Accessors(chain = true)
public class OverlayGradleGetJavaClassContributor extends TemplatedProjectContributor {
    public OverlayGradleGetJavaClassContributor(final ApplicationContext applicationContext) {
        super(applicationContext, "./gradle/getjavaclass.gradle", "classpath:common/gradle/getjavaclass.gradle.mustache");
    }
}
