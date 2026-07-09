import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { catalogService } from "../../shared/services/catalogService";
import { DiamondRating } from "../../shared/components/DiamondRating";
import { useSession } from "../../shared/hooks/useSession";
import { ReviewForm } from "./ReviewForm";
import { Button } from "../../shared/components/Button";
import { Loader } from "../../shared/components/Loader";

export function ReviewSection({ productId, averageRating = 0, numReviews = 0 }) {
  const { user } = useSession();
  const [showForm, setShowForm] = useState(false);
  const [page, setPage] = useState(1);
  const limit = 5;

  const { data, isLoading } = useQuery({
    queryKey: ["productReviews", productId, page],
    queryFn: () => catalogService.getReviews(productId, { page, limit }),
  });

  const { data: eligibility } = useQuery({
    queryKey: ["reviewEligibility", productId],
    queryFn: () => catalogService.checkReviewEligibility(productId),
    enabled: !!user && !showForm,
  });

  const reviews = data?.reviews || [];
  const pagination = data?.pagination;
  const isEligible = eligibility?.eligible;

  return (
    <div className="py-12 border-t border-stone-100" id="reviews">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <h2 className="font-display text-3xl text-stone-900 mb-4">Customer Reviews</h2>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <span className="text-4xl font-display text-stone-900">{averageRating.toFixed(1)}</span>
              <div className="flex flex-col">
                <DiamondRating rating={averageRating} size="md" />
                <span className="text-sm text-stone-500 mt-1">Based on {numReviews} {numReviews === 1 ? 'review' : 'reviews'}</span>
              </div>
            </div>
          </div>
        </div>
        
        {user && isEligible && !showForm && (
          <Button onClick={() => setShowForm(true)}>
            Write a Review
          </Button>
        )}
      </div>

      {showForm && (
        <div className="mb-12">
          <ReviewForm 
            productId={productId} 
            onSuccess={() => setShowForm(false)} 
            onCancel={() => setShowForm(false)} 
          />
        </div>
      )}

      <div className="space-y-8">
        {isLoading ? (
          <Loader label="Loading reviews..." />
        ) : reviews.length > 0 ? (
          <>
            {reviews.map((review) => (
              <div key={review._id} className="pb-8 border-b border-stone-100 last:border-0">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-medium text-stone-900 flex items-center gap-2">
                      {review.user?.name || "Customer"}
                      {review.isVerifiedPurchase && (
                        <span className="text-xs bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded-full flex items-center gap-1">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                          Verified Purchase
                        </span>
                      )}
                    </h4>
                    <p className="text-xs text-stone-500 mt-1">
                      {new Date(review.createdAt).toLocaleDateString("en-US", {
                        year: "numeric",
                        month: "long",
                        day: "numeric"
                      })}
                    </p>
                  </div>
                  <DiamondRating rating={review.rating} size="sm" />
                </div>
                
                {review.title && <h5 className="font-medium text-stone-900 mb-2">{review.title}</h5>}
                <p className="text-stone-600 text-sm whitespace-pre-wrap leading-relaxed">{review.comment}</p>
                
                {review.images && review.images.length > 0 && (
                  <div className="flex flex-wrap gap-3 mt-4">
                    {review.images.map((img, idx) => (
                      <div key={idx} className="w-20 h-20 rounded-lg overflow-hidden border border-stone-100">
                        <img src={img} alt="Review attachment" className="w-full h-full object-cover" />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}

            {pagination && pagination.pages > 1 && (
              <div className="flex justify-center gap-2 mt-8">
                <Button 
                  tone="secondary" 
                  size="sm" 
                  disabled={page === 1}
                  onClick={() => setPage(p => p - 1)}
                >
                  Previous
                </Button>
                <div className="flex items-center px-4 text-sm font-medium text-stone-600">
                  Page {page} of {pagination.pages}
                </div>
                <Button 
                  tone="secondary" 
                  size="sm" 
                  disabled={page === pagination.pages}
                  onClick={() => setPage(p => p + 1)}
                >
                  Next
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center py-12 bg-stone-50 rounded-2xl border border-stone-100 border-dashed">
            <h3 className="font-display text-xl text-stone-900 mb-2">No reviews yet</h3>
            <p className="text-stone-500">Be the first to review this product!</p>
          </div>
        )}
      </div>
    </div>
  );
}
