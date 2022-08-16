// import { getDep } from './extract';
import { extractPackageFile } from '.';

describe('modules/manager/tekton/extract', () => {
  describe('extractPackageFile()', () => {
    it('extracts deps from a file', () => {
      const digest =
        'sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b';
      const content = `
      ---
      plain: gcr.io/tekton-releases/catalog/upstream/plain
      tag: gcr.io/tekton-releases/catalog/upstream/tag:1.0
      digest: gcr.io/tekton-releases/catalog/upstream/digest@${digest}
      full: gcr.io/tekton-releases/catalog/upstream/full:1.0@${digest}
      `;
      const res = extractPackageFile(content)?.deps;
      expect(res).toMatchInlineSnapshot(`
        Array [
          Object {
            "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
            "currentDigest": undefined,
            "currentValue": undefined,
            "datasource": "tekton-hub-task",
            "depName": "gcr.io/tekton-releases/catalog/upstream/plain",
            "depType": "tekton-bundle",
            "replaceString": "gcr.io/tekton-releases/catalog/upstream/plain",
          },
          Object {
            "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
            "currentDigest": undefined,
            "currentValue": "1.0",
            "datasource": "tekton-hub-task",
            "depName": "gcr.io/tekton-releases/catalog/upstream/tag",
            "depType": "tekton-bundle",
            "replaceString": "gcr.io/tekton-releases/catalog/upstream/tag:1.0",
          },
          Object {
            "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
            "currentDigest": "${digest}",
            "currentValue": undefined,
            "datasource": "tekton-hub-task",
            "depName": "gcr.io/tekton-releases/catalog/upstream/digest",
            "depType": "tekton-bundle",
            "replaceString": "gcr.io/tekton-releases/catalog/upstream/digest@${digest}",
          },
          Object {
            "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
            "currentDigest": "${digest}",
            "currentValue": "1.0",
            "datasource": "tekton-hub-task",
            "depName": "gcr.io/tekton-releases/catalog/upstream/full",
            "depType": "tekton-bundle",
            "replaceString": "gcr.io/tekton-releases/catalog/upstream/full:1.0@${digest}",
          },
        ]
      `);
    });

    it('handles file without any deps', () => {
      expect(extractPackageFile('foo: bar')).toBeNull();
    });
  });

  // xdescribe('getDep()', () => {
  //
  //   it('rejects null', () => {
  //     expect(getDep(null)).toEqual({ skipReason: 'invalid-value' });
  //   });
  //
  //   it('parses image without digest nor tag', () => {
  //     const res = getDep('docker.io/library/redis');
  //     expect(res).toMatchInlineSnapshot(`
  //       Object {
  //         "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
  //         "currentDigest": undefined,
  //         "currentValue": undefined,
  //         "datasource": "docker",
  //         "depName": "docker.io/library/redis",
  //         "replaceString": "docker.io/library/redis",
  //       }
  //     `);
  //   });
  //
  //   it('parses image with tag', () => {
  //     const res = getDep('docker.io/library/redis:1.0');
  //     expect(res).toMatchInlineSnapshot(`
  //       Object {
  //         "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
  //         "currentDigest": undefined,
  //         "currentValue": "1.0",
  //         "datasource": "docker",
  //         "depName": "docker.io/library/redis",
  //         "replaceString": "docker.io/library/redis:1.0",
  //       }
  //     `);
  //   });
  //
  //   it('parses image with digest', () => {
  //     const digest =
  //       'sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b';
  //     const res = getDep(`docker.io/library/redis@${digest}`);
  //     expect(res).toMatchInlineSnapshot(`
  //       Object {
  //         "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
  //         "currentDigest": "${digest}",
  //         "currentValue": undefined,
  //         "datasource": "docker",
  //         "depName": "docker.io/library/redis",
  //         "replaceString": "docker.io/library/redis@${digest}",
  //       }
  //     `);
  //   });
  //
  //   it('parses image with digest and tag', () => {
  //     const digest =
  //       'sha256:01ba4719c80b6fe911b091a7c05124b64eeece964e09c058ef8f9805daca546b';
  //     const res = getDep(`docker.io/library/redis:1.0@${digest}`);
  //     expect(res).toMatchInlineSnapshot(`
  //       Object {
  //         "autoReplaceStringTemplate": "{{depName}}{{#if newValue}}:{{newValue}}{{/if}}{{#if newDigest}}@{{newDigest}}{{/if}}",
  //         "currentDigest": "${digest}",
  //         "currentValue": "1.0",
  //         "datasource": "docker",
  //         "depName": "docker.io/library/redis",
  //         "replaceString": "docker.io/library/redis:1.0@${digest}",
  //       }
  //     `);
  //   });
  //
  // });
});
