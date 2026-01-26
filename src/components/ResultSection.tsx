import React from 'react';
import { type ResultSectionProps } from '../types';

const ResultSection: React.FC<ResultSectionProps> = ({ stations }) => {
  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-700 px-1">검색 결과 ({stations.length})</h2>
      
      {stations.length > 0 ? (
        <div className="grid grid-cols-1 gap-3">
          {stations.map((name, index) => (
            <div 
              key={index} 
              className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm hover:border-blue-200 transition"
            >
              <span className="font-medium text-gray-800">{name}</span>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-10 text-gray-400 border-2 border-dashed rounded-xl">
          결과가 없습니다.
        </div>
      )}
    </div>
  );
};

export default ResultSection;