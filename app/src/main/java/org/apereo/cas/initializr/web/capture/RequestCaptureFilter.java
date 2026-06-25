package org.apereo.cas.initializr.web.capture;

import com.github.benmanes.caffeine.cache.Cache;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import lombok.val;
import org.apereo.cas.initializr.config.CasInitializrProperties;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.time.Duration;
import java.time.LocalDateTime;
import java.util.List;

@RequiredArgsConstructor
@Slf4j
public class RequestCaptureFilter extends OncePerRequestFilter {

    private final MongoTemplate mongoTemplate;
    private final RequestCaptureSerice captureSerice;
    private final Cache<String, CapturedRequest> requestCaptureCache;
    private final CasInitializrProperties properties;

    @Override
    protected void doFilterInternal(final HttpServletRequest request, final HttpServletResponse response,
                                    final FilterChain filterChain) throws ServletException, IOException {

        var clientIp = ClientIpResolver.resolve(request);
        var requestURI = request.getRequestURI();
        if (requestURI.startsWith("/starter")) {
            val parameters = new LinkedMultiValueMap<String, String>();
            request.getParameterMap().forEach((key, value) -> {
                if (value != null) {
                    parameters.put(key, List.of(value));
                }
            });
            val expiresAt = LocalDateTime.now().plus(properties.getRequestCacheDuration());
            val capturedRequest = CapturedRequest
                    .builder()
                    .ip(clientIp)
                    .method(request.getMethod())
                    .path(requestURI)
                    .userAgent(request.getHeader("User-Agent"))
                    .referrer(request.getHeader("Referer"))
                    .expiresAt(expiresAt)
                    .parameters(parameters)
                    .build();

            captureSerice.capture(capturedRequest);

            if (properties.getBlockedIps().contains(clientIp)) {
                log.warn("Request from {} is blocked.", clientIp);
                response.sendError(HttpStatus.TOO_MANY_REQUESTS.value());
                return;
            }

            if (!RequestCaptureSerice.isLocalhost(clientIp) && properties.getRequestCacheSize() > 0) {
                var cachedRequest = requestCaptureCache.getIfPresent(clientIp);
                if (cachedRequest != null) {
                    var seconds = Duration.between(LocalDateTime.now(), cachedRequest.getExpiresAt()).getSeconds();
                    log.warn("Request from {} is throttled. Expiration: {}, Expires in {} seconds",
                            clientIp, cachedRequest.getExpiresAt(), seconds);
                    store(capturedRequest.withThrottled(true));
                    response.sendError(HttpStatus.TOO_MANY_REQUESTS.value());
                    return;
                }
                requestCaptureCache.put(clientIp, capturedRequest);
                store(capturedRequest);
            }
        }
        filterChain.doFilter(request, response);
    }

    private void store(final CapturedRequest request) {
        mongoTemplate.save(request, "cas-initializr");
    }
}
