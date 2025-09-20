-- Add DELETE policy for friend_requests to allow users to withdraw their sent requests
CREATE POLICY "Users can withdraw their own pending requests" 
ON public.friend_requests 
FOR DELETE 
USING (auth.uid() = sender_id AND status = 'pending');