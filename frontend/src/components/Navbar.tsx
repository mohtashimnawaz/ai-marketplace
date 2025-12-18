import Link from 'next/link'
import { useWallet } from '@solana/wallet-adapter-react'
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui'
import { Sparkles, Menu, X } from 'lucide-react'
import { useState } from 'react'

const Navbar = () => {
  const { connected } = useWallet()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <nav className="bg-white dark:bg-gray-900 shadow-md sticky top-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2 font-bold text-xl">
            <Sparkles className="w-6 h-6 text-primary-600" />
            <span className="bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-secondary-600">
              AI Marketplace
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-6">
            <Link href="/explore" className="hover:text-primary-600 transition-colors">
              Explore
            </Link>
            <Link href="/creator" className="hover:text-primary-600 transition-colors">
              Create
            </Link>
            {connected && (
              <>
                <Link href="/dashboard" className="hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/my-models" className="hover:text-primary-600 transition-colors">
                  My Models
                </Link>
              </>
            )}
            <WalletMultiButton />
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 space-y-4">
            <Link href="/explore" className="block hover:text-primary-600 transition-colors">
              Explore
            </Link>
            <Link href="/creator" className="block hover:text-primary-600 transition-colors">
              Create
            </Link>
            {connected && (
              <>
                <Link href="/dashboard" className="block hover:text-primary-600 transition-colors">
                  Dashboard
                </Link>
                <Link href="/my-models" className="block hover:text-primary-600 transition-colors">
                  My Models
                </Link>
              </>
            )}
            <div className="pt-2">
              <WalletMultiButton />
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}

export default Navbar
