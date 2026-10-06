import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Boul. — Le copilote de votre boulangerie',
  description: 'Pilotez ventes, stocks, production, coûts et rentabilité.',
  manifest: '/manifest.json',
};
export default function RootLayout({children}:{children:React.ReactNode}){
  return <html lang="fr"><body>{children}</body></html>;
}
