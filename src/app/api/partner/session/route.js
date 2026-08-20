import { NextResponse } from "next/server"
import { getPartnerRequestContext } from "lib/partnerRouteAuth"

export const runtime = "nodejs"

export async function GET(request) {
  const context = await getPartnerRequestContext(request)
  if (context.response) return context.response

  const { user, membership } = context
  return NextResponse.json({
    user: { id: user.id, email: user.email || "" },
    membership: {
      id: membership.id,
      role: membership.role,
      primaryBranchId: membership.primary_branch_id || "",
      partner: membership.partner_organizations,
    },
  })
}
