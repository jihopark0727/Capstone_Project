import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  PDFDownloadLink,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Font, // Font 추가
} from "@react-pdf/renderer";
import { AnalysisData } from "@/type/clientType";
import { useEffect, useState, useRef } from "react";
import html2canvas from "html2canvas";


// 한글 폰트 등록
Font.register({
  family: "NotoSans",
  src: "https://fonts.gstatic.com/ea/notosanskr/v2/NotoSansKR-Regular.woff2", // NotoSansKR 폰트 URL
});


type Props = {
  analysis: AnalysisData[];
  order: number;
  onClose: () => void;
}

const emotionLabels = {
  0: '행복',
  1: '중립',
  2: '불안',
  3: '당황',
  4: '슬픔',
  5: '분노',
  6: '혐오'
};

const emotionReverseLabels = {
  '행복' : 0,
  '중립' : 1,
  '불안' : 2,
  '당황' : 3,
  '슬픔' : 4,
  '분노' : 5,
  '혐오' : 6
};

// PDF 스타일 정의
const styles = StyleSheet.create({
  page: {
    padding: 20,
    fontSize: 12,
    fontFamily: "NotoSans", // 등록한 한글 폰트 사용
    backgroundColor: "#f9f9f9", // 페이지 전체 배경색
  },
  section: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 5,
    backgroundColor: "#ffffff", // 섹션 배경색
    boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)", // 섹션 그림자
  },
  pageHeader: {
    fontSize: 24, // 더 큰 폰트 크기
    marginBottom: 15, // 큰 여백
    fontWeight: "bold", // 강조
    color: "#1a73e8", // 페이지 전체를 대표하는 파란색
    borderBottomWidth: 3, // 더 두꺼운 구분선
    borderBottomColor: "#1a73e8", // 파란색 구분선
    paddingBottom: 8, // 구분선과 텍스트 사이 여백
    textAlign: "center", // 중앙 정렬
    backgroundColor: "#e3f2fd", // 연한 파란 배경
    padding: 10, // 내부 여백
    borderRadius: 8, // 둥근 테두리
  },
  header: {
    fontSize: 18, // 조금 작은 폰트 크기
    marginBottom: 10, // 작은 여백
    fontWeight: "bold", // 강조
    color: "#333333", // 기본적인 검은색
    borderBottomWidth: 1, // 얇은 구분선
    borderBottomColor: "#4caf50", // 녹색 구분선
    paddingBottom: 5, // 구분선과 텍스트 사이 여백
    textAlign: "left", // 왼쪽 정렬
  },
  subheader: {
    fontSize: 14,
    marginBottom: 8,
    fontWeight: "bold",
    color: "#4caf50",
  },
  summaryText: {
    marginBottom: 6,
    color: "#555555",
  },
  text: {
    marginVertical: 10, // 위아래 간격 추가
    padding: 10, // 내부 여백
    backgroundColor: "#f1f1f1", // 말풍선 배경색
    borderRadius: 8, // 말풍선 둥근 모서리
    borderWidth: 1, // 테두리 추가
    borderColor: "#ccc", // 테두리 색상
    color: "#555555",
  },
  highlightedText: {
    backgroundColor: "#fff9c4", // 노란색 강조 배경
    padding: 4,
    borderRadius: 3,
    fontWeight: "bold",
    color: "#333333",
  },

  keywordBox: {
    backgroundColor: "#e3f2fd", // 파란색 배경
    padding: 8,
    borderRadius: 5,
    marginBottom: 10,
    color: "#01579b", // 파란 텍스트 색상
    fontWeight: "bold",
  },
  summaryBox: {
    backgroundColor: "#e8f5e9", // 녹색 배경
    padding: 10,
    borderRadius: 5,
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#4caf50", // 테두리 녹색
  },
  chartSection: {
    marginTop: 20,
    textAlign: "center",
    padding: 10,
    backgroundColor: "#f0f4f8", // 연한 회색 배경
    borderRadius: 5,
  },
  chartPlaceholder: {
    height: 150,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#e0e0e0", // 차트 자리 표시 배경
    borderRadius: 5,
  },
});

