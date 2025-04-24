/**
 * @license
 * Copyright 2025 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */

import {setDefaultBaseUrls} from '../../../src/_base_url';
import {NodeUploader} from '../../../src/node/_node_uploader';
import {GoogleGenAI} from '../../../src/node/node_client';

describe('Client', () => {
  afterEach(() => {
    delete process.env['GOOGLE_API_KEY'];
    delete process.env['GOOGLE_GENAI_USE_VERTEXAI'];
    delete process.env['GOOGLE_CLOUD_PROJECT'];
    delete process.env['GOOGLE_CLOUD_LOCATION'];
    delete process.env['GOOGLE_GEMINI_BASE_URL'];
    delete process.env['GOOGLE_VERTEX_BASE_URL'];

    setDefaultBaseUrls({});
  });

  it('should initialize without any options', () => {
    const client = new GoogleGenAI({});
    expect(client).toBeDefined();
  });

  it('should set apiKey from environment', () => {
    process.env['GOOGLE_API_KEY'] = 'test_api_key';
    const client = new GoogleGenAI({});
    expect(client['apiKey']).toBe('test_api_key');
  });

  it('should set vertexai from environment', () => {
    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'false';
    let client = new GoogleGenAI({});
    expect(client.vertexai).toBe(false);

    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'true';
    client = new GoogleGenAI({});
    expect(client.vertexai).toBe(true);
  });

  it('should set project from environment', () => {
    process.env['GOOGLE_CLOUD_PROJECT'] = 'test_project';
    const client = new GoogleGenAI({});
    expect(client['project']).toBe('test_project');
  });

  it('should set location from environment', () => {
    process.env['GOOGLE_CLOUD_LOCATION'] = 'test_location';
    const client = new GoogleGenAI({});
    expect(client['location']).toBe('test_location');
  });

  it('should prioritize constructor options over environment variables', () => {
    process.env['GOOGLE_API_KEY'] = 'env_api_key';
    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'true';
    process.env['GOOGLE_CLOUD_PROJECT'] = 'env_project';
    process.env['GOOGLE_CLOUD_LOCATION'] = 'env_location';

    const client = new GoogleGenAI({
      vertexai: true,
      project: 'constructor_project',
      location: 'constructor_location',
    });

    expect(client.vertexai).toBe(true);
    expect(client['apiKey']).toBeUndefined();
    expect(client['project']).toBe('constructor_project');
    expect(client['location']).toBe('constructor_location');
  });
  it('should not allow both project and apikey in constructor', () => {
    expect(() => {
      new GoogleGenAI({
        apiKey: 'constructor_api_key',
        vertexai: true,
        project: 'constructor_project',
        location: 'constructor_location',
      });
    }).toThrowError(
      'Project/location and API key are mutually exclusive in the client initializer.',
    );
  });
  it('should prioritize explicit api key over implicit project/location', () => {
    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'true';
    process.env['GOOGLE_CLOUD_PROJECT'] = 'env_project';
    process.env['GOOGLE_CLOUD_LOCATION'] = 'env_location';

    const client = new GoogleGenAI({
      vertexai: true,
      apiKey: 'constructor_api_key',
    });

    expect(client.vertexai).toBe(true);
    expect(client['apiKey']).toBe('constructor_api_key');
    expect(client['project']).toBeUndefined();
    expect(client['location']).toBeUndefined();
  });
  it('should prioritize explicit project/location over implicit api key', () => {
    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'true';
    process.env['GOOGLE_API_KEY'] = 'env_api_key';

    const client = new GoogleGenAI({
      vertexai: true,
      project: 'constructor_project',
      location: 'constructor_location',
    });

    expect(client.vertexai).toBe(true);
    expect(client['apiKey']).toBeUndefined();
    expect(client['project']).toBe('constructor_project');
    expect(client['location']).toBe('constructor_location');
  });
  it('should prioritize implicit project/location over implicit api key', () => {
    process.env['GOOGLE_GENAI_USE_VERTEXAI'] = 'true';
    process.env['GOOGLE_API_KEY'] = 'env_api_key';
    process.env['GOOGLE_CLOUD_PROJECT'] = 'env_project';
    process.env['GOOGLE_CLOUD_LOCATION'] = 'env_location';

    const client = new GoogleGenAI({
      vertexai: true,
    });

    expect(client.vertexai).toBe(true);
    expect(client['apiKey']).toBeUndefined();
    expect(client['project']).toBe('env_project');
    expect(client['location']).toBe('env_location');
  });
  it('should set uploader by default', () => {
    const client = new GoogleGenAI({});
    expect(client['apiClient'].clientOptions.uploader).toBeInstanceOf(
      NodeUploader,
    );
  });
  it('should persist base URL specified from HttpOptions Mldev', () => {
    setDefaultBaseUrls({
      geminiUrl: 'https://custom-gemini-base-url.googleapis.com',
      vertexUrl: 'https://custom-vertex-base-url.googleapis.com',
    });
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({
      httpOptions: {baseUrl: 'https://original-gemini-base-url.googleapis.com'},
    });

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://original-gemini-base-url.googleapis.com',
    );
  });
  it('should persist base URL specified from HttpOptions Vertex', () => {
    setDefaultBaseUrls({
      geminiUrl: 'https://custom-gemini-base-url.googleapis.com',
      vertexUrl: 'https://custom-vertex-base-url.googleapis.com',
    });
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({
      vertexai: true,
      httpOptions: {baseUrl: 'https://original-vertex-base-url.googleapis.com'},
    });

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://original-vertex-base-url.googleapis.com',
    );
  });
  it('should override base URL with values from getDefaultBaseUrls Mldev', () => {
    setDefaultBaseUrls({
      geminiUrl: 'https://custom-gemini-base-url.googleapis.com',
      vertexUrl: 'https://custom-vertex-base-url.googleapis.com',
    });
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({});

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://custom-gemini-base-url.googleapis.com',
    );
  });
  it('should override base URL with values from getDefaultBaseUrls Vertex', () => {
    setDefaultBaseUrls({
      geminiUrl: 'https://custom-gemini-base-url.googleapis.com',
      vertexUrl: 'https://custom-vertex-base-url.googleapis.com',
    });
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({
      vertexai: true,
    });

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://custom-vertex-base-url.googleapis.com',
    );
  });
  it('should override base URL with values from environment variables Mldev', () => {
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({});

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://gemini-base-url.googleapis.com',
    );
  });
  it('should override base URL with values from environment variables Vertex', () => {
    process.env['GOOGLE_GEMINI_BASE_URL'] =
      'https://gemini-base-url.googleapis.com';
    process.env['GOOGLE_VERTEX_BASE_URL'] =
      'https://vertex-base-url.googleapis.com';

    const client = new GoogleGenAI({
      vertexai: true,
    });

    expect(client['apiClient'].getBaseUrl()).toBe(
      'https://vertex-base-url.googleapis.com',
    );
  });
});
