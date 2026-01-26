import { useState } from 'react';
import SearchForm from './components/SearchForm';
import ResultSection from './components/ResultSection';

const App: React.FC = () => {
  const [results, setResults] = useState<string[]>([]);

  const handleSearch = (startStation: string, distance: number): void => {
    console.log(`${startStation}역에서 ${distance}개 정거장 거리 검색`);
    
    // 추후 알고리즘 결과가 들어올 자리
    const mockData: string[] = ['강남역', '잠실역', '홍대입구역']; 
    setResults(mockData);
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