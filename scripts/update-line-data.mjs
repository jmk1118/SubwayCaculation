import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');

const REQUIRED_ENVS = ['SUBWAY_STATION_API_URL', 'SUBWAY_DISTANCE_API_URL'];

const LINE_FIELD_CANDIDATES = [
  'line', 'line_nm', 'line_num', 'line_no', 'linecode', 'line_name',
  'sbwy_rout_ln_nm', 'route', 'route_nm', 'ln_cd',
  '호선', '호선명', '노선', '노선명'
];

const STATION_FIELD_CANDIDATES = [
  'station', 'station_nm', 'station_name', 'stn_nm', 'statn_nm',
  'from_station', 'from_stn', 'source_station', 'start_station',
  'fr_station', 'fr_stn', 'stin_nm', 'sbwy_stns_nm',
  '역명', '전철역명', '지하철역명'
];

const NEXT_STATION_FIELD_CANDIDATES = [
  'next_station', 'next_station_nm', 'next_station_name',
  'to_station', 'to_stn', 'target_station', 'end_station',
  'dest_station', 'arrive_station', 'next_stn_nm', 'tbg_station',
  'to_statn_nm', '도착역', '다음역'
];

const ORDER_FIELD_CANDIDATES = [
  'station_order', 'ord', 'seq', 'idx', 'sort', 'rank',
  'acml_dist', 'acml_dstn', 'distance_sum', '누계거리', '순번', '역순번'
];

const FROM_STATION_FIELD_CANDIDATES = [
  'from_station', 'from_stn', 'source_station', 'start_station',
  'fr_station', 'fr_stn', 'fr_statn_nm', '출발역'
];

const TO_STATION_FIELD_CANDIDATES = [
  'to_station', 'to_stn', 'target_station', 'end_station',
  'tbg_station', 'to_statn_nm', '도착역'
];

const OPERATOR_FIELD_CANDIDATES = [
  'operator', 'operator_nm', 'corp', 'corp_nm', 'railway_company', 'company',
  '관리기관', '운영기관', '운영사', '철도운영기관'
];

const REGION_FIELD_CANDIDATES = [
  'city', 'region', 'area', 'sido', 'sigungu', 'loc', 'location',
  '지역', '권역', '시도'
];

function assertRequiredEnv() {
  const missing = REQUIRED_ENVS.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw new Error(`Missing required env: ${missing.join(', ')}`);
  }
}

function fillApiKey(url) {
  const apiKey = process.env.DATA_GO_API_KEY ?? '';
  return url
    .replaceAll('(인증키)', apiKey)
    .replaceAll('{API_KEY}', apiKey)
    .replaceAll('${API_KEY}', apiKey)
    .replaceAll('__API_KEY__', apiKey);
}

async function fetchText(url) {
  const response = await fetch(url, {
    headers: {
      Accept: 'application/json, application/xml, text/xml, text/csv, text/plain;q=0.9'
    }
  });

  if (!response.ok) {
    throw new Error(`Request failed (${response.status}) for ${url}`);
  }

  return {
    text: await response.text(),
    contentType: response.headers.get('content-type') ?? ''
  };
}

function normalizeKey(key) {
  return String(key).toLowerCase().replace(/[^a-z0-9가-힣]/g, '');
}

function normalizeValue(value) {
  return String(value ?? '').trim();
}

function inferRegion(rawLine, operator, region) {
  const joined = `${rawLine} ${operator} ${region}`.replace(/\s+/g, '');

  if (/서울교통공사|서울메트로|서울시|서울/.test(joined)) return '서울';
  if (/인천교통공사|인천/.test(joined)) return '인천';
  if (/부산교통공사|부산/.test(joined)) return '부산';
  if (/대구교통공사|대구/.test(joined)) return '대구';
  if (/광주교통공사|광주/.test(joined)) return '광주';
  if (/대전교통공사|대전/.test(joined)) return '대전';

  return '';
}

