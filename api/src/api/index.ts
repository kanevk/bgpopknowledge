import * as serverless from 'serverless-http';
import api from './api';

export const handler = serverless(api);
