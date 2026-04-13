import React from 'react';
import { Microscope, Github, Mail, Heart } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="border-t border-slate-800 py-12 px-6">
            <div className="max-w-6xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center gap-6">
                    {/* Brand */}
                    <div className="flex items-center gap-3">
                        <div className="bg-brand-600 p-2 rounded-lg">
                            <Microscope size={20} className="text-white" />
                        </div>
                        <div>
                            <h3 className="text-lg font-bold text-white">MicroLab Pro</h3>
                            <p className="text-xs text-slate-500">Laboratory Management System</p>
                        </div>
                    </div>

                    {/* Center */}
                    <p className="text-sm text-slate-500 flex items-center gap-1">
                        Built with <Heart size={14} className="text-red-500" /> using React & Electron
                    </p>

                    {/* Right */}
                    <div className="flex items-center gap-4">
                        <a href="mailto:contact@microlabpro.com" className="text-slate-500 hover:text-white transition-colors">
                            <Mail size={20} />
                        </a>
                        <a href="https://github.com" target="_blank" rel="noopener noreferrer" className="text-slate-500 hover:text-white transition-colors">
                            <Github size={20} />
                        </a>
                    </div>
                </div>

                <div className="mt-8 pt-6 border-t border-slate-800/50 text-center">
                    <p className="text-xs text-slate-600">
                        © {new Date().getFullYear()} MicroLab Systems. All rights reserved.
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
