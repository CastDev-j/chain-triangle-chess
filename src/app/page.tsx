import ChainTriangleChess from "@/src/components/chain-triangle-chess"

export default function Home() {
  return (
    <main className="container mx-auto px-4 py-8 flex flex-col items-center min-h-screen">
      <h1 className="text-3xl font-bold text-center mb-6">Ajedrez Triangular en Cadena</h1>
      <ChainTriangleChess />
    </main>
  )
}
