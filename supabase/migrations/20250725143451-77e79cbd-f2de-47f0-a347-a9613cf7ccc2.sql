
-- Create a table to track SafariGuide AI visits
CREATE TABLE public.safari_guide_visits (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_session VARCHAR(255),
  ip_address VARCHAR(45),
  user_agent TEXT,
  visited_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create an index on visited_at for performance
CREATE INDEX idx_safari_guide_visits_visited_at ON public.safari_guide_visits(visited_at);

-- Enable RLS (though we'll allow public access for this tracking)
ALTER TABLE public.safari_guide_visits ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert visits (for tracking)
CREATE POLICY "Allow public to insert visits" 
  ON public.safari_guide_visits 
  FOR INSERT 
  WITH CHECK (true);

-- Create policy to allow reading for counting (public read access)
CREATE POLICY "Allow public to read visits for counting" 
  ON public.safari_guide_visits 
  FOR SELECT 
  USING (true);
