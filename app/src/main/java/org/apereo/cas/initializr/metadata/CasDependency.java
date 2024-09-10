package org.apereo.cas.initializr.metadata;

import lombok.Getter;
import lombok.NoArgsConstructor;
import lombok.Setter;
import lombok.ToString;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

@Getter
@NoArgsConstructor
@ToString
@Setter
@Document
public class CasDependency {

    @Id
    public String id;
    
    private String name;

    private String version;

    private String group;

    private String description;

    private CasDependencyDetails details = new CasDependencyDetails();
}
