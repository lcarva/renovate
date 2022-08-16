import { cache } from '../../../util/cache/package/decorator';
import * as looseVersioning from '../../versioning/loose';
// import { Datasource } from '../datasource';
import { DockerDatasource } from '../docker';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import {
  defaultRegistryUrl,
  pipelineBundleDatasource,
  taskBundleDatasource,
} from './common';
import type { Resources } from './types';
import { logger } from '../../../logger';

abstract class TektonHubDatasource extends Datasource {
  protected constructor(id: string, protected readonly kind: string) {
    super(id);
    this.dockerDatasource = new DockerDatasource();
  }

  protected dockerDatasource: DockerDatasource;

  override readonly customRegistrySupport = false;

  override readonly defaultRegistryUrls = [defaultRegistryUrl];

  override readonly defaultVersioning = looseVersioning.id;

  override readonly caching = true;

  async getReleasesInternal({
    registryUrl,
    packageName,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    const result: ReleaseResult = {
      homepage: 'https://hub.tekton.dev',
      sourceUrl: 'https://github.com/tektoncd/hub',
      registryUrl,
      releases: [],
    };

    try {
      // TODO: paging - why not just use /v1/resource/<catalog>/<kind>/<name> ?
      const resources = (
        await this.http.getJson<Resources>(
          `${registryUrl!}v1/query?name=${packageName}&kind=${this.kind}`
        )
      ).body;
      result.releases.push(
        ...resources.data.map(({ latestVersion }) => ({
          version: latestVersion.version,
          releaseTimestamp: latestVersion.updatedAt,
          downloadUrl: latestVersion.rawURL,
          registryUrl: registryUrl,
        }))
      );
    } catch (err) {
      this.handleGenericErrors(err);
    }

    return result.releases.length ? result : null;
  }

  // @cache({
  //   namespace: `datasource-${taskBundleDatasource}`,
  //   key: ({ registryUrl, packageName }: GetReleasesConfig) =>
  //     `${registryUrl!}:${packageName}:digest`,
  // })
  // TODO: Add caching? Or just rely on Docker's?
  // TODO: Is "public" keyword needed? Or is it implied?
  public async getDigest(
    { packageName }: GetReleasesConfig,
    newValue?: string
  ): Promise<string | null> {
    // TODO: newValue is empty for some reason
    // TODO: change registryUrl to be the first part of the packageName
    const registryUrl = 'gcr.io';
    logger.trace(
      { registryUrl, packageName, newValue },
      'YOLO - calling digest'
    );
    const stuff = await this.dockerDatasource.getDigest(
      { registryUrl, packageName },
      newValue
    );
    logger.trace({ stuff }, 'YOLO - called digest');
    return stuff;
  }
}

export class TektonHubTaskDatasource extends TektonHubDatasource {
  static readonly id = taskBundleDatasource;

  constructor() {
    super(taskBundleDatasource, 'Task');
  }

  @cache({
    namespace: `datasource-${taskBundleDatasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      `${registryUrl!}:${packageName}`,
  })
  async getReleases({
    packageName,
    registryUrl,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    const name = parsePackageName(packageName);
    return await this.getReleasesInternal({ packageName: name, registryUrl });
  }
}

export class TektonHubPipelineDatasource extends TektonHubDatasource {
  static readonly id = pipelineBundleDatasource;

  constructor() {
    super(pipelineBundleDatasource, 'Pipeline');
  }

  @cache({
    namespace: `datasource-${pipelineBundleDatasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      `${registryUrl!}:${packageName}`,
  })
  async getReleases({
    packageName,
    registryUrl,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    const name = parsePackageName(packageName);
    return await this.getReleasesInternal({ packageName: name, registryUrl });
  }
}

function parsePackageName(packageName: string): string {
  const parts = packageName.split('/');
  return parts.pop()!;
}
