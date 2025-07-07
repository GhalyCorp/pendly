const { initializeApp, getApps } = require('firebase-admin/app');
const { getFirestore } = require('firebase-admin/firestore');

// Initialize Firebase Admin
if (!getApps().length) {
  initializeApp();
}

const db = getFirestore();

async function testDonation() {
  try {
    console.log('🧪 Starting donation test...');
    
    // Create a test business
    const businessData = {
      businessName: 'Test Business',
      email: 'test@example.com',
      campaignTitle: 'Test Campaign',
      rewardTiers: [
        {
          minAmount: 1000, // $10.00
          coupon: 'Free Coffee'
        }
      ],
      donated: 0,
      createdAt: new Date()
    };
    
    const businessRef = await db.collection('businesses').add(businessData);
    const businessId = businessRef.id;
    console.log('✅ Created test business:', businessId);
    
    // Create a test donation
    const donationData = {
      amount: 2000, // $20.00
      email: 'testdonor@example.com',
      name: 'Test Donor',
      businessAmount: 1800, // $18.00 (after platform fee)
      platformFee: 200, // $2.00
      timestamp: new Date(),
      paymentIntentId: 'pi_test_' + Date.now(),
      status: 'completed'
    };
    
    const donationRef = await businessRef.collection('donations').add(donationData);
    console.log('✅ Created test donation:', donationRef.id);
    
    console.log('📧 Firebase function should now trigger and send emails...');
    console.log('📧 Check your email for: testdonor@example.com');
    console.log('📧 Business email: test@example.com');
    
    // Wait a moment for the function to process
    setTimeout(() => {
      console.log('✅ Test completed! Check your email inbox.');
    }, 5000);
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  }
}

testDonation(); 