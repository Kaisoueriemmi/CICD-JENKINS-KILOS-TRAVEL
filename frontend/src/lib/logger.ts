type LogLevel = 'debug' | 'info' | 'warn' | 'error'

const isDev = process.env.NODE_ENV === 'development'

function log(level: LogLevel, message: string, ...args: any[]) {
  if (!isDev && level === 'debug') return
  const prefix = `[${level.toUpperCase()}]`
  if (level === 'error') {
    console.error(prefix, message, ...args)
  } else if (level === 'warn') {
    console.warn(prefix, message, ...args)
  } else {
    console.log(prefix, message, ...args)
  }
}

export const logger = {
  debug: (message: string, ...args: any[]) => log('debug', message, ...args),
  info:  (message: string, ...args: any[]) => log('info',  message, ...args),
  warn:  (message: string, ...args: any[]) => log('warn',  message, ...args),
  error: (message: string, error?: Error, ...args: any[]) =>
    log('error', message, error?.message ?? '', ...args),
}
