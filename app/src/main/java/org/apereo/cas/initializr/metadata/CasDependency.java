package org.apereo.cas.initializr.metadata;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;

@Getter
@NoArgsConstructor
@ToString
@Setter
public class CasDependency {
    private String name;

    private String version;

    private String group;

    private String description;

    private CasDependencyDetails details = new CasDependencyDetails();
}
