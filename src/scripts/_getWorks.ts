// type works = 'all' | 'tu' | 'al' | 'un'
type works = 'all' | 'tu' | 'al' | 'un'
export async function getWorks(workName: works, _href) {
  const href = import.meta.env.PROD
    ? 'https://ekargallery.netlify.app/'
    : _href
  const url = workName === 'all' ? `${href}all.json` : `${href}/${workName}.json`
  const res = await fetch(url)
  const _workList = await res.json()
  return _workList
}
