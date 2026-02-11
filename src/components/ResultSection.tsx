import React from 'react';
import { type StationResult } from '../types';

// 호선별 색상 매핑 유틸리티
const getLineColor = (line: string) => {
    switch (line) {
        case '1호선': return 'bg-blue-900';
        case '2호선': return 'bg-green-500';
        case '3호선': return 'bg-orange-500';
        case '4호선': return 'bg-sky-400';
        case '5호선': return 'bg-purple-600';
        case '6호선': return 'bg-orange-700';
        case '7호선': return 'bg-lime-900';
        case '8호선': return 'bg-pink-500';
        case '9호선': return 'bg-yellow-600';
        case '분당선': return 'bg-amber-500';
        default: return 'bg-gray-400';
    }
};

const ResultSection: React.FC<{ stations: StationResult[] }> = ({ stations }) => {
    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stations.map((station, index) => (
                <div
                    key={index}
                    className="flex items-center justify-between gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-95"
                >
                    <span className="min-w-0 flex-1 font-bold text-gray-800 truncate">
                        {station.name}
                    </span>
                    <span className={`${getLineColor(station.line)} whitespace-nowrap shrink-0 text-white text-xs px-2 py-1 rounded-lg font-medium`}>
                        {station.line}
                    </span>
                </div>
            ))}
        </div>
    );
};

export default ResultSection;
