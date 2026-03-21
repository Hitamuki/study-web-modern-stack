import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    'http://localhost:8080/v1/graphql': {
      headers: {
        'x-hasura-admin-secret': 'myadminsecretkey'
      }
    }
  },
  // Scan all apps and packages for documents
  documents: ['../../apps/*/src/**/*.{ts,tsx}', '../../packages/*/src/**/*.{ts,tsx}'],
  generates: {
    './src/generated/': {
      preset: 'client',
      plugins: [],
      presetConfig: {
        gqlTagName: 'gql',
      }
    }
  },
  ignoreNoDocuments: true,
};

export default config;
