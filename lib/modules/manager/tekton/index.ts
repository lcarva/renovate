import type { PackageDependency, PackageFile } from '../types';
import { ProgrammingLanguage } from '../../../constants';
import { TektonHubTaskDatasource } from '../../datasource/tekton';
import { logger } from '../../../logger';
import { newlineRegex } from '../../../util/regex';

// TODO: Is this right?
export const language = ProgrammingLanguage.Docker;

export const defaultConfig = {
  // Tekton uses YAML files to define its kubernetes resources. These
  // don't have a specific file name pattern. To avoid issues with
  // unrelated YAML files, the match pattern is left empty by default.
  // Users must provide this value based on their own Tekton usage.
  // For example, to match all the YAML files in a repository, add
  // the following to renovate.json in the corresponding git repo:
  //  {
  //    "tekton": {
  //      "fileMatch": ['\\.yaml$', '\\.yml$']
  //    }
  //  }
  fileMatch: [],
};

export const supportedDatasources = [TektonHubTaskDatasource.id];

export function extractPackageFile(content: string): PackageFile | null {
  const deps: PackageDependency[] = [];

  const autoReplaceStringTemplate =
    '{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}';

  const datasource = TektonHubTaskDatasource.id;

  const lines = content.split(newlineRegex);
  for (const line of lines) {
    // An image reference contains at least one dot "." and two slashes "/"
    const imageRegex =
      /\b(?<image>(?<repo>\S+\.\S+\/\S+\/[^:@\s]+)(:(?<tag>[^@\s]+))?(@(?<digest>\w+:\w+))?)/i;
    const imageMatch = line.match(imageRegex);
    if (imageMatch?.groups?.image) {
      const imageReference = imageMatch?.groups?.image;
      // TODO: Make this configurable?
      if (
        !imageReference.startsWith('gcr.io/tekton-releases/catalog/upstream/')
      ) {
        continue;
      }

      const dep: PackageDependency = {
        autoReplaceStringTemplate,
        currentDigest: imageMatch.groups.digest,
        // If a tag is not found, assume the lowest possible version. This will
        // ensure the version update is successful, and properly resolve digest.
        currentValue: imageMatch.groups.tag || '0.0',
        datasource,
        depName: imageMatch.groups.repo,
        depType: 'tekton-bundle',
        replaceString: imageReference,
      };

      logger.trace(
        {
          depName: dep.depName,
          currentValue: dep.currentValue,
          currentDigest: dep.currentDigest,
        },
        'Tekton'
      );
      deps.push(dep);
    }
  }

  if (!deps.length) {
    return null;
  }
  return { deps };
}
