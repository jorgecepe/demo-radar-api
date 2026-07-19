import './globals.css';

export const metadata = {
  title: 'Radar Chile',
  description: 'Indicadores de Chile con el resumen del día escrito por Claude.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
