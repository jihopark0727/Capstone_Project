import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form"
import { Checkbox } from "@/components/ui/checkbox"
import { useNavigate } from "react-router-dom"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle
} from "@/components/ui/dialog"
import { useState } from "react"
import { BarChart, Shield, Users } from "lucide-react"
import {signup} from "@/api/auth.ts";

const formSchema = z
  .object({
    name: z.string().min(2, "이름을 입력해주세요"),
    email: z.string().email("올바른 이메일을 입력해주세요"),
    phone: z.string().min(10, "올바른 전화번호를 입력해주세요"),
    password: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
    confirmPassword: z.string().min(8, "비밀번호는 최소 8자 이상이어야 합니다"),
    terms: z.boolean().refine((val) => val === true, {
      message: "이용약관에 동의해주세요"
    })
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "비밀번호가 일치하지 않습니다",
    path: ["confirmPassword"]
  })

function Register() {
  const navigate = useNavigate()
  const [showTerms, setShowTerms] = useState(false)
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      password: "",
      confirmPassword: "",
      terms: false
    }
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
      const data = await signup(values.email, values.name, values.phone, values.password, values.confirmPassword);
      if (data.data.message === "중복된 Email 입니다.") {
          alert("중복된 Email 입니다.");
          return;
      }else if (data.data.statusCode !== 201) {
          alert("회원가입 오류 발생");
      }
      alert("회원가입이 완료되었습니다.");
      navigate("/login");
  }

    return (
        <div className="min-h-screen flex items-center justify-center bg-white p-4">
            <div className="w-full max-w-5xl grid md:grid-cols-2 md:gap-8 gap-2">
                <div className="md:hidden text-center mb-2">
                    <h1 className="text-2xl font-bold mb-2">회원가입</h1>
                    <p className="text-gray-500">마음읽기와 함께 시작해보세요</p>
                </div>

                <div className="hidden md:flex flex-col justify-center p-8 bg-gray-50 rounded-lg">
                    <div className="text-center mb-8">
                        <h1 className="text-2xl font-bold mb-2">마음읽기</h1>
                        <p className="text-gray-500">상담사와 내담자를 위한 플랫폼</p>
                    </div>
                    <div className="space-y-6">
                        <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                            <div className="p-3 bg-blue-100 rounded-lg">
                                <Shield className="w-6 h-6 text-blue-600"/>
                            </div>
                            <div>
                                <h3 className="font-medium">안전한 개인정보 보호</h3>
                                <p className="text-sm text-gray-500">철저한 보안 시스템으로 관리됩니다</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                            <div className="p-3 bg-green-100 rounded-lg">
                                <Users className="w-6 h-6 text-green-600"/>
                            </div>
                            <div>
                                <h3 className="font-medium">전문 상담사 매칭</h3>
                                <p className="text-sm text-gray-500">검증된 전문가와 연결됩니다</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4 p-4 bg-white rounded-lg">
                            <div className="p-3 bg-purple-100 rounded-lg">
                                <BarChart className="w-6 h-6 text-purple-600"/>
                            </div>
                            <div>
                                <h3 className="font-medium">상담 분석 리포트</h3>
                                <p className="text-sm text-gray-500">AI 기반 감정 분석을 제공합니다</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="flex flex-col justify-center space-y-6 w-full px-4 md:px-0">
                    <div className="text-center mb-8 md:block hidden">
                        <h1 className="text-2xl md:text-3xl font-bold mb-2">회원가입</h1>
                        <p className="text-sm md:text-base text-gray-500">
                            마음읽기와 함께 더 나은 상담 서비스를 제공하세요
                        </p>
                    </div>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-5">
                            <FormField
                                control={form.control}
                                name="name"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="이름을 입력하세요"
                                                className="h-12 px-4 text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs md:text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="email"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="이메일을 입력하세요"
                                                className="h-12 px-4 text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs md:text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="phone"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                placeholder="전화번호를 입력하세요"
                                                className="h-12 px-4 text-base"
                                                type="tel"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs md:text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="password"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="비밀번호를 입력하세요"
                                                className="h-12 px-4 text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs md:text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="confirmPassword"
                                render={({field}) => (
                                    <FormItem>
                                        <FormControl>
                                            <Input
                                                type="password"
                                                placeholder="비밀번호를 다시 입력하세요"
                                                className="h-12 px-4 text-base"
                                                {...field}
                                            />
                                        </FormControl>
                                        <FormMessage className="text-xs md:text-sm"/>
                                    </FormItem>
                                )}
                            />

                            <FormField
                                control={form.control}
                                name="terms"
                                render={({field}) => (
                                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 px-1">
                                        <FormControl>
                                            <Checkbox
                                                checked={field.value}
                                                onCheckedChange={field.onChange}
                                                className="mt-0.5"
                                            />
                                        </FormControl>
                                        <div className="space-y-1 leading-none">
                                            <button
                                                type="button"
                                                className="text-xs md:text-sm text-gray-500 hover:text-gray-700 text-left"
                                                onClick={() => setShowTerms(true)}
                                            >
                                                개인정보 보호정책을 읽고 동의합니다
                                            </button>
                                        </div>
                                    </FormItem>
                                )}
                            />

                            <div className="space-y-3 pt-2">
                                <Button type="submit" className="w-full h-12 text-base font-medium">
                                    가입하기
                                </Button>

                                <Button
                                    type="button"
                                    variant="secondary"
                                    className="w-full h-12 text-base"
                                    onClick={() => navigate("/login")}
                                >
                                    로그인하기
                                </Button>
                            </div>
                        </form>
                    </Form>
                </div>
            </div>

            <Dialog open={showTerms} onOpenChange={setShowTerms}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>개인정보 보호정책</DialogTitle>
                        <DialogDescription className="mt-4">
                            <div className="space-y-4 text-sm">
                                <p className="font-medium">1. 개인정보의 수집 및 이용 목적</p>
                                <p>- 회원 가입 및 관리</p>
                                <p>- 서비스 제공 및 운영</p>
                                <p>- 고객 상담 및 문의 응대</p>

                                <p className="font-medium">2. 수집하는 개인정보 항목</p>
                                <p>- 필수항목: 이름, 이메일, 전화번호, 비밀번호</p>

                                <p className="font-medium">3. 개인정보의 보유 및 이용기간</p>
                                <p>- 회원 탈퇴 시까지</p>
                                <p>- 관계 법령에 따른 보존 기간</p>
                            </div>
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowTerms(false)}>
                            취소
                        </Button>
                        <Button
                            onClick={() => {
                                form.setValue("terms", true)
                                setShowTerms(false)
                            }}
                        >
                            동의
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
}

export default Register