// PDF 생성 컴포넌트
const AnalysisPDF = ({
                       analysis,
                       order,
                       mostCommonKeyword,
                       mostCommonEmotion,
                       chartImage, // 캡처된 차트 이미지
                     }: {
  analysis: AnalysisData[];
  order: number;
  mostCommonKeyword: string;
  mostCommonEmotion: string;
  chartImage: string | null; // Base64 형식의 차트 이미지
  clientSolution: String | null;
}) => {
  return (
      <Document>
        <Page style={styles.page}>
          {/* 제목 섹션 */}
          <View style={styles.section}>
            <Text style={styles.pageHeader}>{order}번째 상담 Report</Text>
          </View>

          {/* 키워드 및 감정 분석 */}
          <View style={styles.section}>
            <Text style={styles.subheader}>상담 분석</Text>
            <Text style={styles.summaryText}>
              가장 많이 언급된 키워드:{" "}
              <Text style={styles.keywordBox}>{mostCommonKeyword}</Text>
            </Text>
            <Text style={styles.summaryText}>
              주요 감정:{" "}
              <Text style={styles.highlightedText}>{mostCommonEmotion}</Text>
            </Text>
          </View>

          {/* 상담 내용 */}
          <View style={styles.section}>
            <Text style={styles.header}>상담 내용</Text>
            {analysis.map((item, index) => (
                <Text key={index} style={styles.text}>
                  <Text style={{ fontWeight: "bold", color: "#4caf50" }}>
                    {item.speakerLabel === 1 ? "내담자" : "상담사"}:
                  </Text>{" "}
                  {item.text}
                </Text>
            ))}
          </View>

          {/* 차트 이미지 삽입 */}
          {chartImage && (
              <View style={styles.section}>
                <Text style={styles.header}>감정 변화 차트</Text>
                <Image src={chartImage} style={{ width: "100%", height: 200 }} />
              </View>
          )}

          {/* GPT 요약 섹션 */}
          <View style={styles.section}>
            <Text style={styles.header}>당신을 위한 GPT의 요약</Text>
            <View style={styles.summaryBox}>
              <Text>
                {analysis[analysis.length - 2]?.analysisSummary ||
                    "요약 정보가 없습니다."}
              </Text>
            </View>
          </View>
        </Page>
      </Document>
  );
};


