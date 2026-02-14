/**
 * Match Score Calculator
 * Advanced algorithm for calculating startup-investor compatibility.
 * Supports weighted scoring, semantic matching, and configurable parameters.
 */

// Default weights for match scoring
const DEFAULT_WEIGHTS = {
  domain: 0.25,       // Industry/domain alignment
  stage: 0.20,        // Investment stage match
  ticket: 0.15,       // Check size compatibility
  location: 0.10,     // Geographic preference
  thesis: 0.15,       // Investment thesis alignment
  traction: 0.15      // Startup traction/metrics
};

// Stage hierarchy for partial matching
const STAGE_HIERARCHY = {
  'pre-seed': 1,
  'seed': 2,
  'series-a': 3,
  'series-b': 4,
  'series-c': 5,
  'growth': 6
};

// Domain similarity matrix (domains that are related)
const DOMAIN_SIMILARITY = {
  'saas': ['b2b', 'enterprise', 'productivity'],
  'fintech': ['payments', 'banking', 'insurance', 'lending'],
  'healthtech': ['healthcare', 'medtech', 'telemedicine'],
  'deeptech': ['ai', 'ml', 'robotics', 'quantum'],
  'cleantech': ['energy', 'sustainability', 'climate'],
  'consumer': ['marketplace', 'e-commerce', 'd2c']
};

/**
 * Calculate domain match score
 * @param {string} startupDomain - Startup's domain
 * @param {Array} investorDomains - Investor's preferred domains
 * @returns {Object} Match result with score and details
 */
function calculateDomainMatch(startupDomain, investorDomains) {
  if (!startupDomain || !investorDomains || investorDomains.length === 0) {
    return { score: 0, match: 'none', details: 'Domain data incomplete' };
  }

  const normalizedStartupDomain = startupDomain.toLowerCase().trim();
  const normalizedInvestorDomains = investorDomains.map(d => d.toLowerCase().trim());

  // Exact match
  if (normalizedInvestorDomains.includes(normalizedStartupDomain)) {
    return {
      score: 100,
      match: 'exact',
      details: `Direct domain match: ${startupDomain}`
    };
  }

  // Check for partial matches (domain contains or is contained)
  for (const investorDomain of normalizedInvestorDomains) {
    if (normalizedStartupDomain.includes(investorDomain) ||
      investorDomain.includes(normalizedStartupDomain)) {
      return {
        score: 80,
        match: 'partial',
        details: `Partial domain match: ${startupDomain} ~ ${investorDomain}`
      };
    }
  }

  // Check similarity matrix
  const similarDomains = DOMAIN_SIMILARITY[normalizedStartupDomain] || [];
  for (const similar of similarDomains) {
    if (normalizedInvestorDomains.some(d => d.includes(similar) || similar.includes(d))) {
      return {
        score: 60,
        match: 'similar',
        details: `Related domain match: ${startupDomain} related to investor preferences`
      };
    }
  }

  return {
    score: 20,
    match: 'weak',
    details: 'No direct domain alignment'
  };
}

/**
 * Calculate stage match score
 * @param {string} startupStage - Startup's current stage
 * @param {Array} investorStages - Investor's preferred stages
 * @returns {Object} Match result with score and details
 */
