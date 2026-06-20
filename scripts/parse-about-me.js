import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const workspaceRoot = path.resolve(__dirname, '..');
const mdPath = path.join(workspaceRoot, 'about-me.md');
const outPath = path.join(workspaceRoot, 'src/data.js');

// Splits a string by comma, but ignores commas inside parentheses
function splitByComma(str) {
  const result = [];
  let current = '';
  let depth = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str[i];
    if (char === '(') depth++;
    else if (char === ')') depth--;
    if (char === ',' && depth === 0) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  if (current.trim()) result.push(current.trim());
  return result;
}

// Clean parentheticals from skill items (e.g. "Excel (PivotTables...)" -> "Excel")
function cleanParentheticals(str) {
  return str.replace(/\s*\(.*?\)/g, '').trim();
}

function extractField(str, startKeyword, endKeywords) {
  const startIdx = str.indexOf(startKeyword);
  if (startIdx === -1) return '';
  const valStart = startIdx + startKeyword.length;
  
  let endIdx = str.length;
  for (const endKeyword of endKeywords) {
    const idx = str.indexOf(endKeyword, valStart);
    if (idx !== -1 && idx < endIdx) {
      endIdx = idx;
    }
  }
  return str.substring(valStart, endIdx).replace(/\.$/, '').trim(); // Remove trailing period
}

