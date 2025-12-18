import Link from 'next/link'
import { Github, Twitter, Sparkles } from 'lucide-react'

const Footer = () => {
  return (
    <footer className="bg-gray-900 text-gray-300 py-12">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Sparkles className="w-6 h-6 text-primary-500" />
              <span className="text-white">AI Marketplace</span>
            </Link>
            <p className="text-sm">
              Decentralized AI model marketplace built on Solana blockchain.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/explore" className="hover:text-primary-400 transition-colors">
                  Explore Models
                </Link>
              </li>
              <li>
                <Link href="/creator" className="hover:text-primary-400 transition-colors">
                  Become a Creator
                </Link>
              </li>
              <li>
                <Link href="/docs" className="hover:text-primary-400 transition-colors">
                  Documentation
                </Link>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h3 className="font-semibold text-white mb-4">Resources</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  API Documentation
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Smart Contracts
                </a>
              </li>
              <li>
                <a href="#" className="hover:text-primary-400 transition-colors">
                  Developer Guide
                </a>
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h3 className="font-semibold text-white mb-4">Community</h3>
            <div className="flex gap-4">
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="hover:text-primary-400 transition-colors">
                <Github className="w-5 h-5" />
              </a>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
          <p>&copy; 2025 AI Marketplace. All rights reserved.</p>
        </div>
      </div>
    </footer>
  )
}

export default Footer
