import { type SubwayGraph } from '../types';

export const findStationsByDistance = (
    graph: SubwayGraph,
    startStation: string,
    targetDistance: number
): string[] => {
    // 1. 예외 처리: 그래프에 해당 역이 없는 경우
    if (!graph[startStation]) return [];

    const visited = new Set<string>(); // 방문한 역 기록
    const queue: [string, number][] = [[startStation, 0]]; // [역 이름, 현재 거리]
    const results: string[] = [];

    visited.add(startStation);

    while (queue.length > 0) {
        const [currentStation, currentDistance] = queue.shift()!;

        // 입력한 거리와 일치하는 역들을 결과에 추가
        if (currentDistance === targetDistance) {
            results.push(currentStation);
            // 목표 거리에 도달했으므로 이 노드의 인접 노드는 더 이상 탐색할 필요 없음
            continue;
        }

        // 목표 거리보다 작을 때만 다음 인접 역들을 탐색
        if (currentDistance < targetDistance) {
            const neighbors = graph[currentStation] || [];
            for (const neighbor of neighbors) {
                if (!visited.has(neighbor)) {
                    visited.add(neighbor);
                    queue.push([neighbor, currentDistance + 1]);
                }
            }
        }
    }

    return results;
};