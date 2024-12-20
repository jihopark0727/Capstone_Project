import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow
} from '@/components/ui/table'
import {useEffect, useState} from 'react'
import { Plus, Pencil, Ban } from 'lucide-react'
import PostClientModal from '@/components/client/PostClientModal'
import UpdateClientModal from '@/components/client/UpdateClientModal'
import {getClients} from "@/api/client.ts";
import {Api} from "@/api/axios.ts";

export interface Client {
  id: number
  name: string
  age: number
  gender: string
  contactNumber: string
  topic: string
  birthDate: string
  registrationDate: string
  registrationStatus: string
  counselorClients: any[]
  emotionMap: any
  createdAt: string
  updatedAt: string
}

function MyCounsel() {
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [clients, setClients] = useState<any[]>([]);
  const [status, setStatus] = useState<string>("전체")
  const [editId, setEditId] = useState<string>("")
  useEffect(() => {
    getClients()
        .then((res) => {
            if (status === "전체") {
                setClients(res.data.data)
            }else if (status === "진행") {
              setClients(res.data.data.filter((client: Client) => client.registrationStatus === "진행"))
            }else if (status === "완료") {
              setClients(res.data.data.filter((client: Client) => client.registrationStatus === "완료"))
            }
        })
  }, [status]);

  async function handleDeleteClient(id: string) {
    Api.delete(`/api/clients/${id}`)
        .then(() => {
            alert("내담자가 삭제되었습니다.")
            window.location.reload()
        })
  }

  return (
      <div className="w-full min-h-screen bg-gray-50 p-4 md:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col md:flex-row md:items-center justify-between mb-8 gap-4">
            <div>
              <h1 className="text-xl font-medium">안녕하세요 상담사님,</h1>
              <p className="text-gray-500">마음읽기가 도와드릴게요!</p>
            </div>
            <Button
                onClick={() => setShowAddDialog(true)}
                className="flex items-center gap-2 w-full md:w-auto"
            >
              <Plus className="w-4 h-4"/>
              내담자 등록
            </Button>
          </div>

          <div className="bg-white rounded-lg p-4 md:p-6 overflow-x-auto">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button variant="outline" className={"flex-1 md:flex-none " + (status === "전체" ? "bg-red-50 text-red-500 " : "")} onClick={() => setStatus("전체")}>
                  전체
                </Button>
                <Button variant="outline" className={"flex-1 md:flex-none " + (status === "진행" ? "bg-red-50 text-red-500 " : "")} onClick={() => setStatus("진행")}>
                  진행
                </Button>
                <Button variant="outline" className={"flex-1 md:flex-none " + (status === "완료" ? "bg-red-50 text-red-500 " : "")} onClick={() => setStatus("완료")}>
                  완료
                </Button>
              </div>
            </div>

            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="whitespace-nowrap">ID</TableHead>
                    <TableHead className="whitespace-nowrap">이름(나이)</TableHead>
                    <TableHead className="whitespace-nowrap">성별</TableHead>
                    <TableHead className="whitespace-nowrap">토픽</TableHead>
                    <TableHead className="whitespace-nowrap">연락처</TableHead>
                    <TableHead className="whitespace-nowrap">생년월일</TableHead>
                    <TableHead className="whitespace-nowrap">등록일</TableHead>
                    <TableHead className="whitespace-nowrap">수정</TableHead>
                    <TableHead className="whitespace-nowrap">삭제</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {clients.map((client) => (
                      <TableRow key={client.id}>
                        <TableCell className="whitespace-nowrap">{client.id}</TableCell>
                        <TableCell className="whitespace-nowrap">
                          {client.name}({client.age})
                        </TableCell>
                        <TableCell className="whitespace-nowrap">{client.gender}</TableCell>
                        <TableCell className="whitespace-nowrap">{client.topic}</TableCell>
                        <TableCell className="whitespace-nowrap">{client.contactNumber}</TableCell>
                        <TableCell className="whitespace-nowrap">{client.birthDate}</TableCell>
                        <TableCell className="whitespace-nowrap">{client.registrationDate}</TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => {
                            setEditId(client.id)
                            setShowEditDialog(true)
                          }}>
                            <Pencil className="w-4 h-4"/>
                          </Button>
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" onClick={() => {
                            handleDeleteClient(client.id)
                          }}>
                            <Ban className="w-4 h-4"/>
                          </Button>
                        </TableCell>
                      </TableRow>
                  ))}
                </TableBody>
              </Table>
              <PostClientModal showAddDialog={showAddDialog} setShowAddDialog={setShowAddDialog}/>
              <UpdateClientModal
                  showEditDialog={showEditDialog}
                  setShowEditDialog={setShowEditDialog}
                  clientId={editId}
              />
            </div>
          </div>
        </div>
      </div>
  );
}

export default MyCounsel
