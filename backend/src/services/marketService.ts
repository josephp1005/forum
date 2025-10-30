import { createClient } from '@supabase/supabase-js';
import config from '../config/config.js';

const supabase = createClient(config.supabaseUrl, config.supabaseServiceRoleKey);

// Lightweight markets for home page (minimal index data)
export const fetchMarkets = async () => {
    const { data, error } = await supabase
        .from('markets')
        .select(`
            *,
            index: indices(
                current_price,
                last_update,
                update_frequency
            )
        `)
        .eq('is_available', true);

    if (error) {
        throw new Error(`Error fetching markets: ${error.message}`);
    }

    return data;
}

// Full market data including complete index information
export const fetchFullMarket = async (marketId: number) => {
    const { data, error } = await supabase
        .from('markets')
        .select('*, index: indices(*)')
        .eq('id', marketId)
        .single();

    if (error) {
        throw new Error(`Error fetching market ${marketId}: ${error.message}`);
    }

    return data;
}