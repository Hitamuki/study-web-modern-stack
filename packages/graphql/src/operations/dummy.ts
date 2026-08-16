import { gql } from "../generated";

/**
 * SCR-001 ダミー画面が使う GraphQL オペレーション。
 *
 * Web / Mobile / Desktop の 3 アプリが同じ定義を読むため、ここに 1 か所だけ置く。
 * 参照は Hasura が自動生成するクエリ、書き込みは NestJS のドメインロジックを通す
 * Hasura Actions（createDummy / updateDummy / deleteDummy）を使う。
 */

export const DUMMY_LIST = gql(`
  query DummyList {
    dummy(order_by: { updated_at: desc }) {
      id
      content
      created_at
      updated_at
    }
  }
`);

export const CREATE_DUMMY = gql(`
  mutation CreateDummy($content: String!) {
    createDummy(content: $content) {
      id
      content
      createdAt
      updatedAt
    }
  }
`);

export const UPDATE_DUMMY = gql(`
  mutation UpdateDummy($id: String!, $content: String!) {
    updateDummy(id: $id, content: $content) {
      id
      content
      createdAt
      updatedAt
    }
  }
`);

export const DELETE_DUMMY = gql(`
  mutation DeleteDummy($id: String!) {
    deleteDummy(id: $id) {
      id
    }
  }
`);

/**
 * 一覧 1 件分の表示用の型。
 * 生成された型の `uuid` / `timestamptz` スカラーは any 相当になるため、
 * 画面に渡す形はここで明示しておく。
 */
export interface DummyItem {
  id: string;
  content: string;
  created_at: string;
  updated_at: string;
}
