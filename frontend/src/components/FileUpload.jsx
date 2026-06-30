import React from 'react'

function FileUpload({ files, companyName, onCompanyNameChange, onFilesAdded, onRemoveFile, onAnalyze, isAnalyzing }) {
  const handleDrop = (e) => {
    e.preventDefault()
    e.stopPropagation()
    const droppedFiles = Array.from(e.dataTransfer.files).filter(f => f.type === 'application/pdf')
    if (droppedFiles.length === 0) {
      alert('仅支持PDF文件')
    }
    onFilesAdded(droppedFiles)
  }

  const handleFileSelect = (e) => {
    const selectedFiles = Array.from(e.target.files).filter(f => f.type === 'application/pdf')
    onFilesAdded(selectedFiles)
    e.target.value = ''
  }

  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i]
  }

  const canAnalyze = files.length > 0 && companyName.trim() && !isAnalyzing

  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-primary-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-primary-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-white">企业尽调分析</h2>
          <p className="text-sm text-dark-400">上传财务报表PDF，输入企业名称，生成完整尽调报告</p>
        </div>
      </div>

      {/* Company Name Input - REQUIRED */}
      <div className="mb-6">
        <label className="block text-sm font-semibold text-primary-400 mb-2">
          🏢 企业名称 <span className="text-red-400">（必填）</span>
        </label>
        <div className="relative">
          <input
            type="text"
            value={companyName}
            onChange={(e) => onCompanyNameChange(e.target.value)}
            placeholder="请输入完整企业名称（如：阿里巴巴集团控股有限公司）"
            className="w-full px-4 py-4 rounded-xl bg-dark-800/50 border-2 border-primary-500/30 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-2 focus:ring-primary-500/20 outline-none transition-all text-lg font-semibold"
            disabled={isAnalyzing}
            required
          />
          {!companyName.trim() && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="text-xs px-2 py-1 rounded bg-red-500/20 text-red-400 font-semibold">
                必填
              </span>
            </div>
          )}
          {companyName.trim() && (
            <div className="absolute right-4 top-1/2 -translate-y-1/2">
              <span className="text-xs px-2 py-1 rounded bg-green-500/20 text-green-400 font-semibold">
                ✓ 已填写
              </span>
            </div>
          )}
        </div>
        <p className="text-xs text-dark-500 mt-2">
          ⚠️ 必须输入完整企业名称，将调用企查查MCP获取企业工商、风险、经营等信息
        </p>
      </div>

      {/* Dropzone - REQUIRED */}
      <div className="mb-4">
        <label className="block text-sm font-semibold text-blue-400 mb-2">
          📄 上传PDF文件 <span className="text-red-400">（必填）</span>
        </label>
      </div>
      
      <div
        onClick={() => !isAnalyzing && document.getElementById('file-input')?.click()}
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDragLeave={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={handleDrop}
        className={`upload-zone ${isAnalyzing ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      >
        <input
          id="file-input"
          type="file"
          multiple
          accept=".pdf"
          style={{ display: 'none' }}
          onChange={handleFileSelect}
        />
        <div className="text-center">
          <div className="mx-auto w-16 h-16 rounded-full bg-blue-500/10 flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 13h6m-3-3v6m5 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-dark-200 font-semibold mb-2">
            拖拽PDF文件到此处，或点击选择文件
          </p>
          <p className="text-sm text-dark-400">
            支持财务报表、审计报告等PDF文件，单文件最大50MB
          </p>
        </div>
      </div>

      {/* File List */}
      {files.length > 0 && (
        <div className="mt-6 space-y-3">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-dark-300">
              已选择 {files.length} 个文件 <span className="text-green-400">✓</span>
            </h3>
            <button
              onClick={() => files.forEach((_, i) => onRemoveFile(i))}
              className="text-sm text-dark-400 hover:text-red-400 transition-colors"
              disabled={isAnalyzing}
            >
              清空全部
            </button>
          </div>
          
          {files.map((file, index) => (
            <div 
              key={index}
              className="flex items-center gap-4 p-4 rounded-xl bg-dark-800/50 border border-dark-700/50 group hover:border-primary-500/30 transition-all"
            >
              <div className="w-12 h-12 rounded-lg bg-red-500/10 flex items-center justify-center flex-shrink-0">
                <svg className="w-6 h-6 text-red-400" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z" clipRule="evenodd" />
                </svg>
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">
                  {file.name}
                </p>
                <p className="text-xs text-dark-400 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <button
                onClick={() => onRemoveFile(index)}
                className="w-8 h-8 rounded-lg flex items-center justify-center text-dark-400 hover:text-red-400 hover:bg-red-500/10 transition-all opacity-0 group-hover:opacity-100"
                disabled={isAnalyzing}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Workflow Steps Info */}
      <div className="mt-8 p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20">
        <h4 className="text-sm font-semibold text-primary-400 mb-4">📋 分析流程</h4>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-3 rounded-lg bg-dark-800/30">
            <p className="text-2xl mb-2">🏢</p>
            <p className="text-sm font-semibold text-white">第一步</p>
            <p className="text-xs text-dark-400">企查查MCP获取企业信息</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dark-800/30">
            <p className="text-2xl mb-2">🔍</p>
            <p className="text-sm font-semibold text-white">第二步</p>
            <p className="text-xs text-dark-400">GLM-4V视觉OCR解析PDF</p>
          </div>
          <div className="text-center p-3 rounded-lg bg-dark-800/30">
            <p className="text-2xl mb-2">🤖</p>
            <p className="text-sm font-semibold text-white">第三步</p>
            <p className="text-xs text-dark-400">GLM-4.5生成尽调报告</p>
          </div>
        </div>
      </div>

      {/* Action Button */}
      <div className="mt-8 flex justify-center">
        <button
          onClick={onAnalyze}
          disabled={!canAnalyze}
          className={`btn-primary flex items-center gap-3 px-8 py-4 text-lg ${!canAnalyze ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isAnalyzing ? (
            <>
              <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>正在分析...</span>
            </>
          ) : (
            <>
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span>开始生成尽调报告</span>
            </>
          )}
        </button>
      </div>
      
      {/* Validation Messages */}
      {!companyName.trim() && files.length > 0 && (
        <p className="text-center text-sm text-red-400 mt-4">
          ⚠️ 请输入企业名称
        </p>
      )}
      {companyName.trim() && files.length === 0 && (
        <p className="text-center text-sm text-red-400 mt-4">
          ⚠️ 请上传PDF文件
        </p>
      )}
    </div>
  )
}

export default FileUpload