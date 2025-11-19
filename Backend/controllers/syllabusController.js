// backend/controllers/syllabusController.js
const pdf = require('pdf-parse');
const Mapping = require('../models/mappingModel');
const xlsx = require('xlsx');

// Helper to parse outcome sections (unchanged)
const parseOutcomes = (lines, sectionKeywords = [], regex, stopKeywords = []) => {
  const results = [];
  let inSection = false;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const lower = line.toLowerCase();

    if (!inSection) {
      if (sectionKeywords.some(k => lower.includes(k))) {
        inSection = true;
        continue;
      }
    } else {
      if (stopKeywords.some(k => lower.includes(k))) break;

      const m = line.match(regex);
      if (m) {
        let key = m[1].trim();
        let desc = (m[2] || '').trim();

        // Handle multi-line descriptions
        if (!desc) {
          const parts = [];
          let j = i + 1;
          while (j < lines.length && !regex.test(lines[j]) && lines[j].trim() !== '') {
            const low = lines[j].toLowerCase();
            if (stopKeywords.some(k => low.includes(k))) break;
            parts.push(lines[j].trim());
            j++;
          }
          desc = parts.join(' ');
        }

        results.push({ key, description: desc || '' });
      }
    }
  }
  return results;
};

// ---------- NEW: robust Course Outcome extractor ----------
const extractCourseOutcomes = (lines) => {
  // Join the candidate block so we can run multiline regex
  // 1) locate a plausible Course Outcomes section
  let coStart = -1;
  for (let i = 0; i < lines.length; i++) {
    const low = lines[i].toLowerCase();
    if (low.includes('course outcomes') || low.includes('course outcome')) {
      coStart = i + 1;
      break;
    }
  }

  // fallback: if heading not found, try to find first line containing "CO1"
  if (coStart === -1) {
    for (let i = 0; i < lines.length; i++) {
      if (/^co\s*1\b/i.test(lines[i]) || /\bco1\b/i.test(lines[i])) {
        coStart = Math.max(0, i - 1);
        break;
      }
    }
  }

  if (coStart === -1) return []; // no COs found

  // determine reasonable end for CO section
  let coEnd = lines.length;
  const endKeywords = ['unit i', 'unit 1', 'unit ii', 'unit 2', 'program outcomes', 'program specific outcomes', 'co-po', 'co po', 'mapping', 'text book', 'reference book', 'textbooks', 'reference books'];
  for (let i = coStart; i < lines.length; i++) {
    const low = lines[i].toLowerCase();
    if (endKeywords.some(k => low.includes(k))) {
      coEnd = i;
      break;
    }
  }

  const coBlockLines = lines.slice(coStart, coEnd);
  const coBlockText = coBlockLines.join('\n');

  // Regex: capture CO number and its description up to next CO or stop-keyword/new-section.
  // Stops when next CO appears on a new line or when a section keyword appears on a new line.
  const stopPattern = '(?:\\n\\s*(?:CO\\s*\\.?\\s*\\d+\\b|CLO\\s*\\.?\\s*\\d+\\b|Unit\\b|UNIT\\b|Text Books|Textbook|Text Book|Textbooks|Reference Book|Reference Books|Program Outcomes|Program Specific Outcomes|CO-PO|Co-Po|Mapping))';
  const coEntryRegex = new RegExp('\\b(?:CO|CLO|C)\\s*\\.?\\s*(\\d{1,2})\\s*[:\\-\\.]?\\s*([\\s\\S]*?)(?=' + stopPattern + '|$)', 'gi');

  const results = [];
  for (const m of coBlockText.matchAll(coEntryRegex)) {
    const num = m[1].trim();
    let desc = (m[2] || '').trim();

    // Clean description:
    // 1) remove anything starting at 'Unit' (in case unit text is appended inline)
    const unitIdx = desc.search(/\bunit\b/i);
    if (unitIdx !== -1) desc = desc.slice(0, unitIdx).trim();

    // 2) remove trailing "Mapping of Course Outcomes ..." or "CO1, CO2" style tokens that sometimes attach
    desc = desc.replace(/(?:\*?mapping[\s\S]*$)/i, '').trim();
    desc = desc.replace(/(?:,\s*CO\s*\d+\s*)+$/i, '').trim();
    desc = desc.replace(/(?:\(\s*CO\s*\d+\s*\))+$/i, '').trim();

    // 3) remove trailing punctuation and stray hashes
    desc = desc.replace(/[#*]+.*$/g, '').trim();
    desc = desc.replace(/[:,;\-]+\s*$/g, '').trim();

    // If description ended up being too short or purely numeric, attempt a nearby-line fallback:
    if (!desc || /^[\d\W]+$/.test(desc) || desc.length < 8) {
      // Try to find next non-empty line(s) after the CO label in coBlockLines
      // Find the position of the CO label's first occurrence in coBlockLines
      const pattern = new RegExp('\\b(?:CO|CLO|C)\\s*\\.?\\s*' + num + '\\b', 'i');
      let fallbackDesc = '';
      for (let i = 0; i < coBlockLines.length; i++) {
        if (pattern.test(coBlockLines[i])) {
          // collect subsequent lines until a CO label or an end-keyword
          let j = i + 1;
          const parts = [];
          while (j < coBlockLines.length && !/\b(?:CO|CLO|C)\s*\.?\s*\d+\b/i.test(coBlockLines[j])) {
            const low = coBlockLines[j].toLowerCase();
            if (endKeywords.some(k => low.includes(k))) break;
            if (coBlockLines[j].trim().length > 2) parts.push(coBlockLines[j].trim());
            j++;
            if (parts.join(' ').length > 20) break; // limit how far we search
          }
          fallbackDesc = parts.join(' ');
          break;
        }
      }
      if (fallbackDesc && fallbackDesc.length > desc.length) desc = fallbackDesc.replace(/\bunit\b[\s\S]*$/i, '').trim();
    }

    // Final sanitization
    desc = desc.replace(/\s{2,}/g, ' ').trim();

    // Only include CO1..CO6 (limit to typical 6 COs)
    const n = parseInt(num, 10);
    if (!Number.isNaN(n) && n >= 1 && n <= 6) {
      results.push({ number: `CO${n}`, description: desc });
    }
  }

  // If regex approach failed (no matches), fallback to line-by-line detection (older approach)
  if (results.length === 0) {
    const coLineRegex = /^(?:CO|CLO|C)\s*\.?\s*([0-9]{1,2})\s*[:\-]?\s*(.*)$/i;
    let temp = [];
    for (let i = 0; i < coBlockLines.length; i++) {
      const ln = coBlockLines[i];
      const m = ln.match(coLineRegex);
      if (m) {
        const idx = parseInt(m[1], 10);
        let desc = (m[2] || '').trim();
        // append subsequent lines until next CO or unit/mapping
        let j = i + 1;
        const parts = [];
        while (j < coBlockLines.length && !coLineRegex.test(coBlockLines[j])) {
          const low = coBlockLines[j].toLowerCase();
          if (endKeywords.some(k => low.includes(k))) break;
          if (coBlockLines[j].trim().length > 2) parts.push(coBlockLines[j].trim());
          j++;
        }
        if (parts.length) desc += ' ' + parts.join(' ');
        desc = desc.replace(/\bunit\b[\s\S]*$/i, '').replace(/(?:,\s*CO\s*\d+\s*)+$/i, '').trim();
        if (idx >= 1 && idx <= 6) temp.push({ number: `CO${idx}`, description: desc });
      }
    }
    // sort by number
    temp.sort((a, b) => parseInt(a.number.replace(/\D/g, '')) - parseInt(b.number.replace(/\D/g, '')));
    return temp;
  }

  // sort results by CO number ascending and ensure unique first 6
  results.sort((a, b) => parseInt(a.number.replace(/\D/g, '')) - parseInt(b.number.replace(/\D/g, '')));
  const unique = [];
  const seen = new Set();
  for (const r of results) {
    if (!seen.has(r.number)) {
      unique.push(r);
      seen.add(r.number);
    }
    if (unique.length >= 6) break;
  }
  return unique;
};
// ---------- END new extractor ----------

exports.processSyllabus = async (req, res) => {
  try {
    if (!req.file) return res.status(400).json({ message: 'No syllabus file uploaded.' });
    const { subject, year, department } = req.body;

    const data = await pdf(req.file.buffer);
    const lines = data.text
      .split('\n')
      .map(line => line.trim())
      .filter(line => line.length > 0);

    // --- Extract POs and PSOs (unchanged) ---
    const poRegex = /^(PO\s*-?\s*\d+)\s*[:\-]?\s*(.*)$/i;
    const psoRegex = /^(PSO\s*-?\s*\d+)\s*[:\-]?\s*(.*)$/i;
    const programOutcomes = parseOutcomes(
      lines,
      ['program outcomes', 'program outcome'],
      poRegex,
      ['program specific outcomes', 'course outcomes']
    );
    const programSpecificOutcomes = parseOutcomes(
      lines,
      ['program specific outcomes', 'program specific outcome'],
      psoRegex,
      ['course outcomes', 'co-po']
    );

    // --- USE THE NEW extractor for Course Outcomes only (replaces your previous block) ---
    const courseOutcomes = extractCourseOutcomes(lines);

    // --- The rest of your original code for CO-PO mapping + DB save + Excel generation follows ---
    // --- ✅ Extract CO-PO Mapping section ---
    const coRegex = /^(CO|CLO|C)\s*\.?\s*([0-9]+)\s*[:\-]?\s*(.*)$/i;
    const coPoStartIndex = lines.findIndex(l => l.toLowerCase().includes("co-po"));
    const coData = [];
    if (coPoStartIndex !== -1) {
      const coPoEndIndex = lines.length;
      for (let i = coPoStartIndex; i < coPoEndIndex; i++) {
        const match = lines[i].match(coRegex);
        if (!match) continue;

        const coNumber = `CO${match[2].trim()}`;
        const desc = (match[3] || '').trim();
        const mappings = lines[i]
          .split(/\s+/)
          .filter(t => /^[1-3-]$/.test(t));

        coData.push({
          number: coNumber,
          description: desc,
          mappings: mappings.length ? mappings : new Array(15).fill('-')
        });
      }
    }

    // Merge CO text descriptions with CO-PO mapping if available
    coData.forEach(co => {
      const found = courseOutcomes.find(c => c.number === co.number);
      if (found) co.description = found.description;
    });

    // --- Save in MongoDB ---
    await Mapping.findOneAndUpdate(
      { subjectCode: subject ? subject.toUpperCase() : 'UNKNOWN' },
      {
        subjectCode: subject ? subject.toUpperCase() : 'UNKNOWN',
        year,
        department,
        mappings: courseOutcomes.map(c => ({ co_no: c.number, co_description: c.description }))
      },
      { new: true, upsert: true }
    );

    // --- Generate Excel ---
    const wb = xlsx.utils.book_new();

    // Course Outcomes Sheet
    const coSheet = xlsx.utils.json_to_sheet(
      courseOutcomes.map(c => ({
        'CO No.': c.number,
        'Course Outcome Description': c.description
      }))
    );
    xlsx.utils.book_append_sheet(wb, coSheet, 'Course Outcomes');

    // CO-PO Mapping Sheet
    const coPoSheet = xlsx.utils.aoa_to_sheet(
      [
        ['CO', 'PO1', 'PO2', 'PO3', 'PO4', 'PO5', 'PO6', 'PO7', 'PO8', 'PO9', 'PO10', 'PO11', 'PO12'],
        ...coData.map(c => [c.number, ...(c.mappings || new Array(12).fill('-'))])
      ]
    );
    xlsx.utils.book_append_sheet(wb, coPoSheet, 'CO-PO Mapping');

    // POs and PSOs
    xlsx.utils.book_append_sheet(
      wb,
      xlsx.utils.json_to_sheet(programOutcomes.map(p => ({ PO: p.key, Description: p.description }))),
      'POs'
    );
    xlsx.utils.book_append_sheet(
      wb,
      xlsx.utils.json_to_sheet(programSpecificOutcomes.map(p => ({ PSO: p.key, Description: p.description }))),
      'PSOs'
    );

    // Send file
    res.setHeader('Content-Disposition', `attachment; filename="Generated_${subject || 'Syllabus'}.xlsx"`);
    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    const buffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    res.send(buffer);
  } catch (error) {
    console.error('Error:', error);
    res.status(500).json({ message: 'Error extracting syllabus', error: error.message });
  }
};
