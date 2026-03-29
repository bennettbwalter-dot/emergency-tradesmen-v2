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

// Mock review data generator
export function generateMockReviews(businessId: string, count: number = 5): Review[] {
    const reviewTemplates = [
        {
            title: "Excellent emergency service",
            comment: "Called them at 2am with a burst pipe and they arrived within 40 minutes. Professional, efficient, and cleaned up after themselves. Highly recommend!",
            rating: 5,
            jobType: "Emergency repair"
        },
        {
            title: "Very professional",
            comment: "Great service from start to finish. Clear pricing, arrived on time, and did a thorough job. Will definitely use again.",
            rating: 5,
            jobType: "Routine maintenance"
        },
        {
            title: "Quick response time",
            comment: "Needed an emergency electrician and they were here within the hour. Fixed the problem quickly and explained everything clearly.",
            rating: 4,
            jobType: "Emergency callout"
        },
        {
            title: "Good value for money",
            comment: "Fair pricing and good quality work. Took a bit longer than expected but the end result was excellent.",
            rating: 4,
            jobType: "Installation"
        },
        {
            title: "Reliable and trustworthy",
            comment: "Have used them multiple times now and they never disappoint. Always professional and do quality work.",
            rating: 5,
            jobType: "Multiple jobs"
        },
        {
            title: "Saved the day!",
            comment: "Had a gas leak emergency and they responded immediately. Very grateful for their quick action and professionalism.",
            rating: 5,
            jobType: "Emergency repair"
        },
        {
            title: "Professional service",
            comment: "Courteous, professional, and did exactly what was needed. Price was as quoted with no surprises.",
            rating: 4,
            jobType: "Repair"
        },
        {
            title: "Highly skilled",
            comment: "Clearly knew what they were doing. Diagnosed the problem quickly and fixed it properly. Very impressed.",
            rating: 5,
            jobType: "Diagnosis & repair"
        },
    ];

    const names = [
        "Sarah M", "John D", "Emma W", "Michael B", "Lisa P", "David R",
        "Rachel K", "Tom H", "Sophie L", "James C", "Amy S", "Robert F"
    ];

    return Array.from({ length: count }, (_, i) => {
        const template = reviewTemplates[i % reviewTemplates.length];
        const name = names[i % names.length];
        const initials = name.split(' ').map(n => n[0]).join('');
        const daysAgo = Math.floor(Math.random() * 90) + 1;
        const date = new Date();
        date.setDate(date.getDate() - daysAgo);

        return {
            id: `${businessId}-review-${i + 1}`,
            businessId,
            userId: `user-${i + 1}`,
            userName: name,
            userInitials: initials,
            rating: template.rating,
            title: template.title,
            comment: template.comment,
            date: date.toISOString(),
            verified: Math.random() > 0.2, // 80% verified
            helpful: Math.floor(Math.random() * 15),
            notHelpful: Math.floor(Math.random() * 3),
            jobType: template.jobType,
            ...(Math.random() > 0.7 && {
                response: {
                    text: "Thank you for your kind review! We're delighted we could help and look forward to serving you again.",
                    date: new Date(date.getTime() + 86400000 * 2).toISOString(),
                    businessName: "Business Owner"
                }
            })
        };
    });
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
