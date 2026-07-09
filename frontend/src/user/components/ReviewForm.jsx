import React, { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { catalogService } from "../../shared/services/catalogService";
import { notify } from "../../shared/utils/notify";
import { Button } from "../../shared/components/Button";
import { Input } from "../../shared/components/Input";
import { ImageUpload } from "../../shared/components/ImageUpload";
import { DiamondRating } from "../../shared/components/DiamondRating";

export function ReviewForm({ productId, onSuccess, onCancel }) {
  const queryClient = useQueryClient();
  const [rating, setRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [images, setImages] = useState([]);
  const [errors, setErrors] = useState({});

  const mutation = useMutation({
    mutationFn: (data) => catalogService.submitReview(productId, data),
    onSuccess: () => {
      notify.success("Thank you for your review!");
      queryClient.invalidateQueries(["productReviews", productId]);
      queryClient.invalidateQueries(["product", productId]);
      if (onSuccess) onSuccess();
    },
    onError: (err) => {
      notify.error(err?.response?.data?.message || err.message || "Failed to submit review");
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!rating) newErrors.rating = "Please select a rating";
    if (!comment.trim()) newErrors.comment = "Please write a comment";
    
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    mutation.mutate({
      rating,
      title: title.trim(),
      comment: comment.trim(),
      images: images.filter(Boolean),
    });
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 bg-white p-6 rounded-2xl border border-stone-100 shadow-sm">
      <h3 className="font-display text-2xl text-stone-900">Write a Review</h3>
      
      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Overall Rating <span className="text-rose-500">*</span></label>
        <DiamondRating 
          rating={rating} 
          onChange={(v) => {
            setRating(v);
            if (errors.rating) setErrors((prev) => ({ ...prev, rating: undefined }));
          }}
          interactive 
          size="lg"
        />
        {errors.rating && <span className="text-xs text-rose-500 block mt-1">{errors.rating}</span>}
      </div>

      <div className="space-y-4">
        <Input 
          label="Title (optional)" 
          placeholder="Summarize your experience" 
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        
        <Input 
          label="Your Review" 
          as="textarea"
          required
          placeholder="What did you like or dislike? What should other shoppers know?"
          value={comment}
          error={errors.comment}
          onChange={(e) => {
            setComment(e.target.value);
            if (errors.comment) setErrors((prev) => ({ ...prev, comment: undefined }));
          }}
          className="min-h-[120px]"
        />
      </div>

      <div className="space-y-2">
        <label className="text-sm font-medium text-stone-700">Add Photos (optional)</label>
        <div className="flex flex-wrap gap-4">
          {images.map((img, idx) => (
            <div key={idx} className="relative w-24 h-24 rounded-lg overflow-hidden border border-stone-200">
              <img src={img} alt={`Upload ${idx}`} className="w-full h-full object-cover" />
              <button 
                type="button" 
                onClick={async () => {
                  const newImages = [...images];
                  newImages.splice(idx, 1);
                  setImages(newImages);
                  await catalogService.deleteImage(img);
                }}
                className="absolute top-1 right-1 bg-white rounded-full p-1 shadow-sm text-rose-500 hover:bg-rose-50"
              >
                <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
          {images.length < 5 && (
            <div className="w-24 h-24">
              <ImageUpload 
                multiple
                value=""
                onChange={(urls) => {
                  if (Array.isArray(urls)) {
                    setImages((prev) => [...prev, ...urls].slice(0, 5)); // Limit to 5 images
                  } else if (urls) {
                    setImages((prev) => [...prev, urls].slice(0, 5));
                  }
                }}
                className="!mt-0 h-full [&>div]:h-full [&>div]:w-full"
              />
            </div>
          )}
        </div>
        <p className="text-xs text-stone-500">You can upload up to 5 photos.</p>
      </div>

      <div className="flex items-center gap-3 pt-4 border-t border-stone-100">
        <Button 
          type="button" 
          tone="secondary" 
          onClick={onCancel}
          disabled={mutation.isPending}
        >
          Cancel
        </Button>
        <Button 
          type="submit"
          loading={mutation.isPending}
        >
          Submit Review
        </Button>
      </div>
    </form>
  );
}
