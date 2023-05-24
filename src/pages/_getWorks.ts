type wokrs = 'all' | 'tu' | 'al' | 'un'
export function getWorks(workName:works) {
    const href = import.meta.env.PROD
  ? 'https://ekargallery.netlify.app/'
  : Astro.request.url
let url = `${href}all.json`
workName === 'all' ?  url = `${href}all.json` : 
}
