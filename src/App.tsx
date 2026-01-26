import { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultSection from './components/ResultSection';
import { subwayData } from './data/SubwayData';
import { findStationsByDistance } from './utils/BFS';

const App: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (startStation: string, distance: number): void => {
    // 1. 알고리즘 실행
    const foundStations = findStationsByDistance(subwayData, startStation, distance);

    // 2. 결과 상태 업데이트
    setResults(foundStations);

    if (foundStations.length === 0) {
      alert("검색 결과가 없거나 잘못된 역 이름입니다.");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-md mx-auto space-y-8">
        <header className="text-center">
          <h1 className="text-3xl font-bold text-blue-600">Subway Finder</h1>
          <p className="text-gray-500 mt-2">입력한 거리만큼 떨어진 역을 찾아보세요.</p>
        </header>

        <SearchForm onSearch={handleSearch} />

        <ResultSection stations={results} />
      </div>
    </div>
  );
};

export default App;