function parseMarkdown() {
  if (!fs.existsSync(mdPath)) {
    console.error(`Error: Cannot find about-me.md at ${mdPath}`);
    process.exit(1);
  }

  const content = fs.readFileSync(mdPath, 'utf-8');
  
  // Split content by main sections starting with ##
  const sections = {};
  const sectionSplit = content.split(/\n##\s+/);
  
  for (const part of sectionSplit) {
    const lines = part.split('\n');
    const title = lines[0].trim();
    const body = lines.slice(1).join('\n').trim();
    sections[title.toLowerCase()] = body;
  }

  // 1. Parse Basics
  const basicsBody = sections['basics'] || '';
  const basicsLines = basicsBody.split('\n');
  const basics = {};
  let currentKey = null;
  let currentVal = '';
  
  for (const line of basicsLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (currentKey) {
        basics[currentKey] = currentVal.trim();
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        currentKey = line.substring(line.indexOf('-') + 1, colonIdx).trim().toLowerCase();
        currentVal = line.substring(colonIdx + 1).trim();
      }
    } else if (currentKey && (line.startsWith('  ') || line.startsWith('\t') || line.startsWith(' '))) {
      currentVal += ' ' + trimmed;
    }
  }
  if (currentKey) {
    basics[currentKey] = currentVal.trim();
  }

  const person = {
    name: basics['name'] || 'Karthik Kantamneni',
    role: basics['role'] || 'MSc Energy Engineering student, University of Padova',
    location: basics['location'] || 'Padua, Italy',
    tagline: basics['tagline'] || 'Designing the systems behind clean power.',
    pitch: basics['short pitch'] || '',
    tools: [], // Filled from skills later
    available: 'July 2026', // Default fallback
    email: '',
    linkedin: '',
    linkedinHandle: '',
    github: null,
    cv: null
  };

  // Parse looking for graduation date
  const lookingBody = sections['looking for'] || '';
  const availMatch = /available\s+from:\s*([^\n\r(]+)/i.exec(lookingBody);
  if (availMatch) {
    person.available = availMatch[1].trim();
  }

  // 2. Parse Contact
  const contactBody = sections['contact'] || '';
  const contactLines = contactBody.split('\n');
  const contact = {};
  currentKey = null;
  currentVal = '';
  
  for (const line of contactLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('- ')) {
      if (currentKey) {
        contact[currentKey] = currentVal.trim();
      }
      const colonIdx = line.indexOf(':');
      if (colonIdx !== -1) {
        currentKey = line.substring(line.indexOf('-') + 1, colonIdx).trim().toLowerCase();
        currentVal = line.substring(colonIdx + 1).trim();
      }
    } else if (currentKey && (line.startsWith('  ') || line.startsWith('\t') || line.startsWith(' '))) {
      currentVal += ' ' + trimmed;
    }
  }
  if (currentKey) {
    contact[currentKey] = currentVal.trim();
  }

  person.email = contact['email'] || '';
  if (contact['linkedin']) {
    person.linkedin = contact['linkedin'];
    const parts = contact['linkedin'].split('/in/');
    if (parts.length > 1) {
      person.linkedinHandle = parts[1].replace(/\/$/, '');
    } else {
      person.linkedinHandle = contact['linkedin'];
    }
  }
  person.github = (contact['github'] && !contact['github'].includes('[placeholder')) ? contact['github'] : null;
  person.cv = (contact['cv'] && !contact['cv'].includes('[placeholder')) ? contact['cv'] : null;

  // 3. Parse Education
  const educationBody = sections['education'] || '';
  const education = [];
  const eduBlocks = educationBody.split(/\r?\n-\s+/);
  
  for (const block of eduBlocks) {
    if (!block.trim()) continue;
    
    const lines = block.split('\n');
    const firstLine = lines[0].trim();
    
    // Format: [period] — [degree], [school]
    const parts = firstLine.split('—');
    if (parts.length < 2) continue;
    
    let period = parts[0].trim();
    const rest = parts.slice(1).join('—').trim();
    const commaIdx = rest.indexOf(',');
    if (commaIdx === -1) continue;
    
    const degree = rest.substring(0, commaIdx).trim();
    const school = rest.substring(commaIdx + 1).trim();
    
    let thesis = '';
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (line.toLowerCase().startsWith('thesis:')) {
        thesis = line.replace(/^thesis:\s*/i, '').trim();
        thesis = thesis.replace(/\s*\(expected\s+\d{2}\/\d{4}\)/i, '');
        break;
      }
    }
    
    if (period.toLowerCase().includes('present')) {
      period = '2023 – 2026';
    }
    
    education.push({ period, degree, school, thesis });
  }

  // 4. Parse Experience
  const experienceBody = sections['experience'] || '';
  const experience = [];
  
  const profRolesSection = experienceBody.split(/###\s*Professional\s*roles/i)[1];
  const virtualRolesSection = experienceBody.split(/###\s*Virtual\s*experience/i)[1];
  
  if (profRolesSection) {
    const profPart = profRolesSection.split('###')[0].trim();
    const roles = profPart.split(/\n\d+\.\s+/);
    
    let colorToggle = true;
    for (const r of roles) {
      if (!r.trim()) continue;
      
      const lines = r.split('\n');
      const header = lines[0].trim();
      
      const matches = /\*\*(.*?)\s*—\s*(.*?)\*\*\s*·\s*(.*?)\s*·\s*(.*)/.exec(header);
      if (matches) {
        const company = matches[1].trim();
        const role = matches[2].trim();
        const location = matches[3].trim();
        let period = matches[4].trim();
        
        period = period.replace(/\s*–\s*/, ' – ');
        const yrMatches = period.match(/\b\d{4}\b/g);
        if (yrMatches && yrMatches.length === 2 && yrMatches[0] === yrMatches[1]) {
          period = period.replace(new RegExp(`\\s*${yrMatches[0]}\\b`), '');
        }
        
        const desc = lines.slice(1).map(l => l.trim()).filter(Boolean).join(' ');
        const accomplished = extractField(desc, 'Accomplished:', ['Impact:', 'Action:']);
        const impact = extractField(desc, 'Impact:', ['Action:']);
        const action = extractField(desc, 'Action:', []);
        
        experience.push({
          period,
          role,
          company,
          location,
          accomplished,
          impact,
          action,
          color: colorToggle ? 'clay' : 'teal'
        });
        colorToggle = !colorToggle;
      }
    }
  }

  if (virtualRolesSection) {
    const virtPart = virtualRolesSection.split('###')[0].trim();
    const lines = virtPart.split('\n');
    
    const yearMatch = /completed\s+(\d{4})/i.exec(sections['experience'] || '');
    const period = yearMatch ? yearMatch[1] : '2025';
    
    for (const line of lines) {
      const trimmed = line.trim();
      if (trimmed.startsWith('-')) {
        const m = /-\s*\*\*(.*?)\s*—\s*(.*?)\*\*:\s*(.*)/.exec(trimmed);
        if (m) {
          const company = m[1].trim();
          const role = m[2].trim() + ' (Virtual)';
          const desc = m[3].trim();
          
          const accomplished = extractField(desc, 'Accomplished:', ['Impact:', 'Action:']);
          const impact = extractField(desc, 'Impact:', ['Action:']);
          const action = extractField(desc, 'Action:', []);
          
          experience.push({
            period,
            role,
            company,
            location: 'Remote',
            accomplished,
            impact,
            action,
            color: 'faint'
          });
        }
      }
    }
  }

  // 5. Parse Academic projects
  const projectsBody = sections['academic projects (accomplished -> impact -> action)'] || '';
  const projects = [];
  
  // Split projects by number matching (?:^|\r?\n)\d+\.\s+
  const projectBlocks = projectsBody.split(/(?:^|\r?\n)\d+\.\s+/);
  let pIdx = 1;
  const projectBadges = {
    'caiso battery storage & electricity markets': 'MSc thesis',
    'residential building energy audit': 'energy efficiency',
    'pv plant design': 'solar PV',
    'chp optimisation': 'cogeneration',
    'carbon footprint analysis': 'LCA',
    'carbon-neutral fuels strategy': 'decarbonisation'
  };

  for (const block of projectBlocks) {
    if (!block.trim()) continue;
    
    // Clean multiple whitespace/newlines into a single space
    const cleanedBlock = block.replace(/\s+/g, ' ').trim();
    
    const titleMatch = /^\*\*(.*?)\*\*/.exec(cleanedBlock);
    if (titleMatch) {
      const title = titleMatch[1].trim();
      const accomplished = extractField(cleanedBlock, 'Accomplished:', ['Impact:', 'Action:']);
      const impact = extractField(cleanedBlock, 'Impact:', ['Action:', 'Tools:']);
      const action = extractField(cleanedBlock, 'Action:', ['Tools:']);
      const toolsStr = extractField(cleanedBlock, 'Tools:', ['. Link:', 'Link:']);
      
      const tags = splitByComma(toolsStr).map(t => cleanParentheticals(t)).filter(Boolean);
      const cleanTags = tags.map(t => {
        const cleanedTag = t.replace(/\.$/, '').trim(); // Remove trailing dot
        const l = cleanedTag.toLowerCase();
        if (l.includes('econometric')) return 'econometrics';
        if (l.includes('strategic planning')) return 'strategic planning';
        return cleanedTag;
      });
      
      const badgeKey = title.toLowerCase().replace(/\s+&\s+/g, ' & ').trim();
      const badge = projectBadges[badgeKey] || 'project';
      
      projects.push({
        num: String(pIdx++).padStart(2, '0'),
        title,
        accomplished,
        impact,
        action,
        tags: cleanTags,
        badge
      });
    }
  }

  // 6. Parse Certifications
  const certBody = sections['certifications'] || '';
  const certifications = [];
  const certLines = certBody.split('\n');
  for (const line of certLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-')) {
      const m = /-\s*(.*?)\s*—\s*(.*?),\s*(.*)/.exec(trimmed);
      if (m) {
        certifications.push({
          name: m[1].trim(),
          org: m[2].trim(),
          date: m[3].trim()
        });
      }
    }
  }

  // 7. Parse Skills
  const skillsBody = sections['skills'] || '';
  const skills = {
    energy: [],
    tools: [],
    business: [],
    languages: []
  };

  const skillBlocks = skillsBody.split('###');
  for (const block of skillBlocks) {
    const lines = block.split('\n');
    if (!lines[0].trim()) continue;
    const title = lines[0].trim().toLowerCase();
    const contentText = lines.slice(1).join(' ').trim();
    
    if (title.includes('energy')) {
      skills.energy = splitByComma(contentText).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    } else if (title.includes('tools')) {
      skills.tools = splitByComma(contentText).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    } else if (title.includes('business')) {
      skills.business = splitByComma(contentText).map(s => s.replace(/\.$/, '').trim()).filter(Boolean);
    }
  }

  // Extract clean tools for the Hero subtitle/subtitle tags
  person.tools = skills.tools.map(t => cleanParentheticals(t)).slice(0, 6);

  // 8. Parse Languages
  const langBody = sections['languages'] || '';
  const langLines = langBody.split('\n');
  for (const line of langLines) {
    const trimmed = line.trim();
    if (trimmed.startsWith('-')) {
      const m = /-\s*(.*?)\s*—\s*(.*)/.exec(trimmed);
      if (m) {
        const lang = m[1].trim();
        let level = m[2].trim();
        
        if (lang === 'Telugu') level = 'C2 — mother tongue';
        else if (lang === 'English') level = 'C1 listening · B2 spoken';
        else if (lang === 'Italian') level = 'B1 reading · A2 spoken';
        
        skills.languages.push({ lang, level });
      }
    }
  }

  // Generate output code
  const outputCode = `// Generated automatically from about-me.md. Do not edit directly.

export const person = ${JSON.stringify(person, null, 2)};

export const projects = ${JSON.stringify(projects, null, 2)};

export const experience = ${JSON.stringify(experience, null, 2)};

export const certifications = ${JSON.stringify(certifications, null, 2)};

export const education = ${JSON.stringify(education, null, 2)};

export const skills = ${JSON.stringify(skills, null, 2)};
`;

  fs.writeFileSync(outPath, outputCode, 'utf-8');
  console.log(`Successfully generated ${outPath} from about-me.md!`);
}

parseMarkdown();
