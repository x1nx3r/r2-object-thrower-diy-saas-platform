// src/app/layout.js
import "./globals.css";
import { AuthProvider } from "@/lib/auth-context";

export const metadata = {
  title: "DIY R2 Thrower - Bring Your Own Storage",
  description: "Beautiful file uploader for your Cloudflare R2 storage",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
