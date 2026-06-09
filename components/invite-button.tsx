"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { InviteDialog } from "@/components/invite-dialog"
import { UserPlus } from "lucide-react"

export function InviteButton() {
  const [open, setOpen] = useState(false)

  return (
    <>
      <Button onClick={() => setOpen(true)} size="sm">
        <UserPlus className="mr-2 h-4 w-4" />
        직원 추가
      </Button>
      {open && <InviteDialog onClose={() => setOpen(false)} />}
    </>
  )
}
