import React, { useState, useRef, useEffect } from 'react';
import { type StationIndexMap } from '../types';
import Autocomplete from './Autocomplete';

interface SearchFormProps {
    stationIndex: StationIndexMap;
    onSearch: (name: string, dist: number) => void;
}

const SearchForm: React.FC<SearchFormProps> = ({ stationIndex, onSearch }) => {
    const [searchTerm, setSearchTerm] = useState("");
    const [distance, setDistance] = useState(1);
    const [suggestions, setSuggestions] = useState<string[]>([]);
    const [showAutocomplete, setShowAutocomplete] = useState(false);
    const [isEditing, setIsEditing] = useState(false); // 편집 모드 상태 추가

    const wrapperRef = useRef<HTMLDivElement>(null);

    const normalizeStationText = (value: string) => value.replace(/\s+/g, "").trim();
    const removeStationSuffix = (value: string) => value.endsWith("역") ? value.slice(0, -1) : value;

    const findExactStationName = (query: string) => {
        if (!query)
            return "";
        if (stationIndex[query])
            return query;

        const normalizedQuery = normalizeStationText(query);
        return Object.keys(stationIndex).find(
            (name) => normalizeStationText(name) === normalizedQuery
        ) ?? "";
    };

    const resolveStationName = (rawName: string) => {
        const trimmed = rawName.trim();
        if (!trimmed)
            return "";

        // 데이터에 실제로 "...역" 형태가 있을 수 있으므로 원본 우선 확인
        const rawMatched = findExactStationName(trimmed);
        if (rawMatched)
            return rawMatched;

        const withoutSuffix = removeStationSuffix(trimmed);
        const suffixMatched = findExactStationName(withoutSuffix);
        if (suffixMatched)
            return suffixMatched;

        return normalizeStationText(withoutSuffix);
    };

    // 외부 클릭 시 자동완성 닫기
    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
                setShowAutocomplete(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        setSearchTerm(value);
        const keyword = normalizeStationText(removeStationSuffix(value));

        if (value.trim().length > 0) {
            const filtered = Object.keys(stationIndex)
                .filter((name) => {
                    const normalizedName = normalizeStationText(removeStationSuffix(name));
                    return normalizedName.includes(keyword);
                })
                .slice(0, 8);
            setSuggestions(filtered);
            setShowAutocomplete(true);

            if (filtered.length === 0) {
                onSearch("", distance);
            }
        } else {
            setSuggestions([]);
            setShowAutocomplete(false);
            onSearch("", distance);
        }
    };

    const handleSelect = (name: string) => {
        setSearchTerm(name);
        onSearch(name, distance);
        setShowAutocomplete(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const resolvedName = resolveStationName(searchTerm);
        if (resolvedName) {
            onSearch(resolvedName, distance);
            setShowAutocomplete(false);
            return;
        }
        onSearch("", distance);
        setShowAutocomplete(false);
    };

    const updateDistance = (next: number) => {
        const clamped = next > 100 ? 100 : next < 1 ? 1 : next;
        setDistance(clamped);
        const resolvedName = resolveStationName(searchTerm);
        if (resolvedName && clamped > 0) {
            onSearch(resolvedName, clamped);
            setShowAutocomplete(false);
            return;
        }
        onSearch("", clamped);
        setShowAutocomplete(false);
    };

    // 거리 증감 함수
    const handleDecrement = () => updateDistance(distance - 1);
    const handleIncrement = () => updateDistance(distance + 1);

    // 입력값 유효성 검사 및 저장
    const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            updateDistance(val);
        } else if (e.target.value === "") {
            setDistance(0); // 빈 칸일 경우 기본값
        }
    };

    return (
        <form onSubmit={handleSubmit} className="mb-8">
            <div className="flex flex-col gap-5">

                {/* 1. 역 이름 입력부 (생략 - 기존 유지) */}
                <div className="relative w-full" ref={wrapperRef}>
                    <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                        출발역
                    </label>
                    <input
                        type="text"
                        value={searchTerm}
                        onChange={handleInputChange}
                        onFocus={() => searchTerm && setShowAutocomplete(true)}
                        placeholder="역 이름을 입력하세요 (예: 잠실)"
                        className="w-full p-4 rounded-2xl border border-gray-200 bg-white text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                    />
                    <Autocomplete suggestions={suggestions} onSelect={handleSelect} visible={showAutocomplete} />
                </div>

                {/* 2. 거리 조절부 (개선된 증감 버튼 UI) */}
                <div className="w-full">
                    <label className="block text-sm font-medium text-gray-500 mb-1 ml-1">
                        이동 거리 (정거장 수)
                    </label>
                    <div className="flex items-center gap-2 p-1 bg-gray-50 rounded-2xl border border-gray-200">

                        <button
                            type="button"
                            onClick={handleDecrement}
                            className="w-14 h-14 flex items-center justify-center bg-white text-gray-600 rounded-xl shadow-sm active:scale-90 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
                            </svg>
                        </button>

                        {/* 중앙 숫자 표시 및 입력부 */}
                        <div className="flex-1 flex justify-center items-center">
                            {isEditing ? (
                                <input
                                    type="number"
                                    autoFocus
                                    value={distance}
                                    onChange={handleDistanceChange}
                                    onBlur={() => setIsEditing(false)}
                                    onKeyDown={(e) => e.key === 'Enter' && setIsEditing(false)}
                                    // appearance-none을 추가하여 브라우저 기본 스타일을 한 번 더 방어합니다.
                                    className="w-16 text-2xl font-black text-center bg-transparent text-blue-600 outline-none appearance-none"
                                    style={{ MozAppearance: 'textfield' }} // Firefox 호환성
                                />
                            ) : (
                                <div
                                    onClick={() => setIsEditing(true)}
                                    className="cursor-pointer py-2 px-4 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <span className="text-2xl font-black text-blue-600">
                                        {distance}
                                    </span>
                                    <span className="text-sm text-gray-400 ml-1 font-medium">역</span>
                                </div>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={handleIncrement}
                            className="w-14 h-14 flex items-center justify-center bg-white text-gray-600 rounded-xl shadow-sm active:scale-90 transition-all"
                        >
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                            </svg>
                        </button>
                    </div>
                </div>

            </div>
        </form>
    );
};

export default SearchForm;
