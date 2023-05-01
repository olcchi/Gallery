import type { APIRoute } from 'astro'
const url = 'https://api.vika.cn/fusion/v1/datasheets/dstgK4fhao4Qv6Ztfr/records'
const token = 'Bearer uskK5FftsbXnLqrOV5DjzLY'
const work = await fetch(url, {
  headers: {
    Authorization: token,
  },
})
const workData = await work.json()
const workRecords = workData.data.records.map((i) => {
  return i.fields
})

export const get: APIRoute = async({ params }) => {
  let work
  switch (params.workId) {
    case 'tu':
      work = workRecords[0]
      break
    case 'un':
      work = workRecords[1]
      break
    case 'al':
      work = workRecords[2]
      break
    case 'ne':
      work = workRecords[3]
      break
    case 'all':
      work = workRecords.map((work) => {
        return { workName: work.workName, Cover: work.Cover }
      })
      break
  }
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