function calculateStageMatch(startupStage, investorStages) {
  if (!startupStage || !investorStages || investorStages.length === 0) {
    return { score: 50, match: 'unknown', details: 'Stage data incomplete' };
  }

  const normalizedStartupStage = startupStage.toLowerCase().replace(/[\s-_]/g, '');
  const normalizedInvestorStages = investorStages.map(s => s.toLowerCase().replace(/[\s-_]/g, ''));

  // Exact match
  if (normalizedInvestorStages.includes(normalizedStartupStage)) {
    return {
      score: 100,
      match: 'exact',
      details: `Stage match: ${startupStage}`
    };
  }

  // Check stage hierarchy for adjacent stages
  const startupStageLevel = STAGE_HIERARCHY[normalizedStartupStage] || 0;

  for (const investorStage of normalizedInvestorStages) {
    const investorStageLevel = STAGE_HIERARCHY[investorStage] || 0;
    const levelDiff = Math.abs(startupStageLevel - investorStageLevel);

    if (levelDiff === 1) {
      return {
        score: 75,
        match: 'adjacent',
        details: `Adjacent stage: ${startupStage} near ${investorStage}`
      };
    }
  }

  // Check for partial string matches
  for (const investorStage of normalizedInvestorStages) {
    if (normalizedStartupStage.includes(investorStage) || investorStage.includes(normalizedStartupStage)) {
      return {
        score: 70,
        match: 'partial',
        details: `Partial stage match`
      };
    }
  }

  return {
    score: 30,
    match: 'mismatch',
    details: 'Stage preference mismatch'
  };
}

/**
 * Calculate ticket size match score
 * @param {string|number} startupAsk - Startup's funding ask
 * @param {string|Object} investorTicket - Investor's ticket range
 * @returns {Object} Match result with score and details
 */
function calculateTicketMatch(startupAsk, investorTicket) {
  if (!startupAsk || !investorTicket) {
    return { score: 50, match: 'unknown', details: 'Ticket data incomplete' };
  }

  // Parse startup ask
  const startupAmount = parseAmount(startupAsk);

  // Parse investor ticket range
  let minTicket = 0;
  let maxTicket = Infinity;

  if (typeof investorTicket === 'string') {
    const parsed = parseTicketRange(investorTicket);
    minTicket = parsed.min;
    maxTicket = parsed.max;
  } else if (typeof investorTicket === 'object') {
    minTicket = parseAmount(investorTicket.min || investorTicket.minTicket || 0);
    maxTicket = parseAmount(investorTicket.max || investorTicket.maxTicket || Infinity);
  }

  // Calculate match
  if (startupAmount >= minTicket && startupAmount <= maxTicket) {
    return {
      score: 100,
      match: 'exact',
      details: `Ask within ticket range: ${formatAmount(startupAmount)}`
    };
  }

  // Check if close to range
  const rangeCenter = (minTicket + maxTicket) / 2;
  const rangeWidth = maxTicket - minTicket;
  const distance = Math.abs(startupAmount - rangeCenter);

  if (distance <= rangeWidth * 0.5) {
    return {
      score: 80,
      match: 'close',
      details: `Ask close to ticket range`
    };
  }

  if (distance <= rangeWidth) {
    return {
      score: 60,
      match: 'adjacent',
      details: `Ask slightly outside ticket range`
    };
  }

  return {
    score: 30,
    match: 'mismatch',
    details: `Ask outside ticket range`
  };
}

/**
 * Parse amount from string or number
 * @param {string|number} value - Amount value
 * @returns {number} Parsed amount in dollars
 */
function parseAmount(value) {
  if (typeof value === 'number') return value;
  if (!value) return 0;

  const str = value.toLowerCase().replace(/[\s,]/g, '');

  // Handle formats like "$1M", "500k", "1-2m"
  const match = str.match(/[\d.]+/);
  if (!match) return 0;

  let amount = parseFloat(match[0]);

  if (str.includes('m') || str.includes('million')) {
    amount *= 1000000;
  } else if (str.includes('k') || str.includes('thousand')) {
    amount *= 1000;
  } else if (str.includes('b') || str.includes('billion')) {
    amount *= 1000000000;
  }

  return amount;
}

/**
 * Parse ticket range string
 * @param {string} range - Range string like "$1M - $5M"
 * @returns {Object} Min and max values
 */
function parseTicketRange(range) {
  if (!range) return { min: 0, max: Infinity };

  const parts = range.toLowerCase().split(/[-–to]/);

  if (parts.length === 2) {
    return {
      min: parseAmount(parts[0]),
      max: parseAmount(parts[1])
    };
  }

  const amount = parseAmount(parts[0]);
  return {
    min: amount * 0.8,
    max: amount * 1.2
  };
}

