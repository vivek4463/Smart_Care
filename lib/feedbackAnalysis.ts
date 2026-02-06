import { Feedback, FeedbackAnalysis, SatisfactionLevel } from './types';

// Analyze user feedback and determine satisfaction
export function analyzeFeedback(feedback: Feedback): FeedbackAnalysis {
    const satisfactionScores: Record<SatisfactionLevel, number> = {
        very_satisfied: 1.0,
        satisfied: 0.75,
        neutral: 0.5,
        dissatisfied: 0.25,
        very_dissatisfied: 0.0,
    };

    const overallSatisfaction = (satisfactionScores[feedback.satisfaction] + (feedback.rating / 5)) / 2;

    const improvements: string[] = [];
    const strengthAreas: string[] = [];

    // Analyze based on satisfaction level
    if (feedback.satisfaction === 'very_dissatisfied' || feedback.satisfaction === 'dissatisfied') {
        improvements.push('Adjust tempo to better match emotional state');
        improvements.push('Experiment with different musical modes');
        improvements.push('Incorporate user preferences more strongly');
    } else if (feedback.satisfaction === 'neutral') {
        improvements.push('Fine-tune instrument selection');
        improvements.push('Enhance melodic patterns');
    } else {
        strengthAreas.push('Emotion detection accuracy');
        strengthAreas.push('Music generation quality');
    }

    // Analyze rating
    if (feedback.rating < 3) {
        improvements.push('Improve overall music quality');
    } else if (feedback.rating >= 4) {
        strengthAreas.push('User satisfaction');
    }

    // Analyze comments for keywords
    if (feedback.comments) {
        const lowerComments = feedback.comments.toLowerCase();

        if (lowerComments.includes('too fast') || lowerComments.includes('too slow')) {
            improvements.push('Adjust tempo based on user feedback');
        }

        if (lowerComments.includes('relaxing') || lowerComments.includes('calming')) {
            strengthAreas.push('Therapeutic effectiveness');
        }

        if (lowerComments.includes('love') || lowerComments.includes('great')) {
            strengthAreas.push('User engagement');
        }
    }

    return {
        overallSatisfaction,
        improvements: improvements.length > 0 ? improvements : ['Continue current approach'],
        strengthAreas: strengthAreas.length > 0 ? strengthAreas : ['Collect more feedback data'],
    };
}

// Generate improvement suggestions based on feedback
export function generateImprovementSuggestions(analysis: FeedbackAnalysis): string[] {
    const suggestions: string[] = [];

    if (analysis.overallSatisfaction < 0.5) {
        suggestions.push('Consider adjusting the emotion detection sensitivity');
        suggestions.push('Experiment with alternative musical styles');
        suggestions.push('Add user preference customization options');
    } else if (analysis.overallSatisfaction < 0.75) {
        suggestions.push('Fine-tune music generation parameters');
        suggestions.push('Gather more diverse training data');
    } else {
        suggestions.push('Maintain current quality standards');
        suggestions.push('Explore advanced personalization features');
    }

    return suggestions;
}

// Store feedback for self-learning (in production, this would update ML models)
export async function storeFeedback(feedback: Feedback): Promise<boolean> {
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000));

    // In production, this would:
    // 1. Store feedback in database
    // 2. Update user preferences
    // 3. Train/fine-tune music generation models
    // 4. Update emotion detection models based on correlations

    // For demo, just store in localStorage
    const existingFeedback = JSON.parse(localStorage.getItem('feedbackHistory') || '[]');
    existingFeedback.push(feedback);
    localStorage.setItem('feedbackHistory', JSON.stringify(existingFeedback));

    return true;
}

// Get satisfaction emoji
export function getSatisfactionEmoji(satisfaction: SatisfactionLevel): string {
    const emojis: Record<SatisfactionLevel, string> = {
        very_satisfied: '😊',
        satisfied: '🙂',
        neutral: '😐',
        dissatisfied: '😕',
        very_dissatisfied: '😞',
    };
    return emojis[satisfaction];
}

// Get satisfaction color
export function getSatisfactionColor(satisfaction: SatisfactionLevel): string {
    const colors: Record<SatisfactionLevel, string> = {
        very_satisfied: '#22c55e',
        satisfied: '#84cc16',
        neutral: '#eab308',
        dissatisfied: '#f97316',
        very_dissatisfied: '#ef4444',
    };
    return colors[satisfaction];
}
