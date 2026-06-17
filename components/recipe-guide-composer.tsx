"use client"

import { useActionState, useEffect } from "react"
import { createRecipeGuide } from "@/app/actions/recipe-guides"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { RichTextEditor } from "@/components/rich-text-editor"
import { X, Send } from "lucide-react"

export function RecipeGuideComposer({
  authorName,
  onClose,
}: {
  authorName: string
  onClose: () => void
}) {
  const [state, formAction, pending] = useActionState(createRecipeGuide, undefined)

  useEffect(() => {
    if (state?.success) setTimeout(onClose, 300)
  }, [state?.success, onClose])

  const today = new Date().toLocaleDateString("ko-KR", {
    year: "numeric",
    month: "long",
    day: "numeric",
    weekday: "long",
  })

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />

      <div className="relative z-10 flex h-[90vh] w-full max-w-3xl flex-col rounded-2xl border border-border bg-background shadow-2xl">
        {/* 상단 헤더 */}
        <div className="flex items-center justify-between border-b border-border px-5 py-3">
          <span className="text-sm font-semibold">새 레시피 가이드 작성</span>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form action={formAction} className="flex flex-1 flex-col overflow-hidden">
          {/* 이메일 메타 필드 */}
          <div className="shrink-0 border-b border-border">
            {/* 보내는 이 */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-2.5">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">보내는 이</span>
              <span className="text-sm">{authorName}</span>
            </div>

            {/* 날짜 */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-2.5">
              <span className="w-16 shrink-0 text-xs text-muted-foreground">날짜</span>
              <span className="text-sm text-muted-foreground">{today}</span>
            </div>

            {/* 분류 */}
            <div className="flex items-center gap-3 border-b border-border/50 px-5 py-2.5">
              <label htmlFor="rg-category" className="w-16 shrink-0 text-xs text-muted-foreground">
                분류
              </label>
              <Input
                id="rg-category"
                name="category"
                placeholder="예) 전처리, 조리, 위생 (선택)"
                className="h-auto border-none bg-transparent p-0 text-sm shadow-none focus-visible:ring-0"
              />
            </div>

            {/* 제목 */}
            <div className="flex items-center gap-3 px-5 py-2.5">
              <label htmlFor="rg-title" className="w-16 shrink-0 text-xs text-muted-foreground">
                제목
              </label>
              <Input
                id="rg-title"
                name="title"
                placeholder="레시피 가이드 제목을 입력하세요"
                required
                autoFocus
                className="h-auto border-none bg-transparent p-0 text-sm font-medium shadow-none focus-visible:ring-0"
              />
            </div>
          </div>

          {/* 리치 텍스트 에디터 본문 */}
          <div className="flex flex-1 flex-col overflow-hidden px-5 py-4">
            <RichTextEditor
              name="content"
              placeholder="레시피 가이드 내용을 작성하세요..."
            />
          </div>

          {/* 에러 */}
          {state?.error && (
            <p className="px-5 pb-2 text-xs text-destructive" role="alert">
              {state.error}
            </p>
          )}

          {/* 하단 툴바 */}
          <div className="flex items-center justify-between border-t border-border px-5 py-3">
            <Button type="button" variant="ghost" size="sm" onClick={onClose} disabled={pending}>
              취소
            </Button>
            <Button type="submit" size="sm" disabled={pending} className="gap-2">
              <Send className="h-3.5 w-3.5" />
              {pending ? "등록 중..." : "등록"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
