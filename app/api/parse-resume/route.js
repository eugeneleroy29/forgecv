import { NextResponse } from 'next/server'
import pdfParse from 'pdf-parse'
import mammoth from 'mammoth'

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
      const pdfData = await pdfParse(buffer)
      text = pdfData.text
    } else {
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
