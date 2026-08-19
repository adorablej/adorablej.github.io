(function (window) {
    'use strict';

    function formatPublishedAt(value) {
        const text = String(value || '').trim();
        const match = text.match(/^(\d{4})-(\d{2})-(\d{2})/);
        return match ? `${match[1]}.${match[2]}.${match[3]}` : text;
    }

    function normalizeReview(item) {
        return {
            fieldReviewId: Number(item.fieldReviewId ?? item.reviewId ?? item.id),
            title: String(item.title || ''),
            contentSummary: String(item.contentSummary || item.summary || ''),
            reviewerName: String(item.reviewerName || item.storeName || ''),
            publishedAt: formatPublishedAt(item.publishedAt),
            thumbnailUrl: String(item.thumbnailUrl || ''),
            videoUrl: String(item.videoUrl || item.youtubeUrl || ''),
            exposureType: String(item.exposureType || item.exposureTypeCode || 'GENERAL').toUpperCase(),
            isExposed: item.isExposed !== false,
            displayOrder: Number(item.displayOrder ?? 9999)
        };
    }

    function extractReviews(response) {
        if (Array.isArray(response)) return response;
        if (Array.isArray(response?.content)) return response.content;
        if (Array.isArray(response?.items)) return response.items;
        if (Array.isArray(response?.fieldReviews)) return response.fieldReviews;
        return [];
    }

    async function getReviews() {
        try {
            if (!window.HunterFrontAPI?.fieldReviews) throw new Error('현장 리뷰 API를 사용할 수 없습니다.');
            const response = await window.HunterFrontAPI.fieldReviews.getList({ page: 1, size: 100 });
            return extractReviews(response).map(normalizeReview);
        } catch (error) {
            console.warn('[Hunter Pride] API 연결 실패로 임시 데이터를 표시합니다.', error);
            return (window.hunterPrideInterviewData || []).map(normalizeReview);
        }
    }

    window.HunterPrideAPI = Object.freeze({ getReviews: getReviews });
})(window);
