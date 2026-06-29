"""
企查查 MCP 配置
"""

QCC_MCP_CONFIG = {
    "company": {
        "url": "https://agent.qcc.com/mcp/company/stream",
        "description": "企业基本信息查询"
    },
    "risk": {
        "url": "https://agent.qcc.com/mcp/risk/stream",
        "description": "企业风险信息查询"
    },
    "ipr": {
        "url": "https://agent.qcc.com/mcp/ipr/stream",
        "description": "企业知识产权信息查询"
    },
    "operation": {
        "url": "https://agent.qcc.com/mcp/operation/stream",
        "description": "企业经营信息查询"
    },
    "executive": {
        "url": "https://agent.qcc.com/mcp/executive/stream",
        "description": "企业高管信息查询"
    },
    "history": {
        "url": "https://agent.qcc.com/mcp/history/stream",
        "description": "企业历史信息查询"
    }
}

QCC_API_KEY = "M0XqvRM8Bp3CYNqfhcCIffODYeiaTc1h8ePLXyLS8tj9xQ51"
QCC_AUTHORIZATION = f"Bearer {QCC_API_KEY}"

# 企查查可用的工具列表
QCC_TOOLS = {
    "company": [
        "get_company_basic_info",      # 获取企业基本信息
        "get_company_shareholders",    # 获取股东信息
        "get_company_branches",        # 获取分支机构
        "get_company_change_record",   # 获取变更记录
    ],
    "risk": [
        "get_company_risk_info",       # 获取风险信息
        "get_company_lawsuits",        # 获取司法诉讼
        "get_company_violations",      # 获取经营异常
        "get_company_punishments",     # 获取行政处罚
    ],
    "ipr": [
        "get_company_trademarks",      # 获取商标信息
        "get_company_patents",         # 获取专利信息
        "get_company_copyrights",      # 获取著作权
        "get_company_software",        # 获取软件著作权
    ],
    "operation": [
        "get_company_bids",            # 获取招投标信息
        "get_company_contracts",       # 获取合同信息
        "get_company_certifications",  # 获取资质证书
        "get_company_tax_credit",      # 获取税务信用
    ],
    "executive": [
        "get_company_executives",      # 获取高管信息
        "get_executive_other_companies", # 高管关联企业
        "get_executive_investments",   # 对外投资
    ],
    "history": [
        "get_company_history_info",    # 历史信息
        "get_company_cancellation",    # 注销信息
        "get_company_bankruptcy",      # 破产信息
    ]
}