import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value)
          );
          supabaseResponse = NextResponse.next({ request });
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          );
        },
      },
    }
  );

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const path = request.nextUrl.pathname;
  const isAuthPage = path === "/login" || path === "/signup";

  // Helper: build a redirect that preserves any cookies Supabase set
  // (e.g. refreshed tokens). Without this, token refreshes during
  // redirects are lost and can cause infinite redirect loops.
  function redirectWithCookies(pathname: string) {
    const url = request.nextUrl.clone();
    url.pathname = pathname;
    url.search = "";          // drop stale query params like ?redirect=
    const res = NextResponse.redirect(url);
    supabaseResponse.cookies.getAll().forEach(c =>
      res.cookies.set(c.name, c.value)
    );
    return res;
  }

  // Not logged in and trying to access protected route
  if (!user && !isAuthPage && !path.startsWith("/api/") && !path.startsWith("/board/") && !path.startsWith("/script/")) {
    return redirectWithCookies("/login");
  }

  // Logged in and trying to access auth pages
  if (user && isAuthPage) {
    return redirectWithCookies("/");
  }

  return supabaseResponse;
}
