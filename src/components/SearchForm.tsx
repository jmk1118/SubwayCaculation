import React, { useState } from 'react';
import { type SearchFormProps } from '../types';

const SearchForm: React.FC<SearchFormProps> = ({ onSearch }) => {
  const [station, setStation] = useState<string>('');
  const [distance, setDistance] = useState<number>(1);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>): void => {
    e.preventDefault();
    if (!station.trim()) return alert('역 이름을 입력하세요!');
    onSearch(station, distance);
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">출발역 이름</label>
        <input
          type="text"
          value={station}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setStation(e.target.value)}
          placeholder="예: 강남"
          className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">거리 ({distance}개 역)</label>
        <input
          type="range"
          min="1"
          max="10"
          value={distance}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDistance(Number(e.target.value))}
          className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-600 text-black py-3 rounded-lg font-semibold hover:bg-blue-700 transition"
      >
        찾기
      </button>
    </form>
  );
};

export default SearchForm;