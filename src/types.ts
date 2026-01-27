// 역 정보를 담는 인터페이스
export interface StationNode {
    id: string;       // "강남_2", "강남_신분당"
    name: string;     // "강남"
    line: string;     // "2호선"
    neighbors: string[]; // 연결된 StationNode의 id 리스트
}
  
// 검색 폼의 Props 타입
export interface SearchFormProps {
    onSearch: (stationName: string, distance: number) => void;
    graph: SubwayGraph | null;
}
  
// 결과 섹션의 Props 타입
export interface ResultSectionProps {
    stations: string[]; // 결과로 나온 역 이름 리스트
}

// 지하철 노선도 데이터
export interface SubwayGraph {
    [nodeId: string]: StationNode;
}