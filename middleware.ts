import createMiddleware from 'next-intl/middleware';
import { NextRequest, NextResponse } from 'next/server';

const intlMiddleware = createMiddleware({
  locales: ['id', 'en'],
  defaultLocale: 'id',
  localePrefix: 'always',
});

export default function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // skip API, static
  if (
    pathname.startsWith('/api') ||
    pathname.startsWith('/_next') ||
    pathname.startsWith('/_vercel') ||
    pathname.startsWith('/maintenance') ||
    pathname.includes('.')
  ) {
    return NextResponse.next();
  }

  // maintenance mode check
  const maintenance = process.env.MAINTENANCE_MODE === 'true';
  if (maintenance) {
    return NextResponse.rewrite(new URL('/maintenance', req.url));
  }

  return intlMiddleware(req);
}

export const config = {
  matcher: ['/((?!api|_next|_vercel|.*\\..*).*)'],
};
