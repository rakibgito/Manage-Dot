export const DEFAULT_INCOME_SOURCES = [
  'Family allowance',
  'Part-time job',
  'Freelancing',
  'Tuition (Private Teaching)',
  'Business income',
  'Scholarship / Stipend',
  'Other',
];

export const DEFAULT_EXPENSE_CATEGORIES = [
  'Food & Groceries',
  'Transportation',
  'Tea/Coffee/Snacks',
  'Rent (Mess/Hall)',
  'Tuition & Semester Fees',
  'Shopping & Clothing',
  'Mobile Recharge & Internet',
  'Healthcare & Medicine',
  'Entertainment',
  'Personal Care',
  'Books & Stationery',
  'Other',
];

export const FIXED_EXPENSE_CATEGORIES = [
  'Rent (Mess/Hall)',
  'Tuition & Semester Fees',
  'Mobile Recharge & Internet',
  'Wi-Fi & Utilities',
];

export const DEFAULT_PAYMENT_METHODS = [
  'Cash',
  'bKash',
  'Nagad',
  'Rocket',
  'Bank',
  'Upay',
];

export const DEFAULT_BILL_CATEGORIES = [
  'Rent (Mess/Hall)',
  'Tuition Fee',
  'Semester/Exam Fee',
  'Wi-Fi / Internet',
  'Electricity',
  'Gas & Water',
  'Mobile Postpaid/Recharge',
  'Gym Membership',
  'Course / Club Fee',
  'Other',
];

export const DEFAULT_SAVINGS_GOAL_PRESETS = [
  { title: 'Emergency Fund', category: 'Emergency fund', target: 15000 },
  { title: 'Next Semester Tuition', category: 'University expenses', target: 45000 },
  { title: 'New Laptop / Upgrade', category: 'Laptop/Phone', target: 60000 },
  { title: 'Personal Savings Reserve', category: 'Personal savings', target: 20000 },
  { title: 'IELTS / Tech Certifications', category: 'University expenses', target: 25000 },
  { title: 'Commute / Bike Fund', category: 'Personal savings', target: 35000 },
];

export const DEFAULT_CATEGORY_BUDGETS: { category: string; monthlyLimit: number }[] = [
  { category: 'Food & Groceries', monthlyLimit: 6000 },
  { category: 'Transportation', monthlyLimit: 2000 },
  { category: 'Personal Care', monthlyLimit: 1500 },
  { category: 'Rent (Mess/Hall)', monthlyLimit: 8000 },
  { category: 'Tuition & Semester Fees', monthlyLimit: 10000 },
  { category: 'Tea/Coffee/Snacks', monthlyLimit: 1200 },
  { category: 'Mobile Recharge & Internet', monthlyLimit: 800 },
  { category: 'Entertainment', monthlyLimit: 1000 },
];
