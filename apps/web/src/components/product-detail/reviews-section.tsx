'use client';

import { useState } from 'react';
import { ThumbsUp, Calendar, User, Star, ChevronDown } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export interface Review {
  id: string;
  userName: string;
  avatar?: string;
  rating: number;
  date: string;
  text: string;
  helpfulCount: number;
}

interface ReviewsSectionProps {
  reviews: Review[];
  averageRating: number;
  totalReviews: number;
}

type SortOption = 'recent' | 'helpful' | 'highest';

export function ReviewsSection({ reviews, averageRating, totalReviews }: ReviewsSectionProps) {
  const [sortBy, setSortBy] = useState<SortOption>('recent');
  const [helpfulCounts, setHelpfulCounts] = useState<Record<string, number>>(
    reviews.reduce((acc, review) => ({ ...acc, [review.id]: review.helpfulCount }), {} as Record<string, number>)
  );
  const [helpfulClicked, setHelpfulClicked] = useState<Record<string, boolean>>({});

  // Calculate rating breakdown
  const ratingBreakdown = [5, 4, 3, 2, 1].map((rating) => {
    const count = reviews.filter((review) => review.rating === rating).length;
    return {
      rating,
      count,
      percentage: totalReviews > 0 ? (count / totalReviews) * 100 : 0,
    };
  });

  // Sort reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    switch (sortBy) {
      case 'recent':
        return new Date(b.date).getTime() - new Date(a.date).getTime();
      case 'helpful':
        return helpfulCounts[b.id] - helpfulCounts[a.id];
      case 'highest':
        return b.rating - a.rating;
      default:
        return 0;
    }
  });

  const handleHelpful = (reviewId: string) => {
    if (helpfulClicked[reviewId]) return;

    setHelpfulClicked((prev) => ({ ...prev, [reviewId]: true }));
    setHelpfulCounts((prev) => ({ ...prev, [reviewId]: prev[reviewId] + 1 }));
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  return (
    <div className="space-y-6">
      {/* Overall Rating Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="text-xl">Customer Reviews</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average Rating */}
            <div className="flex flex-col items-center md:items-start text-center md:text-left">
              <span className="text-5xl font-bold text-foreground">{averageRating.toFixed(1)}</span>
              <div className="flex items-center mt-2">
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className={`h-5 w-5 ${
                      i < Math.round(averageRating)
                        ? 'fill-amber-400 text-amber-400'
                        : 'text-muted-foreground/30'
                    }`}
                  />
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-1">
                Based on {totalReviews} reviews
              </p>
            </div>

            {/* Rating Breakdown */}
            <div className="flex-1 space-y-2">
              {ratingBreakdown.map(({ rating, count, percentage }) => (
                <div key={rating} className="flex items-center gap-3">
                  <span className="text-sm font-medium text-foreground w-8">{rating} star</span>
                  <div className="flex-1 h-3 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-amber-400 transition-all duration-300"
                      style={{ width: `${percentage}%` }}
                    />
                  </div>
                  <span className="text-sm text-muted-foreground w-12 text-right">
                    {count} ({Math.round(percentage)}%)
                  </span>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sort and Write Review */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative">
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            className="appearance-none bg-background border border-input rounded-md px-4 py-2 pr-10 text-sm font-medium focus:outline-none focus:ring-2 focus:ring-ring cursor-pointer"
          >
            <option value="recent">Most Recent</option>
            <option value="helpful">Most Helpful</option>
            <option value="highest">Highest Rating</option>
          </select>
          <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        </div>
        <Button>Write a Review</Button>
      </div>

      {/* Reviews List */}
      <div className="space-y-4">
        {sortedReviews.map((review) => (
          <Card key={review.id}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                {/* User Avatar */}
                <div className="flex-shrink-0">
                  {review.avatar ? (
                    <img
                      src={review.avatar}
                      alt={review.userName}
                      className="w-12 h-12 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                      <User className="h-6 w-6 text-muted-foreground" />
                    </div>
                  )}
                </div>

                <div className="flex-1 min-w-0">
                  {/* User Info and Rating */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                    <div>
                      <h4 className="font-semibold text-foreground">{review.userName}</h4>
                      <div className="flex items-center gap-2 mt-1">
                        <div className="flex items-center">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'fill-amber-400 text-amber-400'
                                  : 'text-muted-foreground/30'
                              }`}
                            />
                          ))}
                        </div>
                        <div className="flex items-center text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3 mr-1" />
                          {formatDate(review.date)}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Review Text */}
                  <p className="mt-3 text-sm text-foreground leading-relaxed">{review.text}</p>

                  {/* Helpful Button */}
                  <div className="mt-4">
                    <Button
                      variant="ghost"
                      size="sm"
                      className={`text-xs ${
                        helpfulClicked[review.id]
                          ? 'text-primary'
                          : 'text-muted-foreground hover:text-foreground'
                      }`}
                      onClick={() => handleHelpful(review.id)}
                      disabled={helpfulClicked[review.id]}
                    >
                      <ThumbsUp className="h-4 w-4 mr-2" />
                      Helpful ({helpfulCounts[review.id]})
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
