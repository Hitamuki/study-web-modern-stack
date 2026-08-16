/* eslint-disable */
import { TypedDocumentNode as DocumentNode } from '@graphql-typed-document-node/core';
export type Maybe<T> = T | null;
export type InputMaybe<T> = Maybe<T>;
export type Exact<T extends { [key: string]: unknown }> = { [K in keyof T]: T[K] };
export type MakeOptional<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]?: Maybe<T[SubKey]> };
export type MakeMaybe<T, K extends keyof T> = Omit<T, K> & { [SubKey in K]: Maybe<T[SubKey]> };
export type MakeEmpty<T extends { [key: string]: unknown }, K extends keyof T> = { [_ in K]?: never };
export type Incremental<T> = T | { [P in keyof T]?: P extends ' $fragmentName' | '__typename' ? T[P] : never };
/** All built-in and custom scalars, mapped to their actual values */
export type Scalars = {
  ID: { input: string; output: string; }
  String: { input: string; output: string; }
  Boolean: { input: boolean; output: boolean; }
  Int: { input: number; output: number; }
  Float: { input: number; output: number; }
  timestamptz: { input: any; output: any; }
  uuid: { input: any; output: any; }
};

export type DeleteDummyPayload = {
  __typename?: 'DeleteDummyPayload';
  id: Scalars['String']['output'];
};

export type DummyPayload = {
  __typename?: 'DummyPayload';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

/** Boolean expression to compare columns of type "String". All fields are combined with logical 'AND'. */
export type String_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['String']['input']>;
  _gt?: InputMaybe<Scalars['String']['input']>;
  _gte?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given case-insensitive pattern */
  _ilike?: InputMaybe<Scalars['String']['input']>;
  _in?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column match the given POSIX regular expression, case insensitive */
  _iregex?: InputMaybe<Scalars['String']['input']>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  /** does the column match the given pattern */
  _like?: InputMaybe<Scalars['String']['input']>;
  _lt?: InputMaybe<Scalars['String']['input']>;
  _lte?: InputMaybe<Scalars['String']['input']>;
  _neq?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given case-insensitive pattern */
  _nilike?: InputMaybe<Scalars['String']['input']>;
  _nin?: InputMaybe<Array<Scalars['String']['input']>>;
  /** does the column NOT match the given POSIX regular expression, case insensitive */
  _niregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given pattern */
  _nlike?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given POSIX regular expression, case sensitive */
  _nregex?: InputMaybe<Scalars['String']['input']>;
  /** does the column NOT match the given SQL regular expression */
  _nsimilar?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given POSIX regular expression, case sensitive */
  _regex?: InputMaybe<Scalars['String']['input']>;
  /** does the column match the given SQL regular expression */
  _similar?: InputMaybe<Scalars['String']['input']>;
};

/** ordering argument of a cursor */
export enum Cursor_Ordering {
  /** ascending ordering of the cursor */
  Asc = 'ASC',
  /** descending ordering of the cursor */
  Desc = 'DESC'
}

/** columns and relationships of "dummy" */
export type Dummy = {
  __typename?: 'dummy';
  content: Scalars['String']['output'];
  created_at: Scalars['timestamptz']['output'];
  id: Scalars['uuid']['output'];
  updated_at: Scalars['timestamptz']['output'];
};

/** aggregated selection of "dummy" */
export type Dummy_Aggregate = {
  __typename?: 'dummy_aggregate';
  aggregate?: Maybe<Dummy_Aggregate_Fields>;
  nodes: Array<Dummy>;
};

/** aggregate fields of "dummy" */
export type Dummy_Aggregate_Fields = {
  __typename?: 'dummy_aggregate_fields';
  count: Scalars['Int']['output'];
  max?: Maybe<Dummy_Max_Fields>;
  min?: Maybe<Dummy_Min_Fields>;
};


/** aggregate fields of "dummy" */
export type Dummy_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Dummy_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** Boolean expression to filter rows from the table "dummy". All fields are combined with a logical 'AND'. */
export type Dummy_Bool_Exp = {
  _and?: InputMaybe<Array<Dummy_Bool_Exp>>;
  _not?: InputMaybe<Dummy_Bool_Exp>;
  _or?: InputMaybe<Array<Dummy_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamptz_Comparison_Exp>;
  id?: InputMaybe<Uuid_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamptz_Comparison_Exp>;
};

/** unique or primary key constraints on table "dummy" */
export enum Dummy_Constraint {
  /** unique or primary key constraint on columns "id" */
  DummyPkey = 'dummy_pkey'
}

