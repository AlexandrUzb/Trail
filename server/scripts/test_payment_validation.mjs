// Test Payment Validation API
import express from 'express';
import paymentsRouter from '../routes/payments.js';

const app = express();
app.use(express.json());
app.use('/api/payments', paymentsRouter);

const server = app.listen(0, async () => {
  const port = server.address().port;
  const baseUrl = `http://localhost:${port}/api/payments`;

  let passed = 0;
  let failed = 0;

  async function post(payload) {
    const res = await fetch(`${baseUrl}/submit`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return { status: res.status, data };
  }

  console.log("=== Testing Payment Validation ===");

  // Test 1: Date/Time in transactionReference must be REJECTED
  {
    const res = await post({
      userId: 'test_u1',
      planId: 'pro',
      payerName: 'Ali Valiyev',
      transactionReference: "soat 14:30 da o'tkazdim"
    });
    if (res.status === 400 && res.data.error.includes("Sana yoki vaqt")) {
      console.log("✅ Test 1 Passed: 'soat 14:30 da' successfully rejected");
      passed++;
    } else {
      console.error("❌ Test 1 Failed:", res);
      failed++;
    }
  }

  // Test 2: Kecha date in transactionReference must be REJECTED
  {
    const res = await post({
      userId: 'test_u1',
      planId: 'pro',
      payerName: 'Ali Valiyev',
      transactionReference: "kecha 18000 to'landi"
    });
    if (res.status === 400 && res.data.error.includes("Sana yoki vaqt")) {
      console.log("✅ Test 2 Passed: 'kecha 18000 to'landi' successfully rejected");
      passed++;
    } else {
      console.error("❌ Test 2 Failed:", res);
      failed++;
    }
  }

  // Test 3: Invalid Name (single word or digits) must be REJECTED
  {
    const res = await post({
      userId: 'test_u1',
      planId: 'pro',
      payerName: 'Ali123',
      transactionReference: "TXN123456789"
    });
    if (res.status === 400 && res.data.error.includes("haqiqiy ism va familiyangizni")) {
      console.log("✅ Test 3 Passed: 'Ali123' single word with digits successfully rejected");
      passed++;
    } else {
      console.error("❌ Test 3 Failed:", res);
      failed++;
    }
  }

  // Test 4: Valid Full Name and Valid Transaction ID must SUCCEED
  {
    const res = await post({
      userId: 'test_u1',
      planId: 'pro',
      payerName: 'Zafar Zokirov',
      transactionReference: "PAYME-987654321"
    });
    if (res.status === 200 && res.data.success && res.data.data.transaction_reference === "PAYME-987654321") {
      console.log("✅ Test 4 Passed: Valid name and valid transaction ID succeeded");
      passed++;
    } else {
      console.error("❌ Test 4 Failed:", res);
      failed++;
    }
  }

  console.log(`\nSummary: ${passed} passed, ${failed} failed.`);
  server.close();
});
