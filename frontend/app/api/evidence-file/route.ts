import { NextRequest, NextResponse } from 'next/server'

export async function GET(req: NextRequest) {
  const fileUrl = req.nextUrl.searchParams.get('url')
  const token = req.headers.get('x-auth-token')

  if (!fileUrl) {
    return new NextResponse('Missing url', { status: 400 })
  }

  const upstream = await fetch(fileUrl, {
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  })

  if (!upstream.ok) {
    return new NextResponse('Failed to fetch file', { status: upstream.status })
  }

  const buffer = await upstream.arrayBuffer()
  const contentType = upstream.headers.get('content-type') ?? 'application/octet-stream'
  const disposition = upstream.headers.get('content-disposition') ?? ''

  return new NextResponse(buffer, {
    headers: {
      'Content-Type': contentType,
      ...(disposition ? { 'Content-Disposition': disposition } : {}),
    },
  })
}