/** input type for inserting data into table "dummy" */
export type Dummy_Insert_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** aggregate max on columns */
export type Dummy_Max_Fields = {
  __typename?: 'dummy_max_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** aggregate min on columns */
export type Dummy_Min_Fields = {
  __typename?: 'dummy_min_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamptz']['output']>;
  id?: Maybe<Scalars['uuid']['output']>;
  updated_at?: Maybe<Scalars['timestamptz']['output']>;
};

/** response of any mutation on the table "dummy" */
export type Dummy_Mutation_Response = {
  __typename?: 'dummy_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Dummy>;
};

/** on_conflict condition type for table "dummy" */
export type Dummy_On_Conflict = {
  constraint: Dummy_Constraint;
  update_columns?: Array<Dummy_Update_Column>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};

/** Ordering options when selecting data from "dummy". */
export type Dummy_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: dummy */
export type Dummy_Pk_Columns_Input = {
  id: Scalars['uuid']['input'];
};

/** select columns of table "dummy" */
export enum Dummy_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "dummy" */
export type Dummy_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** Streaming cursor of the table "dummy" */
export type Dummy_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Dummy_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Dummy_Stream_Cursor_Value_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamptz']['input']>;
  id?: InputMaybe<Scalars['uuid']['input']>;
  updated_at?: InputMaybe<Scalars['timestamptz']['input']>;
};

