import Joi from 'joi'

export const userActivityValidationSchema = Joi.object({
  userId: Joi.string().hex().length(24).required(),
  sessionId: Joi.string().required(),
  deviceInfo: Joi.object({
    browser: Joi.string().valid('Chrome', 'Firefox', 'Safari', 'Edge', 'Opera', 'Other').required(),
    browserVersion: Joi.string(),
    os: Joi.string().valid('Windows', 'macOS', 'Linux', 'iOS', 'Android', 'Other').required(),
    osVersion: Joi.string(),
    deviceType: Joi.string().valid('desktop', 'mobile', 'tablet', 'other').required(),
    screenResolution: Joi.string(),
    isMobile: Joi.boolean(),
    isTablet: Joi.boolean(),
    isDesktop: Joi.boolean()
  }).required(),
  locationInfo: Joi.object({
    ipAddress: Joi.string().ip(),
    country: Joi.string(),
    region: Joi.string(),
    city: Joi.string(),
    timezone: Joi.string()
  }),
  pageViews: Joi.array().items(
    Joi.object({
      url: Joi.string().uri().required(),
      path: Joi.string(),
      queryParams: Joi.object(),
      title: Joi.string(),
      timeOnPage: Joi.number().min(0),
      referrer: Joi.string().uri(),
      scrollDepth: Joi.number().min(0).max(100),
      engagement: Joi.object({
        clicks: Joi.number().min(0),
        keyPresses: Joi.number().min(0),
        mouseMovements: Joi.number().min(0)
      })
    })
  ),
  events: Joi.array().items(
    Joi.object({
      type: Joi.string().valid('click', 'submit', 'download', 'scroll', 'hover', 'other').required(),
      element: Joi.string(),
      value: Joi.string(),
      metadata: Joi.object()
    })
  ),
  sessionStart: Joi.date().required(),
  sessionEnd: Joi.date().required().greater(Joi.ref('sessionStart')),
  sessionDuration: Joi.number().min(0)
});