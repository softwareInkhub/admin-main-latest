import { AuthProvider } from '@/context/AuthContext';
import { NotificationProvider } from '@/context/NotificationContext';
import { Toaster } from 'react-hot-toast';
import './globals.css';

export const metadata = {
  title: 'Influnder',
  description: 'Influencer Management Platform',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          <NotificationProvider>
            {children}
            <Toaster 
              position="top-right"
              toastOptions={{
                duration: 3000,
                style: {
                  background: '#1e2532',
                  color: '#fff',
                },
                success: {
                  iconTheme: {
                    primary: '#4ade80',
                    secondary: '#1e2532',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#ef4444',
                    secondary: '#1e2532',
                  },
                },
              }}
            />
          </NotificationProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
