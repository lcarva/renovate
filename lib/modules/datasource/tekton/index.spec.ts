import { getPkgReleases } from '..';
import { Fixtures } from '../../../../test/fixtures';
import * as httpMock from '../../../../test/http-mock';
import { EXTERNAL_HOST_ERROR } from '../../../constants/error-messages';
import {
  defaultRegistryUrl,
  pipelineBundleDatasource,
  taskBundleDatasource,
} from './common';

const depName = 'buildpacks';

describe('modules/datasource/tekton/index', () => {
  describe('task', () => {
    describe('getReleases', () => {
      it('throws for 500', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Task`)
          .reply(500);
        await expect(
          getPkgReleases({
            datasource: taskBundleDatasource,
            depName,
          })
        ).rejects.toThrow(EXTERNAL_HOST_ERROR);
      });

      it('returns null for empty 200 OK', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Task`)
          .reply(200, []);
        expect(
          await getPkgReleases({
            datasource: taskBundleDatasource,
            depName,
          })
        ).toBeNull();
      });

      it('processes real data', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Task`)
          .reply(200, Fixtures.get('query-buildpack-task.json'));
        const res = await getPkgReleases({
          datasource: taskBundleDatasource,
          depName,
        });
        expect(res).toMatchSnapshot();
        expect(res?.releases).toHaveLength(2);
      });
    });
  });

  describe('pipeline', () => {
    describe('getReleases', () => {
      it('throws for 500', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Pipeline`)
          .reply(500);
        await expect(
          getPkgReleases({
            datasource: pipelineBundleDatasource,
            depName,
          })
        ).rejects.toThrow(EXTERNAL_HOST_ERROR);
      });

      it('returns null for empty 200 OK', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Pipeline`)
          .reply(200, []);
        expect(
          await getPkgReleases({
            datasource: pipelineBundleDatasource,
            depName,
          })
        ).toBeNull();
      });

      it('processes real data', async () => {
        httpMock
          .scope(defaultRegistryUrl)
          .get(`/v1/query?name=${depName}&kind=Pipeline`)
          .reply(200, Fixtures.get('query-buildpack-pipeline.json'));
        const res = await getPkgReleases({
          datasource: pipelineBundleDatasource,
          depName,
        });
        expect(res).toMatchSnapshot();
        expect(res?.releases).toHaveLength(1);
      });
    });
  });
});
