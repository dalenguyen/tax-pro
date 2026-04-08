import { initializeApp, getApps, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';

function initFirebase() {
  if (getApps().length > 0) return getApps()[0];
  const sa = process.env['FIREBASE_SERVICE_ACCOUNT'];
  if (sa) return initializeApp({ credential: cert(JSON.parse(sa)) });
  return initializeApp();
}

initFirebase();
const db = getFirestore();

const TEST_USER_ID = 'test-user';

async function seed() {
  console.log('Seeding Firestore...');

  // 1. Create test user
  await db.collection('users').doc(TEST_USER_ID).set({
    email: 'test@cantaxpro.dev',
    displayName: 'Test User',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 2. Create 2025 tax year
  const tyId = 'ty-2025';
  const taxYear2025Ref = db
    .collection('users')
    .doc(TEST_USER_ID)
    .collection('taxYears')
    .doc(tyId);
  await taxYear2025Ref.set({
    year: 2025,
    notes: 'Imported from Tax 2025.xlsx',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // 3. Rental Property
  const propertyRef = db
    .collection('users')
    .doc(TEST_USER_ID)
    .collection('taxYears')
    .doc(tyId)
    .collection('rentalProperties')
    .doc('prop-keswick');

  await propertyRef.set({
    address: '261 Parkway Ave, Keswick',
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Rental Expenses
  const rentalExpenses = [
    {
      category: 'LAWYER',
      description: 'Jablegal',
      amount: 1174.75,
      date: new Date('2025-01-01'),
      metadata: null,
    },
    {
      category: 'OTHER',
      description: 'ZipCar - Shopping',
      amount: 179.11,
      date: new Date('2025-05-18'),
      metadata: { purpose: 'Shopping' },
    },
    {
      category: 'HYDRO',
      description: 'Hydro',
      amount: 114.93,
      date: new Date('2025-06-30'),
      metadata: null,
    },
    {
      category: 'RENOVATION',
      description: 'Renovation - Material',
      amount: 114.93,
      date: new Date('2025-06-30'),
      metadata: { type: 'Material' },
    },
  ];

  const batch1 = db.batch();
  for (const exp of rentalExpenses) {
    const ref = propertyRef.collection('rentalExpenses').doc();
    batch1.set(ref, {
      ...exp,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }
  await batch1.commit();
  console.log('  ✓ Rental expenses seeded');

  // 4. Business Expenses
  const expensesCol = db
    .collection('users')
    .doc(TEST_USER_ID)
    .collection('taxYears')
    .doc(tyId)
    .collection('expenseEntries');

  const batch2 = db.batch();

  // MailChimp
  batch2.set(expensesCol.doc(), {
    category: 'EMAIL',
    vendor: 'MailChimp',
    description: 'Email service',
    amount: 73.46,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 73.46,
    date: new Date('2025-01-08'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // GCP expenses
  batch2.set(expensesCol.doc(), {
    category: 'GCP',
    vendor: 'Google Cloud',
    description: 'GCP - dale@dalenguyen.me',
    amount: 3.98,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 3.98,
    date: new Date('2025-01-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch2.set(expensesCol.doc(), {
    category: 'GCP',
    vendor: 'Google Cloud',
    description: 'GCP - dale@dalenguyen.me (2)',
    amount: 17.63,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 17.63,
    date: new Date('2025-01-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch2.set(expensesCol.doc(), {
    category: 'GCP',
    vendor: 'Google Cloud',
    description: 'GCP - dungnq@itbox4vn.com',
    amount: 6.32,
    currency: 'USD',
    exchangeRate: 1.36,
    amountCad: 8.6,
    date: new Date('2025-01-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // Phone expenses (monthly)
  const phoneMonths = [
    { month: 1, amount: 25.52 },
    { month: 2, amount: 26.19 },
    { month: 3, amount: 27.04 },
    { month: 4, amount: 26.53 },
    { month: 5, amount: 26.36 },
    { month: 6, amount: 30.51 },
    { month: 7, amount: 31.36 },
    { month: 8, amount: 30.51 },
    { month: 9, amount: 36.27 },
    { month: 10, amount: 39.66 },
    { month: 11, amount: 36.78 },
    { month: 12, amount: 28.76 },
  ];
  for (const p of phoneMonths) {
    batch2.set(expensesCol.doc(), {
      category: 'PHONE',
      vendor: 'Phone Provider',
      description: `Phone - ${new Date(2025, p.month - 1).toLocaleString('en', { month: 'long' })}`,
      amount: p.amount,
      currency: 'CAD',
      exchangeRate: null,
      amountCad: p.amount,
      date: new Date(2025, p.month - 1, 1),
      paymentMethod: null,
      metadata: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Internet expenses (monthly)
  const internetMonths = [
    { month: 1, amount: 56.5 },
    { month: 2, amount: 56.5 },
    { month: 3, amount: 56.5 },
    { month: 4, amount: 56.5 },
    { month: 5, amount: 56.5 },
    { month: 6, amount: 56.5 },
    { month: 7, amount: 62.15 },
    { month: 8, amount: 45.77 },
  ];
  for (const i of internetMonths) {
    batch2.set(expensesCol.doc(), {
      category: 'INTERNET',
      vendor: 'Internet Provider',
      description: `Internet - ${new Date(2025, i.month - 1).toLocaleString('en', { month: 'long' })}`,
      amount: i.amount,
      currency: 'CAD',
      exchangeRate: null,
      amountCad: i.amount,
      date: new Date(2025, i.month - 1, 1),
      paymentMethod: null,
      metadata: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // Ads expenses
  batch2.set(expensesCol.doc(), {
    category: 'ADS',
    vendor: 'Facebook',
    description: 'Facebook Ads',
    amount: 34.24,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 34.24,
    date: new Date('2025-01-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });
  batch2.set(expensesCol.doc(), {
    category: 'ADS',
    vendor: 'Reddit',
    description: 'Reddit Ads',
    amount: 100.0,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 100.0,
    date: new Date('2025-01-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch2.commit();
  console.log('  ✓ Business expenses seeded');

  // Namecheap + hosting (separate batch)
  const batch3 = db.batch();
  const namecheapOrders = [
    { amount: 12.88, date: '2024-01-10', method: 'PayPal' },
    { amount: 38.64, date: '2024-04-02', method: 'Secure Card Payment' },
    { amount: 25.76, date: '2024-05-20', method: 'PayPal' },
    { amount: 2.18, date: '2024-05-22', method: 'PayPal' },
    { amount: 39.18, date: '2024-06-17', method: 'PayPal' },
    { amount: 25.76, date: '2024-07-21', method: 'PayPal' },
    { amount: 12.88, date: '2024-08-26', method: 'PayPal' },
    { amount: 13.68, date: '2024-10-17', method: 'PayPal' },
    { amount: 83.9, date: '2024-11-02', method: 'PayPal' },
    { amount: 25.16, date: '2024-12-10', method: 'PayPal' },
  ];

  for (const order of namecheapOrders) {
    batch3.set(expensesCol.doc(), {
      category: 'NAMECHEAP',
      vendor: 'Namecheap',
      description: 'Domain/hosting order',
      amount: order.amount,
      currency: 'USD',
      exchangeRate: 1.36,
      amountCad: Math.round(order.amount * 1.36 * 100) / 100,
      date: new Date(order.date),
      paymentMethod: order.method,
      metadata: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // HostGator
  batch3.set(expensesCol.doc(), {
    category: 'HOSTING',
    vendor: 'HostGator',
    description: 'Baby Plan - TECHCATER.COM - 3yr renewal',
    amount: 762.55,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 762.55,
    date: new Date('2024-05-01'),
    paymentMethod: null,
    metadata: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch3.commit();
  console.log('  ✓ Namecheap + hosting seeded');

  // 5. Investments (RRSP + TFSA)
  const investmentsCol = db
    .collection('users')
    .doc(TEST_USER_ID)
    .collection('taxYears')
    .doc(tyId)
    .collection('investments');

  const batch4 = db.batch();

  // TFSA
  batch4.set(investmentsCol.doc(), {
    accountType: 'TFSA',
    amount: 2000,
    currency: 'USD',
    exchangeRate: 1.4,
    amountCad: 2800,
    institution: null,
    date: new Date('2025-05-01'),
    roomRemaining: null,
    notes: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  // RRSP entries
  const rrspEntries = [
    { amount: 1000, date: '2026-01-29', rate: 1.4 },
    { amount: 500, date: '2026-02-19', rate: null },
    { amount: 11900, date: '2025-11-25', rate: null },
    { amount: 875.04, date: '2025-12-05', rate: null },
    { amount: 16000, date: '2026-02-26', rate: null },
  ];
  for (const entry of rrspEntries) {
    batch4.set(investmentsCol.doc(), {
      accountType: 'RRSP',
      amount: entry.amount,
      currency: 'CAD',
      exchangeRate: entry.rate,
      amountCad: entry.amount,
      institution: null,
      date: new Date(entry.date),
      roomRemaining: null,
      notes: null,
      createdAt: FieldValue.serverTimestamp(),
      updatedAt: FieldValue.serverTimestamp(),
    });
  }

  // XOAI investment
  batch4.set(investmentsCol.doc(), {
    accountType: 'TFSA',
    amount: 2500,
    currency: 'CAD',
    exchangeRate: null,
    amountCad: 2500,
    institution: 'XOAI',
    date: new Date('2025-12-05'),
    roomRemaining: null,
    notes: null,
    createdAt: FieldValue.serverTimestamp(),
    updatedAt: FieldValue.serverTimestamp(),
  });

  await batch4.commit();
  console.log('  ✓ Investments seeded');

  console.log('Seeding complete!');
}

seed().catch(console.error);
