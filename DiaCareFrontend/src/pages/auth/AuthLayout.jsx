import React from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import AuthBrand from '../../components/auth/AuthBrand'
import Logo from '../../components/ui/Logo'

export default function AuthLayout({ children }) {
  return (
    <div className="flex min-h-screen">

      {/* Desktop: sticky left panel */}
      <div className="hidden lg:block sticky top-0 h-screen w-[45%] shrink-0">
        <AuthBrand />
      </div>

      {/* Right: scrollable form area */}
      <div className="flex flex-1 flex-col bg-[#F8FAFB]">

        {/* Top bar — back to home + mobile logo */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <Link to="/" className="flex items-center gap-1.5 text-sm font-medium text-[#64748B] hover:text-[#0A4174] transition no-underline">
            <ArrowLeft size={15} />
            Back to home
          </Link>
          <div className="lg:hidden">
            <Logo size={28} showName nameClass="text-[#001D39] text-base" />
          </div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 py-5">
          {children}
        </div>
      </div>

    </div>
  )
}
