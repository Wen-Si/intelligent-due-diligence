import React from 'react'

function WorkflowProgress({ workflowData }) {
  const { currentStep, steps, overallProgress } = workflowData

  const stepIcons = {
    qcc: '🏢',
    ocr: '🔍',
    ai: '🤖'
  }

  const stepLabels = {
    qcc: '企查查MCP',
    ocr: 'GLM-4V视觉OCR',
    ai: 'GLM-4.5生成'
  }

  const stepDescriptions = {
    qcc: '获取企业工商、风险、经营等信息',
    ocr: 'GLM-4V识别PDF页面，提取财务数据',
    ai: '整合所有数据，生成完整尽调报告'
  }

  const getStepStatus = (stepKey) => {
    // 优先使用step对象中明确的status字段
    const stepData = steps?.[stepKey] || {}
    if (stepData.status === 'completed') return 'completed'
    if (stepData.status === 'active' || currentStep === stepKey) return 'active'
    if (stepData.status === 'failed') return 'failed'
    if (stepData.status === 'pending') return 'pending'
    
    // 兜底逻辑：根据currentStep推断
    const stepOrder = ['qcc', 'ocr', 'ai']
    const currentIndex = stepOrder.indexOf(currentStep)
    const stepIndex = stepOrder.indexOf(stepKey)
    
    if (currentIndex === -1 || stepIndex === -1) return 'pending'
    if (stepIndex < currentIndex) return 'completed'
    if (stepIndex === currentIndex) return 'active'
    return 'pending'
  }

  const getStatusClass = (status) => {
    switch (status) {
      case 'active':
        return 'bg-primary-500/10 border-2 border-primary-500'
      case 'completed':
        return 'bg-green-500/10 border border-green-500/30'
      case 'failed':
        return 'bg-red-500/10 border border-red-500/30'
      default:
        return 'bg-dark-800/30 border border-dark-700/50'
    }
  }

  const getStatusBadge = (status) => {
    switch (status) {
      case 'active':
        return { text: '进行中', class: 'bg-primary-500/20 text-primary-400' }
      case 'completed':
        return { text: '已完成', class: 'bg-green-500/20 text-green-400' }
      case 'failed':
        return { text: '失败', class: 'bg-red-500/20 text-red-400' }
      default:
        return { text: '待执行', class: 'bg-dark-700 text-dark-400' }
    }
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
          <p className="text-sm text-dark-400">正在处理您的尽职调查请求...</p>
        </div>
      </div>

      {/* Overall Progress */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-dark-300">总体进度</span>
          <span className="text-sm font-semibold text-primary-400">{Math.min(100, Math.max(0, overallProgress || 0))}%</span>
        </div>
        <div className="progress-bar">
          <div 
            className="progress-bar-fill transition-all duration-300"
            style={{ width: `${Math.min(100, Math.max(0, overallProgress || 0))}%` }}
          ></div>
        </div>
      </div>

      {/* Three Steps */}
      <div className="space-y-6">
        {['qcc', 'ocr', 'ai'].map((stepKey) => {
          const status = getStepStatus(stepKey)
          const stepData = steps?.[stepKey] || {}
          const badge = getStatusBadge(status)
          
          return (
            <div 
              key={stepKey}
              className={`relative p-6 rounded-xl transition-all ${getStatusClass(status)}`}
            >
              {/* Step Header */}
              <div className="flex items-center gap-4 mb-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl flex-shrink-0 ${
                  status === 'active' ? 'bg-primary-500/20 animate-pulse' : 
                  status === 'completed' ? 'bg-green-500/20' : 
                  status === 'failed' ? 'bg-red-500/20' : 'bg-dark-700/50'
                }`}>
                  {status === 'completed' ? (
                    <svg className="w-8 h-8 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                  ) : status === 'failed' ? (
                    <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  ) : (
                    stepIcons[stepKey]
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h3 className="text-lg font-semibold text-white">{stepLabels[stepKey]}</h3>
                    <span className={`text-xs px-2 py-1 rounded ${badge.class}`}>
                      {badge.text}
                    </span>
                  </div>
                  <p className="text-sm text-dark-400 mt-1">{stepDescriptions[stepKey]}</p>
                </div>

                {/* Progress Percentage */}
                {status === 'active' && (
                  <div className="text-right flex-shrink-0">
                    <p className="text-2xl font-bold text-primary-400">{Math.round(stepData.progress || 0)}%</p>
                  </div>
                )}
              </div>

              {/* Step Progress Bar */}
              {status === 'active' && (
                <div className="mb-4">
                  <div className="progress-bar">
                    <div 
                      className="progress-bar-fill transition-all duration-300"
                      style={{ width: `${Math.min(100, Math.max(0, stepData.progress || 0))}%` }}
                    ></div>
                  </div>
                </div>
              )}

              {/* Step Details - Message */}
              {stepData.message && (
                <div className={`p-3 rounded-lg border ${
                  status === 'failed' 
                    ? 'bg-red-900/20 border-red-500/30' 
                    : 'bg-dark-800/30 border-dark-700/30'
                }`}>
                  <p className={`text-sm ${status === 'failed' ? 'text-red-300' : 'text-dark-300'}`}>
                    {stepData.message}
                  </p>
                </div>
              )}

              {/* Completed Details - Result */}
              {status === 'completed' && stepData.result && Object.keys(stepData.result).length > 0 && (
                <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
                  {Object.entries(stepData.result).map(([key, value]) => (
                    <div key={key} className="p-3 rounded-lg bg-dark-800/30 text-center">
                      <p className="text-xs text-dark-500 mb-1">{key}</p>
                      <p className="text-sm font-semibold text-dark-200 truncate" title={String(value)}>
                        {String(value)}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

export default WorkflowProgress