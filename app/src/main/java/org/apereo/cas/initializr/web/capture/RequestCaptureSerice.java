package org.apereo.cas.initializr.web.capture;

import java.net.InetAddress;
import java.net.UnknownHostException;

/**
 * This is {@link RequestCaptureSerice}.
 *
 * @author Misagh Moayyed
 * @since 8.0.0
 */
@FunctionalInterface
public interface RequestCaptureSerice {
    void capture(CapturedRequest referer);

    static boolean isLocalhost(final String value) {
        if (value == null || value.isBlank()) {
            return false;
        }
        try {
            var address = InetAddress.getByName(value.trim());
            return address.isLoopbackAddress();
        } catch (UnknownHostException e) {
            return false;
        }
    }
}
