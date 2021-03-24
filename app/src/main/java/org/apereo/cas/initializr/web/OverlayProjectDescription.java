package org.apereo.cas.initializr.web;

import io.spring.initializr.generator.project.MutableProjectDescription;
import io.spring.initializr.metadata.BillOfMaterials;
import lombok.Getter;
import lombok.Setter;
import org.apache.commons.lang3.StringUtils;

/**
 * This is {@link OverlayProjectDescription}.
 *
 * @author Misagh Moayyed
 * @since 6.4.0
 */
@Getter
@Setter
public class OverlayProjectDescription extends MutableProjectDescription {
    private String casVersion;

    public OverlayProjectDescription(final MutableProjectDescription source) {
        super(source);
    }

    public String resolveCasVersion(final BillOfMaterials billOfMaterials) {
        return StringUtils.defaultIfBlank(this.casVersion, billOfMaterials.getVersion());
    }
}
