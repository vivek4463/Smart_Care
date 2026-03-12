export const CRISIS_KEYWORDS = [
  "suicide", "kill myself", "end my life", "self harm", "worthless", 
  "hopeless", "better off dead", "cutting", "overdose"
];

export const detectCrisis = (text: string): boolean => {
  const lowText = text.toLowerCase();
  return CRISIS_KEYWORDS.some(keyword => lowText.includes(keyword));
};

export const getEmergencyResources = () => {
  return [
    { name: "988 Suicide & Crisis Lifeline", contact: "988" },
    { name: "Crisis Text Line", contact: "Text HOME to 741741" },
    { name: "SAMHSA National Helpline", contact: "1-800-662-4357" }
  ];
};
