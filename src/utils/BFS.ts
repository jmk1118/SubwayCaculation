import { type SubwayGraph, type StationResult, type StationIndexMap } from '../types';

export const findStationsByDistance = (
    graph: SubwayGraph,
    stationIndex: StationIndexMap,
    startStationName: string,
    targetDistance: number
): StationResult[] => {
    if (!graph || !stationIndex || !startStationName || targetDistance < 0)
        return [];

    const startNodeIds = (stationIndex[startStationName] ?? []).filter((id) => Boolean(graph[id]));
    if (startNodeIds.length === 0)
        return [];

    const bestByNode: Record<string, { distance: number; transferCount: number }> = {};
    const queue: string[] = [];

    startNodeIds.forEach((id) => {
        bestByNode[id] = { distance: 0, transferCount: 0 };
        queue.push(id);
    });

    while (queue.length > 0) {
        const currentId = queue.shift()!;
        const currentState = bestByNode[currentId];
        const currentNode = graph[currentId];
        if (!currentState || !currentNode)
            continue;

        if (currentState.distance >= targetDistance)
            continue;

        for (const neighborId of currentNode.neighbors) {
            const neighborNode = graph[neighborId];
            if (!neighborNode)
                continue;
            const nextDistance = currentState.distance + 1;
            const nextTransferCount =
                currentState.transferCount +
                (currentNode.line !== neighborNode.line ? 1 : 0);

            const prevState = bestByNode[neighborId];
            const shouldUpdate =
                !prevState ||
                nextDistance < prevState.distance ||
                (nextDistance === prevState.distance && nextTransferCount < prevState.transferCount);

            if (shouldUpdate) {
                bestByNode[neighborId] = {
                    distance: nextDistance,
                    transferCount: nextTransferCount
                };
                queue.push(neighborId);
            }
        }
    }

    const minDistanceByName: Record<string, number> = {};
    Object.entries(bestByNode).forEach(([nodeId, info]) => {
        const node = graph[nodeId];
        if (!node)
            return;
        const stationName = node.name;
        if (minDistanceByName[stationName] === undefined || info.distance < minDistanceByName[stationName]) {
            minDistanceByName[stationName] = info.distance;
        }
    });

    const bestResultByName: Record<string, StationResult> = {};
    Object.entries(bestByNode).forEach(([nodeId, info]) => {
        const node = graph[nodeId];
        if (!node)
            return;
        const stationName = node.name;

        if (minDistanceByName[stationName] !== targetDistance || info.distance !== targetDistance)
            return;

        const prev = bestResultByName[stationName];
        if (!prev || info.transferCount < prev.transferCount) {
            bestResultByName[stationName] = {
                name: stationName,
                line: node.line,
                transferCount: info.transferCount
            };
        }
    });

    return Object.values(bestResultByName);
};
