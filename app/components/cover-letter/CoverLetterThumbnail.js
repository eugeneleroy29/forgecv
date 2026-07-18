const THUMBNAIL_CONTENT = {
  'ats-classic': {
    wrapper: 'border-2 border-gray-800 p-2 bg-white',
    header: 'h-3 bg-gray-800 rounded-sm w-3/4 mx-auto mb-2',
    lines: ['w-full', 'w-5/6', 'w-full', 'w-4/5', 'w-full', 'w-3/4'],
    hasAccent: false,
  },
  'ats-modern': {
    wrapper: 'border-2 border-gray-600 p-2 bg-white rounded-sm',
    header: 'h-3 bg-gray-600 rounded-sm w-3/4 mx-auto mb-2',
    lines: ['w-full', 'w-5/6', 'w-full', 'w-4/5', 'w-full', 'w-3/4'],
    hasAccent: false,
  },
  'premium-sidebar': {
    wrapper: 'border-2 border-gray-700 p-1 bg-white flex gap-1',
    sidebar: 'w-1/3 bg-gray-100 p-1',
    main: 'w-2/3 p-1',
    hasAccent: true,
  },
  'premium-minimal': {
    wrapper: 'border-2 border-gray-300 p-2 bg-white',
    header: 'h-2 bg-gray-300 rounded-sm w-1/2 mx-auto mb-3',
    lines: ['w-full', 'w-5/6', 'w-full', 'w-4/5', 'w-full', 'w-3/4'],
    hasAccent: true,
  },
}

export default function CoverLetterThumbnail({ template }) {
  const config = THUMBNAIL_CONTENT[template] || THUMBNAIL_CONTENT['ats-classic']

  if (template === 'premium-sidebar') {
    return (
      <div className={`w-full aspect-[8.5/11] ${config.wrapper}`}>
        <div className={config.sidebar}>
          <div className="h-2 bg-gray-400 rounded-sm w-full mb-1" />
          <div className="h-1 bg-gray-300 rounded-sm w-3/4 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-2/3 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-4/5 mb-2" />
          <div className="h-1 bg-gray-300 rounded-sm w-full mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-3/4" />
        </div>
        <div className={config.main}>
          <div className="h-1 bg-gray-300 rounded-sm w-2/3 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-full mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-5/6 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-full mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-4/5 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-full mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-3/4 mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-full mb-0.5" />
          <div className="h-1 bg-gray-300 rounded-sm w-5/6" />
        </div>
      </div>
    )
  }

  return (
    <div className={`w-full aspect-[8.5/11] ${config.wrapper}`}>
      {config.header && <div className={config.header} />}
      <div className="flex flex-col gap-1 mt-1">
        {config.lines.map((width, i) => (
          <div key={i} className={`h-1 bg-gray-200 rounded-sm ${width}`} />
        ))}
      </div>
      <div className="mt-2 flex flex-col gap-1">
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-3/4" />
      </div>
      <div className="mt-2 flex flex-col gap-1">
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-5/6" />
        <div className="h-1 bg-gray-200 rounded-sm w-full" />
        <div className="h-1 bg-gray-200 rounded-sm w-4/5" />
      </div>
    </div>
  )
}