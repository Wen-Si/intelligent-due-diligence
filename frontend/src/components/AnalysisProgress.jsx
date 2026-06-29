import React from 'react'

function AnalysisProgress({ progress, stage }) {
  const stages = [
    { key: 'upload', label: '上传文档', icon: '📄' },
    { key: 'ocr', label: 'OCR识别', icon: '🔍' },
    { key: 'extract', label: '数据提取', icon: '📊' },
    { key: 'analyze', label: 'AI分析', icon: '🤖' },
    { key: 'generate', label: '生成报告', icon: '📝' },
  ]

  const getCurrentStageIndex = () => {
    return stages.findIndex(s => s.key === stage)
  }

  return (
    <div className="glass-card rounded-2xl p-8 animate-slide-up">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-white">分析进度</h2>
          <p className="text-sm text-dark-400">正在处理您的文档...</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-300">总体进度</span>
          <span className="text-sm font-semibold text-primary-400">{progress}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>
      </div>

      {/* Stage Indicators */}
      <div className="grid grid-cols-5 gap-4">
        {stages.map((s, index) => {
          const currentIndex = getCurrentStageIndex()
          const isActive = index === currentIndex
          const isCompleted = index < currentIndex
          
          return (
            <div 
              key={s.key}
              className={`text-center transition-all duration-300 ${isActive ? 'scale-110' : ''}`}
            >
              <div 
                className={`
                  w-16 h-16 mx-auto rounded-xl flex items-center justify-center text-2xl mb-2
                  transition-all duration-300
                  ${isCompleted 
                    ? 'bg-primary-500/20 border-2 border-primary-500' 
                    : isActive 
                      ? 'bg-primary-500/30 border-2 border-primary-400 animate-pulse' 
                      : 'bg-dark-800/50 border-2 border-dark-700'}
                `}
              >
                {isCompleted ? (
                  <svg className="w-8 h-8 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                  </svg>
                ) : (
                  s.icon
                )}
              </div>
              <p className={`text-xs font-semibold ${isActive ? 'text-primary-300' : isCompleted ? 'text-primary-400' : 'text-dark-400'}`}>
                {s.label}
              </p>
            </div>
          )
        })}
      </div>

      {/* Current Action */}
      <div className="mt-8 p-4 rounded-xl bg-dark-800/30 border border-dark-700">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full bg-primary-400 animate-pulse"></div>
          <p className="text-sm text-dark-300">
            {stage === 'upload' && '正在上传文档到服务器...'}
            {stage === 'ocr' && '正在进行OCR文字识别，这可能需要几分钟...'}
            {stage === 'extract' && '正在从文档中提取财务数据...'}
            {stage === 'analyze' && 'AI正在分析财务状况和风险点...'}
            {stage === 'generate' && '正在生成专业的尽调报告...'}
          </p>
        </div>
      </div>
    </div>
  )
}

export default AnalysisProgress