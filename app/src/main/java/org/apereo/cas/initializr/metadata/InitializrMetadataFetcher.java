package org.apereo.cas.initializr.metadata;

import java.util.List;

public interface InitializrMetadataFetcher {
    List<CasDependency> fetch(String casVersion);
}
