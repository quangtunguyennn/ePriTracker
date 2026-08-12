// src/pages/Home.jsx
import { Link } from "react-router-dom";

export default function Home() {
  return (
    <>
      <style>{`
        @keyframes float-wave {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        .animate-wave-1 { animation: float-wave 3s ease-in-out infinite; }
        .animate-wave-2 { animation: float-wave 3s ease-in-out infinite 0.4s; }
        .animate-wave-3 { animation: float-wave 3s ease-in-out infinite 0.8s; }
      `}</style>

      {/* 1. THÊM overflow-hidden VÀ w-full ĐỂ KHÓA KHÔNG CHO TRÀN */}
      <div className="video-background-container relative w-full overflow-hidden">
        <video
          autoPlay
          muted
          loop
          playsInline
          className="w-full h-full object-cover"
        >
          <source src="/theme.mp4" type="video/mp4" />
        </video>

        {/* 2. ĐỔI left-100 THÀNH inset-0 (VIẾT TẮT CỦA top-0 right-0 bottom-0 left-0) */}
        <div className="absolute inset-0 left-100 w-full h-full flex flex-col items-center justify-center text-white ">
          <p className="text-5xl font-urbanist font-bold">
            Track Prices Automagically.
          </p>

          <p className="text-3xl font-syne mt-2">Shop Smarter, Save Bigger.</p>

          <div className="flex gap-4 mt-8">
            <Link
              to="/login"
              className="relative group inline-block overflow-hidden rounded-lg bg-orange-500 px-8 py-3.5 text-lg font-bold text-white transition-all duration-300 hover:bg-orange-600 hover:scale-105 shadow-[0_0_20px_rgba(249,115,22,0.6)] hover:shadow-[0_0_35px_rgba(249,115,22,0.9)]"
            >
              <span className="absolute inset-0 w-full h-full bg-white/20 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
              <span className="relative font-syne z-10">Get started</span>
            </Link>

            <button className="relative group overflow-hidden rounded-lg bg-[#0f172a]/70 backdrop-blur-md border border-slate-700/50 px-8 py-3.5 text-lg font-bold text-slate-100 transition-all duration-300 hover:bg-[#0f172a]/90 hover:border-slate-500 hover:scale-105 shadow-lg hover:shadow-cyan-900/30">
              <span className="absolute inset-0 w-full h-full bg-white/10 transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></span>
              <span className="relative z-10">How it works</span>
            </button>
          </div>
        </div>
      </div>

      <div className="flex justify-center ">
        <div className="h-100 font-syne font-medium text-2xl pt-50 ">on working ...</div>
      </div>
    </>
  );
}
