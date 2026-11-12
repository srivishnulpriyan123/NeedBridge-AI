/**
 * Simulates Gemini AI Need Priority Scoring and Recommendation logic for NeedBridge AI
 */
export const calculateAiScore = ({ urgency, beneficiaries = 1, category, description = '' }) => {
  let score = 50;

  // Urgency weights
  switch (urgency) {
    case 'Critical':
      score += 32;
      break;
    case 'High':
      score += 22;
      break;
    case 'Medium':
      score += 10;
      break;
    case 'Low':
    default:
      score += 2;
      break;
  }

  // Beneficiary volume factor
  const count = parseInt(beneficiaries, 10) || 1;
  if (count >= 50) score += 12;
  else if (count >= 20) score += 8;
  else if (count >= 5) score += 5;
  else score += 2;

  // Category urgency weighting
  if (category === 'medical' || category === 'Medical & Healthcare') score += 6;
  if (category === 'shelter' || category === 'Shelter & Bedding') score += 5;
  if (category === 'food' || category === 'Food & Nutrition') score += 4;

  // Description length and keyword analysis
  const lowerDesc = description.toLowerCase();
  const criticalKeywords = ['emergency', 'children', 'infant', 'winter', 'storm', 'disabled', 'elderly', 'displaced', 'flood', 'shortage'];
  criticalKeywords.forEach(kw => {
    if (lowerDesc.includes(kw)) score += 2;
  });

  // Clamp between 45 and 99
  const finalScore = Math.min(99, Math.max(48, score));

  let priorityLevel = 'Medium';
  let badgeColor = 'blue';

  if (finalScore >= 85) {
    priorityLevel = 'Critical Priority';
    badgeColor = 'rose';
  } else if (finalScore >= 70) {
    priorityLevel = 'High Priority';
    badgeColor = 'amber';
  } else if (finalScore >= 55) {
    priorityLevel = 'Moderate Priority';
    badgeColor = 'teal';
  } else {
    priorityLevel = 'Standard Priority';
    badgeColor = 'slate';
  }

  return {
    score: finalScore,
    priorityLevel,
    badgeColor,
    vulnerabilityIndex: `${(finalScore / 10).toFixed(1)} / 10.0`,
    aiConfidence: '96.4%',
    matchConfidence: 'High (3 nearby suppliers & active donors)',
    summaryReason: `Scored ${finalScore}/100 based on urgency level (${urgency}), scale of ${count} beneficiaries, and rapid relief classification.`
  };
};

