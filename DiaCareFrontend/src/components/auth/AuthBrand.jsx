import React from 'react'
import { BRAND, AUTH_STATS } from '../../constants/auth'
import Logo from '../ui/Logo'

export default function AuthBrand() {
  return (
    <div className="relative flex flex-col w-full h-full px-12 py-10 overflow-hidden"
         style={{ background: 'linear-gradient(145deg, #001D39 0%, #0A4174 60%, #49769F 100%)' }}>

      <Logo size={40} showName nameClass="text-white" />

      <div className="my-auto relative z-10">
        <h1 className="text-4xl font-bold text-white leading-tight tracking-tight mb-4">
          {BRAND.tagline.split('\n').map((line, i) => (
            <React.Fragment key={i}>{line}{i === 0 && <br />}</React.Fragment>
          ))}
        </h1>
        <p className="text-base text-white/80 leading-relaxed mb-10 max-w-sm">{BRAND.sub}</p>

        <div className="flex gap-3 flex-wrap">
          {AUTH_STATS.map(s => (
            <div key={s.label} className="flex flex-col gap-0.5 px-4 py-3 rounded-xl border border-white/15 bg-white/10 backdrop-blur-sm">
              <span className="text-xl font-bold text-white font-mono">{s.value}</span>
              <span className="text-xs text-white/75">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="absolute w-80 h-80 rounded-full bg-white/5 -top-20 -right-20 pointer-events-none" />
      <div className="absolute w-56 h-56 rounded-full bg-white/5 -bottom-16 -left-16 pointer-events-none" />
    </div>
  )
}
