import React, { useState } from 'react'

function ReportDownload({ reportFile, companyName, onNewAnalysis }) {
  const [showContent, setShowContent] = useState(false)
  const [copied, setCopied] = useState(false)

  const handleDownload = () => {
    const link = document.createElement('a')
    link.href = reportFile.downloadUrl
    link.download = reportFile.fileName
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleCopyContent = () => {
    if (reportFile.aiContent) {
      navigator.clipboard.writeText(reportFile.aiContent)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const aiContent = reportFile.aiContent || ''
  const contentPreview = aiContent.substring(0, 800)

  return (
    <div className="animate-fade-in space-y-6">
      {/* Success Header */}
      <div className="glass-card rounded-2xl p-8">
        <div className="text-center">
          <div className="w-20 h-20 mx-auto mb-6 rounded-full bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
            <svg className="w-12 h-12 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          
          <h2 className="text-3xl font-display font-bold text-white mb-2">
            尽调报告已生成完成！
          </h2>
          
          <p className="text-dark-400 mb-4">
            企业：<span className="text-primary-400 font-semibold">{companyName || reportFile.companyName}</span>
          </p>
          
          <div className="flex items-center justify-center gap-4 mb-6 flex-wrap">
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30">
              🏢 企查查MCP
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-blue-500/20 text-blue-400 border border-blue-500/30">
              📄 PaddleOCR
            </span>
            <span className="px-3 py-1 rounded-full text-sm font-semibold bg-purple-500/20 text-purple-400 border border-purple-500/30">
              🤖 GLM-4.5
            </span>
          </div>

          {/* Download Button */}
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-3 px-8 py-4 text-lg mx-auto"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>下载Word尽调报告</span>
          </button>
          
          <p className="text-xs text-dark-500 mt-3">
            文件名：{reportFile.fileName}
          </p>
        </div>
      </div>

      {/* AI Generated Report Content Preview */}
      {aiContent && (
        <div className="glass-card rounded-2xl p-8">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-xl font-display font-semibold text-white flex items-center gap-3">
              <span className="w-8 h-8 rounded-lg bg-purple-500/20 flex items-center justify-center text-sm">
                🤖
              </span>
              GLM-4.5 生成的尽调报告（预览）
            </h3>
            <div className="flex items-center gap-2">
              <button
                onClick={handleCopyContent}
                className="px-3 py-1 rounded-lg bg-dark-800/50 text-xs text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                {copied ? '✓ 已复制' : '复制内容'}
              </button>
              <button
                onClick={() => setShowContent(!showContent)}
                className="px-3 py-1 rounded-lg bg-dark-800/50 text-xs text-dark-300 hover:text-white hover:bg-dark-700 transition-colors"
              >
                {showContent ? '收起' : '展开全文'}
              </button>
            </div>
          </div>
          
          <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
            <pre className="text-sm text-dark-200 whitespace-pre-wrap font-body leading-relaxed max-h-96 overflow-y-auto">
              {showContent ? aiContent : (contentPreview + (aiContent.length > 800 ? '\n\n... [展开查看更多]' : ''))}
            </pre>
          </div>
          
          <p className="text-xs text-dark-500 mt-3">
            报告总字数: {aiContent.length} 字 | {showContent ? '已展开' : '仅显示前800字'}
          </p>
        </div>
      )}

      {/* Report Stats */}
      <div className="glass-card rounded-2xl p-8">
        <h3 className="text-xl font-display font-semibold text-white mb-6 flex items-center gap-3">
          <span className="w-8 h-8 rounded-lg bg-primary-500/20 flex items-center justify-center text-sm">
            📊
          </span>
          生成统计
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20">
              <h4 className="text-sm font-semibold text-white mb-4">数据源</h4>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-dark-400">数据来源</span>
                  <span className="text-primary-400 font-semibold">3个MCP/AI接口</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">PDF文档</span>
                  <span className="text-blue-400 font-semibold">{reportFile.documentCount || 0} 个</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">报告生成时间</span>
                  <span className="text-green-400 font-semibold">{reportFile.generatedAt}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-dark-400">AI模型</span>
                  <span className="text-purple-400 font-semibold">{reportFile.model || 'GLM-4.5-Flash'}</span>
                </div>
                {reportFile.usage && (
                  <div className="flex justify-between">
                    <span className="text-dark-400">Tokens消耗</span>
                    <span className="text-yellow-400 font-semibold">{reportFile.usage.total_tokens || '—'}</span>
                  </div>
                )}
              </div>
            </div>
            
            <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h4 className="text-sm font-semibold text-white mb-3">企查查数据覆盖</h4>
              <div className="flex flex-wrap gap-2">
                {['工商信息', '股东信息', '风险信息', '知识产权', '经营信息', '高管信息', '历史变更'].map((item, i) => (
                  <span key={i} className="px-2 py-1 rounded text-xs bg-green-500/20 text-green-400 border border-green-500/30">
                    ✓ {item}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h4 className="text-sm font-semibold text-primary-400 mb-2">📋 报告内容</h4>
              <p className="text-xs text-dark-400 mb-3">由GLM-4.5基于企查查数据和OCR财务报表生成</p>
              <div className="space-y-2 text-xs">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-primary-500"></span>
                  <span className="text-dark-300">执行摘要</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-blue-500"></span>
                  <span className="text-dark-300">企业基本情况</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-purple-500"></span>
                  <span className="text-dark-300">财务分析</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-yellow-500"></span>
                  <span className="text-dark-300">风险评估</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-green-500"></span>
                  <span className="text-dark-300">投资建议</span>
                </div>
              </div>
            </div>

            {reportFile.pdfResults && reportFile.pdfResults.length > 0 && (
              <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
                <h4 className="text-sm font-semibold text-blue-400 mb-3">📄 解析的PDF</h4>
                <div className="space-y-2">
                  {reportFile.pdfResults.map((r, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-dark-300 truncate flex-1">{r.fileName}</span>
                      <span className="text-dark-500 ml-2">{r.pageCount}页</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-center gap-4">
          <button
            onClick={onNewAnalysis}
            className="btn-secondary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
            </svg>
            <span>新建分析</span>
          </button>
          
          <button
            onClick={handleDownload}
            className="btn-primary flex items-center gap-2"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            <span>再次下载</span>
          </button>
        </div>
      </div>
    </div>
  )
}

export default ReportDownload
