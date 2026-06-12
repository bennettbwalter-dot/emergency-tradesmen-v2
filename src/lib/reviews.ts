// Review data types
export interface Review {
    id: string;
    businessId: string;
    userId: string;
    userName: string;
    userInitials: string;
    rating: number;
    title: string;
    comment: string;
    date: string;
    verified: boolean;
    helpful: number;
    notHelpful: number;
    response?: {
        text: string;
        date: string;
        businessName: string;
    };
    images?: string[];
    jobType?: string;
}

export interface ReviewStats {
    averageRating: number;
    totalReviews: number;
    ratingDistribution: {
        5: number;
        4: number;
        3: number;
        2: number;
        1: number;
    };
    verifiedPercentage: number;
    responseRate: number;
}

export function calculateReviewStats(reviews: Review[]): ReviewStats {
    if (reviews.length === 0) {
        return {
            averageRating: 0,
            totalReviews: 0,
            ratingDistribution: { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 },
            verifiedPercentage: 0,
            responseRate: 0,
        };
    }

    const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    let totalRating = 0;
    let verifiedCount = 0;
    let responseCount = 0;

    reviews.forEach(review => {
        totalRating += review.rating;
        distribution[review.rating as keyof typeof distribution]++;
        if (review.verified) verifiedCount++;
        if (review.response) responseCount++;
    });

    return {
        averageRating: totalRating / reviews.length,
        totalReviews: reviews.length,
        ratingDistribution: distribution,
        verifiedPercentage: (verifiedCount / reviews.length) * 100,
        responseRate: (responseCount / reviews.length) * 100,
    };
}
