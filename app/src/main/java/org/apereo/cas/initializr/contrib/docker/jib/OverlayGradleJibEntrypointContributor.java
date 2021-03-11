package org.apereo.cas.initializr.contrib.docker.jib;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;

import java.io.IOException;
import java.nio.file.Path;

public class OverlayGradleJibEntrypointContributor extends TemplatedProjectContributor {
    public static final String ENTRYPOINT_SCRIPT_PATH = "src/main/jib/docker/entrypoint.sh";

    public OverlayGradleJibEntrypointContributor(final ApplicationContext applicationContext) {
        super(applicationContext, ENTRYPOINT_SCRIPT_PATH, "classpath:common/jib/entrypoint.sh");
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        super.contribute(projectRoot);
        var output = projectRoot.resolve(ENTRYPOINT_SCRIPT_PATH);
        output.toFile().setExecutable(true);
    }

}
