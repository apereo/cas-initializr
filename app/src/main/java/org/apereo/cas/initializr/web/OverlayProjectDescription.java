package org.apereo.cas.initializr.web;

import org.apereo.cas.overlay.OverlayBuildSystem;

import io.spring.initializr.generator.project.MutableProjectDescription;
import io.spring.initializr.metadata.BillOfMaterials;
import lombok.Getter;
import lombok.Setter;
import lombok.ToString;
import org.apache.commons.lang3.StringUtils;

@Getter
@Setter
@ToString
public class OverlayProjectDescription extends MutableProjectDescription {

    public enum DeploymentTypes {
        WEB,
        EXECUTABLE
    }

    private String casVersion;

    private String springBootVersion;

    private boolean dockerSupported;

    private boolean helmSupported;

    private boolean herokuSupported;

    private boolean puppeteerSupported;

    private boolean githubActionsSupported;

    private boolean commandlineShellSupported;

    private boolean nativeImageSupported;

    private boolean openRewriteSupported;

    private boolean sbomSupported;

    private DeploymentTypes deploymentType = DeploymentTypes.EXECUTABLE;

    public String resolveCasVersion(final BillOfMaterials billOfMaterials) {
        return StringUtils.defaultIfBlank(this.casVersion, billOfMaterials.getVersion());
    }

    public String resolveBranchName() {
        return VersionUtils.getBranchName(this.casVersion);
    }

    @Override
    public OverlayBuildSystem getBuildSystem() {
        return (OverlayBuildSystem) super.getBuildSystem();
    }
}
