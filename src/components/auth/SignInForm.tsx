import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface SignInFormProps {
  onSwitchToSignUp: () => void;
}

export const SignInForm = ({ onSwitchToSignUp }: SignInFormProps) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [showRestoreDialog, setShowRestoreDialog] = useState(false);
  const [deletionInfo, setDeletionInfo] = useState<{ userId: string; expiresAt: string } | null>(null);
  const { signIn, resetPassword } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const { error } = await signIn(email, password);

    if (error) {
      toast({
        title: 'Sign In Failed',
        description: error.message,
        variant: 'destructive',
      });
      setLoading(false);
      return;
    }

    // Check if account is scheduled for deletion
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_deleted, deletion_expires_at')
        .eq('user_id', user.id)
        .single();

      if (profile?.is_deleted && profile?.deletion_expires_at) {
        const expiresAt = new Date(profile.deletion_expires_at);
        const now = new Date();

        if (expiresAt > now) {
          // Account is scheduled for deletion but still within grace period
          setDeletionInfo({
            userId: user.id,
            expiresAt: profile.deletion_expires_at
          });
          setShowRestoreDialog(true);
          setLoading(false);
          return;
        }
      }
    }

    toast({
      title: 'Welcome back!',
      description: 'You have successfully signed in.',
    });
    navigate('/');
    setLoading(false);
  };

  const handleRestoreAccount = async () => {
    if (!deletionInfo) return;
    
    setLoading(true);
    
    try {
      // Restore account by clearing deletion flags
      const { error } = await supabase
        .from('profiles')
        .update({
          is_deleted: false,
          deleted_at: null,
          deletion_expires_at: null
        })
        .eq('user_id', deletionInfo.userId);

      if (error) throw error;

      // Log restoration to audit table
      await supabase
        .from('account_deletion_audit')
        .insert({
          user_id: deletionInfo.userId,
          action: 'account_deletion_cancelled',
          metadata: {
            cancelled_at: new Date().toISOString()
          }
        });

      toast({
        title: 'Account Restored',
        description: 'Your account has been successfully restored!',
      });

      setShowRestoreDialog(false);
      setDeletionInfo(null);
      navigate('/');
    } catch (error: any) {
      toast({
        title: 'Restoration Failed',
        description: error.message || 'Failed to restore account. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleKeepDeletion = async () => {
    setShowRestoreDialog(false);
    await supabase.auth.signOut();
    toast({
      title: 'Account Still Scheduled for Deletion',
      description: 'Your account will be permanently deleted as scheduled.',
    });
  };

  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast({
        title: 'Email Required',
        description: 'Please enter your email address to reset your password.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    const { error } = await resetPassword(email);

    if (error) {
      toast({
        title: 'Reset Failed',
        description: error.message,
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Reset Email Sent',
        description: 'Check your email for password reset instructions.',
      });
      setShowForgotPassword(false);
    }
    setLoading(false);
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
        <CardDescription className="text-center">
          Enter your credentials to access your account
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="pl-10"
                required
              />
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="password">Password</Label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="pl-10 pr-10"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-3 h-4 w-4 text-muted-foreground hover:text-foreground transition-colors"
              >
                {showPassword ? <EyeOff /> : <Eye />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            className="w-full" 
            disabled={loading}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </Button>
          
          <Button
            type="button"
            variant="ghost"
            className="w-full"
            onClick={() => setShowForgotPassword(true)}
          >
            Forgot Password?
          </Button>
        </form>

        {showForgotPassword && (
          <div className="mt-4 p-4 border rounded-lg bg-muted/50">
            <form onSubmit={handleForgotPassword} className="space-y-3">
              <div className="space-y-2">
                <Label htmlFor="reset-email">Email Address</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="reset-email"
                    type="email"
                    placeholder="Enter your email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
              <div className="flex gap-2">
                <Button 
                  type="submit" 
                  className="flex-1" 
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Email'}
                </Button>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setShowForgotPassword(false)}
                >
                  Cancel
                </Button>
              </div>
            </form>
          </div>
        )}

        <div className="text-center">
          <button
            onClick={onSwitchToSignUp}
            className="text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            Don't have an account? Create Account
          </button>
        </div>
      </CardContent>

      {/* Account Restoration Dialog */}
      <AlertDialog open={showRestoreDialog} onOpenChange={setShowRestoreDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-primary" />
              Account Scheduled for Deletion
            </AlertDialogTitle>
            <AlertDialogDescription className="space-y-3">
              <p>
                Your account is currently scheduled for permanent deletion.
              </p>
              {deletionInfo && (
                <p className="font-medium">
                  Deletion Date: {new Date(deletionInfo.expiresAt).toLocaleDateString('en-US', { 
                    year: 'numeric', 
                    month: 'long', 
                    day: 'numeric' 
                  })}
                </p>
              )}
              <p>
                Would you like to restore your account and cancel the deletion?
              </p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleKeepDeletion} disabled={loading}>
              Keep Scheduled for Deletion
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleRestoreAccount} disabled={loading}>
              {loading ? 'Restoring...' : 'Restore My Account'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};