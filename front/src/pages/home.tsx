import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import { useState, useEffect, useCallback, ChangeEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from '@/components/ui/select'
import { getClients, postAnalysis } from "@/api/client.ts";
import { Input } from "@/components/ui/input.tsx";

interface DragEvent extends React.DragEvent<HTMLDivElement> {
  dataTransfer: DataTransfer
}

function Home() {
  const [isUploading, setIsUploading] = useState<boolean>(false)
  const [progress, setProgress] = useState<number>(0)
  const [isComplete, setIsComplete] = useState<boolean>(false)
  const [isDragging, setIsDragging] = useState<boolean>(false)
  const [selectedClient, setSelectedClient] = useState<string>('') // 초기값을 빈 문자열로 설정
  const [clients, setClients] = useState<any[]>([])
  const [minuteOfCounseling, setMinuteOfCounseling] = useState<string>("")

  useEffect(() => {
    getClients()
        .then((res) => {
          const fetchedClients = res.data.data
          setClients(fetchedClients)
          if (fetchedClients.length > 0) {
            setSelectedClient(fetchedClients[0].id) // 첫 번째 클라이언트의 ID로 설정
          }
        })
        .catch((error) => {
          console.error('클라이언트 데이터를 가져오는 데 실패했습니다:', error)
          alert('클라이언트 데이터를 가져오는 데 실패했습니다.')
        })
  }, []);

  useEffect(() => {
    if (isUploading) {
      const timer = setTimeout(() => {
        setProgress((prev) => {
          const increment = Math.floor(Math.random() * 30) + 1
          return prev >= 99 ? 0 : Math.min(prev + increment, 99)
        })
      }, 1000)

      return () => clearTimeout(timer)
    }
  }, [isUploading, progress])

  const handleDragOver = useCallback((e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(true)
  }, [])

  const handleDragLeave = useCallback((e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)
  }, [])

  const handleDrop = useCallback((e: DragEvent): void => {
    e.preventDefault()
    e.stopPropagation()
    setIsDragging(false)

    const files = e.dataTransfer.files
    handleFiles(files)
  }, [])

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>): void => {
    if (e.target.files) {
      const files = e.target.files
      handleFiles(files)
    }
  }

  const handleFiles = async (files: FileList): Promise<void> => {
    if (!files.length) return

    const file = files[0]
    if (file.type === 'audio/mpeg' || file.type === 'audio/mp3' || file.type === 'audio/x-m4a' ||
        file.type === 'audio/m4a'
    ) {
      setIsUploading(true)
      const audioFile: Blob = new Blob([file], { type: file.type })
      try {
        await submitAudioFile(selectedClient, minuteOfCounseling, audioFile)
        setProgress(100)
        setIsComplete(true)
      } catch (error) {
        console.error('업로드 실패:', error)
        alert('업로드에 실패했습니다.')
      } finally {
        setIsUploading(false)
      }
    } else {
      alert('파일 형식이 맞지 않습니다.')
    }
  }

  const handleUploadClick = (): void => {
    const fileInput = document.getElementById('file-upload') as HTMLInputElement
    fileInput.click()
  }

  const handleReset = (): void => {
    setIsUploading(false)
    setProgress(0)
    setIsComplete(false)
  }

  const submitAudioFile = async (clientId: string, minuteOfCounseling: string, audioFile: Blob) => {
    const data = await postAnalysis(clientId, minuteOfCounseling, audioFile)
    console.log(data)
  }

  return (
      <div className="mt-12 bg-white">
        <div className="max-w-7xl mx-auto p-8">
          <div className="text-center mb-12">
            <h2 className="text-2xl font-medium mb-2">안녕하세요 상담사님!</h2>
            <p className="text-gray-500">분석할 음성 파일을 업로드 하세요.</p>
          </div>

          <div className="max-w-md mx-auto">
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">내담자 선택하기</h3>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
                <SelectTrigger>
                  <SelectValue placeholder="내담자를 선택하세요" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                      <SelectItem key={client.id} value={client.id}>
                        {client.name}
                      </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <div className="mt-6">
                <h3 className="text-lg font-medium mb-4">상담 시간</h3>
                <Input
                    type="number"
                    value={minuteOfCounseling}
                    onChange={(e) => setMinuteOfCounseling(e.target.value)}
                    placeholder="상담 시간을 분 단위로 입력하세요"
                />
              </div>
            </div>

            {!isComplete && !isUploading && (
                <div
                    className={`bg-gray-50 rounded-lg p-12 text-center border-2 border-dashed
              ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300'}
              `}
                    onDragOver={handleDragOver}
                    onDragLeave={handleDragLeave}
                    onDrop={handleDrop}
                >
                  <div className="mb-4">
                    <Upload className="w-12 h-12 text-gray-400 mx-auto" />
                  </div>
                  <p className="text-sm text-gray-500 mb-2">MP3 파일을 드래그하여 업로드하거나</p>
                  <p className="text-sm text-gray-500 mb-6">아래 버튼을 클릭하여 파일을 선택하세요.</p>
                  <input
                      type="file"
                      accept=".mp3,audio/mp3,audio/mpeg"
                      onChange={handleFileChange}
                      className="hidden"
                      id="file-upload"
                  />
                  <Button className="w-full cursor-pointer" onClick={handleUploadClick}>
                    파일 업로드
                  </Button>
                </div>
            )}

            {isUploading && !isComplete && (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-sm text-gray-500 mb-4">내담자의 감정을 분석하고 있어요.</p>
                  <Progress value={progress} className="mb-4" />
                  <p className="text-sm text-gray-500 mb-2">잠시만 기다려주세요...</p>
                  <p className="text-sm text-gray-400">
                    페이지를 이동하셔도 분석은 계속 진행되며,
                    <br />
                    대시보드에서 결과를 확인하실 수 있습니다.
                  </p>
                </div>
            )}

            {isComplete && (
                <div className="bg-gray-50 rounded-lg p-12 text-center">
                  <p className="text-xl font-medium mb-4">감정 분석이 완료되었습니다!</p>
                  <p className="text-sm text-gray-500 mb-6">
                    내담자님의 감정 분석 결과를 확인해보세요.
                  </p>
                  <div className="grid grid-cols-2 gap-x-4">
                    <Button variant="outline" onClick={handleReset}>
                      다른 파일 분석
                    </Button>
                    <Button>
                      <Link to="/dashboard">결과 보러가기</Link>
                    </Button>
                  </div>
                </div>
            )}
          </div>
        </div>
      </div>
  )
}

export default Home
