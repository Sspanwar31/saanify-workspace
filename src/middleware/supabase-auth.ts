// src/middleware.ts

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

/**
 * यह फंक्शन टोकन (JWT) के पेलोड को सुरक्षित रूप से डिकोड करता है।
 * Supabase से मिले टोकन को पार्स करने के लिए उपयोगी।
 */
function decodeJwtPayload(tokenValue: string) {
  try {
    const base64Url = tokenValue.split('.')[1];
    if (!base64Url) return null;

    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("Token decode failed:", error);
    return null;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get("sb-access-token");
  
  // 1. अगर कोई टोकन नहीं है, तो उसे लॉगिन पेज पर भेजें।
  if (!token) {
    return NextResponse.redirect(new URL("/login", req.url));
  }

  // 2. टोकन को डिकोड करके यूजर की जानकारी निकालें।
  const user = decodeJwtPayload(token.value);

  // अगर टोकन खराब या अमान्य है, तो उसे लॉगिन पेज पर भेजें और कुकी डिलीट करें।
  if (!user) {
    const response = NextResponse.redirect(new URL("/login", req.url));
    response.cookies.delete("sb-access-token");
    return response;
  }
  
  // 3. एडमिन पेजों की सुरक्षा करें।
  // अगर यूजर एडमिन/सुपरएडमिन नहीं है और इन पेजों पर जाने की कोशिश करता है, तो उसे रोकें।
  if (pathname.startsWith("/admin") || pathname.startsWith("/super-admin")) {
    const userRole = user?.role; // टोकन से रोल निकालें
    if (userRole !== "admin" && userRole !== "superadmin") {
      // अनुमति नहीं है, उसे होम पेज या लॉगिन पेज पर वापस भेजें।
      return NextResponse.redirect(new URL("/login", req.url));
    }
  }

  // अगर सब कुछ ठीक है, तो रिक्वेस्ट को आगे बढ़ने दें।
  return NextResponse.next();
}


// Middleware को किन रूट्स पर चलाना है, यह यहाँ कॉन्फ़िगर करें।
export const config = {
  matcher: [
    /*
     * निम्नलिखित को छोड़कर सभी रिक्वेस्ट पाथ्स का मिलान करें:
     * - /login (लॉगिन पेज खुद)
     * - /auth/callback (Supabase लॉगिन के बाद वापस आता है)
     * - /api/super-admin/automation/initialize (आपकी विशेष API)
     * - _next/static (स्टेटिक फाइल्स)
     * - _next/image (इमेज ऑप्टिमाइजेशन फाइल्स)
     * - favicon.ico (फेविकॉन फाइल)
     * - कोई भी पाथ जिसमें एक '.' हो (जैसे images, css, आदि)
     */
    '/((?!login|auth/callback|api/super-admin/automation/initialize|_next/static|_next/image|favicon.ico|.*\\.).*)',
  ],
};
