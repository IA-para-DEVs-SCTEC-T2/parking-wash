import { createClient } from '@supabase/supabase-js';
import ws from 'ws';
import { config } from '../config/env';

export const supabase = createClient(config.supabaseUrl, config.supabaseKey, {
  realtime: {
    transport: ws,
  },
});
