import React from 'react';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto">
          
          {/* Logo */}
          <div className="text-center mb-12">
            <h1 className="text-6xl md:text-7xl font-bold bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
              Ultra Advisor
            </h1>
            <p className="text-xl md:text-2xl text-gray-600">
              您的專業理財規劃助手
            </p>
          </div>

          {/* 主要內容卡片 */}
          <div className="bg-white/80 backdrop-blur-sm rounded-3xl shadow-2xl p-8 md:p-12 mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-800 mb-6 text-center">
              透過 LINE 開始您的理財規劃
            </h2>
            <p className="text-lg md:text-xl text-gray-600 mb-8 text-center">
              加入我們的 LINE Bot，立即開始您的專業理財規劃之旅
            </p>
            
            {/* LINE 加入按鈕 */}
            <div className="flex justify-center mb-8">
              <a 
                href="https://line.me/R/ti/p/@grbt"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center bg-gradient-to-r from-green-500 to-green-600 text-white px-10 py-5 rounded-full text-lg md:text-xl font-semibold hover:from-green-600 hover:to-green-700 transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
              >
                <svg className="w-6 h-6 mr-3" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M19.365 9.863c.349 0 .63.285.63.631 0 .345-.281.63-.63.63H17.61v1.125h1.755c.349 0 .63.283.63.63 0 .344-.281.629-.63.629h-2.386c-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63h2.386c.346 0 .627.285.627.63 0 .349-.281.63-.63.63H17.61v1.125h1.755zm-3.855 3.016c0 .27-.174.51-.432.596-.064.021-.133.031-.199.031-.211 0-.391-.09-.51-.25l-2.443-3.317v2.94c0 .344-.279.629-.631.629-.346 0-.626-.285-.626-.629V8.108c0-.27.173-.51.43-.595.06-.023.136-.033.194-.033.195 0 .375.104.495.254l2.462 3.33V8.108c0-.345.282-.63.63-.63.345 0 .63.285.63.63v4.771zm-5.741 0c0 .344-.282.629-.631.629-.345 0-.627-.285-.627-.629V8.108c0-.345.282-.63.63-.63.346 0 .628.285.628.63v4.771zm-2.466.629H4.917c-.345 0-.63-.285-.63-.629V8.108c0-.345.285-.63.63-.63.348 0 .63.285.63.63v4.141h1.756c.348 0 .629.283.629.63 0 .344-.282.629-.629.629M24 10.314C24 4.943 18.615.572 12 .572S0 4.943 0 10.314c0 4.811 4.27 8.842 10.035 9.608.391.082.923.258 1.058.59.12.301.079.766.038 1.08l-.164 1.02c-.045.301-.24 1.186 1.049.645 1.291-.539 6.916-4.078 9.436-6.975C23.176 14.393 24 12.458 24 10.314"/>
                </svg>
                加入 LINE Bot
              </a>
            </div>

            {/* 功能說明 */}
            <div className="text-center text-gray-500 text-sm">
              <p>免費試用 7 天 · 專業理財規劃工具</p>
            </div>
          </div>

          {/* 功能特點 */}
          <div className="grid md:grid-cols-3 gap-6 mb-12">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">💰</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">理財規劃</h3>
              <p className="text-gray-600 text-center">專業的財務規劃工具，輕鬆管理您的財務</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">📊</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">投資分析</h3>
              <p className="text-gray-600 text-center">智能投資建議與分析，助您做出明智決策</p>
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl p-8 shadow-lg hover:shadow-xl transition-shadow">
              <div className="text-5xl mb-4 text-center">🎯</div>
              <h3 className="text-xl font-bold mb-3 text-center text-gray-800">目標追蹤</h3>
              <p className="text-gray-600 text-center">輕鬆追蹤理財目標，實現財務自由</p>
            </div>
          </div>

          {/* Footer */}
          <div className="text-center text-gray-500 text-sm">
            <p>&copy; 2026 Ultra Advisor. All rights reserved.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
