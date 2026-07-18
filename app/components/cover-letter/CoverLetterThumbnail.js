const THUMBNAIL_STYLES = {
  'ats-classic': 'border-2 border-gray-800 p-2 bg-white',
  'ats-modern': 'border-2 border-gray-600 p-2 bg-white rounded-sm',
  'premium-sidebar': 'border-2 border-gray-700 p-2 bg-white flex',
  'premium-minimal': 'border-2 border-gray-300 p-2 bg-white',
}

export default function CoverLetterThumbnail({ template }) {
  const style = THUMBNAIL_STYLES[template] || THUMBNAIL_STYLES['ats-classic']
  
  return (
    <div className={`w-full aspect-[8.5/11] ${style}`}>
      <div className="w-full h-full flex flex-col gap-1">
        <div className="h-2 bg-gray-300 rounded-sm w-3/4 mx-auto" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
        <div className="mt-2 h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
      </div>
    </div>
  )
}