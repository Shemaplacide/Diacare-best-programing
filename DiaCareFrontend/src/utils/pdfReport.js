const PAGE_WIDTH = 595
const PAGE_HEIGHT = 842
const MARGIN = 42
const CONTENT_WIDTH = PAGE_WIDTH - (MARGIN * 2)

const COLORS = {
  navy: [0.04, 0.25, 0.45],
  blue: [0.06, 0.36, 0.65],
  paleBlue: [0.94, 0.98, 1],
  border: [0.84, 0.89, 0.92],
  text: [0.12, 0.16, 0.24],
  muted: [0.39, 0.45, 0.55],
  white: [1, 1, 1],
  green: [0.09, 0.64, 0.29],
  red: [0.86, 0.15, 0.15],
}

export function downloadPdfReport(filename, report) {
  const pdf = buildPdf(report)
  const blob = new Blob([pdf], { type: 'application/pdf' })
  const url = URL.createObjectURL(blob)
  const link = document.createElement('a')
  link.href = url
  link.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`
  link.click()
  URL.revokeObjectURL(url)
}

function buildPdf(report) {
  const pages = [[]]
  let pageNumber = 1
  let y = PAGE_HEIGHT - 162

  const current = () => pages[pages.length - 1]

  const add = command => current().push(command)

  const addPage = () => {
    pages.push([])
    pageNumber += 1
    drawHeader(true)
    y = PAGE_HEIGHT - 154
  }

  const ensureSpace = height => {
    if (y - height < MARGIN + 34) addPage()
  }

  const setColor = color => color.join(' ')
  const rect = (x, bottomY, width, height, fill, stroke = null) => {
    if (fill) add(`${setColor(fill)} rg ${x} ${bottomY} ${width} ${height} re f`)
    if (stroke) add(`${setColor(stroke)} RG ${x} ${bottomY} ${width} ${height} re S`)
  }

  const line = (x1, y1, x2, y2, color = COLORS.border, width = 1) => {
    add(`${setColor(color)} RG ${width} w ${x1} ${y1} m ${x2} ${y2} l S`)
  }

  const text = (value, size, x, textY, color = COLORS.text, font = 'F1') => {
    add(`${setColor(color)} rg BT /${font} ${size} Tf ${x} ${textY} Td (${escapePdf(value)}) Tj ET`)
  }

  const wrappedText = (value, size, x, textY, maxChars, color = COLORS.text, font = 'F1', leading = 13) => {
    let cursor = textY
    wrap(value, maxChars).forEach(part => {
      text(part, size, x, cursor, color, font)
      cursor -= leading
    })
    return cursor
  }

  const drawHeader = (continued = false) => {
    rect(0, PAGE_HEIGHT - 142, PAGE_WIDTH, 142, COLORS.navy)
    rect(MARGIN, PAGE_HEIGHT - 84, 34, 34, COLORS.white)
    rect(MARGIN + 7, PAGE_HEIGHT - 77, 20, 20, COLORS.blue)
    text('DiaCare', 11, MARGIN + 48, PAGE_HEIGHT - 58, COLORS.white, 'F2')
    text('Admin Report', 8, MARGIN + 48, PAGE_HEIGHT - 73, [0.78, 0.88, 0.96], 'F1')

    text(continued ? `${clean(report.title)} (continued)` : report.title, 19, MARGIN, PAGE_HEIGHT - 104, COLORS.white, 'F2')
    if (!continued && report.subtitle) {
      wrappedText(report.subtitle, 9, MARGIN, PAGE_HEIGHT - 121, 86, [0.82, 0.9, 0.97], 'F1', 11)
    }
    text(`Generated: ${new Date().toLocaleString()}`, 8, PAGE_WIDTH - 190, PAGE_HEIGHT - 58, [0.82, 0.9, 0.97], 'F1')
    text(`Page ${pageNumber}`, 8, PAGE_WIDTH - 82, 24, COLORS.muted, 'F1')
  }

  const sectionTitle = title => {
    ensureSpace(30)
    text(title, 13, MARGIN, y, COLORS.navy, 'F2')
    line(MARGIN, y - 7, MARGIN + CONTENT_WIDTH, y - 7, COLORS.border, 0.8)
    y -= 24
  }

  const drawSummaryCards = () => {
    if (!report.summary?.length) return
    sectionTitle('Summary')
    const gap = 10
    const cardW = (CONTENT_WIDTH - (gap * 2)) / 3
    const cardH = 58

    report.summary.forEach((item, index) => {
      if (index > 0 && index % 3 === 0) y -= cardH + 12
      ensureSpace(cardH + 10)
      const col = index % 3
      const x = MARGIN + (col * (cardW + gap))
      const bottom = y - cardH + 8
      rect(x, bottom, cardW, cardH, COLORS.paleBlue, COLORS.border)
      rect(x, bottom, 4, cardH, index === 1 ? COLORS.green : COLORS.blue)
      text(String(item.value ?? '-'), 18, x + 14, y - 14, index === 1 ? COLORS.green : COLORS.blue, 'F2')
      wrappedText(item.label, 8, x + 14, y - 31, 22, COLORS.muted, 'F1', 10)
    })
    y -= cardH + 14
  }

  const drawFilters = () => {
    if (!report.filters?.length) return
    sectionTitle('Filters Used')
    const height = 22 + (report.filters.length * 13)
    ensureSpace(height)
    rect(MARGIN, y - height + 8, CONTENT_WIDTH, height, [0.98, 0.99, 1], COLORS.border)
    let cursor = y - 12
    report.filters.forEach(filter => {
      text(filter, 9, MARGIN + 14, cursor, COLORS.muted, 'F1')
      cursor -= 13
    })
    y -= height + 10
  }

  const drawRecordCard = (row, index) => {
    const fields = row.fields ?? []
    const lines = fields.reduce((sum, field) => sum + wrap(`${field.label}: ${field.value ?? '-'}`, 72).length, 0)
    const height = Math.max(58, 36 + (lines * 11))
    ensureSpace(height + 8)

    const bottom = y - height + 6
    rect(MARGIN, bottom, CONTENT_WIDTH, height, COLORS.white, COLORS.border)
    rect(MARGIN, bottom + height - 24, CONTENT_WIDTH, 24, COLORS.paleBlue)
    text(`${index + 1}. ${row.title ?? 'Record'}`, 10, MARGIN + 12, bottom + height - 16, COLORS.navy, 'F2')

    let cursor = bottom + height - 38
    fields.forEach(field => {
      const label = `${field.label}: `
      const value = String(field.value ?? '-')
      const isStatus = field.label.toLowerCase().includes('status')
      const color = value.toUpperCase().includes('FAILED') ? COLORS.red : value.toUpperCase().includes('SUCCESS') ? COLORS.green : COLORS.text
      const fieldLines = wrap(`${label}${value}`, 72)
      fieldLines.forEach((part, i) => {
        text(part, 8.5, MARGIN + 14, cursor, i === 0 && isStatus ? color : COLORS.text, i === 0 && isStatus ? 'F2' : 'F1')
        cursor -= 11
      })
    })
    y = bottom - 10
  }

  drawHeader()
  drawSummaryCards()
  drawFilters()

  report.sections?.forEach(section => {
    sectionTitle(section.title)
    if (section.description) {
      ensureSpace(34)
      y = wrappedText(section.description, 9, MARGIN, y, 91, COLORS.muted, 'F1', 12) - 4
    }
    if (!section.rows?.length) {
      ensureSpace(40)
      rect(MARGIN, y - 32, CONTENT_WIDTH, 36, [0.98, 0.99, 1], COLORS.border)
      text('No records found for this report.', 9, MARGIN + 14, y - 15, COLORS.muted, 'F1')
      y -= 48
      return
    }
    section.rows.forEach((row, index) => drawRecordCard(row, index))
  })

  if (report.notes?.length) {
    sectionTitle('Notes')
    report.notes.forEach(note => {
      ensureSpace(24)
      y = wrappedText(note, 9, MARGIN + 10, y, 88, COLORS.muted, 'F1', 12) - 4
    })
  }

  return createPdf(pages)
}

function createPdf(pages) {
  const objects = [
    null,
    null,
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>',
  ]
  const addObject = body => {
    objects.push(body)
    return objects.length
  }

  const pageIds = []
  pages.forEach(page => {
    const stream = page.join('\n')
    const contentId = addObject(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`)
    const pageId = addObject(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PAGE_WIDTH} ${PAGE_HEIGHT}] /Resources << /Font << /F1 3 0 R /F2 4 0 R >> >> /Contents ${contentId} 0 R >>`)
    pageIds.push(pageId)
  })

  objects[0] = '<< /Type /Catalog /Pages 2 0 R >>'
  objects[1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(' ')}] /Count ${pageIds.length} >>`

  const ordered = objects.map((body, index) => `${index + 1} 0 obj\n${body}\nendobj\n`)
  let pdf = '%PDF-1.4\n'
  const offsets = [0]
  ordered.forEach(obj => {
    offsets.push(pdf.length)
    pdf += obj
  })
  const xrefStart = pdf.length
  pdf += `xref\n0 ${ordered.length + 1}\n0000000000 65535 f \n`
  offsets.slice(1).forEach(offset => {
    pdf += `${String(offset).padStart(10, '0')} 00000 n \n`
  })
  pdf += `trailer\n<< /Size ${ordered.length + 1} /Root 1 0 R >>\nstartxref\n${xrefStart}\n%%EOF`
  return pdf
}

function clean(value) {
  return String(value ?? '')
    .replace(/[^\x20-\x7E]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function wrap(value, maxChars) {
  const words = clean(value).split(' ')
  const lines = []
  let line = ''

  words.forEach(word => {
    if ((line + word).length > maxChars) {
      if (line) lines.push(line.trim())
      line = word
    } else {
      line += `${word} `
    }
  })

  if (line.trim()) lines.push(line.trim())
  return lines.length ? lines : ['-']
}

function escapePdf(value) {
  return clean(value).replace(/\\/g, '\\\\').replace(/\(/g, '\\(').replace(/\)/g, '\\)')
}
