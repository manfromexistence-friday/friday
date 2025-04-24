/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {GoogleAuthOptions} from 'google-auth-library';

import {ApiClient} from './_api_client';
import {Caches} from './caches';
import {Chats} from './chats';
import {crossError} from './cross/_cross_error';
import {CrossUploader} from './cross/_cross_uploader';
import {CrossWebSocketFactory} from './cross/_cross_websocket';
import {Files} from './files';
import {Live} from './live';
import {Models} from './models';
import {Operations} from './operations';
import {HttpOptions} from './types';
import {WebAuth} from './web/_web_auth';

const LANGUAGE_LABEL_PREFIX = 'gl-node/';

/**
 * Google Gen AI SDK's configuration options.
 *
 * See {@link GoogleGenAI} for usage samples.
 */
export interface GoogleGenAIOptions {
  /**
   * Optional. Determines whether to use the Vertex AI or the Gemini API.
   *
   * @remarks
   * When true, the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI API} will used.
   * When false, the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Gemini API} will be used.
   *
   * If unset, default SDK behavior is to use the Gemini API service.
   */
  vertexai?: boolean;
  /**
   * Optional. The Google Cloud project ID for Vertex AI clients.
   *
   * @remarks
   * Only supported on Node runtimes, ignored on browser runtimes.
   */
  project?: string;
  /**
   * Optional. The Google Cloud project region for Vertex AI clients.
   *
   * @remarks
   * Only supported on Node runtimes, ignored on browser runtimes.
   *
   */
  location?: string;
  /**
   * The API Key, required for Gemini API clients.
   *
   * @remarks
   * Required on browser runtimes.
   */
  apiKey?: string;
  /**
   * Optional. The API version to use.
   *
   * @remarks
   * If unset, the default API version will be used.
   */
  apiVersion?: string;
  /**
   * Optional. Authentication options defined by the by google-auth-library for Vertex AI clients.
   *
   * @remarks
   * @see {@link https://github.com/googleapis/google-auth-library-nodejs/blob/v9.15.0/src/auth/googleauth.ts | GoogleAuthOptions interface in google-auth-library-nodejs}.
   *
   * Only supported on Node runtimes, ignored on browser runtimes.
   *
   */
  googleAuthOptions?: GoogleAuthOptions;
  /**
   * Optional. A set of customizable configuration for HTTP requests.
   */
  httpOptions?: HttpOptions;
}

/**
 * The Google GenAI SDK.
 *
 * @remarks
 * Provides access to the GenAI features through either the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Gemini API}
 * or the {@link https://cloud.google.com/vertex-ai/docs/reference/rest | Vertex AI API}.
 *
 * The {@link GoogleGenAIOptions.vertexai} value determines which of the API services to use.
 *
 * When using the Gemini API, a {@link GoogleGenAIOptions.apiKey} must also be set,
 * when using Vertex AI {@link GoogleGenAIOptions.project} and {@link GoogleGenAIOptions.location} must also be set.
 *
 * @example
 * Initializing the SDK for using the Gemini API:
 * ```ts
 * import {GoogleGenAI} from '@google/genai';
 * const ai = new GoogleGenAI({apiKey: 'GEMINI_API_KEY'});
 * ```
 *
 * @example
 * Initializing the SDK for using the Vertex AI API:
 * ```ts
 * import {GoogleGenAI} from '@google/genai';
 * const ai = new GoogleGenAI({
 *   vertexai: true,
 *   project: 'PROJECT_ID',
 *   location: 'PROJECT_LOCATION'
 * });
 * ```
 *
 */
export class GoogleGenAI {
  protected readonly apiClient: ApiClient;
  private readonly apiKey?: string;
  public readonly vertexai: boolean;
  private readonly apiVersion?: string;
  readonly models: Models;
  readonly live: Live;
  readonly chats: Chats;
  readonly caches: Caches;
  readonly files: Files;
  readonly operations: Operations;

  constructor(options: GoogleGenAIOptions) {
    if (options.apiKey == null) {
      throw new Error(
        `An API Key must be set when running in an unspecified environment.\n + ${crossError().message}`,
      );
    }
    this.vertexai = options.vertexai ?? false;
    this.apiKey = options.apiKey;
    this.apiVersion = options.apiVersion;
    const auth = new WebAuth(this.apiKey);
    this.apiClient = new ApiClient({
      auth: auth,
      apiVersion: this.apiVersion,
      apiKey: this.apiKey,
      vertexai: this.vertexai,
      httpOptions: options.httpOptions,
      userAgentExtra: LANGUAGE_LABEL_PREFIX + 'cross',
      uploader: new CrossUploader(),
    });
    this.models = new Models(this.apiClient);
    this.live = new Live(this.apiClient, auth, new CrossWebSocketFactory());
    this.chats = new Chats(this.models, this.apiClient);
    this.caches = new Caches(this.apiClient);
    this.files = new Files(this.apiClient);
    this.operations = new Operations(this.apiClient);
  }
}
