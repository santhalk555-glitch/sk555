import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "@/components/Navigation";
import Dashboard from "@/components/Dashboard";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";

const Index = () => {
  const { user, loading } = useAuth();
  const [profileLoading, setProfileLoading] = useState(true);
  const [hasProfile, setHasProfile] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        navigate("/auth");
      } else {
        checkUserProfile();
      }
    }
  }, [user, loading, navigate]);

  const checkUserProfile = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error) {
        console.error('Error checking profile:', error);
      }

      if (!profile) {
        // No profile exists, redirect to profile creation
        navigate('/create-profile');
      } else {
        setHasProfile(true);
      }
    } catch (error) {
      console.error('Error checking profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user || !hasProfile) {
    return null;
  }

  return (
    <div className="min-h-screen bg-background">
      <Navigation />
      <Dashboard />
    </div>
  );
};

export default Index;
