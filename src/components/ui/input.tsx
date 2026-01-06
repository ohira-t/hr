import * as React from "react"

import { cn } from "@/lib/utils"

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // ベーススタイル
          "flex w-full rounded-lg",
          // サイズ・パディング（天地中央）
          "h-10 px-3.5",
          // 境界線（SelectNativeと統一）
          "border border-gray-200/80 bg-white/80",
          "ring-1 ring-gray-900/[0.04]",
          // タイポグラフィ（天地中央）
          "text-sm font-normal text-gray-900",
          "leading-none tracking-[-0.01em]",
          // プレースホルダー
          "placeholder:text-gray-400",
          // ファイル入力
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          // トランジション
          "transition-all duration-200 ease-out",
          // ホバー
          "hover:border-gray-300 hover:bg-gray-50/50",
          "hover:ring-gray-900/[0.08]",
          // フォーカス（Apple標準）
          "focus:outline-none focus:border-blue-500/50",
          "focus:ring-[3px] focus:ring-blue-500/20",
          "focus:bg-white",
          // 無効状態
          "disabled:cursor-not-allowed disabled:opacity-50",
          "disabled:bg-gray-100 disabled:border-gray-200",
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input.displayName = "Input"

export { Input }

