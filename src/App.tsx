import { useState, useEffect } from 'react';
import SearchForm from './components/SearchForm';
import ResultSection from './components/ResultSection';
import { type SubwayGraph } from './types';
import { findStationsByDistance } from './utils/BFS';

const App: React.FC = () => {
  const [graph, setGraph] = useState<SubwayGraph | null>(null);
  const [results, setResults] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // 1. 컴포넌트 마운트 시 데이터 로드
  useEffect(() => {
    fetch('/data/subway.json')
      .then((res) => {
        return res.json();
      })
      .then((data: SubwayGraph) => {
        setGraph(data);
        setIsLoading(false);
      })
      .catch((err) => {
        console.error("데이터 로드 실패:", err);
        setIsLoading(false);
      });
  }, []);

  const handleSearch = (startStation: string, distance: number): void => {

    if (!graph) 
      return;

    const foundStations = findStationsByDistance(graph, startStation, distance);
    setResults(foundStations);

    if (foundStations.length === 0) {
      alert("검색 결과가 없거나 잘못된 역 이름입니다.");
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Subway Finder</h1>
          <p className="text-gray-500 mt-2">입력한 거리만큼 떨어진 역을 찾아보세요.</p>
        </header>

        <SearchForm onSearch={handleSearch} graph={graph}/>
        <ResultSection stations={results} />
      </div>
    </div>
  );
};

export default App;