function normalizeLineName(value, context = {}) {
  const raw = normalizeValue(value).replace(/\s+/g, '');
  if (!raw) return '';

  if (/수인분당|분당/.test(raw)) return '분당선';
  if (/신분당/.test(raw)) return '신분당선';

  if (/(경의중앙|경춘|수인분당|서해|신림|우이신설|김포골드|공항철도|의정부경전철|에버라인|용인경전철)/.test(raw)) {
    return raw.replace(/수도권전철|도시철도|지하철/g, '');
  }

  const numMatch = raw.match(/([1-9])호선/);
  if (numMatch) {
    const region = inferRegion(raw, context.operator ?? '', context.region ?? '');
    if (region && region !== '서울') {
      return `${region}${numMatch[1]}호선`;
    }
    return `${numMatch[1]}호선`;
  }

  const singleDigit = raw.match(/^([1-9])$/);
  if (singleDigit) {
    const region = inferRegion(raw, context.operator ?? '', context.region ?? '');
    if (region && region !== '서울') {
      return `${region}${singleDigit[1]}호선`;
    }
    return `${singleDigit[1]}호선`;
  }

  const lineMatch = raw.match(/^line([1-9])$/i);
  if (lineMatch) {
    const region = inferRegion(raw, context.operator ?? '', context.region ?? '');
    if (region && region !== '서울') {
      return `${region}${lineMatch[1]}호선`;
    }
    return `${lineMatch[1]}호선`;
  }

  return raw;
}

function normalizeStationName(value) {
  return normalizeValue(value)
    .replace(/\s+/g, '')
    .replace(/역$/, '');
}

function toNumber(value) {
  const parsed = Number(String(value).replace(/,/g, '').trim());
  return Number.isFinite(parsed) ? parsed : null;
}

function parseCsv(text) {
  const lines = text.replace(/^\uFEFF/, '').split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const rows = [];
  const headers = parseCsvLine(lines[0]);
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]);
    const row = {};
    headers.forEach((header, idx) => {
      row[header] = cols[idx] ?? '';
    });
    rows.push(row);
  }

  return rows;
}

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const char = line[i];

    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === ',' && !inQuotes) {
      result.push(current);
      current = '';
      continue;
    }

    current += char;
  }

  result.push(current);
  return result;
}

function parseXmlRows(text) {
  const rows = [];
  const blocks = [...text.matchAll(/<(row|item)>([\s\S]*?)<\/\1>/gim)];

  for (const match of blocks) {
    const block = match[2];
    const row = {};
    const fieldMatches = [...block.matchAll(/<([A-Za-z0-9_가-힣]+)>([\s\S]*?)<\/\1>/g)];

    for (const field of fieldMatches) {
      row[field[1]] = field[2]
        .replace(/<!\[CDATA\[|\]\]>/g, '')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&amp;/g, '&')
        .trim();
    }

    if (Object.keys(row).length > 0) {
      rows.push(row);
    }
  }

  return rows;
}

function findFirstArrayObject(value) {
  if (!value) return [];

  if (Array.isArray(value)) {
    if (value.length > 0 && typeof value[0] === 'object' && value[0] !== null) {
      return value;
    }

    for (const item of value) {
      const found = findFirstArrayObject(item);
      if (found.length > 0) return found;
    }

    return [];
  }

  if (typeof value === 'object') {
    for (const next of Object.values(value)) {
      const found = findFirstArrayObject(next);
      if (found.length > 0) return found;
    }
  }

  return [];
}

function parseRows(text, contentType) {
  const trimmed = text.trim();
  const loweredType = contentType.toLowerCase();

  if (loweredType.includes('json') || trimmed.startsWith('{') || trimmed.startsWith('[')) {
    const json = JSON.parse(trimmed);
    return findFirstArrayObject(json);
  }

  if (loweredType.includes('xml') || trimmed.startsWith('<')) {
    return parseXmlRows(trimmed);
  }

  return parseCsv(trimmed);
}

function getNormalizedLookup(row) {
  const lookup = {};
  for (const [key, value] of Object.entries(row)) {
    lookup[normalizeKey(key)] = value;
  }
  return lookup;
}

function pickValue(row, candidates) {
  const lookup = getNormalizedLookup(row);
  for (const key of candidates) {
    const value = lookup[normalizeKey(key)];
    if (value !== undefined && normalizeValue(value) !== '') {
      return normalizeValue(value);
    }
  }
  return '';
}

function buildLineRecords(rows) {
  return rows
    .map((row) => {
      const operator = pickValue(row, OPERATOR_FIELD_CANDIDATES);
      const region = pickValue(row, REGION_FIELD_CANDIDATES);
      const line = normalizeLineName(pickValue(row, LINE_FIELD_CANDIDATES), { operator, region });
      const station = normalizeStationName(pickValue(row, STATION_FIELD_CANDIDATES));
      const nextStation = normalizeStationName(pickValue(row, NEXT_STATION_FIELD_CANDIDATES));
      const order = toNumber(pickValue(row, ORDER_FIELD_CANDIDATES));

      return { line, station, nextStation, order };
    })
    .filter((row) => row.line && row.station);
}

