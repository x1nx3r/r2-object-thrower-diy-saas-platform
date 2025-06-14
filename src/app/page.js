"use client";

import { useAuth } from "@/lib/auth-context";
import Link from "next/link";
import { useState, useEffect } from "react";
import LogoText from "@/components/ui/LogoText";

export default function Home() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-50 via-blue-50 to-indigo-100">
        <div className="text-center">
          <LogoText size="lg" className="justify-center mb-6" />
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-purple-600 border-t-transparent mx-auto"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-700 to-blue-800 relative overflow-hidden">
      {/* Animated background elements */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-4000"></div>
      </div>

      {/* Header */}
      <header className="relative z-10 px-4 py-6">
        <nav className="max-w-7xl mx-auto flex justify-between items-center">
          <div className="flex items-center">
            <LogoText size="md" showText={true} className="text-white" />
          </div>
          <div className="flex items-center space-x-4">
            {user ? (
              <>
                <span className="text-white/80 text-sm hidden sm:block">
                  Welcome, {user.email?.split("@")[0]}
                </span>
                <Link
                  href="/dashboard"
                  className="bg-white/10 backdrop-blur-sm text-white border border-white/20 px-4 py-2 rounded-lg font-medium hover:bg-white/20 transition-all"
                >
                  Dashboard
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-white text-purple-900 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-lg"
                >
                  Go to App
                </Link>
              </>
            ) : (
              <>
                <Link
                  href="/auth"
                  className="text-white hover:text-purple-200 transition-colors font-medium"
                >
                  Sign In
                </Link>
                <Link
                  href="/auth"
                  className="bg-white text-purple-900 px-6 py-2 rounded-lg font-medium hover:bg-purple-50 transition-colors shadow-lg"
                >
                  Get Started
                </Link>
              </>
            )}
          </div>
        </nav>
      </header>

      {/* Hero Section */}
      <main className="relative z-10 px-4 py-20">
        <div className="max-w-7xl mx-auto text-center">
          {user ? (
            <>
              <div className="mb-8">
                <div className="inline-flex items-center px-4 py-2 bg-green-500/20 border border-green-400/30 rounded-full text-green-100 text-sm font-medium mb-6">
                  <svg
                    className="w-4 h-4 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  You're signed in!
                </div>
              </div>
              <h1 className="text-5xl md:text-6xl font-bold text-white mb-8 leading-tight">
                Welcome back to{" "}
                <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  R2 Thrower
                </span>
              </h1>
              <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                Ready to manage your Cloudflare R2 storage? Access your
                dashboard to upload files, manage credentials, and monitor your
                storage usage.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/dashboard"
                  className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Go to Dashboard
                </Link>
                <button className="text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-900 transition-all">
                  View Features
                </button>
              </div>
            </>
          ) : (
            <>
              <h1 className="text-6xl md:text-7xl font-bold text-white mb-8 leading-tight">
                Upload to{" "}
                <span className="bg-gradient-to-r from-purple-300 to-blue-300 bg-clip-text text-transparent">
                  Cloudflare R2
                </span>
                <br />
                Made Simple
              </h1>

              <p className="text-xl text-purple-100 mb-12 max-w-3xl mx-auto leading-relaxed">
                The easiest way to upload, manage, and share your files using
                Cloudflare R2 storage. Fast, secure, and cost-effective cloud
                storage solution.
              </p>

              <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
                <Link
                  href="/auth"
                  className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg"
                >
                  Start Free Trial
                </Link>
                <button className="text-white border-2 border-white px-8 py-4 rounded-full text-lg font-semibold hover:bg-white hover:text-purple-900 transition-all">
                  Watch Demo
                </button>
              </div>
            </>
          )}
        </div>
      </main>

      {/* Features Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-7xl mx-auto">
          <h2 className="text-4xl font-bold text-white text-center mb-16">
            {user ? "Your R2 Thrower Features" : "Why Choose DIY R2 Thrower?"}
          </h2>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 card-hover">
              <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M13 10V3L4 14h7v7l9-11h-7z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Lightning Fast
              </h3>
              <p className="text-purple-100">
                Upload files at blazing speeds with Cloudflare's global network.
                Experience the fastest file transfers.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 card-hover">
              <div className="w-12 h-12 bg-blue-500 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Secure & Private
              </h3>
              <p className="text-purple-100">
                Your files are encrypted and stored securely. Complete control
                over your data with enterprise-grade security.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20 card-hover">
              <div className="w-12 h-12 bg-green-500 rounded-lg flex items-center justify-center mb-6">
                <svg
                  className="w-6 h-6 text-white"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-white mb-4">
                Cost Effective
              </h3>
              <p className="text-purple-100">
                Pay only for what you use. No hidden fees, no surprises.
                Cloudflare R2 offers the best pricing in the market.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section - Show only for authenticated users */}
      {user && (
        <section className="relative z-10 px-4 py-20">
          <div className="max-w-4xl mx-auto">
            <div className="bg-white/10 backdrop-blur-lg rounded-2xl p-8 border border-white/20">
              <h3 className="text-2xl font-bold text-white text-center mb-8">
                Quick Stats
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
                <div>
                  <div className="text-3xl font-bold text-white mb-2">∞</div>
                  <div className="text-purple-200">Storage Available</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">🚀</div>
                  <div className="text-purple-200">Fast Uploads</div>
                </div>
                <div>
                  <div className="text-3xl font-bold text-white mb-2">🔒</div>
                  <div className="text-purple-200">Secure & Private</div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="relative z-10 px-4 py-20">
        <div className="max-w-4xl mx-auto text-center">
          {user ? (
            <>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Upload?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Your dashboard is ready and waiting. Start managing your R2
                storage now.
              </p>
              <Link
                href="/dashboard"
                className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Open Dashboard
              </Link>
            </>
          ) : (
            <>
              <h2 className="text-4xl font-bold text-white mb-6">
                Ready to Get Started?
              </h2>
              <p className="text-xl text-purple-100 mb-8">
                Join thousands of developers and businesses using DIY R2 Thrower
                for their storage needs.
              </p>
              <Link
                href="/auth"
                className="bg-white text-purple-900 px-8 py-4 rounded-full text-lg font-semibold hover:bg-purple-50 transition-all transform hover:scale-105 shadow-lg inline-block"
              >
                Get Started for Free
              </Link>
            </>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="relative z-10 px-4 py-8 border-t border-white/20">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="flex items-center mb-4 md:mb-0">
              <LogoText size="sm" className="text-white" />
            </div>
            <div className="flex space-x-6 text-sm text-purple-200">
              <a href="#" className="hover:text-white transition-colors">
                Privacy Policy
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Terms of Service
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Support
              </a>
              <a href="#" className="hover:text-white transition-colors">
                Documentation
              </a>
            </div>
          </div>
          <div className="mt-4 pt-4 border-t border-white/20 text-center text-sm text-purple-200">
            © 2024 DIY R2 Thrower SaaS. Built with Next.js and Cloudflare R2.
          </div>
        </div>
      </footer>
    </div>
  );
}
