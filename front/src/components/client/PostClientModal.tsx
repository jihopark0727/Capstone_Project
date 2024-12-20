import {useEffect, useState} from 'react';
import {Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle} from "@/components/ui/dialog.tsx";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select.tsx";
import {Input} from "@/components/ui/input.tsx";
import {DatePicker} from "@/components/ui/date-picker.tsx";
import {Button} from "@/components/ui/button.tsx";
import {getTopics} from "@/api/topic.ts";
import {postClient} from "@/api/client.ts";
import {formatDateToYYYYMMDD} from "@/utill/date.ts";

type Props = {
    showAddDialog: boolean;
    setShowAddDialog: (show: boolean) => void;
}
const PostClientModal = ({showAddDialog, setShowAddDialog}:Props) => {
    const [status, setStatus] = useState<string>("")
    const [name, setName] = useState<string>("")
    const [selectTopic, setSelectTopic] = useState<string>("")
    const [phoneNum, setPhoneNum] = useState<string>("")
    const [gender, setGender] = useState("")
    const [birthDate, setBirthDate] = useState<Date>(new Date())


    const [topics, setTopics] = useState<string[]>([])


    const handlePostClient = async () => {
        const data = await postClient(status, name, selectTopic, phoneNum, gender, formatDateToYYYYMMDD(birthDate))
        console.log(data)
        if (data.data.statusCode === 201) {
            alert("내담자가 등록되었습니다.")
            window.location.reload()
        }
    };


    useEffect(() => {
        getTopics()
            .then((res) => {
                setTopics(res.data.data)
            })
    }, []);

    return (
        <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle className="text-lg font-medium">내담자 등록</DialogTitle>
                </DialogHeader>
                <div className="space-y-3 py-4">
                    <Select onValueChange={(value) => setStatus(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="상태 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="신규">신규</SelectItem>
                            <SelectItem value="진행">진행</SelectItem>
                            <SelectItem value="종결">종결</SelectItem>
                        </SelectContent>
                    </Select>
                    <Input placeholder="이름을 입력하세요" onChange={(e) => setName(e.target.value)}/>
                    <Select onValueChange={(value) => setSelectTopic(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="상담주제 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            {topics.map((topic) => (
                                <SelectItem value={topic} key={topic}>{topic}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    <Input
                        type="text"
                        placeholder="연락처"
                        min={11}
                        max={11}
                        className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        onChange={(e) => setPhoneNum(e.target.value)}
                    />
                    <Select onValueChange={(value) => setGender(value)}>
                        <SelectTrigger>
                            <SelectValue placeholder="성별 선택" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value="남성">남성</SelectItem>
                            <SelectItem value="여성">여성</SelectItem>
                        </SelectContent>
                    </Select>
                    <DatePicker
                        selected={birthDate}
                        // @ts-ignore
                        onSelect={setBirthDate}
                        placeholder="생년월일 선택"
                    />

                </div>
                <DialogFooter>
                    <Button className="w-full" size="lg" onClick={() => handlePostClient()}>
                        등록
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
};

export default PostClientModal;