function buildDistanceRecords(rows, stationRecords) {
  const lineByStation = new Map();
  for (const record of stationRecords) {
    if (!lineByStation.has(record.station)) {
      lineByStation.set(record.station, new Set());
    }
    lineByStation.get(record.station).add(record.line);
  }

  const records = [];
  for (const row of rows) {
    const operator = pickValue(row, OPERATOR_FIELD_CANDIDATES);
    const region = pickValue(row, REGION_FIELD_CANDIDATES);
    let line = normalizeLineName(pickValue(row, LINE_FIELD_CANDIDATES), { operator, region });
    let station = normalizeStationName(pickValue(row, STATION_FIELD_CANDIDATES));
    let nextStation = normalizeStationName(pickValue(row, NEXT_STATION_FIELD_CANDIDATES));
    const order = toNumber(pickValue(row, ORDER_FIELD_CANDIDATES));

    if (!station && !nextStation) {
      station = normalizeStationName(pickValue(row, FROM_STATION_FIELD_CANDIDATES));
      nextStation = normalizeStationName(pickValue(row, TO_STATION_FIELD_CANDIDATES));
    }

    if (!line && station) {
      const candidates = lineByStation.get(station);
      if (candidates?.size === 1) {
        line = [...candidates][0];
      }
    }

    if (!line || !station) {
      continue;
    }

    records.push({ line, station, nextStation, order });
  }

  return records;
}

function unique(values) {
  return [...new Set(values)];
}

function buildOrderFromEdges(edges) {
  const graph = new Map();
  const indegree = new Map();

  for (const [from, to] of edges) {
    if (!graph.has(from)) graph.set(from, new Set());
    graph.get(from).add(to);
    if (!indegree.has(from)) indegree.set(from, 0);
    indegree.set(to, (indegree.get(to) ?? 0) + 1);
  }

  const allNodes = unique(edges.flat());
  const starts = allNodes.filter((node) => (indegree.get(node) ?? 0) === 0);
  const queue = starts.length > 0 ? [...starts] : [allNodes[0]];
  const ordered = [];
  const visited = new Set();

  while (queue.length > 0) {
    const current = queue.shift();
    if (!current || visited.has(current)) continue;

    visited.add(current);
    ordered.push(current);

    const nexts = [...(graph.get(current) ?? [])];
    for (const next of nexts) {
      if (!visited.has(next)) queue.push(next);
    }
  }

  for (const node of allNodes) {
    if (!visited.has(node)) ordered.push(node);
  }

  return ordered;
}

function buildLineStationMap(stationRecords, distanceRecords) {
  const byLine = new Map();

  function ensureLine(line) {
    if (!byLine.has(line)) {
      byLine.set(line, { ordered: [], edges: [], fallback: [] });
    }
    return byLine.get(line);
  }

  for (const row of distanceRecords) {
    const bucket = ensureLine(row.line);
    if (row.order !== null) {
      bucket.ordered.push({ station: row.station, order: row.order });
    }
    if (row.nextStation) {
      bucket.edges.push([row.station, row.nextStation]);
    }
    bucket.fallback.push(row.station);
  }

  for (const row of stationRecords) {
    const bucket = ensureLine(row.line);
    if (row.order !== null) {
      bucket.ordered.push({ station: row.station, order: row.order });
    }
    bucket.fallback.push(row.station);
  }

  const lineStationMap = new Map();
  for (const [line, info] of byLine.entries()) {
    let stations = [];

    if (info.ordered.length > 0) {
      const bestOrderByStation = new Map();
      for (const item of info.ordered) {
        const prev = bestOrderByStation.get(item.station);
        if (prev === undefined || item.order < prev) {
          bestOrderByStation.set(item.station, item.order);
        }
      }
      stations = [...bestOrderByStation.entries()]
        .sort((a, b) => a[1] - b[1])
        .map(([station]) => station);
    }

    if (stations.length === 0 && info.edges.length > 0) {
      stations = buildOrderFromEdges(info.edges);
    }

    if (stations.length === 0) {
      stations = unique(info.fallback);
    }

    lineStationMap.set(line, unique(stations.filter(Boolean)));
  }

  return lineStationMap;
}

async function readExistingGraph() {
  const files = await fs.readdir(DATA_DIR);
  const jsonFiles = files.filter((file) => file.endsWith('.json'));

  const graph = {};
  for (const file of jsonFiles) {
    const fullPath = path.join(DATA_DIR, file);
    const parsed = JSON.parse(await fs.readFile(fullPath, 'utf8'));
    Object.assign(graph, parsed);
  }

  return graph;
}

