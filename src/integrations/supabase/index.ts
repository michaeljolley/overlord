import { createClient } from '@supabase/supabase-js';
import { StreamEvent } from '../../types/streamEvent';
import { User } from '../../types/user';

const SUPABASE_URL = process.env.SUPABASE_URL || "";
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "";

const supabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

export default abstract class Supabase {
    static async getAnnouncements() {
        const { data: announcements, error } = await supabaseClient
            .from('announcements')
            .select('*');
        if (error) {
            console.log("Error getting announcements: ", error);
        }
        return announcements?.filter(a => a.expiration_date === null || new Date(a.expiration_date) > new Date());
    }

		static async getStreamEvents(streamDate: string) : Promise<StreamEvent[]> {
			const { data: events, error } = await supabaseClient
				.from('streamEvents')
				.select('*')
				.eq('streamDate', streamDate);
			if (error) {
				console.log("Error getting stream events: ", error);
			}
			return events as StreamEvent[];
		}

		static async getUser(login: string) : Promise<User | null> {
			const { data: user, error } = await supabaseClient
				.from('streamUsers')
				.select('*')
				.eq('login', login)
				.single();
			if (error) {
				console.log("Error getting user: ", error);
				return null;
			}
			return user;
		}

		static async addUser(user: User) : Promise<User | null> {
			const { data, error } = await supabaseClient
				.from('streamUsers')
				.upsert(user)
				.select()
				.single();
			if (error) {
				console.log("Error adding user: ", error);
				return null;
			}
			return data as User;
		}

		static async addStreamEvent(event: StreamEvent) : Promise<StreamEvent | null> {
			const { data, error } = await supabaseClient
				.from('streamEvents')
				.insert(event)
				.select()
				.single();
			if (error) {
				console.log("Error adding stream event: ", error);
				return null;
			}
			return data as StreamEvent;
		}

}
