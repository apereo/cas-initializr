package org.apereo.cas.initializr.config;

import lombok.Getter;
import lombok.Setter;

/**
 * Information about versions of CAS supported by the CAS Initializr.
 * @author Hal Deadman
 */
@Getter
@Setter
public class SupportedVersion {

    private String casVersion;

    private String bootVersion;

}
