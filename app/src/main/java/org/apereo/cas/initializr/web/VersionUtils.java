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

    public static String getBranchName(final String version) {
        var casBranch = version.split("\\.");
        return casBranch[0] + '.' + casBranch[1];
    }

    public static Version parse(String versionText) {
        if (versionText.matches("\\d.\\d-rc-\\d")) {
            versionText = versionText.replaceAll("-rc-\\d", "");
        }
        if (versionText.matches("\\d.\\d-\\d+\\+0000")) {
            versionText = versionText.replaceAll("-\\d+\\+0000", "");
        }
        if (versionText.matches("\\d.\\d")) {
            versionText += ".0";
        }
        if (versionText.matches("\\d.\\d.\\d.\\d")) {
            return Version.parse(versionText.substring(0, versionText.lastIndexOf('.')));
        }
        return Version.parse(versionText);
    }
}
