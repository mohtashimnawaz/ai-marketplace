import Link from 'next/link'
import dynamic from 'next/dynamic'
import { useRouter } from 'next/router'
import { useWallet } from '@solana/wallet-adapter-react'
import { Sparkles, Menu, X, Compass, PlusCircle, LayoutDashboard, FolderOpen, TrendingUp } from 'lucide-react'
import { useState, useEffect } from 'react'

const WalletMultiButton = dynamic(
  async () => (await import('@solana/wallet-adapter-react-ui')).WalletMultiButton,
  { ssr: false }
)

const Navbar = () => {
  const { connected } = useWallet()
  const router = useRouter()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  const isActive = (path: string) => router.pathname === path

  const navLinks = [
    { href: '/explore', label: 'Explore', icon: Compass },
    { href: '/creator', label: 'Create', icon: PlusCircle },
  ]

  const connectedLinks = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/my-models', label: 'My Models', icon: FolderOpen },
  ]

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-slate-900/90 backdrop-blur-xl shadow-lg shadow-cyan-500/10 border-b border-slate-700/50' 
        : 'bg-slate-900/70 backdrop-blur-sm border-b border-slate-800/50'
    }`}>
      <div className="container mx-auto px-4 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="group flex items-center gap-3 font-bold text-xl">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-cyan-500 to-rose-500 rounded-lg blur-sm opacity-75 group-hover:opacity-100 transition-opacity"></div>
              <div className="relative bg-gradient-to-r from-cyan-500 to-rose-500 p-2 rounded-lg">
                <Sparkles className="w-6 h-6 text-white" />
              </div>
            </div>
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-cyan-400 via-rose-400 to-amber-400 group-hover:from-rose-400 group-hover:to-cyan-400 transition-all font-orbitron tracking-wider">
              DECE AI
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden lg:flex items-center gap-2">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(href)
                    ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            {connected && connectedLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  isActive(href)
                    ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/80 border border-transparent hover:border-slate-700'
                }`}
              >
                <Icon className="w-4 h-4" />
                {label}
              </Link>
            ))}
            <div className="ml-4 pl-4 border-l border-slate-700">
              <WalletMultiButton />
            </div>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 rounded-lg hover:bg-slate-800 transition-colors border border-slate-700"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Toggle menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6 text-gray-300" />
            ) : (
              <Menu className="w-6 h-6 text-gray-300" />
            )}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden py-4 space-y-2 animate-fade-in border-t border-slate-700/50">
            {navLinks.map(({ href, label, icon: Icon }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                  isActive(href)
                    ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-lg shadow-cyan-500/25'
                    : 'text-gray-300 hover:text-white hover:bg-slate-800/80'
                }`}
              >
                <Icon className="w-5 h-5" />
                {label}
              </Link>
            ))}
            {connected && (
              <>
                <div className="h-px bg-slate-700 my-2"></div>
                {connectedLinks.map(({ href, label, icon: Icon }) => (
                  <Link
                    key={href}
                    href={href}
                    onClick={() => setMobileMenuOpen(false)}
                    className={`flex items-center gap-3 px-4 py-3 rounded-lg font-medium transition-all ${
                      isActive(href)
                        ? 'bg-gradient-to-r from-cyan-500 to-rose-500 text-white shadow-lg shadow-cyan-500/25'
                        : 'text-gray-300 hover:text-white hover:bg-slate-800/80'
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    {label}
                  </Link>
                ))}
              </>
            )}
            <div className="pt-4">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
