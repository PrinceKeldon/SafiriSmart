
import { supabase } from '@/integrations/supabase/client';

export const trackSafariGuideVisit = async () => {
  try {
    // Generate a simple session ID based on timestamp + random
    const sessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const { error } = await supabase
      .from('safari_guide_visits')
      .insert([
        {
          user_session: sessionId,
          ip_address: null, // We can't easily get IP on client side
          user_agent: navigator.userAgent,
          visited_at: new Date().toISOString()
        }
      ]);

    if (error) {
      console.error('Error tracking safari guide visit:', error);
    }
  } catch (error) {
    console.error('Error in trackSafariGuideVisit:', error);
  }
};
