package org.apereo.cas.initializr.web;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class VersionUtilsTests {
    @Test
    void verifyVersion() throws Exception {
        assertNotNull(VersionUtils.parse("8.2-rc-2"));

    }
}
