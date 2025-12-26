import type { TopMoverStock, ChartDataPoint , StockOverview } from '@/types/database';

export const MOCK_TOP_GAINERS: TopMoverStock[] = [

  { ticker: 'NVDA', price: '145.89', change_amount: '12.45', change_percentage: '9.32%', volume: '45678901' },
  { ticker: 'AMD', price: '178.34', change_amount: '10.23', change_percentage: '6.08%', volume: '34567890' },
  { ticker: 'TSLA', price: '248.50', change_amount: '15.67', change_percentage: '6.73%', volume: '78901234' },
  { ticker: 'META', price: '505.25', change_amount: '28.90', change_percentage: '6.06%', volume: '23456789' },
  { ticker: 'GOOGL', price: '175.80', change_amount: '8.45', change_percentage: '5.05%', volume: '19876543' },
  { ticker: 'AMZN', price: '186.75', change_amount: '8.12', change_percentage: '4.55%', volume: '29876543' },
  { ticker: 'MSFT', price: '425.50', change_amount: '18.30', change_percentage: '4.50%', volume: '18765432' },
  { ticker: 'AAPL', price: '195.25', change_amount: '7.85', change_percentage: '4.19%', volume: '56789012' },
  { ticker: 'NFLX', price: '628.90', change_amount: '24.50', change_percentage: '4.05%', volume: '8765432' },
  { ticker: 'CRM', price: '278.45', change_amount: '10.20', change_percentage: '3.80%', volume: '7654321' },
];



export const MOCK_TOP_LOSERS: TopMoverStock[] = [
  { ticker: 'INTC', price: '24.56', change_amount: '-3.45', change_percentage: '-12.31%', volume: '67890123' },
  { ticker: 'BA', price: '178.90', change_amount: '-18.23', change_percentage: '-9.25%', volume: '12345678' },
  { ticker: 'DIS', price: '98.45', change_amount: '-8.90', change_percentage: '-8.29%', volume: '23456789' },
  { ticker: 'PYPL', price: '62.30', change_amount: '-5.12', change_percentage: '-7.59%', volume: '34567890' },
  { ticker: 'SNAP', price: '11.25', change_amount: '-0.89', change_percentage: '-7.33%', volume: '45678901' },
  { ticker: 'UBER', price: '68.90', change_amount: '-4.56', change_percentage: '-6.21%', volume: '19876543' },
  { ticker: 'COIN', price: '205.60', change_amount: '-12.80', change_percentage: '-5.86%', volume: '8765432' },
  { ticker: 'RIVN', price: '14.25', change_amount: '-0.78', change_percentage: '-5.19%', volume: '29876543' },
  { ticker: 'LCID', price: '3.45', change_amount: '-0.18', change_percentage: '-4.96%', volume: '56789012' },
  { ticker: 'NIO', price: '5.89', change_amount: '-0.28', change_percentage: '-4.54%', volume: '67890123' },
];




export const MOCK_MOST_ACTIVE: TopMoverStock[] = [

  { ticker: 'AAPL', price: '195.25', change_amount: '7.85', change_percentage: '4.19%', volume: '156789012' },
  { ticker: 'TSLA', price: '248.50', change_amount: '15.67', change_percentage: '6.73%', volume: '145678901' },
  { ticker: 'NVDA', price: '145.89', change_amount: '12.45', change_percentage: '9.32%', volume: '134567890' },
  { ticker: 'AMD', price: '178.34', change_amount: '10.23', change_percentage: '6.08%', volume: '123456789' },
  { ticker: 'INTC', price: '24.56', change_amount: '-3.45', change_percentage: '-12.31%', volume: '112345678' },
  { ticker: 'AMZN', price: '186.75' , change_amount: '8.12' , change_percentage: '4.55%', volume: '98765432' },
  { ticker: 'META', price: '505.25', change_amount: '28.90', change_percentage: '6.06%', volume: '87654321' },
  { ticker: 'MSFT', price: '425.50', change_amount: '18.30', change_percentage: '4.50%', volume: '76543210' },
  { ticker: 'GOOGL', price: '175.80', change_amount: '8.45', change_percentage: '5.05%', volume: '65432109' },
  { ticker: 'BAC', price: '38.90' , change_amount: '1.23', change_percentage: '3.27%', volume: '54321098' },
];



