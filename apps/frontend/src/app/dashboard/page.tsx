import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabaseClient'; // Assuming you have a Supabase client setup in frontend

interface User {
  email: string;
  app_metadata: {
    user_role?: string;
  };
}

export default function DashboardPage() {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState<string[]>([]);
  const [searchHistory, setSearchHistory] = useState<string[]>([]);
  const [recentReports, setRecentReports] = useState<string[]>([]);

  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.push('/auth/login'); // Redirect to login if not authenticated
      } else {
        setUser(user);
        // Placeholder for fetching user preferences and reports
        setFavorites(['Gangnam', 'Seocho']);
        setSearchHistory(['Apgujeong', 'Cheongdam', 'Samseong']);
        setRecentReports(['Weekly Report - July 8', 'Monthly Report - June']);
        setLoading(false);
      }
    }
    checkUser();
  }, [router]);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-between p-24">
      <h1 className="text-4xl font-bold mb-8">Welcome to your Dashboard, {user?.email}!</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Your Favorites</h2>
          {favorites.length > 0 ? (
            <ul>
              {favorites.map((fav, index) => (
                <li key={index}>{fav}</li>
              ))}
            </ul>
          ) : (
            <p>No favorites yet.</p>
          )}
        </div>
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Searches</h2>
          {searchHistory.length > 0 ? (
            <ul>
              {searchHistory.map((search, index) => (
                <li key={index}>{search}</li>
              ))}
            </ul>
          ) : (
            <p>No recent searches.</p>
          )}
        </div>
        <div className="p-4 border rounded-lg shadow-md">
          <h2 className="text-lg font-semibold mb-4">Recent Reports</h2>
          {recentReports.length > 0 ? (
            <ul>
              {recentReports.map((report, index) => (
                <li key={index}>{report}</li>
              ))}
            </ul>
          ) : (
            <p>No recent reports.</p>
          )}
        </div>
      </div>
    </main>
  );
}