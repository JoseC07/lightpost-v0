// Add geo-fencing middleware
export const regionalAccess = (allowedRegions: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    const region = req.headers['cf-ipcountry'] || 'XX';
    if(!allowedRegions.includes(region)) {
      throw new ForbiddenError('Region not supported');
    }
    next();
  }
}; 