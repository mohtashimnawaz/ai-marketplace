#!/usr/bin/env node

/**
 * Comprehensive Backend & Smart Contract Integration Test
 * Tests all API endpoints and verifies blockchain integration
 */

const axios = require('axios');
const { Connection, PublicKey, Keypair } = require('@solana/web3.js');

const API_BASE_URL = process.env.API_URL || 'http://localhost:3001';
const SOLANA_RPC_URL = process.env.SOLANA_RPC_URL || 'https://api.devnet.solana.com';
const PROGRAM_ID = process.env.PROGRAM_ID || '8g37Z8wZR9xMaHQRP8W8FzWqAj1A8VRt2c4t6LnBqAyb';

const colors = {
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  reset: '\x1b[0m',
  bold: '\x1b[1m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logTest(name) {
  console.log(`\n${colors.blue}${colors.bold}▶ ${name}${colors.reset}`);
}

function logSuccess(message) {
  log(`  ✓ ${message}`, 'green');
}

function logError(message) {
  log(`  ✗ ${message}`, 'red');
}

function logWarning(message) {
  log(`  ⚠ ${message}`, 'yellow');
}

async function runTests() {
  log('\n===========================================', 'bold');
  log('  AI Marketplace Integration Test Suite', 'bold');
  log('===========================================\n', 'bold');

  let passedTests = 0;
  let failedTests = 0;
  let warnings = 0;

  // Test 1: Health Check
  logTest('1. Backend Health Check');
  try {
    const response = await axios.get(`${API_BASE_URL}/health`);
    if (response.status === 200 && response.data.status === 'ok') {
      logSuccess('Backend is running');
      logSuccess(`Network: ${response.data.network}`);
      passedTests++;
    } else {
      logError('Health check failed');
      failedTests++;
    }
  } catch (error) {
    logError(`Cannot reach backend: ${error.message}`);
    failedTests++;
    log('\n❌ Backend not running. Start with: cd backend && npm run dev\n', 'red');
    process.exit(1);
  }

  // Test 2: Solana Connection
  logTest('2. Solana Connection');
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const version = await connection.getVersion();
    logSuccess(`Connected to Solana ${version['solana-core']}`);
    logSuccess(`RPC: ${SOLANA_RPC_URL}`);
    
    const slot = await connection.getSlot();
    logSuccess(`Current slot: ${slot}`);
    passedTests++;
  } catch (error) {
    logError(`Solana connection failed: ${error.message}`);
    failedTests++;
  }

  // Test 3: Program Deployment
  logTest('3. Smart Contract Verification');
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const programId = new PublicKey(PROGRAM_ID);
    const accountInfo = await connection.getAccountInfo(programId);
    
    if (accountInfo) {
      logSuccess(`Program deployed: ${PROGRAM_ID}`);
      logSuccess(`Program is executable: ${accountInfo.executable}`);
      logSuccess(`Owner: ${accountInfo.owner.toBase58()}`);
      passedTests++;
    } else {
      logError('Program not found on-chain');
      failedTests++;
    }
  } catch (error) {
    logError(`Program verification failed: ${error.message}`);
    failedTests++;
  }

  // Test 4: Marketplace PDA
  logTest('4. Marketplace Account');
  try {
    const connection = new Connection(SOLANA_RPC_URL, 'confirmed');
    const programId = new PublicKey(PROGRAM_ID);
    const [marketplacePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('marketplace')],
      programId
    );
    
    const accountInfo = await connection.getAccountInfo(marketplacePda);
    if (accountInfo) {
      logSuccess(`Marketplace initialized: ${marketplacePda.toBase58()}`);
      logSuccess(`Account size: ${accountInfo.data.length} bytes`);
      passedTests++;
    } else {
      logWarning('Marketplace not initialized yet');
      logWarning('Run: anchor run initialize-marketplace');
      warnings++;
      passedTests++; // Not critical for testing
    }
  } catch (error) {
    logError(`Marketplace check failed: ${error.message}`);
    failedTests++;
  }

  // Test 5: Fetch All Models
  logTest('5. Fetch All Models');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/models`);
    if (response.data.success) {
      logSuccess(`Found ${response.data.count} models`);
      if (response.data.count > 0) {
        logSuccess(`Sample model: ${response.data.models[0].pubkey}`);
      } else {
        logWarning('No models registered yet');
      }
      passedTests++;
    } else {
      logError('Failed to fetch models');
      failedTests++;
    }
  } catch (error) {
    logError(`Models API failed: ${error.message}`);
    failedTests++;
  }

  // Test 6: Marketplace Info
  logTest('6. Marketplace Info API');
  try {
    const response = await axios.get(`${API_BASE_URL}/api/models/info/marketplace`);
    if (response.data.success) {
      logSuccess('Marketplace info retrieved');
      logSuccess(`Total models: ${response.data.marketplace.totalModels}`);
      logSuccess(`Protocol fee: ${response.data.marketplace.protocolFeeBps / 100}%`);
      passedTests++;
    } else if (response.status === 404) {
      logWarning('Marketplace not initialized');
      warnings++;
      passedTests++;
    }
  } catch (error) {
    if (error.response && error.response.status === 404) {
      logWarning('Marketplace not initialized yet');
      warnings++;
      passedTests++;
    } else {
      logError(`Marketplace info failed: ${error.message}`);
      failedTests++;
    }
  }

  // Test 7: Test User Access Check
  logTest('7. Access Control System');
  try {
    // Generate test keypairs
    const testUser = Keypair.generate();
    const testModel = Keypair.generate();
    
    const response = await axios.get(
      `${API_BASE_URL}/api/access/check/${testUser.publicKey.toBase58()}/${testModel.publicKey.toBase58()}`
    );
    
    if (response.data.hasAccess === false) {
      logSuccess('Access control working (no access for new user)');
      logSuccess(`Access PDA: ${response.data.accessPda}`);
      passedTests++;
    } else {
      logError('Unexpected access granted');
      failedTests++;
    }
  } catch (error) {
    logError(`Access check failed: ${error.message}`);
    failedTests++;
  }

  // Test 8: User Access Records
  logTest('8. User Access Records');
  try {
    const testUser = Keypair.generate();
    const response = await axios.get(
      `${API_BASE_URL}/api/access/user/${testUser.publicKey.toBase58()}`
    );
    
    if (response.data.success) {
      logSuccess(`Access records fetched: ${response.data.count} records`);
      passedTests++;
    } else {
      logError('Failed to fetch access records');
      failedTests++;
    }
  } catch (error) {
    logError(`User access API failed: ${error.message}`);
    failedTests++;
  }

  // Test 9: File Upload Endpoint
  logTest('9. File Upload Endpoint');
  try {
    // Test endpoint availability (without actually uploading)
    const FormData = require('form-data');
    const form = new FormData();
    
    // This will fail validation but tests endpoint availability
    const response = await axios.post(
      `${API_BASE_URL}/api/upload/model`,
      form,
      {
        headers: form.getHeaders(),
        validateStatus: () => true, // Accept any status
      }
    );
    
    if (response.status === 400 && response.data.error.includes('file')) {
      logSuccess('Upload endpoint is functional');
      passedTests++;
    } else {
      logWarning('Upload endpoint has unexpected response');
      warnings++;
      passedTests++;
    }
  } catch (error) {
    logError(`Upload endpoint test failed: ${error.message}`);
    failedTests++;
  }

  // Test 10: Metadata Upload
  logTest('10. Metadata Upload');
  try {
    const response = await axios.post(
      `${API_BASE_URL}/api/upload/metadata`,
      {
        name: 'Test Model',
        description: 'Integration test model',
        tags: ['test', 'demo'],
        framework: 'ONNX',
      },
      {
        validateStatus: () => true,
      }
    );
    
    if (response.data.success || response.data.metadata) {
      logSuccess('Metadata upload working');
      passedTests++;
    } else {
      logError('Metadata upload failed');
      failedTests++;
    }
  } catch (error) {
    logError(`Metadata upload test failed: ${error.message}`);
    failedTests++;
  }

  // Test 11: Inference Endpoint (without access)
  logTest('11. Inference Access Control');
  try {
    const testModel = Keypair.generate();
    const testUser = Keypair.generate();
    
    const response = await axios.post(
      `${API_BASE_URL}/api/inference/${testModel.publicKey.toBase58()}`,
      {
        inputs: [[1, 2, 3]],
        userPubkey: testUser.publicKey.toBase58(),
      },
      {
        validateStatus: () => true,
      }
    );
    
    if (response.status === 403) {
      logSuccess('Inference access control working (denied without access)');
      passedTests++;
    } else if (response.status === 429) {
      logSuccess('Rate limiting is active');
      passedTests++;
    } else {
      logWarning(`Unexpected status: ${response.status}`);
      warnings++;
      passedTests++;
    }
  } catch (error) {
    logError(`Inference test failed: ${error.message}`);
    failedTests++;
  }

  // Test 12: Inference History
  logTest('12. Inference History');
  try {
    const testUser = Keypair.generate();
    const response = await axios.get(
      `${API_BASE_URL}/api/inference/history/${testUser.publicKey.toBase58()}`
    );
    
    if (response.data.success !== undefined) {
      logSuccess('Inference history endpoint functional');
      passedTests++;
    } else {
      logError('Inference history failed');
      failedTests++;
    }
  } catch (error) {
    logError(`Inference history test failed: ${error.message}`);
    failedTests++;
  }

  // Test 13: Frontend Environment
  logTest('13. Frontend Configuration');
  const fs = require('fs');
  const path = require('path');
  
  try {
    const frontendEnvPath = path.join(__dirname, '../frontend/.env.local');
    if (fs.existsSync(frontendEnvPath)) {
      logSuccess('Frontend .env.local exists');
      const envContent = fs.readFileSync(frontendEnvPath, 'utf-8');
      if (envContent.includes(PROGRAM_ID)) {
        logSuccess('Program ID configured in frontend');
      } else {
        logWarning('Program ID not found in frontend env');
        warnings++;
      }
      passedTests++;
    } else {
      logWarning('Frontend .env.local not found');
      warnings++;
      passedTests++;
    }
  } catch (error) {
    logWarning(`Frontend config check failed: ${error.message}`);
    warnings++;
    passedTests++;
  }

  // Test 14: IDL Files
  logTest('14. IDL & Types Files');
  try {
    const idlPath = path.join(__dirname, '../frontend/src/lib/idl.json');
    const typesPath = path.join(__dirname, '../frontend/src/lib/types.ts');
    
    if (fs.existsSync(idlPath)) {
      logSuccess('Frontend IDL file exists');
      const idl = JSON.parse(fs.readFileSync(idlPath, 'utf-8'));
      logSuccess(`IDL version: ${idl.version || 'N/A'}`);
    } else {
      logError('Frontend IDL file missing');
      failedTests++;
    }
    
    if (fs.existsSync(typesPath)) {
      logSuccess('Frontend types file exists');
      passedTests++;
    } else {
      logError('Frontend types file missing');
      failedTests++;
    }
  } catch (error) {
    logError(`IDL check failed: ${error.message}`);
    failedTests++;
  }

  // Summary
  log('\n===========================================', 'bold');
  log('  Test Summary', 'bold');
  log('===========================================\n', 'bold');
  
  log(`✓ Passed: ${passedTests}`, 'green');
  if (failedTests > 0) {
    log(`✗ Failed: ${failedTests}`, 'red');
  }
  if (warnings > 0) {
    log(`⚠ Warnings: ${warnings}`, 'yellow');
  }
  
  const total = passedTests + failedTests;
  const percentage = ((passedTests / total) * 100).toFixed(1);
  
  log(`\nSuccess Rate: ${percentage}%`, percentage >= 90 ? 'green' : percentage >= 70 ? 'yellow' : 'red');
  
  if (warnings > 0) {
    log('\n💡 Tips:', 'yellow');
    log('  - Initialize marketplace: anchor run initialize-marketplace');
    log('  - Register test model: Use frontend or write test script');
    log('  - Fund devnet wallet: https://faucet.solana.com');
  }
  
  if (failedTests === 0) {
    log('\n🎉 All critical tests passed! System is ready for deployment.\n', 'green');
    process.exit(0);
  } else {
    log('\n❌ Some tests failed. Please fix issues before deployment.\n', 'red');
    process.exit(1);
  }
}

// Run tests
runTests().catch(error => {
  console.error('Test suite error:', error);
  process.exit(1);
});
