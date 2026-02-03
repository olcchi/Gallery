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
// Remove extremely short cache in dev to avoid constant re-fetching
// Use 1 hour for Dev to keep it fast during development session
const CACHE_DURATION = import.meta.env.DEV ? 1000 * 60 * 60 : 60000 

// Promise limit to dedupe inflight requests
let fetchPromise: Promise<any> | null = null;

async function doFetch() {
  const token = import.meta.env.IMAGE_HOST_TOKEN
  if (!token) {
    console.warn('IMAGE_HOST_TOKEN not found, using fallback data')
    return fallbackData.records
  }

  console.log('Fetching work data from API...')
  const startTime = Date.now()
  const url = 'https://api.vika.cn/fusion/v1/datasheets/dstgK4fhao4Qv6Ztfr/records'
  
  try {
    const response = await fetchWithRetry(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    }, 3, 2000)

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const workData = await response.json()
    if (!workData.data || !workData.data.records) {
      throw new Error('Invalid API response format')
    }

    const records = workData.data.records.map((i: any) => i.fields)
    
    // Update cache
    cachedData = records
    cacheTimestamp = Date.now()
    console.log(`Work data fetched successfully in ${Date.now() - startTime}ms`)
    
    return records
  } catch (error) {
    console.warn('Failed to fetch work data from API, using fallback data:', error.message)
    return fallbackData.records
  } finally {
    fetchPromise = null
  }
}

// 立即尝试预获取数据 (Eager fetch on module load)
// 这有助于在服务器启动时就开始获取数据，减少首次访问的延迟
if (import.meta.env.DEV) {
    // catch error to prevent unhandled rejection crashes, though doFetch handles errors internally mostly
    fetchPromise = doFetch().catch(e => {
        console.error("Initial fetch failed", e);
        return fallbackData.records;
    });
}

// 数据获取函数，带有错误处理
export async function fetchWorkData() {
  // 检查缓存
  const now = Date.now()
  if (cachedData && (now - cacheTimestamp) < CACHE_DURATION) {
    console.log('Using cached data')
    return cachedData
  }

  // 如果已经在请求中，直接返回该 Promise
  if (fetchPromise) {
      console.log('Waiting for pending fetch...')
      return fetchPromise
  }

  fetchPromise = doFetch()
  return fetchPromise
}

// 获取项目标题（从特定记录获取）
export async function getProjectTitle() {
  const workRecords = await fetchWorkData()
  // 项目标题记录通常是第4个（索引为3），或者名为 'Never Know...' 或 'yi' 的记录
  const projectRecord = workRecords.find((field: any) => 
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
    .filter((work: any) => work.workName && work.workName !== projectTitle)
    .map((work: any) => ({
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