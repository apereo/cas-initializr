package org.apereo.cas.initializr.web;

import lombok.Getter;

@Getter
public class UnsupportedVersionException extends RuntimeException {
    private final String version;

    public UnsupportedVersionException(final String version, final String message) {
        super(message);
        this.version = version;
    }
}
