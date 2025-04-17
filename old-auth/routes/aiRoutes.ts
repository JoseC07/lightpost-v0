// Prototype AI endpoint
router.post('/moderate', 
  authenticateJWT,
  requireRole([UserRole.ADMIN]),
  aiModerationHandler
); 