import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

export interface SelectNativeProps
  extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** サイズバリアント */
  selectSize?: "sm" | "default" | "lg"
}

const SelectNative = React.forwardRef<HTMLSelectElement, SelectNativeProps>(
  ({ className, children, selectSize = "default", ...props }, ref) => {
    const sizeClasses = {
      sm: "h-8 text-[13px] pr-8",
      default: "h-10 text-sm pr-10",
      lg: "h-11 text-sm pr-11",
    }

    return (
      <div className="relative">
        <select
          className={cn(
            // ベーススタイル
            "w-full appearance-none rounded-lg",
            // 境界線（鮮明でシャープ）
            "border border-gray-200/80 bg-white/80",
            "ring-1 ring-gray-900/[0.04]",
            // パディング（左側は通常、右側はアイコン用に広め）
            "pl-3.5",
            sizeClasses[selectSize],
            // タイポグラフィ（天地中央）
            "font-normal text-gray-900",
            "leading-none tracking-[-0.01em]",
            // トランジション
            "transition-all duration-200 ease-out",
            // ホバー
            "hover:border-gray-300 hover:bg-gray-50/50",
            "hover:ring-gray-900/[0.08]",
            // フォーカス（Apple標準のフォーカスリング）
            "focus:outline-none focus:border-blue-500/50",
            "focus:ring-[3px] focus:ring-blue-500/20",
            "focus:bg-white",
            // 無効状態
            "disabled:cursor-not-allowed disabled:opacity-50",
            "disabled:bg-gray-100 disabled:border-gray-200",
            // カーソル
            "cursor-pointer",
            className
          )}
          ref={ref}
          {...props}
        >
          {children}
        </select>
        {/* Chevronアイコン */}
        <div className={cn(
          "pointer-events-none absolute inset-y-0 right-0 flex items-center",
          selectSize === "sm" ? "pr-2.5" : selectSize === "lg" ? "pr-4" : "pr-3.5"
        )}>
          <ChevronDown 
            className={cn(
              "text-gray-400 transition-colors",
              selectSize === "sm" ? "h-3.5 w-3.5" : "h-4 w-4"
            )}
            strokeWidth={2}
          />
        </div>
      </div>
    )
  }
)
SelectNative.displayName = "SelectNative"

export { SelectNative }

