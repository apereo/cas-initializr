package org.apereo.cas.initializr.web.capture;

/**
 * This is {@link RequestCaptureSerice}.
 *
 * @author Misagh Moayyed
 * @since 8.0.0
 */
@FunctionalInterface
public interface RequestCaptureSerice {
    void capture(CapturedRequest referer);
}