// Generate realistic chart data
export const generateMockChartData = (days: number = 30, basePrice: number = 150): ChartDataPoint[] => {
  const data: ChartDataPoint[] = [];
  let currentPrice = basePrice;
  const now = new Date();
  
  for (let i = days; i >= 0; i--) {
    const date = new Date(now);

    date.setDate(date.getDate() - i);
    
    const change = (Math.random() - 0.48) * (basePrice * 0.03);

    currentPrice = Math.max(basePrice * 0.7, Math.min(basePrice * 1.3, currentPrice + change));
    
    data.push({
      timestamp: date.toISOString().split('T')[0],
      value: parseFloat(currentPrice.toFixed(2)),
    });
  }
  
  return data;
};




export const MOCK_OVERVIEWS: Record<string, Partial<StockOverview>> = {
  AAPL: {
    Symbol: 'AAPL',
    Name: 'Apple Inc.',
    Description: 'Apple Inc. designs, manufactures, and markets smartphones, personal computers, tablets, wearables, and accessories worldwide. The company offers iPhone, Mac, iPad, and wearables, home and accessories.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Consumer Electronics',

    MarketCapitalization: '3012000000000',
    PERatio: '29.5',
    EPS: '6.62',
    DividendYield: '0.0052',
    '52WeekHigh': '199.62',
    '52WeekLow': '164.08',

    Beta: '1.25',
  },

  NVDA: {
    Symbol: 'NVDA',
    Name: 'NVIDIA Corporation',
    Description: 'NVIDIA Corporation provides graphics, computing and networking solutions. The company designs and sells GPUs for gaming, professional visualization, datacenter, and automotive markets.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Semiconductors',
    MarketCapitalization: '3580000000000',
    PERatio: '65.2',
    EPS: '2.24',
    DividendYield: '0.0003',
    '52WeekHigh': '152.89',
    '52WeekLow': '47.32',
    Beta: '1.65',
  },

  TSLA: {
    Symbol: 'TSLA',
    Name: 'Tesla, Inc.',
    Description: 'Tesla, Inc. designs, develops, manufactures, and sells electric vehicles, energy generation and storage systems. The company operates through Automotive and Energy Generation and Storage segments.',
    Exchange: 'NASDAQ',
    Sector: 'Consumer Cyclical',
    Industry: 'Auto Manufacturers',
    MarketCapitalization: '789000000000',
    PERatio: '72.8',
    EPS: '3.41',
    DividendYield: '0',
    '52WeekHigh': '299.29',
    '52WeekLow': '138.80',
    Beta: '2.05',
  },
  MSFT: {
    Symbol: 'MSFT',
    Name: 'Microsoft Corporation',
    Description: 'Microsoft Corporation develops, licenses, and supports software, services, devices, and solutions worldwide. It operates through Productivity and Business Processes, Intelligent Cloud, and More Personal Computing segments.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Software - Infrastructure',
    MarketCapitalization: '3160000000000',
    PERatio: '36.8',
    EPS: '11.56',
    DividendYield: '0.0072',
    '52WeekHigh': '468.35',
    '52WeekLow': '366.50',
    Beta: '0.89',
  },
  GOOGL: {
    Symbol: 'GOOGL',
    Name: 'Alphabet Inc.',
    Description: 'Alphabet Inc. offers various products and platforms in the United States, Europe, the Middle East, Africa, the Asia-Pacific, Canada, and Latin America. It operates through Google Services, Google Cloud, and Other Bets segments.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Internet Content & Information',
    MarketCapitalization: '2180000000000',
    PERatio: '25.4',
    EPS: '6.92',
    DividendYield: '0.0045',
    '52WeekHigh': '191.75',
    '52WeekLow': '130.67',
    Beta: '1.05',
  },
  AMZN: {
    Symbol: 'AMZN',
    Name: 'Amazon.com, Inc.',
    Description: 'Amazon.com, Inc. engages in the retail sale of consumer products and subscriptions through online and physical stores in North America and internationally. It operates through e-commerce, AWS, and advertising segments.',
    Exchange: 'NASDAQ',
    Sector: 'Consumer Cyclical',
    Industry: 'Internet Retail',
    MarketCapitalization: '1950000000000',
    PERatio: '58.3',
    EPS: '3.21',
    DividendYield: '0',
    '52WeekHigh': '201.20',
    '52WeekLow': '118.35',
    Beta: '1.15',
  },
  META: {
    Symbol: 'META',
    Name: 'Meta Platforms, Inc.',
    Description: 'Meta Platforms, Inc. engages in the development of products that enable people to connect and share with friends and family through mobile devices, personal computers, virtual reality headsets, and wearables worldwide.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Internet Content & Information',
    MarketCapitalization: '1280000000000',
    PERatio: '28.9',
    EPS: '17.48',
    DividendYield: '0.0038',
    '52WeekHigh': '542.81',
    '52WeekLow': '296.37',
    Beta: '1.22',
  },
  AMD: {
    Symbol: 'AMD',
    Name: 'Advanced Micro Devices, Inc.',
    Description: 'Advanced Micro Devices, Inc. operates as a semiconductor company worldwide. It operates through Data Center, Client, Gaming, and Embedded segments.',
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'Semiconductors',
    MarketCapitalization: '288000000000',
    PERatio: '118.5',
    EPS: '1.51',
    DividendYield: '0',
    '52WeekHigh': '227.30',
    '52WeekLow': '132.83',
    Beta: '1.72',
  },
};




