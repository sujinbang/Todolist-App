import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, ArrowRight } from 'lucide-react';
import { auth } from '../firebase';
import { GoogleAuthProvider, signInWithPopup } from 'firebase/auth';

interface AuthProps {
  onLoginSuccess: (email: string, name: string) => void;
}

export default function Auth({ onLoginSuccess }: AuthProps) {
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);

  const handleGoogleLogin = async () => {
    try {
      setLoading(true);
      setError('');
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

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="w-full py-3.5 bg-neutral-900 text-white font-medium rounded-[14px] text-[13px] hover:bg-neutral-800 transition-all cursor-pointer flex items-center justify-center gap-2 shadow-md shadow-neutral-900/10"
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
          </div>
        </div>
      </motion.div>
    </div>
  );
}
