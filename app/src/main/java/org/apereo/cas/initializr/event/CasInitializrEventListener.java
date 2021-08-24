package org.apereo.cas.initializr.event;

import org.apereo.cas.initializr.web.OverlayProjectRequest;

import io.spring.initializr.web.project.ProjectFailedEvent;
import lombok.extern.slf4j.Slf4j;
import org.springframework.context.event.EventListener;

/**
 * This is {@link CasInitializrEventListener}.
 *
 * @author Misagh Moayyed
 */
@Slf4j
public class CasInitializrEventListener {
    @EventListener
    public void handleProjectFailedEvent(ProjectFailedEvent cse) {
        if (cse.getProjectRequest() != null) {
            var request = (OverlayProjectRequest) cse.getProjectRequest();
            log.error(request.toString());
        }
        log.error("Failed to generate project", cse.getCause());
    }
}
