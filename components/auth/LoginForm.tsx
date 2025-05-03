import { Auth } from "@supabase/auth-ui-react";
import { ThemeSupa } from "@supabase/auth-ui-shared";
import { supabase } from "@/integrations/supabase/client";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";

export const LoginForm = () => {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  
  // Format the URL for Supabase auth
  const redirectUrl = window.location.origin
    .replace(/:\d+/, '') // Remove port number
    .replace(/\/$/, '') // Remove trailing slash
    .replace(/^http:/, 'https:') // Ensure HTTPS
    .replace(/:$/, ''); // Remove trailing colon if present
  
  console.log("Login Form Mounted");
  console.log("Redirect URL:", redirectUrl);
  
  useEffect(() => {
    let mounted = true;

    // Check if user is already logged in
    const checkSession = async () => {
      console.log("Checking session...");
      try {
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        console.log("Session check result:", { session, error: sessionError });
        
        if (!mounted) return;

        if (sessionError) {
          console.error("Session check error:", sessionError);
          setError(sessionError.message);
          return;
        }
        
        if (session) {
          console.log("User already logged in, redirecting to home");
          router.push('/');
        }
      } catch (err) {
        console.error("Error checking session:", err);
        if (mounted) {
          setError("Error checking session status");
        }
      }
    };

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (!mounted) return;
      
      console.log("Auth state changed:", event);
      console.log("Session state:", session);
      
      if (event === 'SIGNED_IN' && session) {
        console.log("Sign in successful, redirecting to home");
        router.push('/');
      }
      
      if (event === 'SIGNED_OUT') {
        console.log("User signed out, clearing error");
        setError(null);
      }
    });

    checkSession();

    return () => {
      mounted = false;
      subscription?.unsubscribe();
    };
  }, [router.push]);

  return (
    <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-lg shadow-md">
      <div>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
          Sign in to your account
        </h2>
      </div>
      {error && (
        <Alert variant="destructive" className="mb-4">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
      <div className="mt-8">
        <Auth
          supabaseClient={supabase}
          appearance={{ 
            theme: ThemeSupa,
            style: {
              button: { background: '#4F46E5', color: 'white' },
              anchor: { color: '#4F46E5' },
              container: { maxWidth: '100%' },
              message: { color: '#EF4444' },
              input: { 
                background: 'white', 
                borderColor: '#E5E7EB',
                borderRadius: '0.375rem',
                padding: '0.5rem 0.75rem'
              },
              label: { color: '#374151' }
            },
            variables: {
              default: {
                colors: {
                  brand: '#4F46E5',
                  brandAccent: '#4338CA',
                }
              }
            }
          }}
          theme="light"
          providers={[]}
          redirectTo={redirectUrl}
        />
      </div>
    </div>
  );
};