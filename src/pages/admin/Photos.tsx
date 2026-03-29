import { useState } from "react";
import { supabase } from "@/lib/supabase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card } from "@/components/ui/card";
import { Upload, Image as ImageIcon, X, Check } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

export default function PhotosPage() {
    const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
    const [businessId, setBusinessId] = useState("");
    const [uploading, setUploading] = useState(false);
    const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
    const { toast } = useToast();

    const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            const files = Array.from(e.target.files);
            setSelectedFiles(prev => [...prev, ...files]);
        }
    };

    const removeFile = (index: number) => {
        setSelectedFiles(prev => prev.filter((_, i) => i !== index));
    };

    const uploadPhotos = async () => {
        if (!businessId) {
            toast({
                title: "Error",
                description: "Please enter a business ID",
                variant: "destructive",
            });
            return;
        }

        if (selectedFiles.length === 0) {
            toast({
                title: "Error",
                description: "Please select at least one photo",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        const urls: string[] = [];

        try {
            for (const file of selectedFiles) {
                // Upload to Supabase Storage
                const fileExt = file.name.split('.').pop();
                const fileName = `${businessId}/${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;

                const { data: uploadData, error: uploadError } = await supabase.storage
                    .from('business-photos')
                    .upload(fileName, file, {
                        cacheControl: '3600',
                        upsert: false
                    });

                if (uploadError) {
                    console.error('Upload error:', uploadError);
                    toast({
                        title: "Upload Failed",
                        description: uploadError.message,
                        variant: "destructive",
                    });
                    continue;
                }

                // Get public URL
                const { data: { publicUrl } } = supabase.storage
                    .from('business-photos')
                    .getPublicUrl(fileName);

                // Save to database
                const { error: dbError } = await supabase
                    .from('business_photos')
                    .insert({
                        business_id: businessId,
                        url: publicUrl,
                        alt_text: file.name,
                    });

                if (dbError) {
                    console.error('Database error:', dbError);
                } else {
                    urls.push(publicUrl);
                }
            }

            setUploadedUrls(urls);
            setSelectedFiles([]);

            toast({
                title: "Success!",
                description: `Uploaded ${urls.length} photo(s) successfully`,
            });
        } catch (error) {
            console.error('Error:', error);
            toast({
                title: "Error",
                description: "An error occurred during upload",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <div className="mb-8">
                <h1 className="text-3xl font-display text-foreground mb-2">Photo Upload</h1>
                <p className="text-muted-foreground">Upload photos for business listings</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Upload Form */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Upload Photos</h2>

                    {/* Business ID Input */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Business ID</label>
                        <Input
                            type="text"
                            placeholder="e.g., london-plumb-1"
                            value={businessId}
                            onChange={(e) => setBusinessId(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-1">
                            Enter the ID of the business these photos belong to
                        </p>
                    </div>

                    {/* File Upload */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium mb-2">Select Photos</label>
                        <div className="border-2 border-dashed border-border rounded-lg p-8 text-center hover:border-gold/50 transition-colors">
                            <input
                                type="file"
                                multiple
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="hidden"
                                id="photo-upload"
                            />
                            <label htmlFor="photo-upload" className="cursor-pointer">
                                <Upload className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
                                <p className="text-sm font-medium mb-1">Click to upload photos</p>
                                <p className="text-xs text-muted-foreground">PNG, JPG, WEBP up to 10MB each</p>
                            </label>
                        </div>
                    </div>

                    {/* Selected Files Preview */}
                    {selectedFiles.length > 0 && (
                        <div className="mb-4">
                            <p className="text-sm font-medium mb-2">{selectedFiles.length} file(s) selected:</p>
                            <div className="space-y-2">
                                {selectedFiles.map((file, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-2 p-2 bg-secondary rounded-lg"
                                    >
                                        <ImageIcon className="w-4 h-4 text-gold" />
                                        <span className="text-sm flex-1 truncate">{file.name}</span>
                                        <span className="text-xs text-muted-foreground">
                                            {(file.size / 1024).toFixed(0)}KB
                                        </span>
                                        <button
                                            onClick={() => removeFile(index)}
                                            className="p-1 hover:bg-destructive/10 rounded"
                                        >
                                            <X className="w-4 h-4 text-destructive" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Upload Button */}
                    <Button
                        onClick={uploadPhotos}
                        disabled={uploading || selectedFiles.length === 0 || !businessId}
                        className="w-full"
                        variant="hero"
                        size="lg"
                    >
                        {uploading ? (
                            <>
                                <div className="w-4 h-4 border-2 border-background border-t-transparent rounded-full animate-spin mr-2" />
                                Uploading...
                            </>
                        ) : (
                            <>
                                <Upload className="w-5 h-5 mr-2" />
                                Upload {selectedFiles.length > 0 ? `${selectedFiles.length} Photo(s)` : 'Photos'}
                            </>
                        )}
                    </Button>
                </Card>

                {/* Recently Uploaded */}
                <Card className="p-6">
                    <h2 className="text-xl font-semibold mb-4">Recently Uploaded</h2>

                    {uploadedUrls.length === 0 ? (
                        <div className="text-center py-12 text-muted-foreground">
                            <ImageIcon className="w-12 h-12 mx-auto mb-3 opacity-50" />
                            <p>No photos uploaded yet</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-2 gap-3">
                            {uploadedUrls.map((url, index) => (
                                <div key={index} className="relative group aspect-square rounded-lg overflow-hidden border border-border">
                                    <img
                                        src={url}
                                        alt={`Uploaded ${index + 1}`}
                                        className="w-full h-full object-cover"
                                    />
                                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                        <Check className="w-8 h-8 text-green-500" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </Card>
            </div>

            {/* Instructions */}
            <Card className="p-6 mt-6 bg-gold/5 border-gold/20">
                <h3 className="font-semibold mb-2 flex items-center gap-2">
                    <ImageIcon className="w-5 h-5 text-gold" />
                    Photo Upload Instructions
                </h3>
                <ul className="text-sm space-y-1 text-muted-foreground list-disc list-inside">
                    <li>Enter the business ID exactly as it appears in the database</li>
                    <li>Select one or multiple photos to upload</li>
                    <li>Photos should be business-related (storefronts, staff, work examples)</li>
                    <li>Recommended size: 1200px wide for best quality</li>
                    <li>Files are stored in Supabase Storage and linked to the business</li>
                </ul>
            </Card>
        </div>
    );
}
