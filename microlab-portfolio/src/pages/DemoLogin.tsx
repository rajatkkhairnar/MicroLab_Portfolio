import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import emailjs from '@emailjs/browser';
import { motion } from 'framer-motion';
import { Lock, Mail, Phone, User, ArrowRight, Loader, ShieldCheck } from 'lucide-react';

interface DemoLoginProps {
  setAuth: (value: boolean) => void;
}

interface FormData {
  name: string;
  email: string;
  phone: string;
}

const DemoLogin = ({ setAuth }: DemoLoginProps) => {
  const navigate = useNavigate();
  const [step, setStep] = useState<number>(1); // 1 = Info Form, 2 = Verify Code
  const [loading, setLoading] = useState<boolean>(false);
  
  // Form State
  const [formData, setFormData] = useState<FormData>({ name: '', email: '', phone: '' });
  const [otp, setOtp] = useState<string>('');
  const [generatedOtp, setGeneratedOtp] = useState<number | null>(null);

  // --- STEP 1: SEND CODE ---
  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    // 1. Generate the Code
    const code = Math.floor(1000 + Math.random() * 9000);
    setGeneratedOtp(code);

    // 2. Define your IDs
    const serviceID = 'service_apynf9k';
    const templateID = 'template_a2wgk2i';
    const publicKey = 'QkPIVPuAquOPF7c_n'; 

    // 3. Create the params object
    // MAKE SURE these keys ('to_name', 'message', etc.) match your EmailJS Template exactly!
    const templateParams = {
      to_name: formData.name,
      to_email: formData.email,
      passcode: code, 
    };

    try {
      // 4. Send using the new library syntax
      const response = await emailjs.send(serviceID, templateID, templateParams, publicKey);
      
      console.log('SUCCESS!', response.status, response.text);
      
      // Move to next step
      setTimeout(() => {
        setStep(2);
        setLoading(false);
      }, 1000);

    } catch (error) {
      // THIS IS IMPORTANT: It logs the specific reason why it failed
      console.error('FAILED...', error);
      alert("Failed to send. Open Console (F12) to see the red error message.");
      setLoading(false);
    }
  };

  // --- STEP 2: VERIFY CODE ---
  const handleVerify = (e: React.FormEvent) => {
    e.preventDefault();
    // Allow '1234' as a master key for you, or the actual code for users
    if (parseInt(otp) === generatedOtp || otp === '1234') {
      setAuth(true); // Unlock the App Route
      navigate('/app/dashboard');
    } else {
      alert("Invalid Access Code. Please check your email.");
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 dark:bg-slate-950 px-4 relative overflow-hidden font-sans">
      
      {/* Background Decor */}
      <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
      
      <motion.div 
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full bg-white dark:bg-slate-900 rounded-2xl shadow-2xl overflow-hidden border border-slate-200 dark:border-slate-800 z-10"
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 p-8 text-center relative">
          <div className="absolute top-4 right-4 bg-white/10 p-1.5 rounded-lg backdrop-blur-sm">
            <Lock className="w-5 h-5 text-white/80" />
          </div>
          <ShieldCheck className="w-16 h-16 text-white mx-auto mb-4 opacity-90" />
          <h2 className="text-3xl font-bold text-white mb-1">Restricted Demo</h2>
          <p className="text-blue-100 text-sm font-medium">Identify yourself to access the simulator</p>
        </div>

        <div className="p-8">
          {step === 1 ? (
            /* --- FORM STEP 1 --- */
            <form onSubmit={handleSendOtp} className="space-y-5">
              
              {/* Name Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Full Name</label>
                <div className="relative group">
                  <User className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required 
                    type="text" 
                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    placeholder="Dr. John Doe"
                    onChange={e => setFormData({...formData, name: e.target.value})}
                  />
                </div>
              </div>
              
              {/* Email Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Email Address</label>
                <div className="relative group">
                  <Mail className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required 
                    type="email" 
                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    placeholder="john@hospital.com"
                    onChange={e => setFormData({...formData, email: e.target.value})}
                  />
                </div>
              </div>

              {/* Phone Input */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-500 mb-1.5">Phone Number</label>
                <div className="relative group">
                  <Phone className="absolute left-3 top-3 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={18} />
                  <input required 
                    type="tel" 
                    pattern="[0-9]{10}"
                    className="w-full pl-10 p-3 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none dark:text-white transition-all"
                    placeholder="9876543210"
                    onChange={e => setFormData({...formData, phone: e.target.value})}
                  />
                </div>
              </div>

              <button 
                disabled={loading} 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white p-3.5 rounded-xl font-bold transition-all flex items-center justify-center gap-2 shadow-lg shadow-blue-500/20 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed"
              >
                {loading ? <Loader className="animate-spin" /> : <>Get Access Code <ArrowRight size={18} /></>}
              </button>
              
              <p className="text-xs text-center text-slate-400 mt-4">
                We will send a 4-digit code to your email.
              </p>
            </form>
          ) : (
            /* --- FORM STEP 2 --- */
            <form onSubmit={handleVerify} className="space-y-6">
              <div className="text-center">
                <p className="text-slate-600 dark:text-slate-400 mb-6">
                  Enter the code sent to <br/>
                  <span className="font-bold text-slate-900 dark:text-white">{formData.email}</span>
                </p>
                
                <input required 
                  type="text" 
                  maxLength={4}
                  className="w-48 text-center text-4xl tracking-[0.5em] p-4 bg-slate-100 dark:bg-slate-800 border-2 border-blue-500 rounded-xl font-mono mx-auto block outline-none dark:text-white focus:shadow-lg focus:shadow-blue-500/20 transition-all"
                  onChange={e => setOtp(e.target.value)}
                  autoFocus
                />
              </div>

              <button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white p-3.5 rounded-xl font-bold transition-all shadow-lg shadow-emerald-500/30 flex items-center justify-center gap-2 active:scale-95">
                Unlock Demo Environment <Lock size={18} />
              </button>
              
              <button 
                type="button" 
                onClick={() => setStep(1)} 
                className="w-full text-slate-400 text-sm hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              >
                Change details? Go back
              </button>
            </form>
          )}
        </div>
      </motion.div>
    </div>
  );
};

export default DemoLogin;