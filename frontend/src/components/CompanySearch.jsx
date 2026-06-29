import React, { useState } from 'react'
import { queryCompany } from '../services/api'

function CompanySearch({ onCompanySelect }) {
  const [searchTerm, setSearchTerm] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [companyInfo, setCompanyInfo] = useState(null)
  const [error, setError] = useState(null)

  const handleSearch = async () => {
    if (!searchTerm.trim()) return

    setIsSearching(true)
    setError(null)
    setCompanyInfo(null)

    try {
      const result = await queryCompany(searchTerm)
      setCompanyInfo(result)
    } catch (err) {
      setError(err.message || '查询失败，请重试')
    } finally {
      setIsSearching(false)
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSearch()
    }
  }

  const getStatusColor = (status) => {
    if (status === '存续' || status === '在营') return 'text-green-400 bg-green-400/10'
    if (status === '注销' || status === '吊销') return 'text-red-400 bg-red-400/10'
    return 'text-yellow-400 bg-yellow-400/10'
  }

  return (
    <div className="glass-card rounded-2xl p-8 animate-fade-in">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-lg bg-blue-500/20 flex items-center justify-center">
          <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
        </div>
        <div>
          <h2 className="text-xl font-display font-semibold text-white">企业信息查询</h2>
          <p className="text-sm text-dark-400">基于企查查MCP查询企业工商、风险等信息</p>
        </div>
      </div>

      {/* Search Input */}
      <div className="flex gap-4 mb-6">
        <div className="flex-1 relative">
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="请输入企业名称（如：阿里巴巴、腾讯、华为）"
            className="w-full px-4 py-3 rounded-xl bg-dark-800/50 border border-dark-700 text-white placeholder-dark-500 focus:border-primary-500 focus:ring-1 focus:ring-primary-500 outline-none transition-all pr-12"
            disabled={isSearching}
          />
          <div className="absolute right-3 top-1/2 -translate-y-1/2">
            <span className="text-xs px-2 py-1 rounded bg-blue-500/20 text-blue-400">
              企查查
            </span>
          </div>
        </div>
        <button
          onClick={handleSearch}
          disabled={!searchTerm.trim() || isSearching}
          className={`btn-primary px-6 ${!searchTerm.trim() || isSearching ? 'opacity-50 cursor-not-allowed' : ''}`}
        >
          {isSearching ? (
            <>
              <svg className="w-5 h-5 animate-spin" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              查询中
            </>
          ) : (
            <>
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              查询
            </>
          )}
        </button>
      </div>

      {/* Data Modules Info */}
      <div className="mb-6 p-4 rounded-xl bg-dark-800/30 border border-dark-700/50">
        <p className="text-sm text-dark-400 mb-2">
          <span className="text-primary-400 font-semibold">查询范围：</span>
          企业工商信息、风险信息、知识产权、经营信息、高管信息、历史变更
        </p>
        <div className="flex flex-wrap gap-2">
          {['company', 'risk', 'ipr', 'operation', 'executive', 'history'].map((module) => (
            <span
              key={module}
              className="text-xs px-2 py-1 rounded bg-dark-700/50 text-dark-300"
            >
              {module}
            </span>
          ))}
        </div>
      </div>

      {/* Error Message */}
      {error && (
        <div className="mb-6 p-4 rounded-xl bg-red-900/20 border border-red-500/30 text-red-300">
          {error}
        </div>
      )}

      {/* Company Info Result */}
      {companyInfo && (
        <div className="space-y-6 animate-slide-up">
          {/* Company Header */}
          <div className="p-6 rounded-xl bg-gradient-to-br from-primary-500/10 to-blue-500/10 border border-primary-500/20">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-2xl font-display font-bold text-white mb-2">
                  {companyInfo.company_name || searchTerm}
                </h3>
                <p className="text-dark-400 text-sm">
                  查询时间：{companyInfo.query_time}
                </p>
              </div>
              <button
                onClick={() => onCompanySelect({ name: companyInfo.company_name || searchTerm })}
                className="btn-primary text-sm py-2 px-4"
              >
                使用此企业分析文档
              </button>
            </div>
          </div>

          {/* Basic Info */}
          {companyInfo.modules?.company?.basic_info && (
            <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center text-sm">
                  🏢
                </span>
                基本信息
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {(() => {
                  const basic = companyInfo.modules.company.basic_info
                  const fields = [
                    { label: '统一社会信用代码', value: basic.credit_code },
                    { label: '法定代表人', value: basic.legal_person },
                    { label: '注册资本', value: basic.registered_capital },
                    { label: '成立日期', value: basic.establishment_date },
                    { label: '企业类型', value: basic.company_type },
                    { label: '所属行业', value: basic.industry },
                    { label: '注册地址', value: basic.address, full: true },
                  ]
                  return fields.map((field, i) => (
                    <div key={i} className={field.full ? 'md:col-span-2' : ''}>
                      <p className="text-xs text-dark-500 mb-1">{field.label}</p>
                      <p className="text-dark-200">{field.value || '-'}</p>
                    </div>
                  ))
                })()}
              </div>
              {basic.status && (
                <div className="mt-4">
                  <span className={`px-3 py-1 rounded-full text-sm font-semibold ${getStatusColor(basic.status)}`}>
                    {basic.status}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Risk Info */}
          {companyInfo.modules?.risk && (
            <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center text-sm">
                  ⚠️
                </span>
                风险信息
              </h4>
              <div className="flex items-center gap-4">
                <div className="text-center">
                  <p className="text-3xl font-bold text-red-400">
                    {companyInfo.modules.risk.risk_count || 0}
                  </p>
                  <p className="text-xs text-dark-500">风险数量</p>
                </div>
                <div className="flex-1">
                  <p className="text-dark-300">
                    {companyInfo.modules.risk.risk_summary || '暂无风险信息'}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Operation Info */}
          {companyInfo.modules?.operation && (
            <div className="p-6 rounded-xl bg-dark-800/30 border border-dark-700/50">
              <h4 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <span className="w-8 h-8 rounded-lg bg-green-500/20 flex items-center justify-center text-sm">
                  📊
                </span>
                经营信息
              </h4>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                <div className="text-center p-4 rounded-lg bg-dark-700/30">
                  <p className="text-2xl font-bold text-green-400">
                    {companyInfo.modules.operation.bidCount || 0}
                  </p>
                  <p className="text-xs text-dark-500">招投标</p>
                </div>
                <div className="text-center p-4 rounded-lg bg-dark-700/30">
                  <p className="text-2xl font-bold text-blue-400">
                    {companyInfo.modules.operation.certificationCount || 0}
                  </p>
                  <p className="text-xs text-dark-500">资质证书</p>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Empty State */}
      {!companyInfo && !isSearching && !error && (
        <div className="text-center py-12">
          <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-dark-800/50 flex items-center justify-center">
            <svg className="w-10 h-10 text-dark-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
            </svg>
          </div>
          <p className="text-dark-400">输入企业名称开始查询</p>
          <p className="text-dark-500 text-sm mt-2">支持查询企业工商、风险、知识产权等信息</p>
        </div>
      )}
    </div>
  )
}

export default CompanySearch