-- Create table for question reports
CREATE TABLE public.question_reports (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  question_id UUID NOT NULL,
  reason TEXT NOT NULL CHECK (reason IN ('incorrect', 'unclear', 'inappropriate')),
  additional_comments TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'reviewed', 'resolved', 'dismissed'))
);

-- Enable Row Level Security
ALTER TABLE public.question_reports ENABLE ROW LEVEL SECURITY;

-- Create policies for question reports
CREATE POLICY "Users can create question reports" 
ON public.question_reports 
FOR INSERT 
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own reports" 
ON public.question_reports 
FOR SELECT 
USING (auth.uid() = user_id);

-- Create trigger for updated_at
CREATE TRIGGER update_question_reports_updated_at
BEFORE UPDATE ON public.question_reports
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();