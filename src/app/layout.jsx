import './globals.css';
import { AuthProvider } from '@/context/AuthContext';

export const metadata = {
  title: 'JustSciify — Science Learning Platform for Kids | Class 3-5',
  description: 'NCERT aligned science learning for Class 3, 4 & 5 kids in India. Fun quizzes, interactive lessons, martial-arts belt rewards & more!',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className="scroll-smooth">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#03050F" />
      </head>
      <body style={{ background: '#03050F' }}>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
