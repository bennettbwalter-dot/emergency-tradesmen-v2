import { useState } from "react";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Shield, Upload, FileText, CheckCircle, AlertCircle, ArrowRight, Lock } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useToast } from "@/components/ui/use-toast";
import { GoldWave } from "@/components/GoldWave";

interface DocumentUpload {
    id: string;
    name: string;
    status: 'pending' | 'uploading' | 'completed' | 'error';
    file?: File;
}

export default function VerifyDocumentsPage() {
    const navigate = useNavigate();
    const { toast } = useToast();
    const [documents, setDocuments] = useState<Record<string, DocumentUpload>>({
        id: { id: 'id', name: 'Government ID (Passport / Drivers License)', status: 'pending' },
        insurance: { id: 'insurance', name: 'Public Liability Insurance Certificate', status: 'pending' },
        qualifications: { id: 'qualifications', name: 'Trade Qualifications / Certifications', status: 'pending' }
    });

    const handleFileUpload = (key: string, e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setDocuments(prev => ({
            ...prev,
            [key]: { ...prev[key], status: 'uploading', file }
        }));

        // Simulate upload delay
        setTimeout(() => {
            setDocuments(prev => ({
                ...prev,
                [key]: { ...prev[key], status: 'completed' }
            }));
            toast({
                title: "Document Uploaded",
                description: `${documents[key].name} has been uploaded for review.`,
            });
        }, 1500);
    };

    const allCompleted = Object.values(documents).every(d => d.status === 'completed');

    const handleSubmit = () => {
        toast({
            title: "Verification Submitted",
            description: "Your documents are now under review. We will notify you shortly.",
        });
        // Redirect to dashboard or home after a short delay
        setTimeout(() => navigate('/user/dashboard'), 2000);
    };

    return (
        <div className="min-h-screen bg-background flex flex-col">
            <Header />

            <main className="flex-1 container-wide py-12 md:py-20">
                <div className="max-w-3xl mx-auto">

                    {/* Header Section */}
                    <div className="text-center mb-12">
                        <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gold/10 border border-gold/30 mb-6">
                            <Shield className="w-8 h-8 text-gold" />
                        </div>
                        <h1 className="font-display text-3xl md:text-5xl text-foreground mb-4">
                            Verify Your <span className="text-gold">Professional Status</span>
                        </h1>
                        <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                            To support your claimed listing and receive priority call-outs, please upload your documentation below.
                        </p>
                    </div>

                    {/* Secure Note */}
                    <div className="bg-emerald-500/5 border border-emerald-500/20 rounded-lg p-4 mb-10 flex items-start gap-3">
                        <Lock className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                        <p className="text-sm text-emerald-900 dark:text-emerald-100">
                            <strong>Bank-Grade Security:</strong> Your documents are encrypted and stored securely. They are only viewed by our vetting team for verification purposes.
                        </p>
                    </div>

                    {/* Upload Sections */}
                    <div className="space-y-6">
                        {Object.entries(documents).map(([key, doc]) => (
                            <motion.div
                                key={key}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`
                  relative overflow-hidden rounded-xl border transition-all duration-300
                  ${doc.status === 'completed'
                                        ? 'border-emerald-500/30 bg-emerald-500/5'
                                        : 'border-border bg-card hover:border-gold/30'
                                    }
                `}
                            >
                                <div className="p-6 flex items-center gap-4">

                                    {/* Icon Status */}
                                    <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center shrink-0 border
                    ${doc.status === 'completed'
                                            ? 'bg-emerald-500 text-white border-emerald-500'
                                            : 'bg-secondary border-border text-muted-foreground'
                                        }
                  `}>
                                        {doc.status === 'completed' ? (
                                            <CheckCircle className="w-6 h-6" />
                                        ) : (
                                            <FileText className="w-6 h-6" />
                                        )}
                                    </div>

                                    {/* Text Content */}
                                    <div className="flex-1">
                                        <h3 className="font-semibold text-foreground text-lg">{doc.name}</h3>
                                        <p className="text-sm text-muted-foreground">
                                            {doc.status === 'completed' ? 'Verification complete' : 'PDF, JPG or PNG (Max 5MB)'}
                                        </p>
                                    </div>

                                    {/* Action Button */}
                                    <div>
                                        {doc.status === 'uploading' ? (
                                            <div className="w-10 h-10 rounded-full border-2 border-gold/30 border-t-gold animate-spin" />
                                        ) : doc.status === 'completed' ? (
                                            <Button variant="ghost" size="sm" className="text-emerald-500 hover:text-emerald-600 hover:bg-emerald-50">
                                                Change
                                            </Button>
                                        ) : (
                                            <div className="relative">
                                                <input
                                                    type="file"
                                                    id={`upload-${key}`}
                                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                    accept=".pdf,.jpg,.jpeg,.webp"
                                                    onChange={(e) => handleFileUpload(key, e)}
                                                />
                                                <Button variant="outline" className="gap-2 border-gold/50 hover:bg-gold/5 text-foreground">
                                                    <Upload className="w-4 h-4" />
                                                    Upload
                                                </Button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Progress Bar (if upload status usually useful, kept simple here) */}
                                {doc.status === 'uploading' && (
                                    <div className="absolute bottom-0 left-0 h-1 bg-gold/50 animate-progress w-full" />
                                )}
                            </motion.div>
                        ))}
                    </div>

                    {/* Submit Action */}
                    <div className="mt-12 flex flex-col items-center gap-4">
                        <Button
                            size="xl"
                            className={`w-full md:w-auto min-w-[300px] gap-2 ${allCompleted ? 'bg-gold hover:bg-gold-light text-black' : 'opacity-50 cursor-not-allowed'}`}
                            disabled={!allCompleted}
                            onClick={handleSubmit}
                        >
                            Submit for Verification
                            <ArrowRight className="w-5 h-5" />
                        </Button>
                        {!allCompleted && (
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <AlertCircle className="w-4 h-4" />
                                Please complete all uploads to proceed
                            </p>
                        )}
                    </div>

                </div>
            </main>

            <div className="relative z-10 -mt-12 md:-mt-24 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-20" />
                <GoldWave />
            </div>

            <Footer />
        </div>
    );
}
