import helmet from 'helmet';

export const securityHeaders = helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: [
        "'self'", 
        (req: any, res: any) => `'nonce-${res.locals.nonce}'` as string
      ]
    }
  }
}); 