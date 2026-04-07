import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

// Captured once when this module initialises on the server.
// Railway sets RAILWAY_GIT_COMMIT_SHA on every deploy, giving a stable,
// unique value per build. Fallback: Date.now() at module-init time, which
// also changes on each server restart / redeploy.
const VERSION =
  process.env.RAILWAY_GIT_COMMIT_SHA ??
  process.env.VERCEL_GIT_COMMIT_SHA ??
  `${Date.now()}`

export async function GET() {
  return NextResponse.json({ v: VERSION })
}
