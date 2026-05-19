import { NextRequest, NextResponse } from 'next/server'

const publicRoutes = ['/', '/login']

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  const isPublicRoute = publicRoutes.includes(pathname)
  const authToken = request.cookies.get('auth_token')?.value

  if (!isPublicRoute && !authToken) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico).*)'],
}
