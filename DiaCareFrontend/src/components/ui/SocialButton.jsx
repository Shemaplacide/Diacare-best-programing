import React from 'react'

const icons = {
  google: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
      <path d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 0 0 9 18z" fill="#34A853"/>
      <path d="M3.964 10.707A5.41 5.41 0 0 1 3.682 9c0-.593.102-1.17.282-1.707V4.961H.957A8.996 8.996 0 0 0 0 9c0 1.452.348 2.827.957 4.039l3.007-2.332z" fill="#FBBC05"/>
      <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 0 0 .957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
    </svg>
  ),
  apple: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
      <path d="M14.045 9.533c-.02-2.018 1.647-2.995 1.722-3.042-1.04-1.522-2.576-1.73-3.128-1.75-1.322-.135-2.593.784-3.263.784-.67 0-1.69-.768-2.784-.747-1.42.021-2.74.832-3.47 2.104-1.49 2.578-.38 6.383 1.06 8.474.71 1.022 1.55 2.163 2.648 2.122 1.07-.043 1.47-.685 2.762-.685 1.29 0 1.65.685 2.773.662 1.148-.02 1.872-1.033 2.567-2.063.818-1.18 1.152-2.333 1.168-2.393-.026-.011-2.232-.855-2.255-3.466z" fill="#000"/>
      <path d="M11.718 3.16c.576-.706.967-1.68.86-2.66-.832.035-1.855.558-2.453 1.248-.528.614-.995 1.614-.872 2.563.933.071 1.888-.474 2.465-1.151z" fill="#000"/>
    </svg>
  ),
}

export default function SocialButton({ provider, onClick }) {
  const labels = { google: 'Google', apple: 'Apple' }

  return (
    <button
      type="button"
      onClick={onClick}
      style={{ height: 'var(--btn-h-md)', borderRadius: 'var(--radius-md)' }}
      className="flex-1 inline-flex items-center justify-center gap-2 border border-[#E2E8F0] bg-white hover:bg-[#F8FAFB] text-sm font-medium text-[#1E293B] transition cursor-pointer"
    >
      {icons[provider]}
      {labels[provider]}
    </button>
  )
}
