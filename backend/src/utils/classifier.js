// utils/classifier.js

export const urgentKeywords = ['urgent', 'sos', 'emergency', 'help needed', 'immediate'];

export const isPriority = (text) => {
    return urgentKeywords.some(k => text.toLowerCase().includes(k));
};

export const classifyReport = (text) => {
    if (/need|require|request/i.test(text)) return 'need';
    if (/offer|provide|available/i.test(text)) return 'offer';
    if (/alert|warning|danger/i.test(text)) return 'alert';
    return 'general';
};

// Optional setup method for consistency (can be a placeholder)
export const setupPriorityAlerts = async () => {
    console.log('✅ Priority classification logic ready');
};