/** update columns of table "dummy" */
export enum Dummy_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Dummy_Updates = {
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Dummy_Set_Input>;
  /** filter the rows which have to be updated */
  where: Dummy_Bool_Exp;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** Create dummy record via NestJS domain logic (Hasura Actions) */
  createDummy?: Maybe<DummyPayload>;
  /** Delete dummy record via NestJS domain logic (Hasura Actions) */
  deleteDummy?: Maybe<DeleteDummyPayload>;
  /** delete data from the table: "dummy" */
  delete_dummy?: Maybe<Dummy_Mutation_Response>;
  /** delete single row from the table: "dummy" */
  delete_dummy_by_pk?: Maybe<Dummy>;
  /** insert data into the table: "dummy" */
  insert_dummy?: Maybe<Dummy_Mutation_Response>;
  /** insert a single row into the table: "dummy" */
  insert_dummy_one?: Maybe<Dummy>;
  /** Update dummy record via NestJS domain logic (Hasura Actions) */
  updateDummy?: Maybe<DummyPayload>;
  /** update data of the table: "dummy" */
  update_dummy?: Maybe<Dummy_Mutation_Response>;
  /** update single row of the table: "dummy" */
  update_dummy_by_pk?: Maybe<Dummy>;
  /** update multiples rows of table: "dummy" */
  update_dummy_many?: Maybe<Array<Maybe<Dummy_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootCreateDummyArgs = {
  content: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDeleteDummyArgs = {
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_DummyArgs = {
  where: Dummy_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Dummy_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


/** mutation root */
export type Mutation_RootInsert_DummyArgs = {
  objects: Array<Dummy_Insert_Input>;
  on_conflict?: InputMaybe<Dummy_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Dummy_OneArgs = {
  object: Dummy_Insert_Input;
  on_conflict?: InputMaybe<Dummy_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdateDummyArgs = {
  content: Scalars['String']['input'];
  id: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootUpdate_DummyArgs = {
  _set?: InputMaybe<Dummy_Set_Input>;
  where: Dummy_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Dummy_By_PkArgs = {
  _set?: InputMaybe<Dummy_Set_Input>;
  pk_columns: Dummy_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Dummy_ManyArgs = {
  updates: Array<Dummy_Updates>;
};

/** column ordering options */
export enum Order_By {
  /** in ascending order, nulls last */
  Asc = 'asc',
  /** in ascending order, nulls first */
  AscNullsFirst = 'asc_nulls_first',
  /** in ascending order, nulls last */
  AscNullsLast = 'asc_nulls_last',
  /** in descending order, nulls first */
  Desc = 'desc',
  /** in descending order, nulls first */
  DescNullsFirst = 'desc_nulls_first',
  /** in descending order, nulls last */
  DescNullsLast = 'desc_nulls_last'
}

export type Query_Root = {
  __typename?: 'query_root';
  /** fetch data from the table: "dummy" */
  dummy: Array<Dummy>;
  /** fetch aggregated fields from the table: "dummy" */
  dummy_aggregate: Dummy_Aggregate;
  /** fetch data from the table: "dummy" using primary key columns */
  dummy_by_pk?: Maybe<Dummy>;
};


export type Query_RootDummyArgs = {
  distinct_on?: InputMaybe<Array<Dummy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Dummy_Order_By>>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};


export type Query_RootDummy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Dummy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Dummy_Order_By>>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};


export type Query_RootDummy_By_PkArgs = {
  id: Scalars['uuid']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "dummy" */
  dummy: Array<Dummy>;
  /** fetch aggregated fields from the table: "dummy" */
  dummy_aggregate: Dummy_Aggregate;
  /** fetch data from the table: "dummy" using primary key columns */
  dummy_by_pk?: Maybe<Dummy>;
  /** fetch data from the table in a streaming manner: "dummy" */
  dummy_stream: Array<Dummy>;
};


export type Subscription_RootDummyArgs = {
  distinct_on?: InputMaybe<Array<Dummy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Dummy_Order_By>>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};


export type Subscription_RootDummy_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Dummy_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Dummy_Order_By>>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};


export type Subscription_RootDummy_By_PkArgs = {
  id: Scalars['uuid']['input'];
};


export type Subscription_RootDummy_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Dummy_Stream_Cursor_Input>>;
  where?: InputMaybe<Dummy_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamptz". All fields are combined with logical 'AND'. */
export type Timestamptz_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamptz']['input']>;
  _gt?: InputMaybe<Scalars['timestamptz']['input']>;
  _gte?: InputMaybe<Scalars['timestamptz']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamptz']['input']>;
  _lte?: InputMaybe<Scalars['timestamptz']['input']>;
  _neq?: InputMaybe<Scalars['timestamptz']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamptz']['input']>>;
};

/** Boolean expression to compare columns of type "uuid". All fields are combined with logical 'AND'. */
export type Uuid_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['uuid']['input']>;
  _gt?: InputMaybe<Scalars['uuid']['input']>;
  _gte?: InputMaybe<Scalars['uuid']['input']>;
  _in?: InputMaybe<Array<Scalars['uuid']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['uuid']['input']>;
  _lte?: InputMaybe<Scalars['uuid']['input']>;
  _neq?: InputMaybe<Scalars['uuid']['input']>;
  _nin?: InputMaybe<Array<Scalars['uuid']['input']>>;
};

export type DummyListQueryVariables = Exact<{ [key: string]: never; }>;


export type DummyListQuery = { __typename?: 'query_root', dummy: Array<{ __typename?: 'dummy', id: any, content: string, created_at: any, updated_at: any }> };

export type CreateDummyMutationVariables = Exact<{
  content: Scalars['String']['input'];
}>;


export type CreateDummyMutation = { __typename?: 'mutation_root', createDummy?: { __typename?: 'DummyPayload', id: string, content: string, createdAt: string, updatedAt: string } | null };

export type UpdateDummyMutationVariables = Exact<{
  id: Scalars['String']['input'];
  content: Scalars['String']['input'];
}>;


export type UpdateDummyMutation = { __typename?: 'mutation_root', updateDummy?: { __typename?: 'DummyPayload', id: string, content: string, createdAt: string, updatedAt: string } | null };

export type DeleteDummyMutationVariables = Exact<{
  id: Scalars['String']['input'];
}>;


export type DeleteDummyMutation = { __typename?: 'mutation_root', deleteDummy?: { __typename?: 'DeleteDummyPayload', id: string } | null };


export const DummyListDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"DummyList"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"dummy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"updated_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<DummyListQuery, DummyListQueryVariables>;
export const CreateDummyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"CreateDummy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"createDummy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<CreateDummyMutation, CreateDummyMutationVariables>;
export const UpdateDummyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"UpdateDummy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}},{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"content"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"updateDummy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}},{"kind":"Argument","name":{"kind":"Name","value":"content"},"value":{"kind":"Variable","name":{"kind":"Name","value":"content"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"createdAt"}},{"kind":"Field","name":{"kind":"Name","value":"updatedAt"}}]}}]}}]} as unknown as DocumentNode<UpdateDummyMutation, UpdateDummyMutationVariables>;
export const DeleteDummyDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"mutation","name":{"kind":"Name","value":"DeleteDummy"},"variableDefinitions":[{"kind":"VariableDefinition","variable":{"kind":"Variable","name":{"kind":"Name","value":"id"}},"type":{"kind":"NonNullType","type":{"kind":"NamedType","name":{"kind":"Name","value":"String"}}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"deleteDummy"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"id"},"value":{"kind":"Variable","name":{"kind":"Name","value":"id"}}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}}]}}]}}]} as unknown as DocumentNode<DeleteDummyMutation, DeleteDummyMutationVariables>;