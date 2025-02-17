import { ScmType, BuildProvider } from '../../../../models/site/config';
import {
  DeploymentCenterFormData,
  DeploymentCenterYupValidationSchemaType,
  DeploymentCenterCodeFormData,
  AuthType,
} from '../DeploymentCenter.types';
import * as Yup from 'yup';
import { DeploymentCenterFormBuilder } from '../DeploymentCenterFormBuilder';

export class DeploymentCenterCodeFormBuilder extends DeploymentCenterFormBuilder {
  public generateFormData(): DeploymentCenterFormData<DeploymentCenterCodeFormData> {
    return {
      sourceProvider: ScmType.None,
      buildProvider: BuildProvider.None,
      runtimeStack: '',
      runtimeVersion: '',
      runtimeRecommendedVersion: '',
      ...this.generateCommonFormData(),
    };
  }

  public generateYupValidationSchema(): DeploymentCenterYupValidationSchemaType<DeploymentCenterCodeFormData> {
    const scmAllowed = this._basicPublishingCredentialsPolicies.scm.allow;
    return Yup.object().shape({
      sourceProvider: Yup.mixed().test('sourceProviderRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return value !== ScmType.None || (value === ScmType.None && this.parent.publishingUsername);
      }),
      buildProvider: Yup.mixed().when('authType', {
        is: AuthType.PublishProfile,
        then: Yup.mixed()
          .required()
          .test('basicAuthEnabledForGitHubActionsAndKudu', this._t('deploymentCenterScmBasicAuthValidationError'), function(value) {
            return value === BuildProvider.GitHubAction || value === BuildProvider.AppServiceBuildService ? scmAllowed : true;
          }),
        otherwise: Yup.mixed().required(),
      }),
      runtimeStack: Yup.mixed().test('runtimeStackRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction ? !!value : true;
      }),
      runtimeVersion: Yup.mixed().test('runtimeVersionRequired', this._t('deploymentCenterFieldRequiredMessage'), function(value) {
        return this.parent.buildProvider === BuildProvider.GitHubAction ? !!value : true;
      }),
      runtimeRecommendedVersion: Yup.mixed().notRequired(),
      ...this.generateCommonFormYupValidationSchema(),
    });
  }
}
