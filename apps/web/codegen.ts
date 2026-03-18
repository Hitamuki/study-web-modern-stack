import { CodegenConfig } from '@graphql-codegen/cli';

const config: CodegenConfig = {
  schema: {
    'http://localhost:8080/v1/graphql': {
      headers: {
        'x-hasura-admin-secret': 'myadminsecretkey'
      }
    }
  },
  documents: ['src/**/*.{ts,tsx}'],
  generates: {
    './src/shared/graphql/': {
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
