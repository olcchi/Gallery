import type { APIRoute } from 'astro'
import fallbackData from '../data/fallback.json'

// 数据获取函数，带有错误处理
async function fetchWorkData() {
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

// 在模块顶层获取数据
const workRecords = await fetchWorkData()

const workIndex: Record<string, number> = {
  tu: 0,
  un: 1,
  al: 2,
  // ne: 3,
  all: 4,
}

export const GET: APIRoute = async ({ params }) => {
  const index = workIndex[params.workId!]
  const work = index !== undefined
    ? index === 4
      ? workRecords.map(({ workName, coverImage, placeHolderImage }) => ({ workName, coverImage, placeHolderImage }))
      : workRecords[index].picture
    : null
  return new Response(JSON.stringify(work), {
    status: 200,
    headers: {
      'Content-Type': 'application/json',
    },
  });
}

export function getStaticPaths() {
  return [
    { params: { workId: 'tu' } },
    { params: { workId: 'un' } },
    { params: { workId: 'al' } },
    // { params: { workId: 'ne' } },
    { params: { workId: 'all' } },
  ]
}
