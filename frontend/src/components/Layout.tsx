import { FC, ReactNode } from 'react'
import Navbar from './Navbar'
import Footer from './Footer'

interface Props {
  children: ReactNode
}

const Layout: FC<Props> = ({ children }) => {
  return (
    <div className="flex flex-col min-h-screen">
      <Navbar />
      <main className="flex-grow">
        {children}
      </main>
      <Footer />
      
      {/* Signature Watermark */}
      <a
        href="https://portfolio-main-sooty-mu.vercel.app/"
        target="_blank"
        rel="noopener noreferrer"
        className="tubelight-signature"
      >
        by nwz
      </a>
    </div>
  )
}

export default Layout
