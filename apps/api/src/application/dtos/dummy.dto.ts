/**
 * ダミーレコードの UseCase 入出力 DTO
 */
export interface CreateDummyDto {
  content: string;
}

export interface UpdateDummyDto {
  id: string;
  content: string;
}

export interface DeleteDummyDto {
  id: string;
}
