const THUMBNAIL_STYLES = {
  'ats-classic': {
    wrapper: 'border-2 border-gray-800 p-3 bg-white',
    header: 'text-center mb-3',
    name: 'h-3 bg-gray-800 rounded-sm w-2/3 mx-auto mb-1',
    contact: 'h-1.5 bg-gray-400 rounded-sm w-3/4 mx-auto mb-3',
    date: 'h-1.5 bg-gray-300 rounded-sm w-1/3 mb-2',
    recipient: 'mb-2',
    recipientLine1: 'h-1.5 bg-gray-600 rounded-sm w-1/2 mb-1',
    recipientLine2: 'h-1.5 bg-gray-400 rounded-sm w-2/5',
    salutation: 'h-1.5 bg-gray-500 rounded-sm w-1/3 mb-2',
    body: 'space-y-1 mb-3',
    bodyLine: 'h-1 bg-gray-300 rounded-sm',
    closing: 'h-1.5 bg-gray-400 rounded-sm w-1/4 mb-2',
    signature: 'h-2 bg-gray-600 rounded-sm w-1/3',
  },
  'ats-modern': {
    wrapper: 'border-2 border-gray-600 p-3 bg-white rounded-sm',
    header: 'text-center mb-3 border-b-2 border-gray-600 pb-2',
    name: 'h-3 bg-gray-700 rounded-sm w-2/3 mx-auto mb-1',
    contact: 'h-1.5 bg-gray-400 rounded-sm w-3/4 mx-auto',
    date: 'h-1.5 bg-gray-300 rounded-sm w-1/3 mb-2',
    recipient: 'mb-2',
    recipientLine1: 'h-1.5 bg-gray-600 rounded-sm w-1/2 mb-1',
    recipientLine2: 'h-1.5 bg-gray-400 rounded-sm w-2/5',
    salutation: 'h-1.5 bg-gray-500 rounded-sm w-1/3 mb-2',
    body: 'space-y-1 mb-3',
    bodyLine: 'h-1 bg-gray-300 rounded-sm',
    closing: 'h-1.5 bg-gray-400 rounded-sm w-1/4 mb-2',
    signature: 'h-2 bg-gray-700 rounded-sm w-1/3',
  },
  'premium-minimal': {
    wrapper: 'border-2 border-gray-300 p-3 bg-white',
    header: 'text-center mb-4',
    name: 'h-2.5 bg-gray-400 rounded-sm w-1/2 mx-auto mb-2',
    divider: 'w-8 h-0.5 bg-gray-400 mx-auto mb-2',
    contact: 'h-1 bg-gray-300 rounded-sm w-2/3 mx-auto',
    date: 'h-1.5 bg-gray-300 rounded-sm w-1/3 mb-2',
    recipient: 'mb-2',
    recipientLine1: 'h-1.5 bg-gray-600 rounded-sm w-1/2 mb-1',
    recipientLine2: 'h-1.5 bg-gray-400 rounded-sm w-2/5',
    salutation: 'h-1.5 bg-gray-500 rounded-sm w-1/3 mb-2',
    body: 'space-y-1 mb-3',
    bodyLine: 'h-1 bg-gray-300 rounded-sm',
    closing: 'h-1.5 bg-gray-400 rounded-sm w-1/4 mb-2',
    signature: 'h-2 bg-gray-600 rounded-sm w-1/3',
  },
}

export default function CoverLetterThumbnail({ template }) {
  const s = THUMBNAIL_STYLES[template] || THUMBNAIL_STYLES['ats-classic']

  return (
    <div className={`w-full aspect-[8.5/11] ${s.wrapper}`}>
      <div className={s.header}>
        <div className={s.name} />
        <div className={s.contact} />
      </div>
      <div className={s.date} />
      <div className={s.recipient}>
        <div className={s.recipientLine1} />
        <div className={s.recipientLine2} />
      </div>
      <div className={s.salutation} />
      <div className={s.body}>
        <div className={`${s.bodyLine} w-full`} />
        <div className={`${s.bodyLine} w-5/6`} />
        <div className={`${s.bodyLine} w-full`} />
        <div className={`${s.bodyLine} w-4/5`} />
        <div className={`${s.bodyLine} w-full`} />
        <div className={`${s.bodyLine} w-3/4`} />
        <div className={`${s.bodyLine} w-full`} />
        <div className={`${s.bodyLine} w-5/6`} />
      </div>
      <div className={s.closing} />
      <div className={s.signature} />
    </div>
  )
}
