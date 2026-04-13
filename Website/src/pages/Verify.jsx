import React, { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Mail, ArrowRight, Loader2, ShieldCheck, KeyRound, ArrowLeft } from 'lucide-react';
import emailjs from '@emailjs/browser';

// ===== REPLACE THESE WITH YOUR REAL EMAILJS CREDENTIALS =====
const EMAILJS_SERVICE_ID = 'service_apynf9k';
const EMAILJS_TEMPLATE_ID = 'template_a2wgk2i';
const EMAILJS_PUBLIC_KEY = 'QkPIVPuAquOPF7c_n';
// =============================================================

const Verify = () => {
    const navigate = useNavigate();
    const { isVerified, verify } = useAuth();
    const [step, setStep] = useState(1); // 1 = email, 2 = OTP
    const [email, setEmail] = useState('');
    const [otp, setOtp] = useState(['', '', '', '', '', '']);
    const [generatedOtp, setGeneratedOtp] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const inputRefs = useRef([]);

    // If already verified, redirect to demo
    useEffect(() => {
        if (isVerified) {
            navigate('/demo', { replace: true });
        }
    }, [isVerified, navigate]);

    if (isVerified) return null;

    const generateOTP = () => {
        return Math.floor(100000 + Math.random() * 900000).toString();
    };

    const handleSendOTP = async (e) => {
        e.preventDefault();
        if (!email || !email.includes('@')) {
            setError('Please enter a valid email address');
            return;
        }

        setLoading(true);
        setError('');

        const otpCode = generateOTP();
        setGeneratedOtp(otpCode);

        try {
            await emailjs.send(
                EMAILJS_SERVICE_ID,
                EMAILJS_TEMPLATE_ID,
                {
                    to_email: email,
                    otp_code: otpCode,
                    to_name: email.split('@')[0],
                },
                EMAILJS_PUBLIC_KEY
            );
            setStep(2);
        } catch (err) {
            console.error('EmailJS Error:', err);
            setError('Failed to send verification email. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const handleOtpChange = (index, value) => {
        if (value.length > 1) value = value.slice(-1);
        if (!/^\d*$/.test(value)) return;

        const newOtp = [...otp];
        newOtp[index] = value;
        setOtp(newOtp);

        // Auto-focus next input
        if (value && index < 5) {
            inputRefs.current[index + 1]?.focus();
        }
    };

    const handleOtpKeyDown = (index, e) => {
        if (e.key === 'Backspace' && !otp[index] && index > 0) {
            inputRefs.current[index - 1]?.focus();
        }
    };

    const handleVerifyOTP = (e) => {
        e.preventDefault();
        const enteredOtp = otp.join('');

        if (enteredOtp.length !== 6) {
            setError('Please enter the complete 6-digit code');
            return;
        }

        if (enteredOtp === generatedOtp) {
            verify();
            navigate('/demo', { replace: true });
        } else {
            setError('Invalid verification code. Please try again.');
            setOtp(['', '', '', '', '', '']);
            inputRefs.current[0]?.focus();
        }
    };

    return (
        <div className="min-h-screen bg-surface-950 hero-gradient grid-pattern flex items-center justify-center px-6">
            {/* Back button */}
            <button
                onClick={() => navigate('/')}
                className="absolute top-6 left-6 flex items-center gap-2 text-slate-400 hover:text-white transition-colors"
            >
                <ArrowLeft size={18} />
                <span className="text-sm font-medium">Back</span>
            </button>

            <div className="w-full max-w-md">
                {/* Card */}
                <div className="glass-card rounded-2xl p-8">
                    {/* Icon */}
                    <div className="flex justify-center mb-6">
                        <div className={`w-16 h-16 rounded-2xl flex items-center justify-center ${step === 1 ? 'bg-brand-600/20' : 'bg-emerald-600/20'
                            }`}>
                            {step === 1
                                ? <Mail size={32} className="text-brand-400" />
                                : <KeyRound size={32} className="text-emerald-400" />
                            }
                        </div>
                    </div>

                    {/* Step 1: Email */}
                    {step === 1 && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                Verify Your Email
                            </h2>
                            <p className="text-sm text-slate-400 text-center mb-8">
                                Enter your email to receive a 6-digit verification code and access the live demo.
                            </p>

                            <form onSubmit={handleSendOTP} className="space-y-4">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-500 uppercase mb-2">Email Address</label>
                                    <input
                                        type="email"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="you@example.com"
                                        className="w-full bg-slate-800/50 border border-slate-700 rounded-xl px-4 py-3 text-white placeholder-slate-500 focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                        autoFocus
                                    />
                                </div>

                                <button
                                    type="submit"
                                    disabled={loading}
                                    className="w-full flex items-center justify-center gap-2 bg-brand-600 hover:bg-brand-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-brand-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {loading ? (
                                        <Loader2 className="animate-spin" size={20} />
                                    ) : (
                                        <>
                                            <span>Send Verification Code</span>
                                            <ArrowRight size={18} />
                                        </>
                                    )}
                                </button>
                            </form>
                        </>
                    )}

                    {/* Step 2: OTP */}
                    {step === 2 && (
                        <>
                            <h2 className="text-2xl font-bold text-white text-center mb-2">
                                Enter Verification Code
                            </h2>
                            <p className="text-sm text-slate-400 text-center mb-8">
                                We sent a 6-digit code to <span className="text-white font-medium">{email}</span>
                            </p>

                            <form onSubmit={handleVerifyOTP} className="space-y-6">
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-400 text-sm rounded-lg">
                                        {error}
                                    </div>
                                )}

                                {/* OTP Inputs */}
                                <div className="flex justify-center gap-3">
                                    {otp.map((digit, index) => (
                                        <input
                                            key={index}
                                            ref={(el) => (inputRefs.current[index] = el)}
                                            type="text"
                                            inputMode="numeric"
                                            maxLength={1}
                                            value={digit}
                                            onChange={(e) => handleOtpChange(index, e.target.value)}
                                            onKeyDown={(e) => handleOtpKeyDown(index, e)}
                                            className="w-12 h-14 text-center text-xl font-bold bg-slate-800/50 border border-slate-700 rounded-xl text-white focus:border-brand-500 focus:ring-1 focus:ring-brand-500 outline-none transition-all"
                                            autoFocus={index === 0}
                                        />
                                    ))}
                                </div>

                                <button
                                    type="submit"
                                    className="w-full flex items-center justify-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3 rounded-xl transition-all duration-300 shadow-lg shadow-emerald-600/20"
                                >
                                    <ShieldCheck size={20} />
                                    <span>Verify & Access Demo</span>
                                </button>

                                <button
                                    type="button"
                                    onClick={() => { setStep(1); setOtp(['', '', '', '', '', '']); setError(''); }}
                                    className="w-full text-sm text-slate-500 hover:text-slate-300 transition-colors"
                                >
                                    ← Use a different email
                                </button>
                            </form>
                        </>
                    )}
                </div>

                {/* Footer note */}
                <p className="text-center text-xs text-slate-600 mt-6">
                    Your email is only used for verification and won't be stored.
                </p>
            </div>
        </div>
    );
};

export default Verify;
