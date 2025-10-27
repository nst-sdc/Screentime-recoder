export const validActivity = {
  sessionId: 'test-session-123',
  url: 'https://github.com/test-repo',
  domain: 'github.com',
  tabName: 'GitHub Repository',
  title: 'Test Repository - GitHub',
  action: 'visit',
  duration: 300000, // 5 minutes in milliseconds
  productivityScore: 8
};

export const activeActivity = {
  sessionId: 'active-session-456',
  url: 'https://stackoverflow.com/questions/test',
  domain: 'stackoverflow.com',
  tabName: 'Stack Overflow Question',
  title: 'How to test Node.js applications',
  action: 'start',
  isActive: true,
  productivityScore: 7
};

export const completedActivity = {
  sessionId: 'completed-session-789',
  url: 'https://youtube.com/watch?v=test',
  domain: 'youtube.com',
  tabName: 'YouTube Video',
  title: 'Funny Cat Videos',
  action: 'close',
  isActive: false,
  duration: 1200000, // 20 minutes
  endTime: new Date(),
  productivityScore: 2
};

export const invalidActivity = {
  // Missing required fields
  sessionId: '',
  url: '',
  domain: ''
};

export const activityUpdateData = {
  action: 'update',
  duration: 600000, // 10 minutes
  productivityScore: 6
};
