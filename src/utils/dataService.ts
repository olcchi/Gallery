import fallbackData from '../data/fallback.json'

// 添加延迟函数
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms))

// 添加重试机制的fetch函数
async function fetchWithRetry(url: string, options: RequestInit, maxRetries = 3, delayMs = 1000): Promise<Response> {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const response = await fetch(url, options)
      
      // 如果是429错误，等待更长时间后重试
      if (response.status === 429) {
        if (i < maxRetries - 1) {
          const waitTime = delayMs * Math.pow(2, i) // 指数退避
          console.warn(`API rate limited, waiting ${waitTime}ms before retry ${i + 1}/${maxRetries}`)
          await delay(waitTime)
          continue
        }
      }
      
      return response
    } catch (error) {
      if (i < maxRetries - 1) {
        console.warn(`API request failed, retrying ${i + 1}/${maxRetries}:`, error.message)
        await delay(delayMs)
        continue
      }
      throw error
    }
  }
  
  throw new Error('Max retries exceeded')
}

// 全局缓存，避免重复请求
let cachedData: any = null
let cacheTimestamp = 0
const CACHE_DURATION = import.meta.env.DEV ? 2000 : 60000 // 开发环境下仅缓存2秒，生产环境下1分钟

// 数据获取函数，带有错误处理
export async function fetchWorkData() {
  // 检查缓存
  const now = Date.now()
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached data')
    return cachedData
  }

  try {
    // 检查环境变量
    const token = import.meta.env.IMAGE_HOST_TOKEN
    if (!token) {
      console.warn('IMAGE_HOST_TOKEN not found, using fallback data')
      return fallbackData.records
    }

    console.log('Fetching work data from API...')
    const url = 'https://api.vika.cn/fusion/v1/datasheets/dstgK4fhao4Qv6Ztfr/records'
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 3, 2000) // 3次重试，2秒起始延迟

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const workData = await response.json()
    if (!workData.data || !workData.data.records) {
      throw new Error('Invalid API response format')
    }

    // 缓存所有数据
    cachedData = workData.data.records.map(i => i.fields)
    cacheTimestamp = now
    console.log('Work data fetched successfully')
    
    return cachedData
  } catch (error) {
    console.warn('Failed to fetch work data from API, using fallback data:', error.message)
    return fallbackData.records
  }
}

// 获取项目标题（从特定记录获取）
export async function getProjectTitle() {
  const workRecords = await fetchWorkData()
  // 项目标题记录通常是第4个（索引为3），或者名为 'Never Know...' 或 'yi' 的记录
  const projectRecord = workRecords.find(field => 
    field.workName === 'Never Know How Much I Love You' || 
    field.workName === 'yi' || 
    field.workName === 'YI'
  ) || workRecords[3]
  
  return projectRecord?.workName || 'YI'
}

// 获取所有作品列表
export async function getWorks() {
  const workRecords = await fetchWorkData()
  const projectTitle = await getProjectTitle()
  return workRecords
    .filter(work => work.workName && work.workName !== projectTitle)
    .map(work => ({
      ...work,
      slug: (work.workName as string).replace(/ /g, "_")
    }))
}

// 工作索引映射
export const workIndex: Record<string, number> = {
  tu: 0,
  un: 1,
  al: 2,
  ne: 3,
  all: 4,
}

// 根据工作ID获取数据
export async function getWorkById(workId: string) {
  if (workId === "all") {
    return getWorks()
  }
  
  const workRecords = await fetchWorkData()
  const index = workIndex[workId]
  
  if (index === undefined) {
    return null
  }
  
  // 返回特定工作的图片
  return workRecords[index]?.picture || []
} 