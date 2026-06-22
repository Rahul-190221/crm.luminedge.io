import { Bell, ChevronDown, Menu, LogOut } from 'lucide-react'

interface HeaderProps {
  user: {
    name: string
    role: string
  }
  onSearch?: (term: string) => void
  searchTerm?: string
  onLogout: () => void
  onMenuToggle: () => void
  unreadCount: number
  onNotificationClick: () => void
}

export default function Header({ user, onSearch, searchTerm, onLogout, onMenuToggle, unreadCount, onNotificationClick }: HeaderProps) {
  const getInitials = (name: string) =>
    name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)

  return (
    <header className="bg-white/95 backdrop-blur-xl border-b border-[#00000F]/[0.07] px-4 sm:px-6 py-3.5 sticky top-0 z-30 shadow-[0_1px_12px_rgba(0,0,0,0.05)]">
      <div className="flex items-center gap-3 sm:gap-5">

        {/* Hamburger — mobile only */}
        <button
          onClick={onMenuToggle}
          className="lg:hidden p-2 rounded-xl hover:bg-gray-100 transition-colors flex-shrink-0 text-[#00000F]/50 hover:text-[#00000F]/80"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        <div className="flex-1" />

        {/* Right */}
        <div className="flex items-center gap-2 sm:gap-3 flex-shrink-0">

          {/* Notification bell */}
          <button
            onClick={onNotificationClick}
            className="relative p-2.5 text-[#00000F]/45 hover:text-[#00000F]/75 transition-all rounded-xl hover:bg-[#00000F]/[0.04] border border-transparent hover:border-[#00000F]/[0.07]"
          >
            <Bell className="w-[18px] h-[18px]" />
            {unreadCount > 0 && (
              <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] bg-red-500 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-white px-0.5">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {/* Divider */}
          <div className="hidden sm:block h-7 w-px bg-[#00000F]/[0.08]" />

          {/* User profile */}
          <div className="relative group">
            <div className="flex items-center gap-2.5 cursor-pointer px-2 py-1.5 rounded-2xl hover:bg-[#FACE39]/8 transition-all duration-200 border border-transparent hover:border-[#FACE39]/20">
              <div className="relative flex-shrink-0">
                <div className="w-8 h-8 sm:w-[34px] sm:h-[34px] bg-[#FACE39] rounded-xl flex items-center justify-center text-[#00000F] font-black text-[12px] shadow-[0_2px_8px_rgba(250,206,57,0.40)]">
                  {getInitials(user.name)}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
              </div>
              <div className="hidden lg:flex flex-col text-left">
                <p className="text-[14px] font-semibold text-[#00000F]/85 leading-tight">{user.name}</p>
                <p className="text-[11px] font-medium text-gray-400 uppercase tracking-widest">{user.role}</p>
              </div>
              <ChevronDown className="hidden sm:block w-3.5 h-3.5 text-[#00000F]/30 group-hover:text-[#00000F]/55 transition-colors" />
            </div>

            {/* Dropdown */}
            <div className="absolute right-0 mt-2 w-44 bg-white rounded-2xl shadow-[0_8px_32px_rgba(0,0,0,0.12)] border border-[#00000F]/[0.07] opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200 z-[60] overflow-hidden">
              <div className="p-1.5">
                <button
                  onClick={onLogout}
                  className="w-full flex items-center gap-3 px-4 py-2.5 text-[14px] text-red-500 font-bold hover:bg-red-50 rounded-xl transition-all"
                >
                  <LogOut className="w-4 h-4" />
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}
