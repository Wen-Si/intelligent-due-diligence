import React, { useState } from 'react'
import Header from './components/Header'
import FileUpload from './components/FileUpload'
import WorkflowProgress from './components/WorkflowProgress'
import ReportDownload from './components/ReportDownload'
import HistoryPanel from './components/HistoryPanel'
import { analyzeFiles } from './services/api'

function App() {
  const [files, setFiles] = useState([])
  const [companyName, setCompanyName] = useState('')
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [workflowData, setWorkflowData] = useState(null)
  const [reportFile, setReportFile] = useState(null)
  const [history, setHistory] = useState([])
  const [error, setError] = useState(null)

  const handleFilesAdded = (newFiles) => {
    setFiles(prev => [...prev, ...newFiles])
    setError(null)
  }

  const handleRemoveFile = (index) => {
    setFiles(prev => prev.filter((_, i) => i !== index))
  }

  const handleAnalyze = async () => {
    if (files.length === 0 || !companyName.trim()) return

    setIsAnalyzing(true)
    setError(null)
    setWorkflowData(null)
    setReportFile(null)

    try {
      const result = await analyzeFiles(files, companyName, (data) => {
        setWorkflowData(data)
      })

      setReportFile(result)
      setHistory(prev => [{
        id: Date.now(),
        files: files.map(f => f.name),
        companyName: companyName,
        timestamp: new Date().toLocaleString('zh-CN'),
        reportFile: result
      }, ...prev].slice(0, 10))

    } catch (err) {
      setError(err.message || '分析过程中发生错误，请重试')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const handleNewAnalysis = () => {
    setFiles([])
    setCompanyName('')
    setWorkflowData(null)
    setReportFile(null)
    setError(null)
  }

  const handleLoadHistory = (historyItem) => {
    setReportFile(historyItem.reportFile)
  }

  return (
    <div className="min-h-screen relative">
      {/* Background Effects */}
      <div className="grain-overlay"></div>
      <div className="floating-orb w-96 h-96 bg-primary-500 top-20 left-10"></div>
      <div className="floating-orb w-80 h-80 bg-primary-600 bottom-40 right-20" style={{animationDelay: '-10s'}}></div>
      
      {/* Main Content */}
      <div className="relative z-10">
        <Header />
        
        <main className="container mx-auto px-6 py-8">
          {/* Error Alert */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-300 flex items-center gap-3 animate-fade-in">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{error}</span>
              <button 
                onClick={() => setError(null)}
                className="ml-auto hover:text-red-100"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          )}

          <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
            {/* Main Panel */}
            <div className="lg:col-span-3 space-y-8">
              {!reportFile ? (
                <>
                  {/* Upload Section */}
                  <FileUpload
                    files={files}
                    companyName={companyName}
                    onCompanyNameChange={setCompanyName}
                    onFilesAdded={handleFilesAdded}
                    onRemoveFile={handleRemoveFile}
                    onAnalyze={handleAnalyze}
                    isAnalyzing={isAnalyzing}
                  />

                  {/* Workflow Progress */}
                  {isAnalyzing && workflowData && (
                    <WorkflowProgress workflowData={workflowData} />
                  )}
                </>
              ) : (
                <ReportDownload 
                  reportFile={reportFile}
                  companyName={companyName}
                  onNewAnalysis={handleNewAnalysis}
                />
              )}
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1">
              <HistoryPanel 
                history={history}
                onLoadHistory={handleLoadHistory}
              />
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="relative z-10 mt-16 border-t border-dark-700/50 py-8">
          <div className="container mx-auto px-6 text-center text-dark-400">
            <p className="font-body">
              © 2024 智能尽调平台 | 专业财务分析解决方案
            </p>
            <p className="text-xs mt-2 text-dark-500">
              Powered by 企查查MCP + PaddleOCR-VL-1.6 + 智谱GLM-4.5-Flash
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}

export default App