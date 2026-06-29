import axios from 'axios'

const API_BASE_URL = window.location.hostname === 'localhost' 
  ? '/api' 
  : (import.meta.env.VITE_API_URL || '/api')

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 600000, // 10 minutes for full workflow
})

/**
 * Analyze uploaded PDF files with complete 3-step workflow
 */
export async function analyzeFiles(files, companyName, onProgress) {
  const formData = new FormData()
  
  files.forEach((file) => {
    formData.append('files', file)
  })
  
  formData.append('company_name', companyName)

  try {
    // Start analysis
    const response = await api.post('/analyze', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    })

    const taskId = response.data.taskId

    // Poll for progress updates
    return await pollWorkflowProgress(taskId, onProgress)

  } catch (error) {
    console.error('Analysis error:', error)
    throw new Error(error.response?.data?.detail || error.message || '分析失败')
  }
}

/**
 * Poll for workflow progress with detailed step information
 */
async function pollWorkflowProgress(taskId, onProgress) {
  return new Promise((resolve, reject) => {
    const pollInterval = setInterval(async () => {
      try {
        const response = await api.get(`/status/${taskId}`)
        const { status, workflow, error, reportFile } = response.data

        if (error) {
          clearInterval(pollInterval)
          reject(new Error(error))
          return
        }

        // Send progress update
        if (workflow) {
          onProgress({
            currentStep: workflow.currentStep,
            steps: workflow.steps,
            overallProgress: workflow.overallProgress
          })
        }

        if (status === 'completed' && reportFile) {
          clearInterval(pollInterval)
          resolve(reportFile)
        } else if (status === 'failed') {
          clearInterval(pollInterval)
          reject(new Error('分析失败'))
        }
      } catch (err) {
        clearInterval(pollInterval)
        reject(err)
      }
    }, 1000) // Poll every 1 second for more responsive updates
  })
}

export default api