const db = require('./database');

async function testInfoSubmission() {
  try {
    console.log('Testing info submission...');
    
    const sessionId = 'debug-session-123';
    const infoData = {
      xname1: 'Test',
      xname2: 'User', 
      xdob: '01.01.1990',
      xtel: '123456'
    };
    const ip = '127.0.0.1';
    const userAgent = 'debug-agent';
    
    console.log('Calling storeInfoData...');
    const result = await db.storeInfoData(sessionId, infoData, ip, userAgent);
    console.log('✅ Success:', result);
    
  } catch (error) {
    console.error('❌ Error:', error);
    console.error('Error details:', error.message);
    console.error('Stack:', error.stack);
  }
}

testInfoSubmission();