export function DetailedView({ analysis, order, onClose }: Props) {

  const chartRef = useRef(null); // 차트를 참조할 ref

  const emotions = analysis.map((data) => {
    switch (data.emotion) {
      case '행복':
        return 0
      case '중립':
        return 1
      case '불안':
        return 2
      case '당황':
        return 3
      case '슬픔':
        return 4
      case '분노':
        return 5
      case '혐오':
        return 6
      default:
        return 1
    }
  })



  const chartData1 = analysis
      .filter((item) => item.speakerLabel === 1) // speakerLabel이 1인 경우만 필터링
  const chartData = chartData1.map((item, index) => ({
    name: item.text, // 실제 대화 텍스트
    value:  emotionReverseLabels[item.emotion ?? '중립']// 숫자 값 유지
  }));



  const getMostCommonKeywordAndEmotion = (data: AnalysisData[]) => {
    const keywords: string[] = []
    const emotions: string[] = []

    data.forEach((item) => {
      if (item.speakerLabel === 1) {
        if (item.keywords) keywords.push(...item.keywords)
        if (item.emotion) emotions.push(item.emotion)
      }
    })

    const keywordCount = keywords.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const emotionCount = emotions.reduce((acc, curr) => {
      acc[curr] = (acc[curr] || 0) + 1
      return acc
    }, {} as Record<string, number>)

    const mostCommonKeyword = Object.entries(keywordCount).sort((a, b) => b[1] - a[1])[0]?.[0]
    const mostCommonEmotion = Object.entries(emotionCount).sort((a, b) => b[1] - a[1])[0]?.[0]

    return [mostCommonKeyword, mostCommonEmotion]
  }

  const [mostCommonKeyword, mostCommonEmotion] = getMostCommonKeywordAndEmotion(analysis)

  // 감정 색상 맵핑
  const emotionColorMap = {
    행복: 'bg-green-500',
    중립: 'bg-gray-500',
    불안: 'bg-yellow-500',
    당황: 'bg-orange-500',
    슬픔: 'bg-blue-500',
    분노: 'bg-red-500',
    혐오: 'bg-purple-500',
    default: 'bg-gray-300',
  };


  // 마지막 대화에서 요약 데이터 가져오기
  const lastItem = analysis[analysis.length - 1]
  const summary = lastItem?.analysisSummary

  return (
      <div className="mt-4 p-4 border rounded-lg bg-gray-50">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold">{order}번째 상담</h2>
          <div className="flex gap-10">
            {/* PDF 다운로드 버튼 */}
            <PDFDownloadLink
                document={
                  <AnalysisPDF
                      analysis={analysis}
                      order={order}
                      mostCommonKeyword={mostCommonKeyword || "키워드 없음"}
                      mostCommonEmotion={mostCommonEmotion || "감정 없음"}
                  />
                }
                fileName="analysis_report.pdf"
                className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              {({loading}) => (loading ? "PDF 생성 중..." : "PDF 다운로드")}
            </PDFDownloadLink>

            {/* 닫기 버튼 */}
            <button
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
            >
              닫기
            </button>
          </div>
        </div>
        <p className="text-lg">
          가장 많이 언급된 키워드: <span className="font-medium">{mostCommonKeyword}</span>
        </p>
        <p className="text-lg mb-4">
          주요 감정: <span className="font-medium text-red-500">{mostCommonEmotion}</span>
        </p>

        <div className="mb-6 h-[300px] emotion-chart" ref={chartRef}>
          <h3 id="capture" className="text-lg font-semibold mb-2">감정 변화 그래프</h3>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart
                data={chartData}
                margin={{top: 10, right: 30, left: 20, bottom: 30}}
            >
              <CartesianGrid strokeDasharray="3 3"/>
              <XAxis dataKey="name" tick={false} padding={{left: 30, right: 30}}/>
              <YAxis
                  tickFormatter={(tick) => emotionLabels[tick]}
                  domain={[0, 6]}
                  ticks={[0, 1, 2, 3, 4, 5, 6]}
              />
              <Tooltip formatter={(value) => [emotionLabels[value], "감정"]}/>
              <Line type="monotone" dataKey="value" stroke="#8884d8"/>
            </LineChart>
          </ResponsiveContainer>
        </div>

        <div className="space-y-2">
          {analysis.map((item, index) => {
            const emotion = item.emotion || "default";
            const emotionColor =
                item.speakerLabel === 2
                    ? "bg-white"
                    : emotionColorMap[emotion] || emotionColorMap.default;

            const textBackgroundColor =
                item.speakerLabel === 1 ? "bg-blue-50" : "bg-white"; // 내담자는 옅은 하늘색

            return (
                <div key={index} className="p-2 rounded">
                  <p className="flex items-center gap-1"> {/* gap-2 -> gap-1로 간격 줄임 */}
                    {/* 감정 라벨 */}
                    <span
                        className={`inline-block w-16 h-6 flex items-center justify-center text-white text-sm rounded-lg ${emotionColor}`}
                        style={{lineHeight: "1.5"}}
                    >
      {item.speakerLabel === 2 ? "" : item.emotion ?? ""}
    </span>

                    <strong
                        className="w-20 flex-shrink-0 text-lg"
                        style={{
                          fontSize: "1rem",
                          marginLeft: "8px", // 왼쪽 여백 추가
                        }}
                    >
                      {item.speakerLabel === 1
                          ? "내담자"
                          : item.speakerLabel === 2
                              ? "상담사"
                              : `사람(${item.speakerLabel})`}
                    </strong>

                    {/* 대화 내용 */}
                    <span
                        className={`text-base flex-grow px-4 py-3 rounded-lg ${textBackgroundColor}`}
                        style={{
                          display: "flex", // Flexbox 활성화
                          alignItems: "center", // 세로(수직) 가운데 정렬
                          width: "300px", // 고정 너비
                          height: "80px", // 고정 높이
                          overflow: "hidden", // 넘치는 텍스트 숨김
                          textOverflow: "ellipsis", // 넘치는 텍스트 '...'로 표시
                          whiteSpace: "pre-wrap", // 줄바꿈 허용
                          wordBreak: "break-word", // 긴 단어 줄바꿈
                          fontSize: "1rem", // 텍스트 크기 조정
                        }}
                    >
      {item.text}
    </span>
                  </p>
                </div>

            )
                ;
          })}
        </div>


        {/* 요약 섹션 (루프 밖) */}
        {summary && (
            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded shadow">
              <h4 className="text-lg font-semibold text-blue-800 mb-2">Chat GPT의 요약</h4>
              <p className="text-sm text-gray-700 leading-relaxed">{summary}</p>
            </div>
        )}
      </div>

  )
}
