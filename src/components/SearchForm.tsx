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

        if (value.trim().length > 0) {
            const filtered = Object.keys(stationIndex)
                .filter(name => name.includes(value))
                .slice(0, 8);
            setSuggestions(filtered);
            setShowAutocomplete(true);
        } else {
            setSuggestions([]);
        }
    };

    const handleSelect = (name: string) => {
        setSearchTerm(name);
        setShowAutocomplete(false);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (searchTerm.trim()) {
            onSearch(searchTerm, distance);
            setShowAutocomplete(false);
        }
    };

    // 거리 증감 함수
    const handleDecrement = () => setDistance(prev => (prev > 0 ? prev - 1 : prev));
    const handleIncrement = () => setDistance(prev => (prev < 100 ? prev + 1 : prev));

    // 입력값 유효성 검사 및 저장
    const handleDistanceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const val = parseInt(e.target.value);
        if (!isNaN(val)) {
            setDistance(val > 100 ? 100 : val < 1 ? 1 : val);
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

                {/* 3. 검색 버튼 */}
                <button
                    type="submit"
                    className="w-full p-4 mt-2 rounded-2xl font-bold text-lg transition-all active:scale-[0.98]bg-blue-600 text-slate-900 shadow-lg shadow-blue-200 hover:bg-blue-700"
                >
                    탐색하기
                </button>
            </div>
        </form>
    );
};

export default SearchForm;