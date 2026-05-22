import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup, setPersistence, browserLocalPersistence, browserSessionPersistence } from 'firebase/auth';

interface AuthProps {
  onLoginSuccess: (email: string, name: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const [rememberMe, setRememberMe] = React.useState(() => {
    // 저장된 자동로그인 설정 불러오기
    return localStorage.getItem('haru_remember_me') === 'true';
  });

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');

      // 자동로그인 설정에 따라 persistence 설정
      if (rememberMe) {
        // 브라우저를 닫아도 로그인 유지
        await setPersistence(auth, browserLocalPersistence);
        localStorage.setItem('haru_remember_me', 'true');
      } else {
        // 브라우저를 닫으면 로그아웃
        await setPersistence(auth, browserSessionPersistence);
        localStorage.setItem('haru_remember_me', 'false');
      }

      const provider = new GoogleAuthProvider();
      const result = await signInWithPopup(auth, provider);
      if (result.user.email && result.user.displayName) {
        onLoginSuccess(result.user.email, result.user.displayName);
      }
    } catch (err: any) {
      setError(err.message || '로그인에 실패했습니다.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#faf9f7] text-neutral-800 flex items-center justify-center p-4 antialiased font-light relative overflow-hidden">
      {/* Absolute delicate background elements */}
      <div className="absolute right-0 top-0 -mr-32 -mt-32 h-[500px] w-[500px] rounded-full bg-[#f4ece3] blur-3xl pointer-events-none opacity-60" />
      <div className="absolute left-0 bottom-0 -ml-32 -mb-32 h-[500px] w-[500px] rounded-full bg-[#e8edda] blur-3xl pointer-events-none opacity-60" />

      <motion.div
        initial={{ opacity: 0, scale: 0.98 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5, ease: 'easeOut' }}
        className="w-full max-w-[360px] relative z-10"
      >
        {/* Brand Header */}
        <div className="text-center mb-10">
          <motion.div
            initial={{ rotate: -5, scale: 0.95 }}
            animate={{ rotate: 0, scale: 1 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className="inline-flex h-12 w-12 bg-white border border-neutral-100 rounded-full items-center justify-center text-[#d9ae92] shadow-sm mb-5"
          >
            <Sparkles className="h-5 w-5" strokeWidth={1.5} />
          </motion.div>
          <h1 className="text-2xl font-serif text-neutral-900 tracking-tight">Daily Planner</h1>
          <p className="text-[11px] text-neutral-400 uppercase tracking-[0.15em] mt-2 font-medium">Daily Minimal Record</p>
        </div>

        {/* Dynamic Card */}
        <div className="bg-white/60 backdrop-blur-xl border border-white rounded-[24px] p-8 shadow-[0_8px_30px_rgba(0,0,0,0.04)] relative">
          
          <h2 className="text-[15px] font-medium text-neutral-800 mb-6 text-center">
            로그인
          </h2>

          <div className="space-y-4">
            {error && (
              <div className="text-[12px] text-red-500 bg-red-50 border border-red-100 px-4 py-3 rounded-[12px] font-medium">
                {error}
              </div>
            )}

            {/* 자동로그인 체크박스 */}
            <label className="flex items-center gap-3 cursor-pointer group px-1">
              <div className="relative">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="peer sr-only"
                />
                <div className={`h-5 w-5 rounded-[6px] border-2 transition-all flex items-center justify-center ${
                  rememberMe
                    ? 'bg-neutral-900 border-neutral-900'
                    : 'bg-white border-neutral-200 group-hover:border-neutral-300'
                }`}>
                  {rememberMe && (
                    <svg
                      className="h-3 w-3 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2.5"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7" />
                    </svg>
                  )}
                </div>
              </div>
              <span className="text-[13px] text-neutral-600 group-hover:text-neutral-800 transition-colors select-none">
                자동 로그인
              </span>
            </label>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 text-white font-medium rounded-[14px] text-[13px] hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-neutral-900/10 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <span className="h-4 w-4 border-[1.5px] border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Continue with Google
                  <ArrowRight className="h-4 w-4 opacity-70" strokeWidth={1.5} />
                </>
              )}
            </button>

            {/* 자동로그인 안내 */}
            <p className="text-[11px] text-neutral-400 text-center leading-relaxed px-2">
              {rememberMe
                ? '브라우저를 닫아도 로그인 상태가 유지됩니다.'
                : '브라우저를 닫으면 자동으로 로그아웃됩니다.'}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
