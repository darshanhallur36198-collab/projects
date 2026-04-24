import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../components/AuthContext';
import { motion } from 'motion/react';
import { Mail, Lock, User, ArrowRight, Github } from 'lucide-react';
import toast from 'react-hot-toast';

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const { signIn, signInWithEmail, signUpWithEmail } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (isLogin) {
        await signInWithEmail(email, password);
        toast.success('Access Granted. Welcome back, Agent.');
      } else {
        await signUpWithEmail(email, password, name);
        toast.success('Registration Complete. Welcome to the Grid.');
      }
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Authentication Synchronized Error');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signIn();
      toast.success('Biometric Sync Successful.');
      navigate('/dashboard');
    } catch (error: any) {
      toast.error(error.message || 'Google Auth Failure');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-md w-full space-y-8 bg-white p-10 rounded-[40px] border-2 border-vibrant-tan shadow-2xl relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-32 h-32 bg-vibrant-orange/10 blur-[60px] -translate-y-1/2 translate-x-1/2" />
        <div className="absolute bottom-0 left-0 w-32 h-32 bg-vibrant-teal/10 blur-[60px] translate-y-1/2 -translate-x-1/2" />

        <div className="relative text-center">
          <div className="mx-auto w-16 h-16 bg-vibrant-orange rounded-[20px] flex items-center justify-center shadow-xl shadow-vibrant-orange/20 mb-6">
             <Lock className="text-white" size={32} />
          </div>
          <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
            {isLogin ? 'Agent Login' : 'New Operative'}
          </h2>
          <p className="text-vibrant-tan font-black text-[10px] uppercase tracking-[0.2em] italic">
            {isLogin ? 'Synchronize your grid credentials' : 'Register your digital manifest'}
          </p>
        </div>

        <form className="mt-8 space-y-6 relative" onSubmit={handleSubmit}>
          <div className="space-y-4">
            {!isLogin && (
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={18} />
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="input-vibrant !pl-12 !py-4 text-sm"
                  placeholder="FULL OPERATIVE NAME"
                />
              </div>
            )}
            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={18} />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="input-vibrant !pl-12 !py-4 text-sm"
                placeholder="GRID@EMAIL.ADDRESS"
              />
            </div>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-vibrant-tan" size={18} />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="input-vibrant !pl-12 !py-4 text-sm"
                placeholder="SECURE ACCESS CODE"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="btn-vibrant w-full py-5 text-xs shadow-xl shadow-vibrant-orange/20"
          >
            {loading ? 'SYNCHRONIZING...' : isLogin ? 'AUTHORIZE ACCESS' : 'CREATE MANIFEST'}
            {!loading && <ArrowRight size={18} />}
          </button>
        </form>

        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t-2 border-vibrant-tan"></div>
          </div>
          <div className="relative flex justify-center text-xs font-black uppercase tracking-widest leading-none">
            <span className="px-4 bg-white text-vibrant-tan">Or Protocol Sync</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-4 relative">
          <button
            onClick={handleGoogleSignIn}
            className="flex items-center justify-center gap-3 w-full bg-white border-2 border-vibrant-tan py-4 rounded-[20px] font-black text-[10px] uppercase tracking-widest hover:border-vibrant-orange transition-all"
          >
            <img src="https://www.google.com/favicon.ico" alt="" className="w-4 h-4" />
            Sync with Google Infrastructure
          </button>
        </div>

        <div className="text-center relative">
          <button
            onClick={() => setIsLogin(!isLogin)}
            className="text-[10px] font-black uppercase tracking-widest text-vibrant-orange hover:text-slate-900 transition-colors"
          >
            {isLogin ? "Need a manifest? Create one here" : "Already an operative? Access here"}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
