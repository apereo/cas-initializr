package org.apereo.cas.initializr.metadata;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import java.util.List;


@Getter
@NoArgsConstructor
@ToString
@Setter
public class CasDependencyDetails {
    private String category;

    private String title;

    private List<String> aliases;

    private List<String> facets;

    private boolean selectable = true;
}
