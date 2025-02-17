import * as React from 'react';
import { deploymentCenterContent, deploymentCenterInfoBannerDiv, titleWithPaddingStyle } from '../DeploymentCenter.styles';
import { useTranslation } from 'react-i18next';
import { Field } from 'formik';
import { MessageBarType } from '@fluentui/react/lib/MessageBar';
import DeploymentCenterData from '../DeploymentCenter.data';
import { PortalContext } from '../../../../PortalContext';
import { getTelemetryInfo } from '../utility/DeploymentCenterUtility';
import { DeploymentCenterContext } from '../DeploymentCenterContext';
import {
  AuthType,
  DeploymentCenterCodeFormData,
  DeploymentCenterContainerFormData,
  DeploymentCenterFieldProps,
  UserAssignedIdentity,
} from '../DeploymentCenter.types';
import { RBACRoleId } from '../../../../utils/CommonConstants';
import { getErrorMessage } from '../../../../ApiHelpers/ArmHelper';
import CustomBanner from '../../../../components/CustomBanner/CustomBanner';
import { DeploymentCenterLinks } from '../../../../utils/FwLinks';
import RadioButton from '../../../../components/form-controls/RadioButton';
import { Link } from '@fluentui/react/lib/Link';
import { learnMoreLinkStyle } from '../../../../components/form-controls/formControl.override.styles';

export const DeploymentCenterAuthenticationSettings = React.memo<
  DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>
>((props: DeploymentCenterFieldProps<DeploymentCenterContainerFormData | DeploymentCenterCodeFormData>) => {
  const { t } = useTranslation();
  const { formProps } = props;
  const deploymentCenterData = new DeploymentCenterData();
  const portalContext = React.useContext(PortalContext);
  const deploymentCenterContext = React.useContext(DeploymentCenterContext);
  const managedIdentityInfo = React.useRef<{ [key: string]: UserAssignedIdentity }>({});

  const authTypeOptions = React.useMemo(() => {
    return [
      { key: AuthType.PublishProfile, text: t('authenticationSettingsBasicAuthentication') },
      { key: AuthType.Oidc, text: t('authenticationSettingsUserAssignedManagedIdentity') },
    ];
  }, []);

  const hasPermissionOverResource = React.useCallback(async () => {
    if (deploymentCenterContext.resourceId) {
      const adToken = await portalContext.getAdToken('microsoft.graph');
      if (adToken) {
        const getUserResponse = await deploymentCenterData.getUser(adToken);
        if (getUserResponse.metadata.success) {
          const userId = getUserResponse.data.id;
          const getRoleAssignmentsResponse = await deploymentCenterData.getRoleAssignmentsWithScope(
            deploymentCenterContext.resourceId,
            userId
          );
          if (getRoleAssignmentsResponse.metadata.success) {
            return formProps.setFieldValue(
              'hasPermissionToAssignRBAC',
              deploymentCenterData.hasRoleAssignment(RBACRoleId.owner, getRoleAssignmentsResponse.data.value) ||
                deploymentCenterData.hasRoleAssignment(RBACRoleId.userAccessAdministrator, getRoleAssignmentsResponse.data.value)
            );
          } else {
            portalContext.log(
              getTelemetryInfo('error', 'getRoleAssignmentsResponse', 'failed', {
                message: getErrorMessage(getRoleAssignmentsResponse.metadata.error),
                errorAsString: getRoleAssignmentsResponse.metadata.error ? JSON.stringify(getRoleAssignmentsResponse.metadata.error) : '',
              })
            );
          }
        } else {
          portalContext.log(
            getTelemetryInfo('error', 'getUserResponse', 'failed', {
              message: getErrorMessage(getUserResponse.metadata.error),
              errorAsString: getUserResponse.metadata.error ? JSON.stringify(getUserResponse.metadata.error) : '',
            })
          );
        }
      } else {
        portalContext.log(getTelemetryInfo('error', 'getAdToken', 'failed'));
      }
    }

    return formProps.setFieldValue('hasPermissionToAssignRBAC', false);
  }, [deploymentCenterContext.resourceId, formProps.values.hasPermissionToAssignRBAC]);

  React.useEffect(() => {
    const authIdentityClientId = formProps.values.authIdentityClientId;
    if (authIdentityClientId && managedIdentityInfo.current[authIdentityClientId]) {
      formProps.values.authIdentity = managedIdentityInfo.current[authIdentityClientId];
    }
  }, [formProps.values.authIdentityClientId]);

  React.useEffect(() => {
    hasPermissionOverResource();
  }, [hasPermissionOverResource]);

  return (
    <div className={deploymentCenterContent}>
      <>
        <h3 className={titleWithPaddingStyle}>{t('authenticationSettingsTitle')}</h3>
        <p>
          <span>{t('authenticationSettingsDescription')}</span>{' '}
          <Link
            id="deployment-center-settings-learnMore"
            aria-label={t('authenticationSettingsIdentityPermissionsError')}
            href={DeploymentCenterLinks.managedIdentityOidc}
            target="_blank"
            className={learnMoreLinkStyle}>
            {t('learnMore')}
          </Link>
        </p>
      </>

      {formProps.values.authType === AuthType.Oidc && formProps.values.hasPermissionToAssignRBAC === false && (
        <div className={deploymentCenterInfoBannerDiv}>
          <CustomBanner
            id="deployment-center-msi-permissions-error"
            message={t('authenticationSettingsIdentityPermissionsError')}
            type={MessageBarType.blocked}
            learnMoreLink={DeploymentCenterLinks.managedIdentityOidc}
            learnMoreLinkAriaLabel={t('authenticationSettingsIdentityPermissionsLinkAriaLabel')}
          />
        </div>
      )}

      <Field
        id="deployment-center-auth-type-option"
        label={t('authenticationSettingsAuthenticationType')}
        name="authType"
        component={RadioButton}
        options={authTypeOptions}
        displayInVerticalLayout={true}
        required
      />
    </div>
  );
});

DeploymentCenterAuthenticationSettings.displayName = 'DeploymentCenterAuthenticationSettings';
