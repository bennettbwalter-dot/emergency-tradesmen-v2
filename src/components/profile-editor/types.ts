
export interface EditorProps {
    formData: any;
    setFormData: (data: any) => void;
    previews?: any;
    setPreviews?: (data: any) => void;
    handleFile?: (key: string, e: any) => void;
    files?: any;
    setFiles?: (data: any) => void;
    saving?: boolean;
}
