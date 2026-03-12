import { supabase } from "./supabase";

export interface SessionRecord {
  id?: string;
  user_id: string;
  face_emotion: string;
  voice_emotion: string;
  text_sentiment: string;
  heart_rate: number;
  final_emotion: string;
  confidence: number;
  created_at?: string;
}

export const sessionService = {
  async saveSession(session: SessionRecord) {
    const { data, error } = await supabase
      .from('sessions')
      .insert([session])
      .select();

    if (error) {
      console.error("Error saving session:", error);
      return { success: false, error };
    }
    return { success: true, data };
  },

  async getRecentSessions(userId: string, limit = 10) {
    const { data, error } = await supabase
      .from('sessions')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error) {
      console.error("Error fetching sessions details:", {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint
      });
      return [];
    }
    return data;
  },

  async getAnalyticsData(userId: string) {
    // Basic aggregation for demonstration
    const { data, error } = await supabase
      .from('sessions')
      .select('final_emotion, created_at')
      .eq('user_id', userId)
      .order('created_at', { ascending: true });

    if (error) {
      console.error("Error fetching analytics:", error);
      return [];
    }
    return data;
  }
};
