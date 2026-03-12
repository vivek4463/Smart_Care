export interface RLState {
  mood: string;
  reward: number;
}

import { supabase } from './supabase';

class RLEngine {
  private qTable: Record<string, Record<string, number>> = {};
  private userId: string | null = null;
  private learningRate = 0.1;
  private discountFactor = 0.9;

  constructor() {
    this.init();
  }

  private async init() {
    if (typeof window !== "undefined") {
      const { data: { user } } = await supabase.auth.getUser();
      this.userId = user?.id || null;
      
      if (this.userId) {
        await this.loadFromSupabase();
      } else {
        const saved = localStorage.getItem("smart_care_rl_data");
        if (saved) this.qTable = JSON.parse(saved);
      }
    }
  }

  private async loadFromSupabase() {
    if (!this.userId) return;
    const { data, error } = await supabase
      .from('user_preferences')
      .select('q_table')
      .eq('user_id', this.userId)
      .single();
    
    if (data && data.q_table) {
      this.qTable = data.q_table as Record<string, Record<string, number>>; // Cast to correct type
    }
  }

  private async save() {
    if (typeof window === "undefined") return;
    
    if (this.userId) {
      await supabase
        .from('user_preferences')
        .upsert({ user_id: this.userId, q_table: this.qTable as any }); // Cast to any for now
    } else {
      localStorage.setItem("smart_care_rl_data", JSON.stringify(this.qTable));
    }
  }

  public async getAction(state: string): Promise<string> { // Made async because it might trigger a save
    if (!this.qTable[state]) {
      this.qTable[state] = {
        "Uplifting": 0,
        "Calming": 0,
        "Grounding": 0,
        "Neutral": 0
      };
      await this.save(); // Save the new state structure
    }

    // Epsilon-greedy or best action
    const actions = Object.keys(this.qTable[state]);
    return actions.reduce((a, b) => this.qTable[state][a] > this.qTable[state][b] ? a : b);
  }

  public update(state: string, action: string, reward: number) {
    if (!this.qTable[state]) return;
    
    const prevValue = this.qTable[state][action];
    this.qTable[state][action] = prevValue + this.learningRate * (reward - prevValue);
    
    if (typeof window !== "undefined") {
      localStorage.setItem("smart_care_rl_data", JSON.stringify(this.qTable));
    }
  }
}

export const rlEngine = new RLEngine();
