/**
 * 日時を design/app.pen の表記（`2026-08-15 09:12`）に合わせて整形する。
 * Hasura はオフセット付きで返すため、表示はブラウザのローカル時刻になる。
 */
export const formatDateTime = (value: string): string => {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const pad = (n: number) => String(n).padStart(2, "0");
  return (
    `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}` +
    ` ${pad(date.getHours())}:${pad(date.getMinutes())}`
  );
};
