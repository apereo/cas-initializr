package org.apereo.cas.initializr.web.capture;

import jakarta.servlet.http.HttpServletRequest;
import lombok.experimental.UtilityClass;

import java.net.InetAddress;
import java.util.Arrays;

@UtilityClass
public class ClientIpResolver {
    
    public static String resolve(HttpServletRequest request) {
        var xff = request.getHeader("X-Forwarded-For");

        if (xff != null && !xff.isBlank()) {
            return Arrays.stream(xff.split(","))
                    .map(String::trim)
                    .filter(ClientIpResolver::looksLikeIp)
                    .reduce((first, second) -> second) // right-most IP for Heroku
                    .orElse(request.getRemoteAddr());
        }

        return request.getRemoteAddr();
    }

    private static boolean looksLikeIp(String value) {
        try {
            return InetAddress.getByName(value) != null;
        } catch (Exception e) {
            return false;
        }
    }
}