export const getMockOverview = (symbol: string): Partial<StockOverview> => {
  if (MOCK_OVERVIEWS[symbol]) {
    return MOCK_OVERVIEWS[symbol];
  }
  
  // Return generic data for unknown symbols
  return {
    Symbol: symbol,
    Name: `${symbol} Corporation`,
    Description: `${symbol} is a publicly traded company listed on major exchanges.`,
    Exchange: 'NASDAQ',
    Sector: 'Technology',
    Industry: 'General',
    MarketCapitalization: '50000000000',
    PERatio: '25.0',
    EPS: '4.50',
    DividendYield: '0.02',
    '52WeekHigh': '150.00',
    '52WeekLow': '100.00',
    Beta: '1.0',
  };
};


// Mock news data
export const MOCK_NEWS = [
  {
    title: 'Tech Stocks Rally on Strong Earnings Reports',
    url: 'https://ndtv.com/news/1',
    time_published: '20241226T103000',
    authors: ['Financial Times'],
    summary: 'Major technology companies reported better-than-expected quarterly earnings, driving a broad rally in tech stocks.',
    banner_image: null,
    source: 'Financial Times',
    category_within_source: 'Markets',
    source_domain: 'ft.com',
    overall_sentiment_score: 0.35,
    overall_sentiment_label: 'Bullish',
  },
  {
    title: 'Federal Reserve Signals Potential Rate Cuts in 2025',
    url: 'https://ndtv.com/news/2',
    time_published: '20241226T090000',
    authors: ['Reuters'],
    summary: 'The Federal Reserve indicated it may begin cutting interest rates next year if inflation continues to cool.',
    banner_image: null,
    source: 'Reuters',
    category_within_source: 'Economy',
    source_domain: 'reuters.com',
    overall_sentiment_score: 0.25,
    overall_sentiment_label: 'Somewhat-Bullish',
  },
  {
    title: 'AI Investments Continue to Drive Market Growth',
    url: 'https://ndtv.com/news/3',
    time_published: '20241225T140000',
    authors: ['Bloomberg'],
    summary: 'Companies investing heavily in artificial intelligence are seeing significant returns as AI adoption accelerates.',
    banner_image: null,
    source: 'Bloomberg',
    category_within_source: 'Technology',
    source_domain: 'bloomberg.com',
    overall_sentiment_score: 0.42,
    overall_sentiment_label: 'Bullish',
  },
  {
    title: 'Global Markets Mixed Amid Economic Uncertainty',
    url: 'https://ndtv.com/news/4',
    time_published: '20241225T080000',
    authors: ['CNBC'],
    summary: 'World markets showed mixed performance as investors weigh economic data and geopolitical concerns.',
    banner_image: null,
    source: 'CNBC',
    category_within_source: 'Markets',
    source_domain: 'cnbc.com',
    overall_sentiment_score: 0.0,
    overall_sentiment_label: 'Neutral',
  },
  {
    title: 'Semiconductor Sector Faces Supply Chain Challenges',
    url: 'https://ndtv.com/news/5',
    time_published: '20241224T150000',
    authors: ['Wall Street Journal'],
    summary: 'Chip manufacturers are navigating ongoing supply chain disruptions while demand remains strong.',
    banner_image: null,
    source: 'Wall Street Journal',
    category_within_source: 'Industry',
    source_domain: 'wsj.com',
    overall_sentiment_score: -0.15,
    overall_sentiment_label: 'Somewhat-Bearish',
  },
];

export default {
  MOCK_TOP_GAINERS,
  MOCK_TOP_LOSERS,
  MOCK_MOST_ACTIVE,
  MOCK_NEWS,
  MOCK_OVERVIEWS,
  generateMockChartData,
  getMockOverview,
};