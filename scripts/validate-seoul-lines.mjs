import fs from 'node:fs/promises';
import path from 'node:path';

const DATA_DIR = path.join(process.cwd(), 'public', 'data');
const FILES = ['line1.json', 'line2.json', 'line3.json', 'line4.json', 'line5.json', 'line6.json', 'line7.json', 'line8.json', 'line9.json'];

async function loadGraph() {
  const graph = {};
  for (const file of FILES) {
    const full = path.join(DATA_DIR, file);
    const parsed = JSON.parse(await fs.readFile(full, 'utf8'));
    Object.assign(graph, parsed);
  }
  return graph;
}

function validate(graph) {
  const errors = [];
  const warnings = [];
  const managedNodeIds = new Set(Object.keys(graph));

  for (const [id, node] of Object.entries(graph)) {
    if (!Array.isArray(node.neighbors)) {
      errors.push(`${id}: neighbors is not an array`);
      continue;
    }

    for (const neighborId of node.neighbors) {
      // line1~9 외부(예: 분당선/기타 파일) 참조는 본 검증 대상에서 제외
      if (!managedNodeIds.has(neighborId)) {
        continue;
      }
      const neighbor = graph[neighborId];

      if (!neighbor.neighbors.includes(id)) {
        warnings.push(`${id}: asymmetric link -> ${neighborId}`);
      }
    }
  }

  return { errors, warnings };
}

async function main() {
  const graph = await loadGraph();
  const { errors, warnings } = validate(graph);
  if (warnings.length > 0) {
    console.warn(`Validation warnings: ${warnings.length}`);
    warnings.slice(0, 100).forEach((w) => console.warn(`- ${w}`));
  }
  if (errors.length > 0) {
    console.error(`Validation failed: ${errors.length} issue(s)`);
    errors.slice(0, 100).forEach((e) => console.error(`- ${e}`));
    process.exit(1);
  }
  console.log('Validation passed');
}

main().catch((error) => {
  console.error(error.message);
  process.exit(1);
});
