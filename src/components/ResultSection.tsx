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
        case '인천1호선': return 'bg-cyan-600';
        case '인천2호선': return 'bg-yellow-500';
        case '분당선': return 'bg-amber-500';
        case '신분당선': return 'bg-red-500';
        case '경의중앙선': return 'bg-teal-600';
        case '공항철도': return 'bg-blue-500';
        case '경춘선': return 'bg-emerald-500';
        case '의정부경전철': return 'bg-lime-500';
        case '용인경전철': return 'bg-lime-700';
        case '경강선': return 'bg-indigo-500';
        case '우이신설선': return 'bg-orange-400';
        case '서해선': return 'bg-emerald-700';
        case '김포도시철도': return 'bg-amber-700';
        case '신림선': return 'bg-green-700';
        case 'GTX-A': return 'bg-violet-600';
        default: return 'bg-gray-400';
    }
};

interface ResultSectionProps {
    stations: StationResult[];
    startStationName: string;
}

const ensureStationSuffix = (name: string) => name.endsWith('역') ? name : `${name}역`;
const toTransitStationQuery = (name: string) => `${ensureStationSuffix(name)} 지하철역`;

const createGoogleMapDirectionsUrl = (startStationName: string, endStationName: string) => {
    const start = toTransitStationQuery(startStationName.trim());
    const end = toTransitStationQuery(endStationName.trim());
    const params = new URLSearchParams({
        api: '1',
        origin: start,
        destination: end,
        travelmode: 'transit'
    });
    return `https://www.google.com/maps/dir/?${params.toString()}`;
};

const ResultSection: React.FC<ResultSectionProps> = ({ stations, startStationName }) => {
    const canOpenMap = startStationName.trim().length > 0;
    const hasSearched = startStationName.trim().length > 0;

    if (!hasSearched) {
        return (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-3">
                <h2 className="text-base font-bold text-slate-900">검색 전 안내</h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                    출발역과 점수를 입력하면 도달 가능한 역 목록이 표시됩니다.
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                    결과창에서는 환승 횟수와 이동 정거장 수를 확인할 수 있습니다.
                </p>
            </section>
        );
    }

    if (stations.length === 0) {
        return (
            <section className="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm space-y-2">
                <h2 className="text-base font-bold text-slate-900">검색 결과가 없습니다</h2>
                <p className="text-sm text-slate-700 leading-relaxed">
                    입력한 역명 또는 점수 조건으로는 도달 가능한 역을 찾지 못했습니다.
                </p>
                <p className="text-sm text-slate-700 leading-relaxed">
                    역명을 다시 확인하거나 거리 점수/환승 가중치를 조정해 다시 검색해보세요.
                </p>
            </section>
        );
    }

    return (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {stations.map((station, index) => (
                <button
                    key={index}
                    type="button"
                    onClick={() => {
                        if (!canOpenMap)
                            return;
                        const url = createGoogleMapDirectionsUrl(startStationName, station.name);
                        window.open(url, '_blank', 'noopener,noreferrer');
                    }}
                    disabled={!canOpenMap}
                    className="flex items-center justify-between gap-2 p-4 bg-white rounded-2xl shadow-sm border border-gray-100 transition-transform active:scale-95 text-left disabled:opacity-60 disabled:cursor-not-allowed"
                >
                    <div className="min-w-0 flex-1">
                        <p className="font-bold text-gray-800 truncate">{station.name}</p>
                        <p className="text-xs text-gray-500 mt-1 whitespace-nowrap">
                            환승 {station.transferCount}회, {station.distance}역 이동
                        </p>
                    </div>
                    <span className={`${getLineColor(station.line)} whitespace-nowrap shrink-0 text-white text-xs px-2 py-1 rounded-lg font-medium`}>
                        {station.line}
                    </span>
                </button>
            ))}
        </div>
    );
};

export default ResultSection;
