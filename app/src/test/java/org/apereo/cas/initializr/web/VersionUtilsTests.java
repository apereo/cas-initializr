package org.apereo.cas.initializr.web;

import org.junit.jupiter.api.Test;
import static org.junit.jupiter.api.Assertions.*;

public class VersionUtilsTests {
    @Test
    void verifyVersion() throws Exception {
        assertNotNull(VersionUtils.parse("8.2-rc-2"));
        assertNotNull(VersionUtils.parse("8.2-20230620231712+0000"));
        assertNotNull(VersionUtils.parse("6.6.15.1"));
        assertNotNull(VersionUtils.parse("8.10"));
    }
}
