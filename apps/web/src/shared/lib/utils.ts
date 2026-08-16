import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * shadcn/ui が生成するコンポーネントが参照するクラス結合ヘルパー。
 *
 * clsx が条件付きクラスを畳み、tailwind-merge が競合するユーティリティ
 * （`p-2` と `p-4` など）の後勝ちを保証する。呼び出し側から className を
 * 上書きできるのはこの 2 段があるため。
 */
export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs));
