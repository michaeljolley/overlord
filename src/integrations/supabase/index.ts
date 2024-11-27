import { createClient } from '@supabase/supabase-js';

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export  default abstract class Supabase {

    static async addSubGift(username: string, giftedTotal: number) {
        const { data, error } = await supabaseClient
            .from('subgifts')
            .insert({ username, giftedTotal });
        if (error) {
            console.log("Error adding sub gift: ", {error, username, giftedTotal});
        }
    }

    static async getAnnouncements() {
        const { data: announcements, error } = await supabaseClient
            .from('announcements')
            .select('*');
        if (error) {
            console.log("Error getting announcements: ", error);
        }
        return announcements!.filter(a => a.expiration_date === null || new Date(a.expiration_date) > new Date());
    }

}
