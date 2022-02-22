package org.apereo.cas.initializr.web;

import io.spring.initializr.generator.version.Version;
import lombok.experimental.UtilityClass;

/**
 * This is {@link VersionUtils}.
 *
 * @author Misagh Moayyed
 * @since 6.5.0
 */
@UtilityClass
public class VersionUtils {
    
    public static Version parse(final String versionText) {
        if (versionText.matches("\\d.\\d.\\d.\\d")) {
            return Version.parse(versionText.substring(0, versionText.lastIndexOf('.')));
        }
        return Version.parse(versionText);
    }
}
