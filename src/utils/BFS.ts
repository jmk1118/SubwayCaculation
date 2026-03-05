import { type SubwayGraph, type StationResult, type StationIndexMap } from '../types';

interface SearchState {
    nodeId: string;
    distance: number;
    transferCount: number;
    weightedCost: number;
}

interface BestRoute {
    distance: number;
    transferCount: number;
    weightedCost: number;
}

class MinHeap {
    private heap: SearchState[] = [];

    private static compare(a: SearchState, b: SearchState): number {
        if (a.weightedCost !== b.weightedCost)
            return a.weightedCost - b.weightedCost;
        if (a.distance !== b.distance)
            return a.distance - b.distance;
        return a.transferCount - b.transferCount;
    }

    push(value: SearchState): void {
        this.heap.push(value);
        this.bubbleUp(this.heap.length - 1);
    }

    pop(): SearchState | undefined {
        if (this.heap.length === 0)
            return undefined;
        const top = this.heap[0];
        const last = this.heap.pop()!;
        if (this.heap.length > 0) {
            this.heap[0] = last;
            this.bubbleDown(0);
        }
        return top;
    }

    get size(): number {
        return this.heap.length;
    }

    private bubbleUp(index: number): void {
        let currentIndex = index;
        while (currentIndex > 0) {
            const parentIndex = Math.floor((currentIndex - 1) / 2);
            if (MinHeap.compare(this.heap[parentIndex], this.heap[currentIndex]) <= 0)
                break;
            [this.heap[parentIndex], this.heap[currentIndex]] = [this.heap[currentIndex], this.heap[parentIndex]];
            currentIndex = parentIndex;
        }
    }

    private bubbleDown(index: number): void {
        let currentIndex = index;
        while (true) {
            const left = currentIndex * 2 + 1;
            const right = currentIndex * 2 + 2;
            let smallest = currentIndex;

            if (left < this.heap.length && MinHeap.compare(this.heap[left], this.heap[smallest]) < 0)
                smallest = left;
            if (right < this.heap.length && MinHeap.compare(this.heap[right], this.heap[smallest]) < 0)
                smallest = right;

            if (smallest === currentIndex)
                break;
            [this.heap[currentIndex], this.heap[smallest]] = [this.heap[smallest], this.heap[currentIndex]];
            currentIndex = smallest;
        }
    }
}

export const findStationsByDistance = (
    graph: SubwayGraph,
    stationIndex: StationIndexMap,
    startStationName: string,
    targetDistance: number,
    transferWeight: number = 2
): StationResult[] => {
    if (!graph || !stationIndex || !startStationName || targetDistance < 0)
        return [];

    const startNodeIds = (stationIndex[startStationName] ?? []).filter((id) => Boolean(graph[id]));
    if (startNodeIds.length === 0)
        return [];

    const bestByNode: Record<string, BestRoute> = {};
    const queue = new MinHeap();

    startNodeIds.forEach((id) => {
        bestByNode[id] = { distance: 0, transferCount: 0, weightedCost: 0 };
        queue.push({
            nodeId: id,
            distance: 0,
            transferCount: 0,
            weightedCost: 0
        });
    });

    while (queue.size > 0) {
        const current = queue.pop()!;
        const currentId = current.nodeId;
        const currentNode = graph[currentId];
        if (!currentNode)
            continue;

        const currentBest = bestByNode[currentId];
        const isStale =
            !currentBest ||
            current.weightedCost !== currentBest.weightedCost ||
            current.distance !== currentBest.distance ||
            current.transferCount !== currentBest.transferCount;
        if (isStale)
            continue;

        for (const neighborId of currentNode.neighbors) {
            const neighborNode = graph[neighborId];
            if (!neighborNode)
                continue;

            const isTransfer = currentNode.name === neighborNode.name && currentNode.line !== neighborNode.line;
            const stepDistance = isTransfer ? 0 : 1; // 사용자 표시 거리(정거장 수)
            const nextDistance = current.distance + stepDistance;

            const nextWeightedCost = current.weightedCost + (isTransfer ? transferWeight : 1); // 탐색 전용 가중치
            const nextTransferCount =
                current.transferCount +
                (isTransfer ? 1 : 0);

            const prevState = bestByNode[neighborId];
            const shouldUpdate =
                !prevState ||
                nextWeightedCost < prevState.weightedCost ||
                (nextWeightedCost === prevState.weightedCost && nextTransferCount < prevState.transferCount) ||
                (nextWeightedCost === prevState.weightedCost &&
                    nextTransferCount === prevState.transferCount &&
                    nextDistance < prevState.distance);

            if (shouldUpdate) {
                bestByNode[neighborId] = {
                    distance: nextDistance,
                    weightedCost: nextWeightedCost,
                    transferCount: nextTransferCount
                };
                queue.push({
                    nodeId: neighborId,
                    distance: nextDistance,
                    transferCount: nextTransferCount,
                    weightedCost: nextWeightedCost
                });
            }
        }
    }

    const bestResultByName: Record<string, StationResult> = {};
    const bestMetaByName: Record<string, BestRoute> = {};
    Object.entries(bestByNode).forEach(([nodeId, info]) => {
        const node = graph[nodeId];
        if (!node)
            return;

        const stationName = node.name;

        const prevMeta = bestMetaByName[stationName];
        const shouldUpdate =
            !prevMeta ||
            info.weightedCost < prevMeta.weightedCost ||
            (info.weightedCost === prevMeta.weightedCost && info.transferCount < prevMeta.transferCount) ||
            (info.weightedCost === prevMeta.weightedCost &&
                info.transferCount === prevMeta.transferCount &&
                info.distance < prevMeta.distance);
        if (shouldUpdate) {
            bestMetaByName[stationName] = info;
            bestResultByName[stationName] = {
                name: stationName,
                line: node.line,
                transferCount: info.transferCount
            };
        }
    });

    return Object.values(bestResultByName).filter((result) => {
        const meta = bestMetaByName[result.name];
        return Boolean(meta && meta.distance === targetDistance);
    });
};
