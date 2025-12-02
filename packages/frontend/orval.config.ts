import { defineConfig } from 'orval';

export default defineConfig({
  api: {
    input: {
      target: '../backend/openapi.json',
      validation: true,
    },
    output: {
      mode: 'tags-split',
      target: 'src/api/generated',
      baseUrl: '/api/v1',
      schemas: 'src/api/schemas',
      client: 'react-query',
      mock: true,
    },
  },
});