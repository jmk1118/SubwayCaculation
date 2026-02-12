import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const SEOUL_LINES = ['1호선', '2호선', '3호선', '4호선', '5호선', '6호선', '7호선', '8호선', '9호선'];

const API_KEY = process.env.SEOUL_OPEN_API_KEY ?? '';
const ENDPOINT_TEMPLATE =
  process.env.SEOUL_LINE_ENDPOINT_TEMPLATE ??
  'http://openapi.seoul.go.kr:8088/{API_KEY}/json/SearchSTNBySubwayLineInfo/{START}/{END}/{LINE}';
const PAGE_SIZE = Number(process.env.SEOUL_LINE_PAGE_SIZE ?? 1000);

const STATION_NAME_FIELDS = ['STATION_NM', 'STATN_NM', 'station_nm', 'stationName', '역명'];
const LINE_NAME_FIELDS = ['LINE_NUM', 'LINE_NM', 'line_num', 'lineName', '호선'];
const ORDER_FIELDS = ['STATION_ORD', 'ORD', 'ROW_NUM', 'station_ord', '역순번'];

function sanitizeStationName(name) {
  return String(name ?? '').trim().replace(/\s+/g, '').replace(/역$/, '');
}

function readField(row, fields) {
  for (const key of fields) {
    if (row[key] !== undefined && String(row[key]).trim() !== '') {
      return row[key];
    }
  }
  return '';
}

function normalizeLineName(raw) {
  const value = String(raw ?? '').replace(/\s+/g, '');
  const match = value.match(/([1-9])호선/);
  if (match) return `${match[1]}호선`;
  if (/^[1-9]$/.test(value)) return `${value}호선`;
  return value;
}

function idFor(line, station) {
  const number = line.match(/([1-9])호선/)?.[1];
  if (!number) throw new Error(`Unsupported line name: ${line}`);
  return `${station}_${number}`;
}

function fileFor(line) {
  const number = line.match(/([1-9])호선/)?.[1];
  if (!number) throw new Error(`Unsupported line name: ${line}`);
  return `line${number}.json`;
}

function buildUrl(line, start, end) {
  return ENDPOINT_TEMPLATE
    .replaceAll('{API_KEY}', API_KEY)
    .replaceAll('{LINE}', encodeURIComponent(line))
    .replaceAll('{START}', String(start))
    .replaceAll('{END}', String(end));
}

function extractRows(payload) {
  if (!payload || typeof payload !== 'object') return [];
  const firstObj = Object.values(payload).find((v) => v && typeof v === 'object');
  if (!firstObj || typeof firstObj !== 'object') return [];
  const rows = firstObj.row;
  if (Array.isArray(rows)) return rows;
  return [];
}

async function fetchLineRows(line) {
  const all = [];
  let start = 1;

  while (true) {
    const end = start + PAGE_SIZE - 1;
    const url = buildUrl(line, start, end);
    const res = await fetch(url, { headers: { Accept: 'application/json' } });
    if (!res.ok) throw new Error(`Failed fetching ${line}: ${res.status}`);

    const json = await res.json();
    const rows = extractRows(json);
    if (rows.length === 0) break;

    all.push(...rows);
    if (rows.length < PAGE_SIZE) break;
    start += PAGE_SIZE;
  }

  return all;
}

function orderedUniqueStations(rows, requestedLine) {
  const parsed = rows
    .map((row, idx) => {
      const station = sanitizeStationName(readField(row, STATION_NAME_FIELDS));
      const line = normalizeLineName(readField(row, LINE_NAME_FIELDS) || requestedLine);
      const orderRaw = readField(row, ORDER_FIELDS);
      const order = Number.isFinite(Number(orderRaw)) ? Number(orderRaw) : idx + 1;
      return { station, line, order, idx };
    })
    .filter((x) => x.station && x.line === requestedLine);

  parsed.sort((a, b) => (a.order - b.order) || (a.idx - b.idx));

  const seen = new Set();
  const ordered = [];
  for (const item of parsed) {
    if (seen.has(item.station)) continue;
    seen.add(item.station);
    ordered.push(item.station);
  }
  return ordered;
}

function buildLineGraph(line, stations) {
  const graph = {};
  for (let i = 0; i < stations.length; i += 1) {
    const name = stations[i];
    const id = idFor(line, name);
    const neighbors = [];
    if (i > 0) neighbors.push(idFor(line, stations[i - 1]));
    if (i < stations.length - 1) neighbors.push(idFor(line, stations[i + 1]));

    graph[id] = { id, name, line, neighbors };
  }
  return graph;
}

function addTransfers(mergedGraph) {
  const idsByName = new Map();

  for (const [id, node] of Object.entries(mergedGraph)) {
    if (!idsByName.has(node.name)) idsByName.set(node.name, []);
    idsByName.get(node.name).push(id);
  }

  for (const ids of idsByName.values()) {
    if (ids.length < 2) continue;
    for (const id of ids) {
      const node = mergedGraph[id];
      for (const other of ids) {
        if (other === id) continue;
        if (!node.neighbors.includes(other)) node.neighbors.push(other);
      }
    }
  }
}

async function writePerLineFiles(mergedGraph) {
  const byLine = new Map();
  for (const node of Object.values(mergedGraph)) {
    const file = fileFor(node.line);
    if (!byLine.has(file)) byLine.set(file, {});
    byLine.get(file)[node.id] = node;
  }

  for (const [file, data] of byLine.entries()) {
    const out = path.join(DATA_DIR, file);
    await fs.writeFile(out, `${JSON.stringify(data, null, 4)}\n`, 'utf8');
    console.log(`Updated ${file} (${Object.keys(data).length} stations)`);
  }
}

async function main() {
  if (!API_KEY) {
    throw new Error('Missing SEOUL_OPEN_API_KEY');
  }

  const mergedGraph = {};
  for (const line of SEOUL_LINES) {
    const rows = await fetchLineRows(line);
    if (rows.length === 0) {
      throw new Error(`No rows fetched for ${line}. Check endpoint/template.`);
    }

    const stations = orderedUniqueStations(rows, line);
    if (stations.length < 2) {
      throw new Error(`Too few stations for ${line}. Parsed: ${stations.length}`);
    }

    Object.assign(mergedGraph, buildLineGraph(line, stations));
  }

  addTransfers(mergedGraph);
  await writePerLineFiles(mergedGraph);
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
