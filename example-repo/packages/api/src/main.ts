/* eslint-disable no-console */

import 'dmno/load'; // import first to load global DMNO_CONFIG

import Koa from 'koa';
import bodyParser from 'koa-bodyparser';
import chalk from 'chalk';
import cors from '@koa/cors';

import { router, routesLoaded } from './routes';
import { ApiError, errorHandlingMiddleware } from './lib/api-error';
import { httpRequestLoggingMiddleware } from './lib/request-logger';
// import { loadAuthMiddleware } from "./services/auth.service";
import { detectClientIp } from './lib/client-ip';
import { CustomAppContext, CustomAppState } from './custom-state';

export const app = new Koa<CustomAppState, CustomAppContext>();

app.proxy = true;

// include this one early since it can fire off and be done when handling OPTIONS requests
app.use(cors({ credentials: true }));
app.use(detectClientIp);
app.use(httpRequestLoggingMiddleware);
app.use(errorHandlingMiddleware);
app.use(bodyParser());
// app.use(loadAuthMiddleware);

// routes - must be last after all middlewares
app.use(router.routes());

// catch-all middelware after routes handles no route match (404)
app.use((_ctx, _next) => {
  throw new ApiError('NotFound', 'NoMatchingURL', 'No matching URL found');
});

if (process.env.NODE_ENV !== 'test') {
  // not strictly necessary, but this way we fail right away if we can't connect to db
  try {
    // await prisma.$connect();
    await routesLoaded;
    app.listen(DMNO_CONFIG.PORT);
    console.log(chalk.green.bold(`API available at ${DMNO_CONFIG.API_URL}`));
    // await prisma.$disconnect();
  } catch (err) {
    console.log('ERROR!', err);
    // await prisma.$disconnect();
  }
}

// process.on('SIGINT', () => {
//   console.log('SIGINT!');
//   process.exit(1);
// });
