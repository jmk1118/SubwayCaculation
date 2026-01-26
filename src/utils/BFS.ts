import { type SubwayGraph } from '../types';

export const findStationsByDistance = (
    graph: SubwayGraph,
    startStationName: string,
    targetDistance: number
): string[] => {
    // 1. 예외 처리: 그래프에 해당 역이 없는 경우
    const startNodes = Object.values(graph).filter(node => node.name === startStationName);
    if (startNodes.length === 0) 
        return [];

    const visited = new Set<string>(); // 방문한 역 기록
    const queue: [string, number][] = []; // [역 이름, 현재 거리]
    const results = new Set<string>(); // 중복된 역 이름 제거를 위해 Set 사용

    // 시작점이 환승역이라면 모든 호선의 강남역을 큐에 넣음
    startNodes.forEach(node => {
        queue.push([node.id, 0]);
        visited.add(node.id);
    });

    while (queue.length > 0) {
        const [currentId, currentDistance] = queue.shift()!;
        const currentNode = graph[currentId];

        if (!currentNode)
            continue;

        // 입력한 거리와 일치하는 역들을 결과에 추가
        if (currentDistance === targetDistance) {
            results.add(currentNode.name);
            // 목표 거리에 도달했으므로 이 노드의 인접 노드는 더 이상 탐색할 필요 없음
            continue;
        }

        // 목표 거리보다 작을 때만 다음 인접 역들을 탐색
        if (currentDistance < targetDistance) {
            for (const neighborId of currentNode.neighbors) {
                if (!visited.has(neighborId)) {
                    visited.add(neighborId);
                    queue.push([neighborId, currentDistance + 1]);
                }
            }
        }
    }

    return Array.from(results);
};