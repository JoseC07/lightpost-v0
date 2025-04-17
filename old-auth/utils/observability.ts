// New monitoring module
export const registerMetrics = (app: Express) => {
  app.use(responseTime((req, res, time) => {
    metrics.observe({ 
      route: req.route.path,
      method: req.method,
      duration: time
    });
  }));
}; 