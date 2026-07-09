import { useState, useRef } from "react";
import { Upload, X, Loader2 } from "lucide-react";
import { cn } from "../utils/cn";
import { catalogService } from "../services/catalogService";
import { notify } from "../utils/notify";

export function ImageUpload({ label, required, value, error, onChange, className, multiple = false }) {
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;

    const validFiles = files.filter(f => f.type.startsWith("image/"));
    if (validFiles.length === 0) {
      notify.error("Please select valid image files.");
      return;
    }

    setIsUploading(true);
    try {
      const uploadPromises = validFiles.map(file => catalogService.uploadImage(file));
      const urls = await Promise.all(uploadPromises);
      const successfulUrls = urls.filter(Boolean);
      
      if (successfulUrls.length > 0) {
        if (multiple) {
          onChange(successfulUrls);
        } else {
          onChange(successfulUrls[0]);
        }
      } else {
        notify.error("Failed to upload images.");
      }
    } catch (err) {
      notify.error(err.message || "Failed to upload images.");
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleRemove = async () => {
    if (!value || multiple) return; // Multiple mode doesn't support built-in remove for the value array in this component structure
    
    const previousValue = value;
    onChange("");
    
    const success = await catalogService.deleteImage(previousValue);
    if (!success) {
      console.warn("Failed to delete image from storage:", previousValue);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      {label && (
        <span className="text-sm font-medium text-stone-700 block">
          {label}
          {required ? <span className="ml-1 text-rose-500">*</span> : null}
        </span>
      )}
      
      {value && !multiple ? (
        <div className="relative group rounded-xl border border-gold-100 overflow-hidden w-full aspect-[4/3] max-w-[300px]">
          <img 
            src={value} 
            alt="Uploaded preview" 
            className="w-full h-full object-cover bg-stone-50"
          />
          <button
            type="button"
            onClick={handleRemove}
            className="absolute top-2 right-2 p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition-colors"
            title="Remove image"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      ) : (
        <div 
          onClick={() => fileInputRef.current?.click()}
          className={cn(
            "flex flex-col items-center justify-center w-full aspect-[4/3] max-w-[300px] rounded-xl border-2 border-dashed bg-stone-50 cursor-pointer transition-colors hover:bg-stone-100",
            error ? "border-rose-300 hover:border-rose-400" : "border-stone-300 hover:border-[#d3a347]",
            isUploading && "opacity-70 pointer-events-none"
          )}
        >
          {isUploading ? (
            <div className="flex flex-col items-center text-[#d3a347]">
              <Loader2 className="w-8 h-8 animate-spin mb-2" />
              <span className="text-sm font-medium">Uploading...</span>
            </div>
          ) : (
            <div className="flex flex-col items-center text-stone-500">
              <Upload className="w-8 h-8 mb-2" />
              <span className="text-sm font-medium">{multiple ? "Upload images" : "Click to upload"}</span>
              <span className="text-xs text-stone-400 mt-1">JPEG, PNG, WebP up to 5MB</span>
            </div>
          )}
        </div>
      )}
      
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileChange}
        accept="image/jpeg, image/png, image/webp"
        multiple={multiple}
        className="hidden"
      />
      
      {error && !value && <span className="text-xs text-rose-600 block">{error}</span>}
    </div>
  );
}
