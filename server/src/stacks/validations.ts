import { HttpException } from '@nestjs/common';
import { AppStackOs } from './2020-10-01/models/AppStackModel';
import { FunctionAppStackValue as FunctionAppStackValue20201001 } from './2020-10-01/models/FunctionAppStackModel';
import { WebAppStackValue as WebAppStackValue20201001 } from './2020-10-01/models/WebAppStackModel';
import { Versions } from './versions';

export function validateOs(os?: AppStackOs) {
  if (os && os !== 'linux' && os !== 'windows') {
    throw new HttpException(`Incorrect os '${os}' provided. Allowed os values are 'linux' or 'windows'.`, 400);
  }
}

export function validateApiVersion(apiVersion: string, earliestSupportedVersion: Versions) {
  if (!apiVersion) {
    throw new HttpException(`Missing 'api-version' query parameter.`, 400);
  }

  const apiVersionRegex = /^\d\d\d\d-\d\d-\d\d((-preview)|(-privatepreview)|(-beta))?$/i;
  if (!apiVersion.match(apiVersionRegex) || apiVersion < earliestSupportedVersion) {
    throw new HttpException(`Invalid api-version '${apiVersion}' provided.`, 400);
  }
}

export function validateFunctionAppStack(stack?: string) {
  const stackValues: FunctionAppStackValue20201001[] = ['dotnet', 'java', 'node', 'powershell', 'python', 'custom'];
  if (stack && !(stackValues as string[]).includes(stack)) {
    throw new HttpException(`Incorrect function app stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
  }
}

export function validateWebAppStack(stack?: string) {
  const stackValues: WebAppStackValue20201001[] = ['dotnet', 'java', 'javacontainers', 'node', 'php', 'python', 'ruby'];
  if (stack && !(stackValues as string[]).includes(stack)) {
    throw new HttpException(`Incorrect web app stack '${stack}' provided. Allowed stack values are ${stackValues.join(', ')}.`, 400);
  }
}

export function validateRemoveHiddenStacks(removeHiddenStacks?: string) {
  if (removeHiddenStacks && removeHiddenStacks.toLowerCase() !== 'true' && removeHiddenStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removeHiddenStacks '${removeHiddenStacks}' provided. Allowed removeHiddenStacks values are 'true' or 'false'.`,
      400
    );
  }
}

export function validateRemoveDeprecatedStacks(removeDeprecatedStacks?: string) {
  if (removeDeprecatedStacks && removeDeprecatedStacks.toLowerCase() !== 'true' && removeDeprecatedStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removeDeprecatedStacks '${removeDeprecatedStacks}' provided. Allowed removeDeprecatedStacks values are 'true' or 'false'.`,
      400
    );
  }
}

export function validateRemovePreviewStacks(removePreviewStacks?: string) {
  if (removePreviewStacks && removePreviewStacks.toLowerCase() !== 'true' && removePreviewStacks.toLowerCase() !== 'false') {
    throw new HttpException(
      `Incorrect removePreviewStacks '${removePreviewStacks}' provided. Allowed removePreviewStacks values are 'true' or 'false'.`,
      400
    );
  }
}

export function validateRemoveNonGitHubActionStacks(removeNonGitHubActionStacks?: string) {
  if (
    removeNonGitHubActionStacks &&
    removeNonGitHubActionStacks.toLowerCase() !== 'true' &&
    removeNonGitHubActionStacks.toLowerCase() !== 'false'
  ) {
    throw new HttpException(
      `Incorrect removeNonGitHubActionStacks '${removeNonGitHubActionStacks}' provided. Allowed removeNonGitHubActionStacks values are 'true' or 'false'.`,
      400
    );
  }
}
