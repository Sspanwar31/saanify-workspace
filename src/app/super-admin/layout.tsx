'use client'

export default function SuperAdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f9ff', minHeight: '100vh' }}>
      <div style={{ marginBottom: '20px', borderBottom: '2px solid blue', paddingBottom: '10px' }}>
         <h2 style={{ fontSize: '20px', fontWeight: 'bold', color: 'blue' }}>
            Super Admin Layout (Test Mode)
         </h2>
         <p>AuthGuard & Sidebar are temporarily removed.</p>
      </div>
      
      {/* Page Content Yahan Aayega */}
      {children}
    </div>
  )
}
