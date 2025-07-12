type works = 'all' | 'tu' | 'al' | 'un'
// type works = 'all' | 'tu' | 'al' | 'un' | 'ne'
export async function getWorks(workName: works, _href: string) {
  try {
    const href = import.meta.env.PROD
      ? 'https://yigallery.netlify.app/'
      : _href
    
    const url = workName === 'all' ? `${href}all.json` : `${href}/${workName}.json`
    
    const res = await fetch(url)
    
    if (!res.ok) {
      throw new Error(`Failed to fetch work data: ${res.status}`)
    }
    
    const _workList = await res.json()
    return _workList
  } catch (error) {
    console.warn(`Failed to fetch work data for ${workName}:`, error.message)
    
    // 返回基本的fallback数据
    const fallbackData = {
      all: [
        { workName: 'Turpan', coverImage: '/paper.png', placeHolderImage: '/paper.png' },
        { workName: 'Unnoticed', coverImage: '/paper.png', placeHolderImage: '/paper.png' },
        { workName: 'Another Landscape', coverImage: '/paper.png', placeHolderImage: '/paper.png' }
      ],
      tu: [{ url: '/paper.png', alt: 'Turpan Gallery Image' }],
      al: [{ url: '/paper.png', alt: 'Another Landscape Gallery Image' }],
      un: [{ url: '/paper.png', alt: 'Unnoticed Gallery Image' }]
    }
    
    return fallbackData[workName] || []
  }
}
