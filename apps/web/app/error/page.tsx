export default async function ErrorPage({ searchParams }: { searchParams: Promise<{ message?: string }> }) {
  const params = await searchParams
  return (
    <main style={{ maxWidth: 600, margin: '60px auto', padding: 24 }}>
      <h1>Something went wrong</h1>
      <p>{params.message ?? 'Please try again.'}</p>
    </main>
  )
}
