import type { APIRoute } from 'astro'
import { getWorkById } from '../utils/dataService'

export const GET: APIRoute = async ({ params }) => {
  const work = await getWorkById(params.workId!)
  
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
