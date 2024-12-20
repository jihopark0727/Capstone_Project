import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Users, Calendar, Clock, ArrowUpRight, Type } from 'lucide-react'
import { useEffect, useState } from 'react'
import Modal from 'react-modal'

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { EmotionHeptagonChart } from '@/components/ui/emotion-herptagon-chart'
import { DetailedView } from '@/components/detailview'
import { getClients, getDashboardData, getDominantEmotionByClient } from '@/api/client.ts'
import { ClientType, DashboardType } from '@/type/clientType.ts'

Modal.setAppElement('#root') // React Modal의 루트 설정

interface EmotionJson {
  [key: string]: number | undefined
}

interface EmotionData {
  labels: string[]
  values: number[]
}

function transformEmotionData(emotionJson: EmotionJson): EmotionData {
  const availableKeys = ['행복', '중립', '불안', '당황', '슬픔', '분노', '혐오']
  const completeEmotionJson: { [key: string]: number } = Object.fromEntries(
      availableKeys.map((key) => [key, emotionJson[key] || 0])
  )

  return {
    labels: Object.keys(completeEmotionJson),
    values: Object.values(completeEmotionJson)
  }
}

function Dashboard() {
  const [expandedAnalysis, setExpandedAnalysis] = useState<number | null>(null)
  const [clients, setClients] = useState<ClientType[]>([])
  const [selectClient, setSelectClient] = useState<string | null>(null);
  const [dashboardData, setDashboardData] = useState<DashboardType | null>(null)
  const [dominantEmotion, setDominantEmotion] = useState<string>('정보 없음');
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedOrder, setSelectedOrder] = useState<number | null>(null);

  const openModal = (analysisId: number, order: number) => {
    setExpandedAnalysis(analysisId);
    setSelectedOrder(order); // 순서 저장
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setExpandedAnalysis(null);
    setSelectedOrder(null); // 순서 초기화
    setIsModalOpen(false);
  };

  useEffect(() => {
    getClients().then((res) => {
      setClients(res.data.data)
    })
  }, [])

  useEffect(() => {
    if (selectClient) {
      getDashboardData(selectClient).then((res) => {
        setDashboardData(res.data.data);
      });

      getDominantEmotionByClient(selectClient)
          .then((res) => {
            const clientEmotion = res.data?.dominantEmotion || '정보 없음';
            setDominantEmotion(clientEmotion);
          })
          .catch((err) => {
            console.error('Error fetching dominant emotion:', err);
            setDominantEmotion('정보 없음');
          });
    } else {
      setDashboardData(null);
      setDominantEmotion('정보 없음');
    }
  }, [selectClient]);



  return (
      <div className="p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-2xl font-bold mb-2">대시보드</h1>
          </div>
          <Select value={selectClient} onValueChange={setSelectClient}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="내담자 선택" />
            </SelectTrigger>
            <SelectContent>
              {clients.map((client) => (
                  <SelectItem key={client.id} value={String(client.id)}>
                    {client.name}
                  </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {selectClient && dashboardData ? (
            <>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-blue-100 rounded-lg">
                      <Users className="w-5 h-5 text-blue-600" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">전체 내담자</p>
                  <p className="text-2xl font-bold">{dashboardData?.totalClientCount}</p>
                </Card>
                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-purple-100 rounded-lg">
                      <Calendar className="w-5 h-5 text-purple-600" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">총 상담 횟수</p>
                  <p className="text-2xl font-bold">{dashboardData?.totalCounselingCount}회</p>
                </Card>

                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-orange-100 rounded-lg">
                      <Clock className="w-5 h-5 text-orange-600" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">총 상담 시간</p>
                  <p className="text-2xl font-bold">{dashboardData?.totalCounselingTime}</p>
                </Card>

                <Card className="p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2 bg-green-100 rounded-lg">
                      <Type className="w-5 h-5 text-green-600" />
                    </div>
                    <ArrowUpRight className="w-5 h-5 text-green-500" />
                  </div>
                  <p className="text-sm text-gray-500 mb-1">주된 감정</p>
                  <p className="text-2xl font-bold">{dominantEmotion}</p>
                </Card>
              </div>

              <div className="grid grid-cols-1 gap-6 mb-8">
                <Card className="p-6">
                  <div>
                    <h2 className="text-2xl font-bold">감정 분석 결과</h2>
                    <p className="text-gray-500 mt-1">
                      최근 분석된 상담의 감정 분석 결과입니다.
                    </p>
                  </div>
                  <div className="flex justify-center">
                    {dashboardData && (
                        <EmotionHeptagonChart
                            data={transformEmotionData(
                                dashboardData?.counselingCountByEmotion
                            )}
                        />
                    )}
                  </div>
                </Card>
                <Card className="p-6">
                  <div className="mb-8">
                    <h2 className="text-2xl font-bold">최근 상담 내역</h2>
                    <p className="text-gray-500 mt-1">
                      최근 분석된 상담의 감정 분석 결과입니다.
                    </p>
                  </div>
                  <div className="space-y-5">
                    {dashboardData?.counselingDetails.map((analysis, index) => (
                        <div key={analysis.id}>
                          <div
                              className="flex items-center justify-between p-5 rounded-xl border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all bg-white"
                          >
                            <div className="flex items-center gap-5">
                              {/* 순서 박스 */}
                              <span
                                  className="inline-block w-10 h-10 flex items-center justify-center bg-gray-200 text-gray-800 text-sm font-medium rounded-lg"
                              >
              {index + 1}
            </span>
                              {/* 내담자 이름 박스 */}
                              <span
                                  className="inline-block w-20 h-10 flex items-center justify-center bg-blue-100 text-blue-800 text-sm font-medium rounded-lg"
                              >
              {analysis.clientName}
            </span>
                              <div>
                                {/* 날짜와 상담 시간 표시 */}
                                <div className="flex items-center gap-3 mb-1.5">
                                  <h3 className="text-xl font-bold text-gray-800">
                                    {analysis.data} ({analysis.duration}분)
                                  </h3>
                                </div>
                              </div>
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => openModal(analysis.id, index + 1)} // 순서 값 전달
                            >
                              {expandedAnalysis === analysis.id ? "접기" : "상세보기"}
                            </Button>
                          </div>
                        </div>
                    ))}
                  </div>
                </Card>
              </div>
            </>
        ) : (
            <div className="flex items-center justify-center h-screen">
              <div className="text-center" style={{transform: "translateY(-20%)"}}>
                <h1 className="text-4xl font-bold mb-4">상담 현황과 통계를 한눈에 확인하세요</h1>
                <p className="text-2xl text-gray-500">내담자를 선택해주세요.</p>
              </div>
            </div>

        )}

        {/* Modal Implementation */}
        <Modal
            isOpen={isModalOpen}
            onRequestClose={closeModal}
            contentLabel="Detailed View Modal"
            style={{
              overlay: {backgroundColor: "rgba(0, 0, 0, 0.5)"},
              content: {
                top: "50%",
                left: "50%",
                right: "auto",
                bottom: "auto",
                marginRight: "-50%",
                transform: "translate(-50%, -50%)",
                padding: "20px",
                borderRadius: "8px",
                width: "80%",
                maxWidth: "1200px",
                maxHeight: "90vh",
                overflow: "auto",
              },
            }}
        >
          {expandedAnalysis !== null && dashboardData?.counselingDetails && (
              <DetailedView
                  analysis={
                      dashboardData.counselingDetails.find(
                          (detail) => detail.id === expandedAnalysis
                      )?.analysisData || []
                  }
                  order={selectedOrder} // 순서 값 전달
                  onClose={closeModal}
              />
          )}
        </Modal>
      </div>
  )
}

export default Dashboard
