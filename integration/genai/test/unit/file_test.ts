/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleGenAI} from '../../src/node';
import {createZeroFilledTempFile} from '../_generate_test_file';

describe('File', () => {
  let client: GoogleGenAI;
  beforeEach(() => {
    client = new GoogleGenAI({vertexai: false, apiKey: 'fake-api-key'});
  });

  describe('delete', () => {
    it('It should delete the file by given config', async () => {
      const deleteUrl =
        'https://generativelanguage.googleapis.com/v1beta/files/6h7lat0gfq5n';
      const deleteOkoptions = {
        status: 200,
        statusText: 'OK',
        ok: true,
        headers: {
          'Content-Type': 'application/json',
        },
        url: 'some-url',
      };

      spyOn(global, 'fetch').and.returnValue(
        Promise.resolve(new Response('{}', deleteOkoptions)),
      );
      await client.files.delete({
        name: 'files/6h7lat0gfq5n',
      });

      expect(global.fetch).toHaveBeenCalledWith(
        jasmine.stringMatching(deleteUrl),
        jasmine.any(Object),
      );
    });
  });
  describe('upload', () => {
    const DEFAULT_CHUNK_SIZE = 1024 * 1024 * 8; // bytes
    const TEST_FILE_SIZE = 1024 * 1024 * 30; // bytes
    const DEFAULT_TEST_MIMETYPE = 'text/plain';
    const TEST_CREATE_URL =
      'https://generativelanguage.googleapis.com/upload/v1beta/files';
    const TEST_UPLOAD_URL =
      'https://generativelanguage.googleapis.com/upload/v1beta/files?upload_id=test-upload-id&upload_protocol=resumable';

    const createUrlOkoptions = {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-upload-url': TEST_UPLOAD_URL,
      },
      url: 'some-url',
    };
    const uploadOkOptions = {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-upload-status': 'active',
      },
      url: 'some-url',
    };
    const lastCorrectFetchOkOptions = {
      status: 200,
      statusText: 'OK',
      ok: true,
      headers: {
        'Content-Type': 'application/json',
        'x-goog-upload-status': 'final',
      },
      url: 'some-url',
    };
    const mockResponse = new Response(
      JSON.stringify({
        data: 'data1',
      }),
      uploadOkOptions,
    );
    const fileSize = TEST_FILE_SIZE;
    describe('Node_client', () => {
      it('It should upload the file from a string path.', async () => {
        const filePath = await createZeroFilledTempFile(TEST_FILE_SIZE);
        const numRequests = Math.ceil(TEST_FILE_SIZE / DEFAULT_CHUNK_SIZE);

        // one initial request to get the upload url, and then the rest
        // of the requests to upload the file.
        const mockResponses = [
          Promise.resolve(new Response('', createUrlOkoptions)),
        ];

        for (let i = 0; i < numRequests - 1; i++) {
          mockResponses.push(Promise.resolve(mockResponse));
        }
        mockResponses.push(
          Promise.resolve(
            new Response(
              JSON.stringify({
                data: 'data12',
              }),
              lastCorrectFetchOkOptions,
            ),
          ),
        );

        const fetchSpy = spyOn(global, 'fetch').and.returnValues(
          ...mockResponses,
        );

        await client.files.upload({file: filePath});
        expect(fetchSpy).toHaveBeenCalledTimes(numRequests + 1);

        const allArgs = fetchSpy.calls.allArgs();

        // make sure we get the correct create url. mimeType and fileSize in the
        // first request.
        expect(allArgs[0][0]).toBe(TEST_CREATE_URL);
        expect(allArgs[0][1]?.['body']).toContain(DEFAULT_TEST_MIMETYPE);
        expect(allArgs[0][1]?.['body']).toContain(TEST_FILE_SIZE);

        let byteProcessed = 0;
        for (let i = 1; i < numRequests + 1; i++) {
          // make sure we get the correct upload url in the first
          // request.
          expect(allArgs[i][0]).toBe(TEST_UPLOAD_URL);
          expect(allArgs[i][1]?.['body']).toBeInstanceOf(Blob);
          const body = allArgs[i][1]?.['body'] as Blob;
          expect(
            body?.size ==
              Math.min(DEFAULT_CHUNK_SIZE, fileSize - byteProcessed),
          ).toBeTrue();
          byteProcessed += body?.size;
        }
        // make sure we have processed all the bytes.
        expect(byteProcessed).toBe(fileSize);
      });

      it('It should upload the file from a blob.', async () => {
        const testBlob = new Blob([new Uint8Array(fileSize)], {
          type: DEFAULT_TEST_MIMETYPE,
        });
        const numRequests = Math.ceil(TEST_FILE_SIZE / DEFAULT_CHUNK_SIZE);

        // one initial request to get the upload url, and then the rest
        // of the requests to upload the file.
        const mockResponses = [
          Promise.resolve(new Response('', createUrlOkoptions)),
        ];

        for (let i = 0; i < numRequests - 1; i++) {
          mockResponses.push(Promise.resolve(mockResponse));
        }
        mockResponses.push(
          Promise.resolve(
            new Response(
              JSON.stringify({
                data: 'data12',
              }),
              lastCorrectFetchOkOptions,
            ),
          ),
        );

        const fetchSpy = spyOn(global, 'fetch').and.returnValues(
          ...mockResponses,
        );

        await client.files.upload({file: testBlob});

        expect(fetchSpy).toHaveBeenCalledTimes(numRequests + 1);
        const allArgs = fetchSpy.calls.allArgs();

        // make sure we get the correct create url. mimeType and fileSize in the
        // first request.
        expect(allArgs[0][0]).toBe(TEST_CREATE_URL);
        expect(allArgs[0][1]?.['body']).toContain(DEFAULT_TEST_MIMETYPE);
        expect(allArgs[0][1]?.['body']).toContain(TEST_FILE_SIZE);
        let byteProcessed = 0;
        for (let i = 1; i < numRequests + 1; i++) {
          // make sure we get the correct upload url in the first
          // request.
          expect(allArgs[i][0]).toBe(TEST_UPLOAD_URL);
          expect(allArgs[i][1]?.['body']).toBeInstanceOf(Blob);
          const body = allArgs[i][1]?.['body'] as Blob;
          expect(
            body?.size ==
              Math.min(DEFAULT_CHUNK_SIZE, fileSize - byteProcessed),
          ).toBeTrue();
          byteProcessed += body?.size;
        }
        expect(byteProcessed).toBe(fileSize);
      });
    });
  });
});
