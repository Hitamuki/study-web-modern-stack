import { readFile } from "node:fs/promises";
import { extname, join, normalize } from "node:path";
import { BrowserWindow, app, protocol } from "electron";

/**
 * renderer を読み込むカスタムスキーム。
 *
 * `file://` で読み込むとオリジンが無く、次の 2 つが同時に壊れる。
 *   - パスベースのルーティングが成立しない（Discussion #75）
 *   - localStorage が不安定になり、Supabase の getSession が null を返す
 *
 * 正規のオリジンを持つスキームを登録して、両方をまとめて解決する。
 */
const APP_SCHEME = "app";

// standard: true にすると http(s) と同じ URL 解釈になり、オリジンが付く。
// secure: true で Secure Context として扱われ、localStorage などが使える。
protocol.registerSchemesAsPrivileged([
  { scheme: APP_SCHEME, privileges: { standard: true, secure: true, supportFetchAPI: true } },
]);

const MIME_TYPES: Record<string, string> = {
  ".html": "text/html",
  ".js": "text/javascript",
  ".css": "text/css",
  ".json": "application/json",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".woff2": "font/woff2",
};

/** renderer のビルド成果物を app:// から配る */
function registerAppProtocol(): void {
  const rendererRoot = join(__dirname, "../renderer");

  protocol.handle(APP_SCHEME, async (request) => {
    const { pathname } = new URL(request.url);
    // ディレクトリ外への参照を防ぐ（../ を含むパスを弾く）
    const candidate = normalize(join(rendererRoot, decodeURIComponent(pathname)));
    const isInsideRoot = candidate.startsWith(rendererRoot);
    const hasExtension = extname(candidate) !== "";

    // 拡張子が無いパスはルーティングの対象なので index.html を返す（SPA のフォールバック）。
    // これが無いと /login をリロードしたときに 404 になる。
    const target = isInsideRoot && hasExtension ? candidate : join(rendererRoot, "index.html");

    try {
      const body = await readFile(target);
      return new Response(body, {
        headers: { "content-type": MIME_TYPES[extname(target)] ?? "application/octet-stream" },
      });
    } catch {
      return new Response("Not Found", { status: 404 });
    }
  });
}

function createWindow(): void {
  const win = new BrowserWindow({
    width: 900,
    height: 670,
    webPreferences: {
      preload: join(__dirname, "../preload/index.js"),
      sandbox: false,
    },
  });

  // 読み込みの完了は待たない（ウィンドウは先に表示される）
  if (process.env.ELECTRON_RENDERER_URL) {
    void win.loadURL(process.env.ELECTRON_RENDERER_URL);
  } else {
    void win.loadURL(`${APP_SCHEME}://-/`);
  }
}

void app.whenReady().then(() => {
  registerAppProtocol();
  createWindow();
  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) createWindow();
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});
