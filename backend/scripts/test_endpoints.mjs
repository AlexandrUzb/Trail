async function testAll() {
  console.log('Testing endpoints...');

  // 1. Health
  const healthRes = await fetch('http://localhost:5000/api/health');
  console.log('Health status:', healthRes.status, await healthRes.json());

  // 2. Payment status
  const statusRes = await fetch('http://localhost:5000/api/payments/status/demo_user_123');
  console.log('Payment status code:', statusRes.status, await statusRes.json());

  // 3. Payment submit instant activation test
  const payRes = await fetch('http://localhost:5000/api/payments/submit', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'test_user_instant',
      planId: 'pro',
      payerName: 'Valijon Aliyev',
      transactionReference: 'PAYME-9876543210'
    })
  });
  console.log('Payment submit status:', payRes.status, await payRes.json());

  // 4. Verify updated user plan
  const verifyRes = await fetch('http://localhost:5000/api/payments/status/test_user_instant');
  console.log('Instant activated plan:', await verifyRes.json());

  // 5. Chat API test with unlimited flag
  const chatRes = await fetch('http://localhost:5000/api/chat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      userId: 'test_user_instant',
      message: 'Transport vositasidan xavfsizlik kamarini taqmasdan foydalanish jarimasi qancha?'
    })
  });
  console.log('Chat API status:', chatRes.status);
  const chatJson = await chatRes.json();
  console.log('Chat response sample:', chatJson.data?.text?.slice(0, 200));
  console.log('Source article:', chatJson.data?.sourceArticle);
  console.log('Source url:', chatJson.data?.sourceUrl);
}

testAll();
