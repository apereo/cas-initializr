package org.apereo.cas.overlay.casserver.contrib.docker;

import org.apereo.cas.initializr.contrib.TemplatedProjectContributor;
import org.springframework.context.ApplicationContext;
import java.io.IOException;
import java.nio.file.Path;
import java.util.Map;

public class CasOverlayDockerContributor extends TemplatedProjectContributor {
    private static final String ENTRYPOINT_SCRIPT_PATH = "src/main/jib/docker/entrypoint.sh";

    public CasOverlayDockerContributor(final ApplicationContext applicationContext) {
        super(applicationContext,
            Map.of(
                "./", "classpath:overlay/docker/**",
                ENTRYPOINT_SCRIPT_PATH, "classpath:common/docker/jib/entrypoint.sh.mustache"
            )
        );
    }

    @Override
    public void contribute(final Path projectRoot) throws IOException {
        if (getOverlayProjectDescription().isDockerSupported()) {
            super.contribute(projectRoot);

            var output = projectRoot.resolve(ENTRYPOINT_SCRIPT_PATH);
            output.toFile().setExecutable(true);
        }
    }
}
