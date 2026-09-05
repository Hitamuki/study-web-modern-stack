/**
 * Resend の疎通確認スクリプト（Issue #71 / Discussion #70 の反証条件 2・3）
 *
 * **アプリの機能ではない。** 認証メールを送るのは Supabase のサーバーで、
 * `apps/api` も `apps/web` も送信処理を持たない（Discussion #70 の H1）。
 * これは「Resend のアカウントで実際に送れるか」を人手で確かめるための道具。
 *
 * 実行:
 *   make resend-test
 *
 * 秘匿値はすべて `.env`（.gitignore 済み）から読む。ここに直接書かない。
 */
import { Resend } from "resend";

/** 未設定なら理由を出して止める。後で失敗すると原因が分かりにくいため。 */
const required = (name, hint) => {
  const value = process.env[name];
  if (!value) {
    console.error(`エラー: 環境変数 ${name} が未設定です。`);
    console.error(`  ${hint}`);
    console.error("  .env.example の「認証メールの送信」の節を参照してください。");
    process.exit(1);
  }
  return value;
};

const apiKey = required("RESEND_API_KEY", "Resend のダッシュボード > API Keys で発行します。");
const from = required("RESEND_FROM", "ドメイン未検証のうちは onboarding@resend.dev のみ使えます。");
const to = required(
  "RESEND_TEST_TO",
  "ドメイン未検証のうちは Resend アカウントの登録アドレスのみ届きます。",
);

const resend = new Resend(apiKey);

const { data, error } = await resend.emails.send({
  from,
  to,
  subject: "[study-web-modern-stack] Resend 疎通確認",
  html: `<p>Resend の疎通確認です（Issue #71）。</p>
<p>このメールが届いた場合、Resend のアカウントから実際に送信できることが確認できます。<br>
ただし <strong>送信ドメインを検証するまで、宛先は Resend アカウントの登録アドレスに限られます</strong>。</p>
<p>送信日時: ${new Date().toISOString()}</p>`,
});

if (error) {
  console.error("送信に失敗しました。");
  console.error(`  name:    ${error.name ?? "(不明)"}`);
  console.error(`  message: ${error.message ?? "(不明)"}`);
  // 最頻の失敗。ドメイン未検証で登録アドレス以外へ送ろうとした場合。
  if (String(error.message ?? "").includes("testing emails")) {
    console.error("");
    console.error(
      "  → ドメインが未検証のため、Resend アカウントの登録アドレス宛にしか送れません。",
    );
    console.error(
      "     .env の RESEND_TEST_TO を登録アドレスにするか、ドメインを検証してください。",
    );
  }
  process.exit(1);
}

console.log("送信しました。");
console.log(`  id:   ${data?.id}`);
console.log(`  from: ${from}`);
console.log(`  to:   ${to}`);
console.log("");
console.log(
  "受信トレイと迷惑メールフォルダの両方を確認してください（Discussion #70 の反証条件 3）。",
);
