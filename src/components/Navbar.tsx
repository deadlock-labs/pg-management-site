"use client";

import Link from "next/link";
import { useSession, signOut } from "next-auth/react";
import { useState } from "react";

export default function Navbar() {
  const { data: session } = useSession();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin = session?.user?.role === "admin";

  return (
    <nav className="bg-white shadow-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="text-xl font-bold text-indigo-600">
              🏠 PG Management
            </Link>
            {session && (
              <div className="hidden md:flex ml-10 space-x-4">
                <Link
                  href="/dashboard"
                  className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      href="/admin/rooms"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Rooms
                    </Link>
                    <Link
                      href="/admin/bills"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Bills
                    </Link>
                    <Link
                      href="/admin/bill-types"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Bill Types
                    </Link>
                    <Link
                      href="/admin/users"
                      className="text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Users
                    </Link>
                  </>
                )}
              </div>
            )}
          </div>

          <div className="hidden md:flex items-center">
            {session ? (
              <div className="flex items-center space-x-4">
                <span className="text-sm text-gray-600">
                  {session.user.name || session.user.email}
                </span>
                <button
                  onClick={() => signOut({ callbackUrl: "/" })}
                  className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
                >
                  Sign Out
                </button>
              </div>
            ) : (
              <Link
                href="/auth/login"
                className="bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700"
              >
                Sign In
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="text-gray-700 hover:text-indigo-600 p-2"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {mobileOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="md:hidden border-t border-gray-200 bg-white">
          <div className="px-4 py-3 space-y-2">
            {session ? (
              <>
                <Link
                  href="/dashboard"
                  className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium"
                  onClick={() => setMobileOpen(false)}
                >
                  Dashboard
                </Link>
                {isAdmin && (
                  <>
                    <Link href="/admin/rooms" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      Rooms
                    </Link>
                    <Link href="/admin/bills" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      Bills
                    </Link>
                    <Link href="/admin/bill-types" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      Bill Types
                    </Link>
                    <Link href="/admin/users" className="block text-gray-700 hover:text-indigo-600 px-3 py-2 rounded-md text-sm font-medium" onClick={() => setMobileOpen(false)}>
                      Users
                    </Link>
                  </>
                )}
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <span className="block text-sm text-gray-600 px-3 py-1">
                    {session.user.name || session.user.email}
                  </span>
                  <button
                    onClick={() => signOut({ callbackUrl: "/" })}
                    className="w-full text-left text-red-600 hover:text-red-700 px-3 py-2 rounded-md text-sm font-medium"
                  >
                    Sign Out
                  </button>
                </div>
              </>
            ) : (
              <Link
                href="/auth/login"
                className="block bg-indigo-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-indigo-700 text-center"
                onClick={() => setMobileOpen(false)}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
