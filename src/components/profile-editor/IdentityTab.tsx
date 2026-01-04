
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { User, Phone, Globe, Briefcase } from "lucide-react";
import { EditorProps } from "./types";
import { motion } from "framer-motion";

export function IdentityTab({ formData, setFormData }: EditorProps) {
    return (
        <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
        >
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 bg-[#D4AF37] rounded-lg text-black">
                        <Briefcase className="w-5 h-5" />
                    </div>
                    <div>
                        <h3 className="text-xl font-bold text-white">Business Identity</h3>
                        <p className="text-slate-400">Core information displayed to your customers.</p>
                    </div>
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Business Name *</label>
                        <Input
                            value={formData.name}
                            onChange={e => setFormData({ ...formData, name: e.target.value })}
                            className="bg-slate-950 border-slate-800 text-white focus:border-[#D4AF37]"
                            placeholder="e.g. London Emergency Plumbers"
                        />
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Contact Person</label>
                        <div className="relative">
                            <User className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={formData.contact_name}
                                onChange={e => setFormData({ ...formData, contact_name: e.target.value })}
                                className="pl-9 bg-slate-950 border-slate-800 text-white focus:border-[#D4AF37]"
                                placeholder="Your Name"
                            />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <label className="text-sm font-medium text-slate-300">About Your Business</label>
                    <Textarea
                        value={formData.description}
                        onChange={e => setFormData({ ...formData, description: e.target.value })}
                        className="bg-slate-950 border-slate-800 text-white focus:border-[#D4AF37] min-h-[120px]"
                        placeholder="Tell customers about your experience, certifications, and services..."
                    />
                </div>

                <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">WhatsApp / Mobile</label>
                        <div className="relative">
                            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={formData.whatsapp}
                                onChange={e => setFormData({ ...formData, whatsapp: e.target.value })}
                                className="pl-9 bg-slate-950 border-slate-800 text-white focus:border-[#D4AF37]"
                                placeholder="447123456789"
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <label className="text-sm font-medium text-slate-300">Website</label>
                        <div className="relative">
                            <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                            <Input
                                value={formData.website}
                                onChange={e => setFormData({ ...formData, website: e.target.value })}
                                className="pl-9 bg-slate-950 border-slate-800 text-white focus:border-[#D4AF37]"
                                placeholder="https://example.com"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </motion.div>
    );
}
