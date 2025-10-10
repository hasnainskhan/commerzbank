const { PrismaClient } = require('@prisma/client');

async function testDatabase() {
  const prisma = new PrismaClient();
  
  try {
    console.log('Testing database connection...');
    
    // Test basic connection
    await prisma.$connect();
    console.log('✅ Database connected successfully');
    
    // Test creating a session
    const session = await prisma.userSession.create({
      data: {
        sessionId: 'test-session-123',
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      }
    });
    console.log('✅ Session created:', session);
    
    // Test creating info data
    const infoData = await prisma.infoData.create({
      data: {
        sessionId: 'test-session-123',
        xname1: 'Test',
        xname2: 'User',
        xdob: '01.01.1990',
        xtel: '123456',
        ip: '127.0.0.1',
        userAgent: 'test-agent'
      }
    });
    console.log('✅ Info data created:', infoData);
    
    // Clean up
    await prisma.infoData.delete({ where: { sessionId: 'test-session-123' } });
    await prisma.userSession.delete({ where: { sessionId: 'test-session-123' } });
    console.log('✅ Test data cleaned up');
    
  } catch (error) {
    console.error('❌ Database test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testDatabase();
