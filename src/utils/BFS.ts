import { type SubwayGraph, type StationResult, type StationIndexMap } from '../types';

export const findStationsByDistance = (
    graph: SubwayGraph,
    stationIndex: StationIndexMap,
    startStationName: string,
    targetDistance: number
): StationResult[] => {
    const startNodeIds = stationIndex[startStationName];
    if (!startNodeIds || startNodeIds.length === 0) 
        return [];

    const minDistanceByName: Record<string, { distance: number; line: string }> = { 
        [startStationName]: { distance: 0, line: graph[startNodeIds[0]].line } 
      };
    const visitedNodes = new Set<string>();
    const queue: [string, number][] = []; // [역 이름, 현재 거리]

    // 시작점이 환승역이라면 모든 호선의 강남역을 큐에 넣음
    startNodeIds.forEach(id => {
        queue.push([id, 0]);
        visitedNodes.add(id);
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
                    if (!(neighborNode.name in minDistanceByName) || nextDistance < minDistanceByName[neighborNode.name].distance) {
                        minDistanceByName[neighborNode.name] = { distance: nextDistance, line: neighborNode.line };;
                    }
        
                    visitedNodes.add(neighborId);
                    queue.push([neighborId, nextDistance]);
                }
            }
        }
    }

    // 목표 거리에 해당하는 역들만 객체 형태로 반환
    return Object.entries(minDistanceByName)
        .filter(([_, info]) => info.distance === targetDistance)
        .map(([name, info]) => ({ name, line: info.line }));
};