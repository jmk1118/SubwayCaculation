import { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ResultSection from './components/ResultSection';
import { type StationIndexMap, type SubwayGraph, type StationResult } from './types';
import { findStationsByDistance } from './utils/BFS';

const App: React.FC = () => {
  const [graph, setGraph] = useState<SubwayGraph | null>(null);
  const [searchResults, setSearchResults] = useState<StationResult[]>([]);
  const [stationIndex, setStationIndex] = useState<StationIndexMap>({});
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    const lines = ['line1', 'line2', 'line3', 'line4', 'line5', 'line6', 'line8'];

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

  const useDarkMode = () => {
    const [isDark, setIsDark] = useState(
      () => localStorage.getItem('theme') === 'dark' || 
      (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)
    );
  
    useEffect(() => {
      const root = window.document.documentElement;
      if (isDark) {
        root.classList.add('dark');
        localStorage.setItem('theme', 'dark');
      } else {
        root.classList.remove('dark');
        localStorage.setItem('theme', 'light');
      }
    }, [isDark]);
  
    return [isDark, setIsDark] as const;
  };

  const ThemeToggle = () => {
    const [isDark, setIsDark] = useDarkMode();
  
    return (
      <button
        onClick={() => setIsDark(!isDark)}
        className="fixed top-6 right-6 p-3 rounded-2xl bg-white dark:bg-slate-800 shadow-lg border border-gray-200 dark:border-slate-700 transition-all active:scale-95"
      >
        {isDark ? '🌙' : '☀️'}
      </button>
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-[100dvh] min-w-screen bg-gray-50 flex justify-center py-6 md:py-12 px-4 dark:bg-slate-950 text-slate-900 dark:text-slate-100 transition-colors duration-500">
      <ThemeToggle />
      <main className="w-full max-w-[480px] mx-auto space-y-8">
        
        {/* 헤더 영역 */}
        <header className="text-center space-y-2">
          <div className="inline-block p-3 bg-blue-100 rounded-2xl mb-2">
            <span className="text-3xl">🚇</span>
          </div>
          <h1 className="text-3xl font-extrabold text-slate-900 dark:text-slate-100 tracking-tight">
            Subway Distance Finder
          </h1>
          <p className="text-gray-500 font-medium">
            입력한 거리만큼 떨어진 역을 찾아보세요.
          </p>
        </header>

        {/* 메인 폼 영역 */}
        {graph && stationIndex ? (
          <>
            <SearchForm 
              stationIndex={stationIndex} 
              onSearch={(name, dist) => {
                const results = findStationsByDistance(graph, stationIndex, name, dist);
                setSearchResults(results);
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
    </div>
  );
};

export default App;