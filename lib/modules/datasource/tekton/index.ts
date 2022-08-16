import { cache } from '../../../util/cache/package/decorator';
import * as looseVersioning from '../../versioning/loose';
import { Datasource } from '../datasource';
import type { GetReleasesConfig, ReleaseResult } from '../types';
import {
  defaultRegistryUrl,
  pipelineDatasource,
  taskDatasource,
} from './common';
import type { Resources } from './types';

abstract class TektonHubDatasource extends Datasource {
  protected constructor(id: string, protected readonly kind: string) {
    super(id);
  }

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
      // TODO: paging
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
}

export class TektonHubTaskDatasource extends TektonHubDatasource {
  static readonly id = taskDatasource;

  constructor() {
    super(taskDatasource, 'Task');
  }

  @cache({
    namespace: `datasource-${taskDatasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      `${registryUrl!}:${packageName}`,
  })
  async getReleases({
    packageName,
    registryUrl,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    return await this.getReleasesInternal({ packageName, registryUrl });
  }
}

export class TektonHubPipelineDatasource extends TektonHubDatasource {
  static readonly id = pipelineDatasource;

  constructor() {
    super(pipelineDatasource, 'Pipeline');
  }

  @cache({
    namespace: `datasource-${pipelineDatasource}`,
    key: ({ registryUrl, packageName }: GetReleasesConfig) =>
      `${registryUrl!}:${packageName}`,
  })
  async getReleases({
    packageName,
    registryUrl,
  }: GetReleasesConfig): Promise<ReleaseResult | null> {
    return await this.getReleasesInternal({ packageName, registryUrl });
  }
}