/**
 * Format amount for display
 * @param {number} amount - Amount in dollars
 * @returns {string} Formatted amount
 */
function formatAmount(amount) {
  if (amount >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  } else if (amount >= 1000) {
    return `$${(amount / 1000).toFixed(0)}K`;
  }
  return `$${amount}`;
}

/**
 * Calculate location match score
 * @param {string} startupLocation - Startup's location
 * @param {Array} investorLocations - Investor's preferred locations
 * @returns {Object} Match result with score and details
 */
function calculateLocationMatch(startupLocation, investorLocations) {
  if (!startupLocation) {
    return { score: 50, match: 'unknown', details: 'Location not specified' };
  }

  if (!investorLocations || investorLocations.length === 0) {
    return { score: 70, match: 'open', details: 'Investor location agnostic' };
  }

  const normalizedStartupLocation = startupLocation.toLowerCase().trim();
  const normalizedInvestorLocations = investorLocations.map(l => l.toLowerCase().trim());

  // Exact match
  if (normalizedInvestorLocations.some(l => l === normalizedStartupLocation ||
    normalizedStartupLocation.includes(l) || l.includes(normalizedStartupLocation))) {
    return {
      score: 100,
      match: 'exact',
      details: `Location match: ${startupLocation}`
    };
  }

  // Check for regional matches
  const regions = {
    'india': ['bangalore', 'mumbai', 'delhi', 'hyderabad', 'chennai', 'pune'],
    'usa': ['sf', 'san francisco', 'new york', 'nyc', 'boston', 'la', 'seattle'],
    'europe': ['london', 'berlin', 'paris', 'amsterdam']
  };

  for (const [region, cities] of Object.entries(regions)) {
    const startupInRegion = cities.some(c => normalizedStartupLocation.includes(c));
    const investorWantsRegion = normalizedInvestorLocations.some(l =>
      l.includes(region) || cities.some(c => l.includes(c))
    );

    if (startupInRegion && investorWantsRegion) {
      return {
        score: 80,
        match: 'regional',
        details: `Regional match: ${startupLocation}`
      };
    }
  }

  return {
    score: 40,
    match: 'mismatch',
    details: 'Location not in investor preferences'
  };
}

/**
 * Main match score calculation function
 * @param {Object} startup - Startup profile
 * @param {Object} investor - Investor thesis
 * @param {Object} options - Calculation options
 * @returns {Object} Match result
 */
