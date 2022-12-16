package org.apereo.cas.initializr.web;

import io.spring.initializr.web.project.WebProjectRequest;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.builder.ToStringBuilder;
import org.apache.commons.lang3.builder.ToStringStyle;

@Getter
@Setter
public class OverlayProjectRequest extends WebProjectRequest {
    private String casVersion;
    
    @Override
    public String toString() {
        return ToStringBuilder.reflectionToString(this, ToStringStyle.NO_CLASS_NAME_STYLE);
    }
}
