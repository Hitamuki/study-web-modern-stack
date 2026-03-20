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
  timestamp: { input: any; output: any; }
};

export type CreateMemoResponse = {
  __typename?: 'CreateMemoResponse';
  content: Scalars['String']['output'];
  createdAt: Scalars['String']['output'];
  id: Scalars['String']['output'];
  updatedAt: Scalars['String']['output'];
};

/** Boolean expression to compare columns of type "Int". All fields are combined with logical 'AND'. */
export type Int_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['Int']['input']>;
  _gt?: InputMaybe<Scalars['Int']['input']>;
  _gte?: InputMaybe<Scalars['Int']['input']>;
  _in?: InputMaybe<Array<Scalars['Int']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['Int']['input']>;
  _lte?: InputMaybe<Scalars['Int']['input']>;
  _neq?: InputMaybe<Scalars['Int']['input']>;
  _nin?: InputMaybe<Array<Scalars['Int']['input']>>;
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

/** columns and relationships of "memos" */
export type Memos = {
  __typename?: 'memos';
  content: Scalars['String']['output'];
  created_at: Scalars['timestamp']['output'];
  id: Scalars['Int']['output'];
  updated_at: Scalars['timestamp']['output'];
};

/** aggregated selection of "memos" */
export type Memos_Aggregate = {
  __typename?: 'memos_aggregate';
  aggregate?: Maybe<Memos_Aggregate_Fields>;
  nodes: Array<Memos>;
};

/** aggregate fields of "memos" */
export type Memos_Aggregate_Fields = {
  __typename?: 'memos_aggregate_fields';
  avg?: Maybe<Memos_Avg_Fields>;
  count: Scalars['Int']['output'];
  max?: Maybe<Memos_Max_Fields>;
  min?: Maybe<Memos_Min_Fields>;
  stddev?: Maybe<Memos_Stddev_Fields>;
  stddev_pop?: Maybe<Memos_Stddev_Pop_Fields>;
  stddev_samp?: Maybe<Memos_Stddev_Samp_Fields>;
  sum?: Maybe<Memos_Sum_Fields>;
  var_pop?: Maybe<Memos_Var_Pop_Fields>;
  var_samp?: Maybe<Memos_Var_Samp_Fields>;
  variance?: Maybe<Memos_Variance_Fields>;
};


/** aggregate fields of "memos" */
export type Memos_Aggregate_FieldsCountArgs = {
  columns?: InputMaybe<Array<Memos_Select_Column>>;
  distinct?: InputMaybe<Scalars['Boolean']['input']>;
};

