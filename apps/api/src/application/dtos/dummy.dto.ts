/**
 * ダミーレコードの UseCase 入出力 DTO
 */
export interface CreateDummyDto {
  /** Supabase Auth のユーザー ID（UUID）。呼び出し元の入力ではなく認証情報から渡す */
  ownerId: string;
  content: string;
}

export interface UpdateDummyDto {
  id: string;
  content: string;
}

export interface DeleteDummyDto {
  id: string;
}
