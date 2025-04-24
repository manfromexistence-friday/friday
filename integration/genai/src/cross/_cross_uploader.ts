/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
import {ApiClient} from '../_api_client';
import {FileStat, Uploader} from '../_uploader';
import {File, HttpResponse} from '../types';

import {crossError} from './_cross_error';

export const MAX_CHUNK_SIZE = 1024 * 1024 * 8; // bytes
export class CrossUploader implements Uploader {
  async upload(
    file: string | Blob,
    uploadUrl: string,
    apiClient: ApiClient,
  ): Promise<File> {
    if (typeof file === 'string') {
      throw crossError();
    } else {
      return uploadBlob(file, uploadUrl, apiClient);
    }
  }

  async stat(file: string | Blob): Promise<FileStat> {
    if (typeof file === 'string') {
      throw crossError();
    } else {
      return getBlobStat(file);
    }
  }
}

export async function uploadBlob(
  file: Blob,
  uploadUrl: string,
  apiClient: ApiClient,
): Promise<File> {
  let fileSize = 0;
  let offset = 0;
  let response: HttpResponse = new HttpResponse(new Response());
  let uploadCommand = 'upload';
  fileSize = file.size;
  while (offset < fileSize) {
    const chunkSize = Math.min(MAX_CHUNK_SIZE, fileSize - offset);
    const chunk = file.slice(offset, offset + chunkSize);
    if (offset + chunkSize >= fileSize) {
      uploadCommand += ', finalize';
    }
    response = await apiClient.request({
      path: '',
      body: chunk,
      httpMethod: 'POST',
      httpOptions: {
        apiVersion: '',
        baseUrl: uploadUrl,
        headers: {
          'X-Goog-Upload-Command': uploadCommand,
          'X-Goog-Upload-Offset': String(offset),
          'Content-Length': String(chunkSize),
        },
      },
    });
    offset += chunkSize;
    // The `x-goog-upload-status` header field can be `active`, `final` and
    //`cancelled` in resposne.
    if (response?.headers?.['x-goog-upload-status'] !== 'active') {
      break;
    }
    // TODO(b/401391430) Investigate why the upload status is not finalized
    // even though all content has been uploaded.
    if (fileSize <= offset) {
      throw new Error(
        'All content has been uploaded, but the upload status is not finalized.',
      );
    }
  }
  const responseJson = (await response?.json()) as Record<
    string,
    File | unknown
  >;
  if (response?.headers?.['x-goog-upload-status'] !== 'final') {
    throw new Error('Failed to upload file: Upload status is not finalized.');
  }
  return responseJson['file'] as File;
}

export async function getBlobStat(file: Blob): Promise<FileStat> {
  const fileStat: FileStat = {size: file.size, type: file.type};
  return fileStat;
}
