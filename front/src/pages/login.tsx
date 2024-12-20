import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Home, BarChart2, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { login } from "@/api/auth.ts";

const formSchema = z.object({
  email: z.string().email("올바른 이메일을 입력해주세요"),
  password: z.string().min(6, "비밀번호는 최소 6자 이상이어야 합니다"),
});

const carouselItems = [
  {
    icon: <Home size={64} color="white" className="drop-shadow-md" />,
    title: "홈",
    description: "메인 대시보드",
    backgroundImage: "url('/image1.png')", // 배경 이미지 경로
  },
  {
    icon: <BarChart2 size={64} color="white" className="drop-shadow-md" />,
    title: "분석 기능",
    description: "데이터 분석 및 통계",
    backgroundImage: "url('/image2.png')", // 배경 이미지 경로
  },
  {
    icon: <FileText size={64} color="white" className="drop-shadow-md" />,
    title: "PDF 기능",
    description: "문서 변환 및 내보내기",
    backgroundImage: "url('/image3.png')", // 배경 이미지 경로
  },
];

function Login() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) =>
          prev === carouselItems.length - 1 ? 0 : prev + 1
      );
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  async function onSubmit(values: z.infer<typeof formSchema>) {
    console.log(values);
    const data = await login(values.email, values.password);
    localStorage.setItem("token", data.data.data.token);
    window.location.reload();
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index);
  };

  return (
      <div className="min-h-screen flex items-center justify-center bg-white p-4">
        <div className="w-full max-w-5xl grid md:grid-cols-2 sm:gap-8 gap-2">
          {/* 모바일 제목 */}
          <div className="md:hidden text-center mb-2">
            <h1 className="text-2xl font-bold mb-2">로그인</h1>
            <p className="text-gray-500">마음읽기에 오신 것을 환영합니다</p>
          </div>

          {/* 캐러셀 영역 */}
          <div className="hidden md:flex flex-col items-center">
            <div className="text-center mb-4">
              <h1 className="text-2xl font-bold mb-2">마음읽기 주요 기능</h1>
              <p className="text-sm text-gray-500">
                상담사님을 위한 핵심 서비스를 소개합니다
              </p>
            </div>
            <div className="relative w-full bg-gray-100 rounded-lg overflow-hidden">
              <div
                  className="flex transition-transform duration-500 ease-in-out"
                  style={{ transform: `translateX(-${currentSlide * 100}%)` }}
              >
                {carouselItems.map((item, index) => (
                    <div
                        key={index}
                        className="min-w-full aspect-square flex flex-col items-center justify-center"
                        style={{
                          backgroundImage: item.backgroundImage,
                          backgroundSize: "cover",
                          backgroundPosition: "center",
                          color: "white",
                          textShadow: "0 0 10px rgba(0, 0, 0, 0.7)",
                        }}
                    >
                      {item.icon}
                      <h2 className="text-2xl font-bold mt-4">{item.title}</h2>
                      <p className="text-base">{item.description}</p>
                    </div>
                ))}
              </div>
            </div>
            <div className="flex mt-4 gap-2">
              {carouselItems.map((_, index) => (
                  <button
                      key={index}
                      onClick={() => goToSlide(index)}
                      className={`w-2 h-2 rounded-full ${
                          currentSlide === index ? "bg-blue-500" : "bg-gray-200"
                      }`}
                  />
              ))}
            </div>
          </div>

          {/* 로그인 폼 */}
          <div className="flex flex-col justify-center space-y-6">
            <div className="hidden md:block text-center mb-8">
              <h1 className="text-3xl font-bold mb-2">로그인</h1>
              <p className="text-gray-500">
                마음읽기와 함께 더 나은 상담 서비스를 제공하세요
              </p>
            </div>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                                placeholder="이메일을 입력하세요"
                                className="h-12 px-4"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <FormField
                    control={form.control}
                    name="password"
                    render={({ field }) => (
                        <FormItem>
                          <FormControl>
                            <Input
                                type="password"
                                placeholder="비밀번호를 입력하세요"
                                className="h-12 px-4"
                                {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                    )}
                />

                <Button type="submit" className="w-full h-12 text-base">
                  로그인
                </Button>

                <Button
                    asChild
                    type="button"
                    variant="secondary"
                    className="w-full h-12 text-base"
                >
                  <Link to="/register">회원가입</Link>
                </Button>
              </form>
            </Form>

            <div className="flex justify-center gap-4 text-sm text-gray-500">
              <button className="hover:text-gray-800">비밀번호 찾기</button>
              <span>|</span>
              <button className="hover:text-gray-800">이메일 찾기</button>
            </div>
          </div>
        </div>
      </div>
  );
}

export default Login;
