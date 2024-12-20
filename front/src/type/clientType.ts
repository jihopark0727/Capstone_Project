type ClientType = {
    age: number;
    birthDate: string;
    contactNumber: string;
    counselorClients: any[]; // 구체적인 타입을 알고 있다면 여기서 any 대신 명시.
    createdAt: string;
    emotionMap: Record<string, number> | null; // 감정 맵 구조가 명확하지 않다면 null을 허용.
    gender: string;
    id: number;
    name: string;
    registrationDate: string;
    registrationStatus: string;
    topic: string;
    updatedAt: string;
};

type AnalysisData = {
    id: number;
    speakerLabel: number;
    text: string;
    emotion: "행복" | "중립" | "불안" | "당황" | "슬픔" | "분노" | "혐오" | null;
    keywords: string[];
    analysisSummary?: string;
    sessionId: string;
};

type CounselingDetail = {
    id: number;
    clientName: string;
    data: string; // 날짜 형식. 예: "2024-12-05"
    duration: number; // 상담 시간(분)
    analysisData: AnalysisData[];
};

type DashboardType = {
    totalClientCount: number;
    totalCounselingCount: number;
    totalCounselingTime: string; // 예: "3시간 50분"
    mostFrequencyEmotion: string; // 예: "슬픔"
    counselingCountByEmotion: {
        [emotion: string]: number; // 감정 이름과 해당 카운트 매핑
    };
    counselingDetails: CounselingDetail[];
};

export type {ClientType, AnalysisData, DashboardType, CounselingDetail}
