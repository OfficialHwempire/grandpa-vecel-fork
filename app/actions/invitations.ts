"use server"

import { Resend } from "resend"
import { createClient as createAdminClient } from "@supabase/supabase-js"
import { revalidatePath } from "next/cache"

function createAdmin() {
  return createAdminClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  )
}

export async function inviteEmployee(
  _prevState: { error?: string; success?: boolean } | undefined,
  formData: FormData,
) {
  const email = String(formData.get("email") ?? "").trim().toLowerCase()
  if (!email) return { error: "이메일을 입력해주세요." }

  const admin = createAdmin()

  // 이미 초대된 이메일 확인
  const { data: existing } = await admin
    .from("invitations")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (existing) return { error: "이미 초대된 이메일입니다." }

  // 이미 가입된 유저 확인
  const { data: existingUser } = await admin
    .from("users")
    .select("email")
    .eq("email", email)
    .maybeSingle()

  if (existingUser) return { error: "이미 가입된 이메일입니다." }

  // invitations 테이블에 저장
  const { error: insertError } = await admin.from("invitations").insert({ email })
  if (insertError) return { error: "초대 등록에 실패했습니다." }

  // 초대 메일 발송 (발신 도메인이 설정된 경우에만)
  const fromEmail = process.env.RESEND_FROM_EMAIL
  if (fromEmail && process.env.RESEND_API_KEY) {
    const resend = new Resend(process.env.RESEND_API_KEY)
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"

    const { error: emailError } = await resend.emails.send({
      from: `초대 <${fromEmail}>`,
      to: email,
      subject: "직원 시스템 초대",
      html: `
        <div style="font-family: sans-serif; max-width: 480px; margin: 0 auto;">
          <h2>직원 시스템에 초대되었습니다</h2>
          <p>아래 링크를 클릭하여 회원가입을 완료해주세요.</p>
          <a
            href="${siteUrl}/login"
            style="display:inline-block;padding:12px 24px;background:#000;color:#fff;border-radius:6px;text-decoration:none;margin-top:8px;"
          >
            회원가입하기
          </a>
          <p style="margin-top:16px;color:#666;font-size:13px;">
            초대된 이메일: ${email}
          </p>
        </div>
      `,
    })

    if (emailError) {
      await admin.from("invitations").delete().eq("email", email)
      return { error: "이메일 발송에 실패했습니다." }
    }
  }

  revalidatePath("/dashboard/employees")
  return { success: true }
}