function buildTransferIndex(existingGraph) {
  const index = new Map();

  for (const node of Object.values(existingGraph)) {
    for (const neighborId of node.neighbors ?? []) {
      const neighbor = existingGraph[neighborId];
      if (!neighbor) continue;
      if (node.line === neighbor.line) continue;

      const key = `${node.line}|${node.name}`;
      const value = `${neighbor.line}|${neighbor.name}`;
      if (!index.has(key)) index.set(key, new Set());
      index.get(key).add(value);
    }
  }

  return index;
}

function toLineToken(line) {
  const token = line.replace(/\s+/g, '').replace(/[^0-9A-Za-z가-힣]/g, '');
  return token || 'unknown';
}

function getLineFileName(line) {
  const seoulLine = line.match(/^([1-9])호선$/);
  if (seoulLine) {
    return `line${seoulLine[1]}.json`;
  }

  if (line === '분당선') {
    return 'lineBunDang.json';
  }

  return `line_${toLineToken(line)}.json`;
}

function getLineSuffix(line) {
  const seoulLine = line.match(/^([1-9])호선$/);
  if (seoulLine) {
    return seoulLine[1];
  }

  if (line === '분당선') {
    return '분당';
  }

  return toLineToken(line);
}

function buildManagedLineData(lineStationMap, transferIndex) {
  const lineDataByFile = new Map();
  const idByLineStation = new Map();

  for (const [line, stations] of lineStationMap.entries()) {
    const fileName = getLineFileName(line);
    const suffix = getLineSuffix(line);

    const data = {};
    stations.forEach((station, idx) => {
      const id = `${station}_${suffix}`;
      const neighbors = [];
      if (idx > 0) neighbors.push(`${stations[idx - 1]}_${suffix}`);
      if (idx < stations.length - 1) neighbors.push(`${stations[idx + 1]}_${suffix}`);

      data[id] = {
        id,
        name: station,
        line,
        neighbors
      };

      idByLineStation.set(`${line}|${station}`, id);
    });

    lineDataByFile.set(fileName, data);
  }

  for (const [fileName, lineData] of lineDataByFile.entries()) {
    for (const node of Object.values(lineData)) {
      const transferTargets = transferIndex.get(`${node.line}|${node.name}`) ?? new Set();
      for (const target of transferTargets) {
        const transferId = idByLineStation.get(target);
        if (transferId && !node.neighbors.includes(transferId)) {
          node.neighbors.push(transferId);
        }
      }
    }
    lineDataByFile.set(fileName, lineData);
  }

  return lineDataByFile;
}

async function writeLineFiles(lineDataByFile) {
  for (const [fileName, data] of lineDataByFile.entries()) {
    const fullPath = path.join(DATA_DIR, fileName);
    await fs.writeFile(fullPath, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
    console.log(`Updated: public/data/${fileName} (${Object.keys(data).length} stations)`);
  }
}

async function run() {
  assertRequiredEnv();

  const stationUrl = fillApiKey(process.env.SUBWAY_STATION_API_URL);
  const distanceUrl = fillApiKey(process.env.SUBWAY_DISTANCE_API_URL);

  const [stationResponse, distanceResponse] = await Promise.all([
    fetchText(stationUrl),
    fetchText(distanceUrl)
  ]);

  const stationRows = parseRows(stationResponse.text, stationResponse.contentType);
  const distanceRows = parseRows(distanceResponse.text, distanceResponse.contentType);

  if (stationRows.length === 0) {
    throw new Error('No station rows parsed from SUBWAY_STATION_API_URL');
  }

  if (distanceRows.length === 0) {
    throw new Error('No distance rows parsed from SUBWAY_DISTANCE_API_URL');
  }

  const stationRecords = buildLineRecords(stationRows);
  const distanceRecords = buildDistanceRecords(distanceRows, stationRecords);

  if (stationRecords.length === 0) {
    throw new Error('Could not normalize station records. Check field names and API response format.');
  }

  if (distanceRecords.length === 0) {
    const sample = distanceRows[0] ? Object.keys(distanceRows[0]).join(', ') : 'no rows';
    console.warn(`Distance normalization fallback: parsed 0 rows. Raw keys: ${sample}`);
  }

  const lineStationMap = buildLineStationMap(
    stationRecords,
    distanceRecords.length > 0 ? distanceRecords : stationRecords
  );
  const existingGraph = await readExistingGraph();
  const transferIndex = buildTransferIndex(existingGraph);
  const lineDataByFile = buildManagedLineData(lineStationMap, transferIndex);

  if (lineDataByFile.size === 0) {
    throw new Error('No line data generated. Check line normalization and response payload.');
  }

  await writeLineFiles(lineDataByFile);
}

run().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
