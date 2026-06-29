import React from 'react'

function Header() {
  return (
    <header className="border-b border-dark-700/50 backdrop-blur-xl bg-dark-900/60 sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-primary-400 to-primary-600 flex items-center justify-center shadow-lg shadow-primary-500/30">
                <svg className="w-7 h-7 text-dark-900" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-primary-400 rounded-full animate-pulse"></div>
            </div>
            <div>
              <h1 className="text-2xl font-display font-bold text-white">
                智能尽调
              </h1>
              <p className="text-xs text-dark-400 font-body">
                AI驱动的财务分析平台
              </p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#" className="text-dark-300 hover:text-primary-400 transition-colors font-body">
              首页
            </a>
            <a href="#" className="text-dark-300 hover:text-primary-400 transition-colors font-body">
              功能介绍
            </a>
            <a href="#" className="text-dark-300 hover:text-primary-400 transition-colors font-body">
              使用指南
            </a>
          </nav>

          {/* Status Badge */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-dark-800/50 border border-dark-700">
              <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>
              <span className="text-sm text-dark-300 font-body">服务正常</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  )
}

export default Header