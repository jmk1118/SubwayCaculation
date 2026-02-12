import { useState, useEffect } from 'react';
import Header from './components/Header';
import SearchForm from './components/SearchForm';
import ResultSection from './components/ResultSection';
import { type StationIndexMap, type SubwayGraph, type StationResult } from './types';
import { findStationsByDistance } from './utils/BFS';

// 결과창 호선 정렬 우선순위 설정 (앞에 있을수록 먼저 노출)
const LINE_SORT_ORDER = [
    '1호선',
    '2호선',
    '3호선',
    '4호선',
    '5호선',
    '6호선',
    '7호선',
    '8호선',
    '9호선',
    '인천1호선',
    '인천2호선',
    '분당선'
] as const;

const LINE_SORT_RANK = LINE_SORT_ORDER.reduce<Record<string, number>>((acc, line, index) => {
    acc[line] = index;
    return acc;
}, {});

const App: React.FC = () => {
    const [graph, setGraph] = useState<SubwayGraph | null>(null);
    const [searchResults, setSearchResults] = useState<StationResult[]>([]);
    const [stationIndex, setStationIndex] = useState<StationIndexMap>({});
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const [isGuideOpen, setIsGuideOpen] = useState<boolean>(false);

    // 1. 컴포넌트 마운트 시 데이터 로드
    useEffect(() => {
        const lines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line7', 'line8', 'line9', 'lineBunDang', 'lineIncheon1'];

        const loadData = async () => {
            try {
                setIsLoading(true);

                const requests = lines.map(line => fetch(`/data/${line}.json`).then(res => res.json()));
                const results = await Promise.all(requests);
                const combinedGraph: SubwayGraph = Object.assign({}, ...results);
                setGraph(combinedGraph);

                const index: StationIndexMap = {};
                Object.keys(combinedGraph).forEach(id => {
                    const name = combinedGraph[id].name;

                    if (!index[name])
                        index[name] = [];
                    index[name].push(id);
                });
                setStationIndex(index);
            }
            catch (error) {
                console.error("데이터 통합 로드 실패:", error);
            }
            finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, []);

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-[100dvh] min-w-screen bg-gray-50 flex justify-center py-6 md:py-12 px-4 text-slate-900 transition-colors duration-500">
            <button
                type="button"
                onClick={() => setIsGuideOpen(true)}
                aria-label="사이트 사용법 보기"
                className="fixed top-4 right-4 md:top-6 md:right-6 z-40 w-11 h-11 rounded-full bg-blue-600 text-white text-lg font-bold shadow-lg shadow-blue-200 active:scale-95 transition-transform"
            >
                ?
            </button>

            <main className="w-full max-w-[480px] mx-auto space-y-8">

                {/* 헤더 영역 */}
                <Header/>

                {/* 메인 폼 영역 */}
                {graph && stationIndex ? (
                    <>
                        <SearchForm
                            stationIndex={stationIndex}
                            onSearch={(name, dist) => {
                                const results = findStationsByDistance(graph, stationIndex, name, dist);
                                if (results.length === 0) {
                                    setSearchResults([]);
                                    return;
                                }

                                const sortedResults = [...results].sort((a, b) => {
                                    if (a.transferCount !== b.transferCount) {
                                        return a.transferCount - b.transferCount;
                                    }

                                    const lineA = LINE_SORT_RANK[a.line] ?? Number.MAX_SAFE_INTEGER;
                                    const lineB = LINE_SORT_RANK[b.line] ?? Number.MAX_SAFE_INTEGER;

                                    if (lineA !== lineB) {
                                        return lineA - lineB;
                                    }

                                    return a.name.localeCompare(b.name);
                                });

                                setSearchResults(sortedResults);
                            }}
                        />
                        <ResultSection stations={searchResults} />
                    </>
                ) : (
                    <div className="text-center py-20">데이터를 불러오는 중...</div>
                )}

                {/* 푸터 (선택 사항) */}
                <footer className="text-center text-gray-400 text-xs pt-4">
                    © 2026 Subway Finder Project
                </footer>
            </main>

            {isGuideOpen && (
                <div
                    className="fixed inset-0 z-50 bg-slate-900/45 backdrop-blur-[1px] flex items-center justify-center px-4"
                    onClick={() => setIsGuideOpen(false)}
                >
                    <div
                        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="relative mb-4 flex items-center justify-center">
                            <h2 className="text-xl font-black text-slate-900 text-center">사용법</h2>
                            <button
                                type="button"
                                onClick={() => setIsGuideOpen(false)}
                                aria-label="팝업 닫기"
                                className="absolute right-0 w-8 h-8 rounded-lg bg-slate-100 text-slate-600 font-bold hover:bg-slate-200 transition-colors"
                            >
                                ×
                            </button>
                        </div>

                        <ul className="text-sm text-slate-700 space-y-2 leading-relaxed text-center list-none p-0">
                            <li>출발역과 원하는 이동 거리를 입력해주세요.</li>
                            <li>환승하는 경우 이동 거리 1로 계산됩니다.</li>
                        </ul>
                    </div>
                </div>
            )}
        </div>
    );
};

export default App;
