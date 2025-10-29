import { createClient } from '@supabase/supabase-js';
import config from '../config/config.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

export const fetchMarkets = async () => {
    const { data, error } = await supabase
        .from('markets')
        .select('*, index: indices(*)');

    if (error) {
        throw new Error(`Error fetching markets: ${error.message}`);
    }

    return data;
}