/** aggregate avg on columns */
export type Memos_Avg_Fields = {
  __typename?: 'memos_avg_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Boolean expression to filter rows from the table "memos". All fields are combined with a logical 'AND'. */
export type Memos_Bool_Exp = {
  _and?: InputMaybe<Array<Memos_Bool_Exp>>;
  _not?: InputMaybe<Memos_Bool_Exp>;
  _or?: InputMaybe<Array<Memos_Bool_Exp>>;
  content?: InputMaybe<String_Comparison_Exp>;
  created_at?: InputMaybe<Timestamp_Comparison_Exp>;
  id?: InputMaybe<Int_Comparison_Exp>;
  updated_at?: InputMaybe<Timestamp_Comparison_Exp>;
};

/** unique or primary key constraints on table "memos" */
export enum Memos_Constraint {
  /** unique or primary key constraint on columns "id" */
  MemosPkey = 'memos_pkey'
}

/** input type for incrementing numeric columns in table "memos" */
export type Memos_Inc_Input = {
  id?: InputMaybe<Scalars['Int']['input']>;
};

/** input type for inserting data into table "memos" */
export type Memos_Insert_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate max on columns */
export type Memos_Max_Fields = {
  __typename?: 'memos_max_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
};

/** aggregate min on columns */
export type Memos_Min_Fields = {
  __typename?: 'memos_min_fields';
  content?: Maybe<Scalars['String']['output']>;
  created_at?: Maybe<Scalars['timestamp']['output']>;
  id?: Maybe<Scalars['Int']['output']>;
  updated_at?: Maybe<Scalars['timestamp']['output']>;
};

/** response of any mutation on the table "memos" */
export type Memos_Mutation_Response = {
  __typename?: 'memos_mutation_response';
  /** number of rows affected by the mutation */
  affected_rows: Scalars['Int']['output'];
  /** data from the rows affected by the mutation */
  returning: Array<Memos>;
};

/** on_conflict condition type for table "memos" */
export type Memos_On_Conflict = {
  constraint: Memos_Constraint;
  update_columns?: Array<Memos_Update_Column>;
  where?: InputMaybe<Memos_Bool_Exp>;
};

/** Ordering options when selecting data from "memos". */
export type Memos_Order_By = {
  content?: InputMaybe<Order_By>;
  created_at?: InputMaybe<Order_By>;
  id?: InputMaybe<Order_By>;
  updated_at?: InputMaybe<Order_By>;
};

/** primary key columns input for table: memos */
export type Memos_Pk_Columns_Input = {
  id: Scalars['Int']['input'];
};

/** select columns of table "memos" */
export enum Memos_Select_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

/** input type for updating data in table "memos" */
export type Memos_Set_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate stddev on columns */
export type Memos_Stddev_Fields = {
  __typename?: 'memos_stddev_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_pop on columns */
export type Memos_Stddev_Pop_Fields = {
  __typename?: 'memos_stddev_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate stddev_samp on columns */
export type Memos_Stddev_Samp_Fields = {
  __typename?: 'memos_stddev_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** Streaming cursor of the table "memos" */
export type Memos_Stream_Cursor_Input = {
  /** Stream column input with initial value */
  initial_value: Memos_Stream_Cursor_Value_Input;
  /** cursor ordering */
  ordering?: InputMaybe<Cursor_Ordering>;
};

/** Initial value of the column from where the streaming should start */
export type Memos_Stream_Cursor_Value_Input = {
  content?: InputMaybe<Scalars['String']['input']>;
  created_at?: InputMaybe<Scalars['timestamp']['input']>;
  id?: InputMaybe<Scalars['Int']['input']>;
  updated_at?: InputMaybe<Scalars['timestamp']['input']>;
};

/** aggregate sum on columns */
export type Memos_Sum_Fields = {
  __typename?: 'memos_sum_fields';
  id?: Maybe<Scalars['Int']['output']>;
};

/** update columns of table "memos" */
export enum Memos_Update_Column {
  /** column name */
  Content = 'content',
  /** column name */
  CreatedAt = 'created_at',
  /** column name */
  Id = 'id',
  /** column name */
  UpdatedAt = 'updated_at'
}

export type Memos_Updates = {
  /** increments the numeric columns with given value of the filtered values */
  _inc?: InputMaybe<Memos_Inc_Input>;
  /** sets the columns of the filtered rows to the given values */
  _set?: InputMaybe<Memos_Set_Input>;
  /** filter the rows which have to be updated */
  where: Memos_Bool_Exp;
};

/** aggregate var_pop on columns */
export type Memos_Var_Pop_Fields = {
  __typename?: 'memos_var_pop_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate var_samp on columns */
export type Memos_Var_Samp_Fields = {
  __typename?: 'memos_var_samp_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** aggregate variance on columns */
export type Memos_Variance_Fields = {
  __typename?: 'memos_variance_fields';
  id?: Maybe<Scalars['Float']['output']>;
};

/** mutation root */
export type Mutation_Root = {
  __typename?: 'mutation_root';
  /** Create memo via NestJS domain logic (Hasura Actions) */
  createMemo?: Maybe<CreateMemoResponse>;
  /** delete data from the table: "memos" */
  delete_memos?: Maybe<Memos_Mutation_Response>;
  /** delete single row from the table: "memos" */
  delete_memos_by_pk?: Maybe<Memos>;
  /** insert data into the table: "memos" */
  insert_memos?: Maybe<Memos_Mutation_Response>;
  /** insert a single row into the table: "memos" */
  insert_memos_one?: Maybe<Memos>;
  /** update data of the table: "memos" */
  update_memos?: Maybe<Memos_Mutation_Response>;
  /** update single row of the table: "memos" */
  update_memos_by_pk?: Maybe<Memos>;
  /** update multiples rows of table: "memos" */
  update_memos_many?: Maybe<Array<Maybe<Memos_Mutation_Response>>>;
};


/** mutation root */
export type Mutation_RootCreateMemoArgs = {
  content: Scalars['String']['input'];
};


/** mutation root */
export type Mutation_RootDelete_MemosArgs = {
  where: Memos_Bool_Exp;
};


/** mutation root */
export type Mutation_RootDelete_Memos_By_PkArgs = {
  id: Scalars['Int']['input'];
};


/** mutation root */
export type Mutation_RootInsert_MemosArgs = {
  objects: Array<Memos_Insert_Input>;
  on_conflict?: InputMaybe<Memos_On_Conflict>;
};


/** mutation root */
export type Mutation_RootInsert_Memos_OneArgs = {
  object: Memos_Insert_Input;
  on_conflict?: InputMaybe<Memos_On_Conflict>;
};


/** mutation root */
export type Mutation_RootUpdate_MemosArgs = {
  _inc?: InputMaybe<Memos_Inc_Input>;
  _set?: InputMaybe<Memos_Set_Input>;
  where: Memos_Bool_Exp;
};


/** mutation root */
export type Mutation_RootUpdate_Memos_By_PkArgs = {
  _inc?: InputMaybe<Memos_Inc_Input>;
  _set?: InputMaybe<Memos_Set_Input>;
  pk_columns: Memos_Pk_Columns_Input;
};


/** mutation root */
export type Mutation_RootUpdate_Memos_ManyArgs = {
  updates: Array<Memos_Updates>;
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
  /** fetch data from the table: "memos" */
  memos: Array<Memos>;
  /** fetch aggregated fields from the table: "memos" */
  memos_aggregate: Memos_Aggregate;
  /** fetch data from the table: "memos" using primary key columns */
  memos_by_pk?: Maybe<Memos>;
};


export type Query_RootMemosArgs = {
  distinct_on?: InputMaybe<Array<Memos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Memos_Order_By>>;
  where?: InputMaybe<Memos_Bool_Exp>;
};


export type Query_RootMemos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Memos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Memos_Order_By>>;
  where?: InputMaybe<Memos_Bool_Exp>;
};


export type Query_RootMemos_By_PkArgs = {
  id: Scalars['Int']['input'];
};

export type Subscription_Root = {
  __typename?: 'subscription_root';
  /** fetch data from the table: "memos" */
  memos: Array<Memos>;
  /** fetch aggregated fields from the table: "memos" */
  memos_aggregate: Memos_Aggregate;
  /** fetch data from the table: "memos" using primary key columns */
  memos_by_pk?: Maybe<Memos>;
  /** fetch data from the table in a streaming manner: "memos" */
  memos_stream: Array<Memos>;
};


export type Subscription_RootMemosArgs = {
  distinct_on?: InputMaybe<Array<Memos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Memos_Order_By>>;
  where?: InputMaybe<Memos_Bool_Exp>;
};


export type Subscription_RootMemos_AggregateArgs = {
  distinct_on?: InputMaybe<Array<Memos_Select_Column>>;
  limit?: InputMaybe<Scalars['Int']['input']>;
  offset?: InputMaybe<Scalars['Int']['input']>;
  order_by?: InputMaybe<Array<Memos_Order_By>>;
  where?: InputMaybe<Memos_Bool_Exp>;
};


export type Subscription_RootMemos_By_PkArgs = {
  id: Scalars['Int']['input'];
};


export type Subscription_RootMemos_StreamArgs = {
  batch_size: Scalars['Int']['input'];
  cursor: Array<InputMaybe<Memos_Stream_Cursor_Input>>;
  where?: InputMaybe<Memos_Bool_Exp>;
};

/** Boolean expression to compare columns of type "timestamp". All fields are combined with logical 'AND'. */
export type Timestamp_Comparison_Exp = {
  _eq?: InputMaybe<Scalars['timestamp']['input']>;
  _gt?: InputMaybe<Scalars['timestamp']['input']>;
  _gte?: InputMaybe<Scalars['timestamp']['input']>;
  _in?: InputMaybe<Array<Scalars['timestamp']['input']>>;
  _is_null?: InputMaybe<Scalars['Boolean']['input']>;
  _lt?: InputMaybe<Scalars['timestamp']['input']>;
  _lte?: InputMaybe<Scalars['timestamp']['input']>;
  _neq?: InputMaybe<Scalars['timestamp']['input']>;
  _nin?: InputMaybe<Array<Scalars['timestamp']['input']>>;
};

export type GetMemosQueryVariables = Exact<{ [key: string]: never; }>;


export type GetMemosQuery = { __typename?: 'query_root', memos: Array<{ __typename?: 'memos', id: number, content: string, created_at: any, updated_at: any }> };


export const GetMemosDocument = {"kind":"Document","definitions":[{"kind":"OperationDefinition","operation":"query","name":{"kind":"Name","value":"GetMemos"},"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"memos"},"arguments":[{"kind":"Argument","name":{"kind":"Name","value":"order_by"},"value":{"kind":"ObjectValue","fields":[{"kind":"ObjectField","name":{"kind":"Name","value":"created_at"},"value":{"kind":"EnumValue","value":"desc"}}]}}],"selectionSet":{"kind":"SelectionSet","selections":[{"kind":"Field","name":{"kind":"Name","value":"id"}},{"kind":"Field","name":{"kind":"Name","value":"content"}},{"kind":"Field","name":{"kind":"Name","value":"created_at"}},{"kind":"Field","name":{"kind":"Name","value":"updated_at"}}]}}]}}]} as unknown as DocumentNode<GetMemosQuery, GetMemosQueryVariables>;