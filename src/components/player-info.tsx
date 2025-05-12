import { Card, CardContent, CardHeader, CardTitle } from "@/src/components/ui/card"
import { Trophy } from "lucide-react"

type PlayerInfoProps = {
  playerCount: number
  currentPlayer: number
  scores: number[]
  playerColors: string[]
  gameOver: boolean
  winner: number | null
}

export default function PlayerInfo({
  playerCount,
  currentPlayer,
  scores,
  playerColors,
  gameOver,
  winner,
}: PlayerInfoProps) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-center">Jugadores</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {Array.from({ length: playerCount }).map((_, index) => (
          <div
            key={index}
            className={`flex items-center justify-between p-3 rounded-md ${
              currentPlayer === index && !gameOver ? "bg-muted" : ""
            } ${winner === index ? "bg-muted/50" : ""}`}
          >
            <div className="flex items-center gap-3">
              <div
                className="w-8 h-8 flex items-center justify-center rounded-full"
                style={{ backgroundColor: playerColors[index] + "30" }}
              >
                {index === 0 && (
                  <div className="w-5 h-5 rounded-full" style={{ backgroundColor: playerColors[index] }} />
                )}
                {index === 1 && <div className="w-5 h-5" style={{ backgroundColor: playerColors[index] }} />}
                {index === 2 && (
                  <div
                    className="w-0 h-0"
                    style={{
                      borderLeft: "5px solid transparent",
                      borderRight: "5px solid transparent",
                      borderBottom: `10px solid ${playerColors[index]}`,
                    }}
                  />
                )}
                {index === 3 && (
                  <div
                    className="w-5 h-5"
                    style={{
                      backgroundColor: playerColors[index],
                      transform: "rotate(45deg)",
                    }}
                  />
                )}
              </div>
              <span className="font-medium">Jugador {index + 1}</span>
              {winner === index && <Trophy className="h-5 w-5 text-yellow-500" />}
            </div>
            <div className="text-xl font-bold">{scores[index]/2}</div>
          </div>
        ))}

        {!gameOver && (
          <div className="text-center text-sm font-medium text-muted-foreground mt-4 p-2 bg-muted/30 rounded-md">
            Turno del Jugador {currentPlayer + 1}
          </div>
        )}

        {gameOver && (
          <div className="text-center font-medium mt-4 p-2 bg-muted/30 rounded-md">
            {winner !== null ? `¡Jugador ${winner + 1} gana!` : "¡Juego terminado en empate!"}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
