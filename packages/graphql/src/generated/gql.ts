/* eslint-disable */
import * as types from './graphql';
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';

/**
 * Map of all GraphQL operations in the project.
 *
 * This map has several performance disadvantages:
 * 1. It is not tree-shakeable, so it will include all operations in the project.
 * 2. It is not minifiable, so the string of a GraphQL query will be multiple times inside the bundle.
 * 3. It does not support dead code elimination, so it will add unused operations.
 *
 * Therefore it is highly recommended to use the babel or swc plugin for production.
 * Learn more about it here: https://the-guild.dev/graphql/codegen/plugins/presets/preset-client#reducing-bundle-size
 */
type Documents = {
    "\n  query DummyList {\n    dummy(order_by: { updated_at: desc }) {\n      id\n      content\n      created_at\n      updated_at\n    }\n  }\n": typeof types.DummyListDocument,
    "\n  mutation CreateDummy($content: String!) {\n    createDummy(content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.CreateDummyDocument,
    "\n  mutation UpdateDummy($id: String!, $content: String!) {\n    updateDummy(id: $id, content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n": typeof types.UpdateDummyDocument,
    "\n  mutation DeleteDummy($id: String!) {\n    deleteDummy(id: $id) {\n      id\n    }\n  }\n": typeof types.DeleteDummyDocument,
};
const documents: Documents = {
    "\n  query DummyList {\n    dummy(order_by: { updated_at: desc }) {\n      id\n      content\n      created_at\n      updated_at\n    }\n  }\n": types.DummyListDocument,
    "\n  mutation CreateDummy($content: String!) {\n    createDummy(content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n": types.CreateDummyDocument,
    "\n  mutation UpdateDummy($id: String!, $content: String!) {\n    updateDummy(id: $id, content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n": types.UpdateDummyDocument,
    "\n  mutation DeleteDummy($id: String!) {\n    deleteDummy(id: $id) {\n      id\n    }\n  }\n": types.DeleteDummyDocument,
};

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 *
 *
 * @example
 * ```ts
 * const query = gql(`query GetUser($id: ID!) { user(id: $id) { name } }`);
 * ```
 *
 * The query argument is unknown!
 * Please regenerate the types.
 */
export function gql(source: string): unknown;

/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  query DummyList {\n    dummy(order_by: { updated_at: desc }) {\n      id\n      content\n      created_at\n      updated_at\n    }\n  }\n"): (typeof documents)["\n  query DummyList {\n    dummy(order_by: { updated_at: desc }) {\n      id\n      content\n      created_at\n      updated_at\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation CreateDummy($content: String!) {\n    createDummy(content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation CreateDummy($content: String!) {\n    createDummy(content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation UpdateDummy($id: String!, $content: String!) {\n    updateDummy(id: $id, content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n"): (typeof documents)["\n  mutation UpdateDummy($id: String!, $content: String!) {\n    updateDummy(id: $id, content: $content) {\n      id\n      content\n      createdAt\n      updatedAt\n    }\n  }\n"];
/**
 * The gql function is used to parse GraphQL queries into a document that can be used by GraphQL clients.
 */
export function gql(source: "\n  mutation DeleteDummy($id: String!) {\n    deleteDummy(id: $id) {\n      id\n    }\n  }\n"): (typeof documents)["\n  mutation DeleteDummy($id: String!) {\n    deleteDummy(id: $id) {\n      id\n    }\n  }\n"];

export function gql(source: string) {
  return (documents as any)[source] ?? {};
}

export type DocumentType<TDocumentNode extends DocumentNode<any, any>> = TDocumentNode extends DocumentNode<  infer TType,  any>  ? TType  : never;