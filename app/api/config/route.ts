import { NextResponse } from 'next/server'

export const dynamic = 'force-dynamic'

export async function GET() {
  const key = process.env.MAPTILER_KEY || process.env.NEXT_PUBLIC_MAPTILER_KEY || ''
  return NextResponse.json({ maptilerKey: key })
}
