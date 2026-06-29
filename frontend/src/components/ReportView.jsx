import React, { useState } from 'react'

function ReportView({ report, onNewAnalysis }) {
  const [activeTab, setActiveTab] = useState('overview')
  const [expandedSection, setExpandedSection] = useState(null)

  const tabs = [
    { key: 'overview', label: '概览', icon: '📊' },
    { key: 'company', label: '企业信息', icon: '🏢' },
    { key: 'financial', label: '财务分析', icon: '💰' },
    { key: 'risks', label: '风险评估', icon: '⚠️' },
    { key: 'conclusion', label: '结论建议', icon: '✅' },
  ]

  const hasCompanyInfo = report.companyInfo && Object.keys(report.companyInfo).length > 0

  const getStatusColor = (status) => {
    if (status === '存续' || status === '在营') return 'text-green-400 bg-green-400/10 border-green-400/30'
    if (status === '注销' || status === '吊销') return 'text-red-400 bg-red-400/10 border-red-400/30'
    return 'text-yellow-400 bg-yellow-400/10 border-yellow-400/30'
  }

  return (
    <div className="animate-fade-in space-y-6">
      {/* Header */}
      <div className="glass-card rounded-2xl p-6">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center">
              <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <h2 className="text-2xl font-display font-bold text-white">
                尽调报告已生成
              </h2>
              <p className="text-dark-400">
                {new Date().toLocaleString('zh-CN')}
              </p>
              {report.metadata?.companyName && (
                <p className="text-primary-400 text-sm mt-1">
                  分析企业：{report.metadata.companyName}
                </p>
              )}
            </div>
          </div>

          <div className="flex gap-3">
            <button className="btn-secondary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
              导出报告
            </button>
            <button onClick={onNewAnalysis} className="btn-primary flex items-center gap-2">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              新建分析
            </button>
          </div>
        </div>
      </div>

      {/* Data Source Badge */}
      {report.metadata?.dataSource && (
        <div className="flex flex-wrap gap-2">
          {report.metadata.dataSource.map((source, i) => (
            <span 
              key={i}
              className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-500/20 text-primary-400 border border-primary-500/30"
            >
              {source === '财务报表' && '📄 '}
              {source === '审计报告' && '📋 '}
              {source === '企查查' && '🏢 '}
              {source}
            </span>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div className="glass-card rounded-2xl overflow-hidden">
        <div className="flex border-b border-dark-700 overflow-x-auto">
          {tabs.map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-shrink-0 px-6 py-4 font-semibold transition-all ${
                activeTab === tab.key
                  ? 'bg-primary-500/10 text-primary-400 border-b-2 border-primary-500'
                  : 'text-dark-400 hover:text-dark-200 hover:bg-dark-800/30'
              }`}
            >
              <span className="mr-2">{tab.icon}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* Content */}
        <div className="p-8">
          {activeTab === 'overview' && (
            <div className="markdown-content">
              <div dangerouslySetInnerHTML={{ __html: report.overview || '<p>暂无概览数据</p>' }} />
            </div>
          )}

          {activeTab === 'company' && (
            <div>
              {hasCompanyInfo ? (
                <div className="space-y-6">
                  {/* Company Basic Info */}
                  {report.companyInfo.basic && Object.keys(report.companyInfo.basic).length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">🏢</span>
                        工商基本信息
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {report.companyInfo.basic.companyName && (
                          <div className="md:col-span-2 p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
                            <p className="text-xs text-dark-500 mb-1">企业名称</p>
                            <p className="text-lg font-semibold text-white">{report.companyInfo.basic.companyName}</p>
                            {report.companyInfo.basic.status && (
                              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold border ${getStatusColor(report.companyInfo.basic.status)}`}>
                                {report.companyInfo.basic.status}
                              </span>
                            )}
                          </div>
                        )}
                        {[
                          { label: '统一社会信用代码', value: report.companyInfo.basic.creditCode },
                          { label: '法定代表人', value: report.companyInfo.basic.legalPerson },
                          { label: '注册资本', value: report.companyInfo.basic.registeredCapital },
                          { label: '成立日期', value: report.companyInfo.basic.establishmentDate },
                          { label: '企业类型', value: report.companyInfo.basic.companyType },
                          { label: '所属行业', value: report.companyInfo.basic.industry },
                        ].filter(item => item.value).map((item, i) => (
                          <div key={i} className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
                            <p className="text-xs text-dark-500 mb-1">{item.label}</p>
                            <p className="text-dark-200">{item.value}</p>
                          </div>
                        ))}
                        {report.companyInfo.basic.address && (
                          <div className="md:col-span-2 p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
                            <p className="text-xs text-dark-500 mb-1">注册地址</p>
                            <p className="text-dark-200">{report.companyInfo.basic.address}</p>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Risk Info */}
                  {report.companyInfo.risk && Object.keys(report.companyInfo.risk).length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-sm">⚠️</span>
                        风险信息
                      </h3>
                      <div className="p-4 rounded-xl bg-red-900/10 border border-red-500/20">
                        <div className="flex items-center gap-4">
                          <div className="text-center">
                            <p className="text-4xl font-bold text-red-400">
                              {report.companyInfo.risk.riskCount || 0}
                            </p>
                            <p className="text-xs text-dark-500">风险数量</p>
                          </div>
                          <div className="flex-1">
                            <p className="text-dark-300">
                              {report.companyInfo.risk.riskSummary || '暂无风险信息'}
                            </p>
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Operation Info */}
                  {report.companyInfo.operation && Object.keys(report.companyInfo.operation).length > 0 && (
                    <div>
                      <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                        <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">📊</span>
                        经营信息
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50 text-center">
                          <p className="text-3xl font-bold text-green-400">{report.companyInfo.operation.bidCount || 0}</p>
                          <p className="text-xs text-dark-500 mt-1">招投标信息</p>
                        </div>
                        <div className="p-4 rounded-xl bg-dark-800/30 border border-dark-700/50 text-center">
                          <p className="text-3xl font-bold text-blue-400">{report.companyInfo.operation.certificationCount || 0}</p>
                          <p className="text-xs text-dark-500 mt-1">资质证书</p>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* QCC Data Note */}
                  <div className="p-4 rounded-xl bg-blue-900/10 border border-blue-500/20">
                    <p className="text-sm text-blue-300">
                      💡 以上企业信息由 <strong>企查查MCP</strong> 提供，包含工商、风险、经营等多维度数据。
                    </p>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
                    <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                    </svg>
                  </div>
                  <p className="text-dark-400">未提供企业名称，未查询企查查信息</p>
                  <p className="text-dark-500 text-sm mt-2">在上传文档时输入企业名称即可获取企查查数据</p>
                </div>
              )}
            </div>
          )}

          {activeTab === 'financial' && (
            <div className="markdown-content">
              <div dangerouslySetInnerHTML={{ __html: report.financial || '<p>暂无财务分析数据</p>' }} />
            </div>
          )}

          {activeTab === 'risks' && (
            <div className="markdown-content">
              <div dangerouslySetInnerHTML={{ __html: report.risks || '<p>暂无风险评估数据</p>' }} />
            </div>
          )}

          {activeTab === 'conclusion' && (
            <div className="markdown-content">
              <div dangerouslySetInnerHTML={{ __html: report.conclusion || '<p>暂无结论建议</p>' }} />
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              </svg>
            </div>
            <span className="text-dark-400 text-sm">关键指标</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {report.keyMetrics || '--'}
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-yellow-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-dark-400 text-sm">风险等级</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {report.riskLevel || '--'}
          </p>
        </div>

        <div className="glass-card rounded-xl p-6">
          <div className="flex items-center gap-3 mb-2">
            <div className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center">
              <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-dark-400 text-sm">整体评分</span>
          </div>
          <p className="text-2xl font-display font-bold text-white">
            {report.score || '--'}
          </p>
        </div>
      </div>

      {/* Analysis Metadata */}
      {report.metadata && (
        <div className="glass-card rounded-xl p-6">
          <h4 className="text-sm font-semibold text-dark-400 mb-4">分析元数据</h4>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <p className="text-dark-500">文档数量</p>
              <p className="text-dark-200 font-semibold">{report.metadata.documentCount} 个</p>
            </div>
            <div>
              <p className="text-dark-500">表格数量</p>
              <p className="text-dark-200 font-semibold">{report.metadata.tableCount} 个</p>
            </div>
            <div>
              <p className="text-dark-500">AI模型</p>
              <p className="text-dark-200 font-semibold">{report.metadata.model}</p>
            </div>
            <div>
              <p className="text-dark-500">分析日期</p>
              <p className="text-dark-200 font-semibold">{report.metadata.analysisDate}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default ReportView