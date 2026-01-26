// 역 정보를 담는 인터페이스
export interface Station {
    name: string;
    line: string; // 예: '2호선'
}
  
// 검색 폼의 Props 타입
export interface SearchFormProps {
    onSearch: (stationName: string, distance: number) => void;
}
  
// 결과 섹션의 Props 타입
export interface ResultSectionProps {
    stations: string[]; // 결과로 나온 역 이름 리스트
}