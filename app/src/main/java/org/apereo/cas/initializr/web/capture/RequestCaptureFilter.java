package org.apereo.cas.initializr.web.capture;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.val;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@RequiredArgsConstructor
public class RequestCaptureFilter extends OncePerRequestFilter {

    private final RequestCaptureSerice captureSerice;

    @Override
    protected void doFilterInternal(final HttpServletRequest request, final HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {
        var clientIp = ClientIpResolver.resolve(request);
        var requestURI = request.getRequestURI();
        if (requestURI.startsWith("/starter") || requestURI.startsWith("/actuator/") || requestURI.startsWith("/ui")) {

            val parameters = new LinkedMultiValueMap<String, String>();
            request.getParameterMap().forEach((key, value) -> {
                if (value != null) {
                    parameters.put(key, List.of(value));
                }
            });
            captureSerice.capture(new CapturedRequest(
                    clientIp,
                    request.getMethod(),
                    requestURI,
                    request.getHeader("User-Agent"),
                    request.getHeader("Referer"),
                    parameters
            ));
        }
        filterChain.doFilter(request, response);
    }

}
