type LogLevel = 'info' | 'warn' | 'error'

interface LogContext {
  [key: string]: string | number | boolean | null | undefined
}

function log(level: LogLevel, message: string, context: LogContext = {}) {
  const entry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    service: 'leaky-wallet',
    env: process.env.NODE_ENV,
    ...context,
  }
  // JSON lines — captured by Vercel log drain / Axiom automatically
  if (level === 'error') {
    console.error(JSON.stringify(entry))
  } else if (level === 'warn') {
    console.warn(JSON.stringify(entry))
  } else {
    console.log(JSON.stringify(entry))
  }
}

export const logger = {
  info: (message: string, context?: LogContext) => log('info', message, context),
  warn: (message: string, context?: LogContext) => log('warn', message, context),
  error: (message: string, context?: LogContext) => log('error', message, context),
}
