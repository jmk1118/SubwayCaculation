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

    const minDistanceByName: Record<string, number> = { [startStationName]: 0 };
    const visitedNodes = new Set<string>();
    const queue: [string, number][] = []; // [역 이름, 현재 거리]

    // 시작점이 환승역이라면 모든 호선의 강남역을 큐에 넣음
    startNodes.forEach(node => {
        queue.push([node.id, 0]);
        visitedNodes.add(node.id);
    });

    while (queue.length > 0) {
        const [currentId, currentDistance] = queue.shift()!;
        const currentNode = graph[currentId];

        // 현재 노드의 이웃 탐색
        if (currentDistance < targetDistance) {
            for (const neighborId of currentNode.neighbors) {
                if (!visitedNodes.has(neighborId)) {
                    const neighborNode = graph[neighborId];
                    const nextDistance = currentDistance + 1;
        
                    // 이 이름의 역을 더 짧은 거리에서 만난 적이 있는지 확인
                    if (!(neighborNode.name in minDistanceByName) || nextDistance < minDistanceByName[neighborNode.name]) {
                    minDistanceByName[neighborNode.name] = nextDistance;
                    }
        
                    visitedNodes.add(neighborId);
                    queue.push([neighborId, nextDistance]);
                }
            }
        }
    }

    // 전체 기록된 이름들 중, 정확히 목표 거리(targetDistance)가 '최소 거리'인 역들만 필터링
    const finalResults = Object.keys(minDistanceByName).filter(
        name => minDistanceByName[name] === targetDistance
    );

    return finalResults;
};