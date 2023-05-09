import type { APIRoute } from 'astro'
const url = 'https://api.vika.cn/fusion/v1/datasheets/dstgK4fhao4Qv6Ztfr/records'
const token = `Bearer ${import.meta.env.IMAGE_HOST_TOKEN}`
const work = await fetch(url, {
  headers: {
    Authorization: token,
  },
})
const workData = await work.json()
const workRecords = workData.data.records.map(i => i.fields)

const workIndex: Record<string, number> = {
  tu: 0,
  un: 1,
  al: 2,
  ne: 3,
  all: 4,
}
export const get: APIRoute = async({ params }) => {
  const index = workIndex[params.workId!]
  const work = index !== undefined
    ? index === 4
      ? workRecords.map(({ workName, cover, placeHolder }) => ({ workName, cover, placeHolder }))
      : workRecords[index]
    : null
  return {
    body: JSON.stringify(work),
  }
}
export function getStaticPaths() {
  return [
    { params: { workId: 'tu' } },
    { params: { workId: 'un' } },
    { params: { workId: 'al' } },
    { params: { workId: 'ne' } },
    { params: { workId: 'all' } },
  ]
}
