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
    const deque: string[] = [];

    startNodeIds.forEach((id) => {
        bestByNode[id] = { distance: 0, transferCount: 0 };
        deque.push(id);
    });

    while (deque.length > 0) {
        const currentId = deque.shift()!;
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

            const isTransfer = currentNode.name === neighborNode.name && currentNode.line !== neighborNode.line;
            const stepDistance = isTransfer ? 0 : 1;
            const nextDistance = currentState.distance + stepDistance;
            const nextTransferCount =
                currentState.transferCount +
                (isTransfer ? 1 : 0);

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
                if (stepDistance === 0) {
                    deque.unshift(neighborId);
                } else {
                    deque.push(neighborId);
                }
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
