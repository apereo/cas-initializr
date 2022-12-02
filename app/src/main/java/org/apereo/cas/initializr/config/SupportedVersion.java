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
    private String containerBaseImage;

    private String version;

    private String bootVersion;

    private boolean sync;

    private boolean validate;

    private String branch;

    private String type;

    private String platformVersion;

    private String tomcatVersion;

    private String javaVersion;
}
