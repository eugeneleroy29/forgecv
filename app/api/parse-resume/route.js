import { NextResponse } from 'next/server'

export async function POST(request) {
  try {
    const formData = await request.formData()
    const file = formData.get('file')

    if (!file) {
      return NextResponse.json({ success: false, error: 'No file provided' }, { status: 400 })
    }

    const allowedTypes = [
      'application/pdf',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    ]

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ success: false, error: 'Only PDF and DOCX files are allowed' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())
    let text = ''

    if (file.type === 'application/pdf') {
      const { default: PDFParser } = await import('pdf2json')
      
      const pdfParser = new PDFParser()
      
      const textContent = await new Promise((resolve, reject) => {
        pdfParser.on('pdfParser_dataReady', (pdfData) => {
          resolve(pdfData.Pages.map(page => 
            page.Texts.map(t => decodeURIComponent(t.R[0].T)).join(' ')
          ).join('\n\n'))
        })
        pdfParser.on('pdfParser_dataError', (err) => reject(err))
        pdfParser.parseBuffer(buffer)
      })
      
      text = textContent
    } else {
      const mammoth = await import('mammoth').then(m => m.default || m)
      const docxData = await mammoth.extractRawText({ buffer })
      text = docxData.value
    }

    return NextResponse.json({
      success: true,
      text: text.trim(),
    })

  } catch (error) {
    console.error('Parse resume error:', error)
    return NextResponse.json({ success: false, error: error.message }, { status: 500 })
  }
}