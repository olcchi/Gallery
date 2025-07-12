import fallbackData from '../data/fallback.json'

// 数据获取函数，带有错误处理
export async function fetchWorkData() {
  try {
    // 检查环境变量
    const token = import.meta.env.IMAGE_HOST_TOKEN
    if (!token) {
      console.warn('IMAGE_HOST_TOKEN not found, using fallback data')
      return fallbackData.records
    }

    const url = 'https://api.vika.cn/fusion/v1/datasheets/dstgK4fhao4Qv6Ztfr/records'
    const response = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    })

    if (!response.ok) {
      throw new Error(`API request failed: ${response.status}`)
    }

    const workData = await response.json()
    if (!workData.data || !workData.data.records) {
      throw new Error('Invalid API response format')
    }

    return workData.data.records.map(i => i.fields)
  } catch (error) {
    console.warn('Failed to fetch work data from API, using fallback data:', error.message)
    return fallbackData.records
  }
}

// 工作索引映射
export const workIndex: Record<string, number> = {
  tu: 0,
  un: 1,
  al: 2,
  // ne: 3,
  all: 4,
}

// 根据工作ID获取数据
export async function getWorkById(workId: string) {
  const workRecords = await fetchWorkData()
  const index = workIndex[workId]
  
  if (index === undefined) {
    return null
  }
  
  if (index === 4) {
    // 返回所有工作的概览
    return workRecords.map(({ workName, coverImage, placeHolderImage }) => ({ 
      workName, 
      coverImage, 
      placeHolderImage 
    }))
  }
  
  // 返回特定工作的图片
  return workRecords[index]?.picture || []
} 