async function runMatchScore(startup = {}, investor = {}, options = {}) {
  const weights = { ...DEFAULT_WEIGHTS, ...(options.weights || {}) };

  // Calculate individual scores
  const domainResult = calculateDomainMatch(
    startup.domain || startup.industry,
    investor.domains || investor.focusDomains || []
  );

  const stageResult = calculateStageMatch(
    startup.stage,
    investor.stages || investor.preferredStages || []
  );

  const ticketResult = calculateTicketMatch(
    startup.ticketSize || startup.ask || startup.raiseAmount,
    investor.ticketSize || investor.ticketRange
  );

  const locationResult = calculateLocationMatch(
    startup.location || startup.hq,
    investor.preferredLocations || investor.locations
  );

  // Calculate weighted score
  const weightedScore =
    domainResult.score * weights.domain +
    stageResult.score * weights.stage +
    ticketResult.score * weights.ticket +
    locationResult.score * weights.location;

  // Add thesis alignment (simplified)
  const thesisScore = calculateThesisAlignment(startup, investor);
  const tractionScore = calculateTractionScore(startup);

  const finalScore = Math.round(
    weightedScore +
    thesisScore * weights.thesis +
    tractionScore * weights.traction
  );

  // Determine fit level
  let fitLevel = 'LOW';
  if (finalScore >= 80) fitLevel = 'HIGH';
  else if (finalScore >= 60) fitLevel = 'MEDIUM';
  else if (finalScore >= 40) fitLevel = 'MODERATE';

  // Generate key reasons
  const keyReasons = [];
  if (domainResult.match === 'exact') keyReasons.push('Domain alignment is strong');
  if (stageResult.match === 'exact') keyReasons.push('Stage matches investor preference');
  if (ticketResult.match === 'exact') keyReasons.push('Ask within ticket range');
  if (locationResult.match === 'exact') keyReasons.push('Location preference match');
  if (thesisScore > 70) keyReasons.push('Investment thesis alignment');
  if (tractionScore > 70) keyReasons.push('Strong traction metrics');

  // Generate risk flags
  const riskFlags = [];
  if (domainResult.score < 50) riskFlags.push('Domain mismatch risk');
  if (stageResult.score < 50) riskFlags.push('Stage preference mismatch');
  if (ticketResult.score < 50) riskFlags.push('Ticket size outside range');
  if (tractionScore < 50) riskFlags.push('Limited traction data');

  return {
    matchScore: Math.min(finalScore, 98),
    fitLevel,
    breakdown: {
      domain: domainResult,
      stage: stageResult,
      ticket: ticketResult,
      location: locationResult,
      thesis: { score: thesisScore },
      traction: { score: tractionScore }
    },
    keyReasons: keyReasons.length > 0 ? keyReasons : ['Basic compatibility assessed'],
    riskFlags: riskFlags.length > 0 ? riskFlags : ['Standard due diligence recommended'],
    weights,
    _meta: {
      calculatedAt: new Date().toISOString(),
      version: '2.0'
    }
  };
}

/**
 * Calculate thesis alignment score
 * @param {Object} startup - Startup profile
 * @param {Object} investor - Investor thesis
 * @returns {number} Alignment score
 */
function calculateThesisAlignment(startup, investor) {
  let score = 50; // Base score

  // Check if investor has thesis keywords
  const thesisKeywords = investor.thesisKeywords || investor.keywords || [];
  const startupKeywords = [
    startup.domain,
    startup.industry,
    startup.category,
    startup.businessModel
  ].filter(Boolean).map(k => k.toLowerCase());

  // Keyword matching
  for (const keyword of thesisKeywords) {
    if (startupKeywords.some(sk => sk.includes(keyword.toLowerCase()))) {
      score += 10;
    }
  }

  // Check investment focus areas
  if (investor.focusAreas && startup.domain) {
    for (const area of investor.focusAreas) {
      if (startup.domain.toLowerCase().includes(area.toLowerCase())) {
        score += 5;
      }
    }
  }

  return Math.min(score, 100);
}

/**
 * Calculate traction score
 * @param {Object} startup - Startup profile
 * @returns {number} Traction score
 */
function calculateTractionScore(startup) {
  let score = 50; // Base score

  // Revenue traction
  if (startup.revenue) {
    const revenue = parseAmount(startup.revenue);
    if (revenue >= 1000000) score += 20;
    else if (revenue >= 100000) score += 15;
    else if (revenue >= 10000) score += 10;
  }

  // User/customer traction
  if (startup.users || startup.customers) {
    const users = parseInt(startup.users || startup.customers);
    if (users >= 10000) score += 15;
    else if (users >= 1000) score += 10;
    else if (users >= 100) score += 5;
  }

  // Growth rate
  if (startup.growthRate) {
    const growth = parseFloat(startup.growthRate);
    if (growth >= 100) score += 15;
    else if (growth >= 50) score += 10;
    else if (growth >= 20) score += 5;
  }

  // Team size (proxy for execution)
  if (startup.teamSize) {
    const team = parseInt(startup.teamSize);
    if (team >= 10) score += 5;
  }

  return Math.min(score, 100);
}

module.exports = runMatchScore;
