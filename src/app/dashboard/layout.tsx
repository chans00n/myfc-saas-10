import React from 'react';
import DesktopNav from '../../components/layout/DesktopNav';
import Container from '../../components/layout/Container';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <DesktopNav />
      <div className="flex-1">
        <Container className="py-8">
          {children}
        </Container>
      </div>
    </div>
  );
} 