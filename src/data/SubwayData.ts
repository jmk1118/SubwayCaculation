import { type SubwayGraph } from '../types';

export const subwayData: SubwayGraph = {
    // --- 2호선 ---
    "강남_2": {
      id: "강남_2",
      name: "강남",
      line: "2호선",
      neighbors: ["역삼_2", "교대_2", "강남_신분당"] // 환승 연결 포함
    },
    "역삼_2": {
      id: "역삼_2",
      name: "역삼",
      line: "2호선",
      neighbors: ["강남_2", "선릉_2"]
    },
  
    // --- 신분당선 ---
    "강남_신분당": {
      id: "강남_신분당",
      name: "강남",
      line: "신분당선",
      neighbors: ["양재_신분당", "신논현_신분당", "강남_2"] // 환승 연결 포함
    },
    "양재_신분당": {
      id: "양재_신분당",
      name: "양재",
      line: "신분당선",
      neighbors: ["강남_신분당", "양재시민의숲_신분당"]
    }
  };