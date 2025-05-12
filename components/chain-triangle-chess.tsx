"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import GameBoard from "./game-board"
import PlayerInfo from "./player-info"
import GameRules from "./game-rules"

const PLAYER_COLORS = ["#FF5555", "#55FF55", "#5555FF", "#FFAA55"]

export type Edge = {
  from: number
  to: number
  player: number
}

export type Triangle = {
  pegs: number[]
  player: number
}

export default function ChainTriangleChess() {
  const [gameStarted, setGameStarted] = useState(false)
  const [playerCount, setPlayerCount] = useState(2)
  const [currentPlayer, setCurrentPlayer] = useState(0)
  const [scores, setScores] = useState<number[]>([])
  const [boardSize, setBoardSize] = useState(4)
  const [edges, setEdges] = useState<Edge[]>([])
  const [triangles, setTriangles] = useState<Triangle[]>([])
  const [selectedPeg, setSelectedPeg] = useState<number | null>(null)
  const [gameOver, setGameOver] = useState(false)
  const [winner, setWinner] = useState<number | null>(null)
  const [validConnections, setValidConnections] = useState<[number, number][]>([])
  const [potentialTriangles, setPotentialTriangles] = useState<number[][][]>([])
  const [debugMode, setDebugMode] = useState(false) 

  const startGame = () => {
    setGameStarted(true)
    setCurrentPlayer(0)
    setScores(Array(playerCount).fill(0))
    setEdges([])
    setTriangles([])
    setSelectedPeg(null)
    setGameOver(false)
    setWinner(null)

    const { connections, triangles } = calculateValidConnectionsAndTriangles(boardSize)
    setValidConnections(connections)
    setPotentialTriangles(triangles)
  }

  const calculateValidConnectionsAndTriangles = (size: number) => {
    const pegMap: { [key: string]: number } = {}
    const positions: [number, number][] = []
    let pegIndex = 0

    for (let q = -size + 1; q < size; q++) {
      const r1 = Math.max(-size + 1, -q - size + 1)
      const r2 = Math.min(size - 1, -q + size - 1)

      for (let r = r1; r <= r2; r++) {
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) < size) {
          pegMap[`${q},${r}`] = pegIndex
          positions.push([q, r])
          pegIndex++
        }
      }
    }

    const connections: [number, number][] = []

    for (let i = 0; i < positions.length; i++) {
      for (let j = i + 1; j < positions.length; j++) {
        const [q1, r1] = positions[i]
        const [q2, r2] = positions[j]

        const distance = Math.max(Math.abs(q1 - q2), Math.abs(r1 - r2), Math.abs(q1 + r1 - (q2 + r2)))

        if (distance === 1) {
          connections.push([i, j])
        }
      }
    }

    const trianglesList: number[][][] = []

    for (let i = 0; i < connections.length; i++) {
      for (let j = i + 1; j < connections.length; j++) {
        const [a, b] = connections[i]
        const [c, d] = connections[j]

        if (a === c) {
          if (connections.some(([x, y]) => (x === b && y === d) || (x === d && y === b))) {
            trianglesList.push(
              [
                [a, b],
                [c, d],
                [b, d],
              ].sort((x, y) => x[0] - y[0] || x[1] - y[1]),
            )
          }
        } else if (a === d) {
          if (connections.some(([x, y]) => (x === b && y === c) || (x === c && y === b))) {
            trianglesList.push(
              [
                [a, b],
                [d, c],
                [b, c],
              ].sort((x, y) => x[0] - y[0] || x[1] - y[1]),
            )
          }
        } else if (b === c) {
          if (connections.some(([x, y]) => (x === a && y === d) || (x === d && y === a))) {
            trianglesList.push(
              [
                [b, a],
                [c, d],
                [a, d],
              ].sort((x, y) => x[0] - y[0] || x[1] - y[1]),
            )
          }
        } else if (b === d) {
          if (connections.some(([x, y]) => (x === a && y === c) || (x === c && y === a))) {
            trianglesList.push(
              [
                [b, a],
                [d, c],
                [a, c],
              ].sort((x, y) => x[0] - y[0] || x[1] - y[1]),
            )
          }
        }
      }
    }

    const uniqueTriangles = trianglesList.filter(
      (triangle, index, self) =>
        index ===
        self.findIndex(
          (t) =>
            t[0][0] === triangle[0][0] &&
            t[0][1] === triangle[0][1] &&
            t[1][0] === triangle[1][0] &&
            t[1][1] === triangle[1][1] &&
            t[2][0] === triangle[2][0] &&
            t[2][1] === triangle[2][1],
        ),
    )

    return { connections, triangles: uniqueTriangles }
  }

  const handlePegClick = (pegId: number) => {
    if (gameOver) return

    if (selectedPeg === null) {
      setSelectedPeg(pegId)
      return
    }

    if (selectedPeg === pegId) {
      setSelectedPeg(null)
      return
    }

    tryCreateEdge(selectedPeg, pegId)
  }

  const tryCreateEdge = (from: number, to: number) => {
    const edgeExists = edges.some((e) => (e.from === from && e.to === to) || (e.from === to && e.to === from))

    if (edgeExists) {
      setSelectedPeg(null)
      return
    }

    if (!isValidConnection(from, to)) {
      setSelectedPeg(null)
      return
    }

    const newEdge: Edge = {
      from: Math.min(from, to),
      to: Math.max(from, to),
      player: currentPlayer,
    }

    const newEdges = [...edges, newEdge]
    setEdges(newEdges)

    const completedTriangles = checkForCompletedTriangles(newEdges, from, to)

    if (completedTriangles.length > 0) {
      const newTriangles = [...triangles, ...completedTriangles]
      setTriangles(newTriangles)

      const newScores = [...scores]
      newScores[currentPlayer] += completedTriangles.length
      setScores(newScores)

      if (debugMode) {
        console.log("Triángulos completados:", completedTriangles)
        console.log("Nuevas puntuaciones:", newScores)
      }

    }

    setCurrentPlayer((currentPlayer + 1) % playerCount)

    // Limpiar selección
    setSelectedPeg(null)
  }

  // Verificar si una conexión es válida (debe estar en la lista de conexiones válidas)
  const isValidConnection = (from: number, to: number): boolean => {
    return validConnections.some(([a, b]) => (a === from && b === to) || (a === to && b === from))
  }

  // Verificar si una nueva línea completa algún triángulo
  const checkForCompletedTriangles = (allEdges: Edge[], peg1: number, peg2: number): Triangle[] => {
    const completedTriangles: Triangle[] = []
    const minPeg = Math.min(peg1, peg2)
    const maxPeg = Math.max(peg1, peg2)

    // Buscar en los triángulos potenciales
    potentialTriangles.forEach((triangle) => {
      // Verificar si la nueva línea es parte de este triángulo
      const isPartOfTriangle = triangle.some(([a, b]) => a === minPeg && b === maxPeg)

      if (isPartOfTriangle) {
        // Verificar si las otras dos líneas ya existen
        const otherEdges = triangle.filter(([a, b]) => !(a === minPeg && b === maxPeg))

        const allEdgesExist = otherEdges.every(([a, b]) =>
          allEdges.some((e) => (e.from === a && e.to === b) || (e.from === b && e.to === a)),
        )

        if (allEdgesExist) {
          // Encontrar los tres puntos del triángulo
          const points = new Set<number>()
          triangle.forEach(([a, b]) => {
            points.add(a)
            points.add(b)
          })

          // Convertir el conjunto a un array y ordenar
          const trianglePegs = Array.from(points).sort((a, b) => a - b)

          // Verificar si este triángulo ya existe
          const triangleExists = triangles.some((t) => t.pegs.every((p, i) => p === trianglePegs[i]))

          if (!triangleExists) {
            completedTriangles.push({
              pegs: trianglePegs,
              player: currentPlayer, // El jugador actual obtiene el punto por completar el último lado
            })
          }
        }
      }
    })

    return completedTriangles
  }

  // Verificar si el juego ha terminado
  useEffect(() => {
    if (!gameStarted || edges.length === 0) return

    // El juego termina cuando se han colocado todas las líneas posibles
    if (edges.length >= validConnections.length) {
      endGame()
    }
  }, [edges, gameStarted, validConnections])

  // Finalizar el juego y determinar el ganador
  const endGame = () => {
    setGameOver(true)

    // Encontrar el jugador con la puntuación más alta
    let maxScore = -1
    let maxPlayer = -1
    let tie = false

    scores.forEach((score, player) => {
      if (score > maxScore) {
        maxScore = score
        maxPlayer = player
        tie = false
      } else if (score === maxScore) {
        tie = true
      }
    })

    if (tie) {
      setWinner(null)
    } else {
      setWinner(maxPlayer)
    }
  }

  // Forzar fin del juego (para pruebas o cuando los jugadores deciden terminar)
  const forceEndGame = () => {
    endGame()
  }

  return (
    <div className="w-full max-w-5xl">
      <Tabs defaultValue="game" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="game">Juego</TabsTrigger>
          <TabsTrigger value="rules">Reglas</TabsTrigger>
        </TabsList>

        <TabsContent value="game" className="space-y-4">
          {!gameStarted ? (
            <Card>
              <CardHeader>
                <CardTitle>Configuración del Juego</CardTitle>
                <CardDescription>Configura tu partida de Ajedrez Triangular en Cadena</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Número de Jugadores</label>
                  <Select
                    value={playerCount.toString()}
                    onValueChange={(value) => setPlayerCount(Number.parseInt(value))}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona número de jugadores" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="2">2 Jugadores</SelectItem>
                      <SelectItem value="3">3 Jugadores</SelectItem>
                      <SelectItem value="4">4 Jugadores</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium">Tamaño del Tablero</label>
                  <Select value={boardSize.toString()} onValueChange={(value) => setBoardSize(Number.parseInt(value))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Selecciona tamaño del tablero" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="3">Pequeño (3 puntos por lado)</SelectItem>
                      <SelectItem value="4">Medio (4 puntos por lado)</SelectItem>
                      <SelectItem value="5">Grande (5 puntos por lado)</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button onClick={startGame} className="w-full">
                  Iniciar Juego
                </Button>
              </CardFooter>
            </Card>
          ) : (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row gap-4">
                <div className="w-full md:w-3/4">
                  <Card>
                    <CardHeader className="pb-2">
                      <CardTitle className="text-center">Ajedrez Triangular en Cadena</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <GameBoard
                        boardSize={boardSize}
                        edges={edges}
                        triangles={triangles}
                        selectedPeg={selectedPeg}
                        currentPlayer={currentPlayer}
                        playerColors={PLAYER_COLORS}
                        onPegClick={handlePegClick}
                        validConnections={validConnections}
                      />
                    </CardContent>
                  </Card>
                </div>

                <div className="w-full md:w-1/4">
                  <PlayerInfo
                    playerCount={playerCount}
                    currentPlayer={currentPlayer}
                    scores={scores}
                    playerColors={PLAYER_COLORS}
                    gameOver={gameOver}
                    winner={winner}
                  />
                </div>
              </div>

              <div className="flex justify-between">
                <Button
                  variant="outline"
                  onClick={() => {
                    setGameStarted(false)
                  }}
                >
                  Nuevo Juego
                </Button>

                {!gameOver && (
                  <Button variant="secondary" onClick={forceEndGame}>
                    Terminar Juego
                  </Button>
                )}
              </div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="rules">
          <GameRules />
        </TabsContent>
      </Tabs>
    </div>
  )
}
