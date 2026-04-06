
import { Button } from "@/components/ui/button";
import { Image as ImageIcon, Building2, Upload } from "lucide-react";
import { EditorProps } from "./types";
import { motion } from "framer-motion";

export function BrandingTab({ previews, handleFile }: EditorProps) {
    if (!previews || !handleFile) return null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <div className="flex items-center gap-3 mb-6">
                    <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                        <ImageIcon className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Branding & Imagery</h3>
                        <p className="text-slate-400">Your visual identity. High quality images increase conversion.</p>
                    </div>
                </div>

                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Logo Section */}
                    <div className="w-full md:w-1/3">
                        <label className="text-sm font-bold block mb-3 uppercase tracking-wider text-[#D4AF37]">Main Logo</label>
                        <div className="border-2 border-dashed border-slate-700 rounded-xl p-4 flex flex-col items-center justify-center text-center bg-slate-950 aspect-square relative group overflow-hidden transition-all hover:border-[#D4AF37]/50">
                            {previews.logo ?
                                <img src={previews.logo} alt="Business logo" className="w-full h-full object-contain p-2 z-10" /> :
                                <Building2 className="w-16 h-16 text-slate-800 mb-2" />
                            }
                            <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-20">
                                <Button variant="secondary" size="sm" onClick={() => document.getElementById('logo-u')?.click()}>
                                    Change Logo
                                </Button>
                            </div>
                            <input type="file" id="logo-u" className="hidden" accept="image/*" onChange={e => handleFile('logo', e)} />
                        </div>
                        <p className="text-xs text-slate-500 mt-2 text-center">Square PNG/JPG recommended.</p>
                    </div>

                    {/* Banner & Vehicle Section */}
                    <div className="w-full md:w-2/3 space-y-8">
                        <div>
                            <label className="text-sm font-bold block mb-3 uppercase tracking-wider text-[#D4AF37]">Header Background</label>
                            <div className="h-40 bg-slate-950 rounded-xl w-full overflow-hidden relative group border border-slate-700 hover:border-[#D4AF37]/50 transition-all">
                                {previews.header ?
                                    <img src={previews.header} alt="Header banner" className="w-full h-full object-cover opacity-80" /> :
                                    <div className="w-full h-full flex flex-col items-center justify-center text-slate-600 gap-2">
                                        <Upload className="w-6 h-6 opacity-50" />
                                        <span className="text-sm">No Banner Image</span>
                                    </div>
                                }
                                <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button variant="secondary" onClick={() => document.getElementById('head-u')?.click()}>Upload Banner</Button>
                                </div>
                                <input type="file" id="head-u" className="hidden" accept="image/*" onChange={e => handleFile('header', e)} />
                            </div>
                            <p className="text-xs text-slate-500 mt-2">Recommended: 1920x400px high-res image.</p>
                        </div>

                        <div>
                            <label className="text-sm font-bold block mb-3 uppercase tracking-wider text-[#D4AF37]">Featured Hero Image</label>
                            <div className="flex gap-4 items-center p-4 bg-slate-950 rounded-xl border border-slate-800">
                                <div className="w-24 h-16 bg-slate-900 rounded overflow-hidden flex-shrink-0 border border-slate-700 relative group">
                                    {previews.vehicle ?
                                        <img src={previews.vehicle} alt="Featured hero image" className="w-full h-full object-cover" /> :
                                        <div className="w-full h-full flex items-center justify-center text-xs text-slate-600">None</div>
                                    }
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm text-slate-400 mb-2">Showcase your van, team, or best work. Appears floating over the banner.</p>
                                    <input type="file" id="veh-u" className="hidden" accept="image/*" onChange={e => handleFile('vehicle', e)} />
                                    <Button variant="outline" size="sm" onClick={() => document.getElementById('veh-u')?.click()} className="border-slate-700 text-slate-300 hover:bg-slate-800">
                                        Select Image
                                    </Button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
