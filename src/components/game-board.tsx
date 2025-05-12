"use client"

import { useRef, useEffect } from "react"
import { useMobile } from "@/src/hooks/use-mobile"
import type { Edge, Triangle } from "./chain-triangle-chess"

type GameBoardProps = {
  boardSize: number
  edges: Edge[]
  triangles: Triangle[]
  selectedPeg: number | null
  currentPlayer: number
  playerColors: string[]
  onPegClick: (pegId: number) => void
  validConnections: [number, number][] // Añadido para recibir las conexiones válidas
}

export default function GameBoard({
  boardSize,
  edges,
  triangles,
  selectedPeg,
  currentPlayer,
  playerColors,
  onPegClick,
  validConnections,
}: GameBoardProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const isMobile = useMobile()

  const calculatePegPositions = (size: number, canvasWidth: number, canvasHeight: number) => {
    const positions: [number, number][] = []
    const pegMap: { [key: string]: number } = {}
    const padding = 80 

    const centerX = canvasWidth / 2
    const centerY = canvasHeight / 2

    const radius = Math.min(canvasWidth, canvasHeight) / 2 - padding

    const pegDistance = radius / size

    let pegIndex = 0

    for (let q = -size + 1; q < size; q++) {
      const r1 = Math.max(-size + 1, -q - size + 1)
      const r2 = Math.min(size - 1, -q + size - 1)

      for (let r = r1; r <= r2; r++) {
        if (Math.max(Math.abs(q), Math.abs(r), Math.abs(-q - r)) < size) {
          const x = centerX + pegDistance * ((3 / 2) * q)
          const y = centerY + pegDistance * ((Math.sqrt(3) / 2) * q + Math.sqrt(3) * r)

          positions.push([x, y])

          pegMap[`${q},${r}`] = pegIndex
          pegIndex++
        }
      }
    }

    return { positions, pegMap }
  }

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    const container = canvas.parentElement
    if (container) {
      canvas.width = container.clientWidth
      canvas.height = container.clientWidth * 1.1
    }

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    const { positions, pegMap } = calculatePegPositions(boardSize, canvas.width, canvas.height)

    drawHexagonalGrid(ctx, positions, validConnections)

    triangles.forEach((triangle) => {
      const color = playerColors[triangle.player]

      ctx.beginPath()
      const [x1, y1] = positions[triangle.pegs[0]]
      const [x2, y2] = positions[triangle.pegs[1]]
      const [x3, y3] = positions[triangle.pegs[2]]

      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.lineTo(x3, y3)
      ctx.closePath()

      ctx.fillStyle = color + "60" 
      ctx.fill()

      const centerX = (x1 + x2 + x3) / 3
      const centerY = (y1 + y2 + y3) / 3

      ctx.beginPath()
      ctx.arc(centerX, centerY, 12, 0, Math.PI * 2)
      ctx.fillStyle = "rgba(255, 255, 255, 0.7)"
      ctx.fill()

      switch (triangle.player) {
        case 0: // Primer jugador - círculo
          ctx.beginPath()
          ctx.arc(centerX, centerY, 10, 0, Math.PI * 2)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()
          break
        case 1: // Segundo jugador - cuadrado
          ctx.beginPath()
          ctx.rect(centerX - 8, centerY - 8, 16, 16)
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()
          break
        case 2: // Tercer jugador - triángulo
          ctx.beginPath()
          ctx.moveTo(centerX, centerY - 10)
          ctx.lineTo(centerX + 10, centerY + 5)
          ctx.lineTo(centerX - 10, centerY + 5)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()
          break
        case 3: // Cuarto jugador - diamante
          ctx.beginPath()
          ctx.moveTo(centerX, centerY - 10)
          ctx.lineTo(centerX + 10, centerY)
          ctx.lineTo(centerX, centerY + 10)
          ctx.lineTo(centerX - 10, centerY)
          ctx.closePath()
          ctx.fillStyle = color
          ctx.fill()
          ctx.strokeStyle = "#fff"
          ctx.lineWidth = 2
          ctx.stroke()
          break
      }
    })

    edges.forEach((edge) => {
      const [x1, y1] = positions[edge.from]
      const [x2, y2] = positions[edge.to]

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.strokeStyle = playerColors[edge.player]
      ctx.lineWidth = 3
      ctx.stroke()
    })

    positions.forEach(([x, y], index) => {
      ctx.beginPath()

      const isSelected = selectedPeg === index

      if (isSelected) {
        ctx.fillStyle = playerColors[currentPlayer]
        ctx.arc(x, y, 8, 0, Math.PI * 2)
      } else {
        ctx.fillStyle = "#888"
        ctx.arc(x, y, 6, 0, Math.PI * 2)
      }

      ctx.fill()

      // ctx.fillStyle = '#000'
      // ctx.font = '10px Arial'
      // ctx.fillText(index.toString(), x - 3, y + 3)
    })

    const handleCanvasClick = (event: MouseEvent) => {
      const rect = canvas.getBoundingClientRect()
      const x = event.clientX - rect.left
      const y = event.clientY - rect.top

      // Encontrar el punto más cercano
      let closestPeg = -1
      let closestDistance = Number.POSITIVE_INFINITY

      positions.forEach(([pegX, pegY], index) => {
        const distance = Math.sqrt((pegX - x) ** 2 + (pegY - y) ** 2)
        if (distance < closestDistance && distance < 20) {
          closestDistance = distance
          closestPeg = index
        }
      })

      if (closestPeg !== -1) {
        onPegClick(closestPeg)
      }
    }

    canvas.addEventListener("click", handleCanvasClick)

    return () => {
      canvas.removeEventListener("click", handleCanvasClick)
    }
  }, [boardSize, edges, triangles, selectedPeg, currentPlayer, playerColors, onPegClick, validConnections])

  const drawHexagonalGrid = (
    ctx: CanvasRenderingContext2D,
    positions: [number, number][],
    validConnections: [number, number][],
  ) => {
    ctx.strokeStyle = "rgba(200, 200, 200, 0.2)"
    ctx.lineWidth = 1

    validConnections.forEach(([i, j]) => {
      const [x1, y1] = positions[i]
      const [x2, y2] = positions[j]

      ctx.beginPath()
      ctx.moveTo(x1, y1)
      ctx.lineTo(x2, y2)
      ctx.stroke()
    })

    ctx.strokeStyle = "rgba(150, 150, 150, 0.5)"
    ctx.lineWidth = 2

    const outerPegs = findOuterPegs(positions)

    ctx.beginPath()
    const [startX, startY] = positions[outerPegs[0]]
    ctx.moveTo(startX, startY)

    for (let i = 1; i < outerPegs.length; i++) {
      const [x, y] = positions[outerPegs[i]]
      ctx.lineTo(x, y)
    }

    ctx.closePath()
    ctx.stroke()
  }

  const findOuterPegs = (positions: [number, number][]) => {
    const centerX = positions.reduce((sum, [x, _]) => sum + x, 0) / positions.length
    const centerY = positions.reduce((sum, [_, y]) => sum + y, 0) / positions.length

    const sectors = 6
    const sectorSize = (2 * Math.PI) / sectors
    const outerPegs: number[] = []

    for (let sector = 0; sector < sectors; sector++) {
      const sectorStart = sector * sectorSize
      const sectorEnd = (sector + 1) * sectorSize

      let maxDistance = -1
      let farthestPeg = -1

      positions.forEach(([x, y], index) => {
        const angle = Math.atan2(y - centerY, x - centerX)
        const normalizedAngle = angle < 0 ? angle + 2 * Math.PI : angle

        if (normalizedAngle >= sectorStart && normalizedAngle < sectorEnd) {
          const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2)

          if (distance > maxDistance) {
            maxDistance = distance
            farthestPeg = index
          }
        }
      })

      if (farthestPeg !== -1) {
        outerPegs.push(farthestPeg)
      }
    }

    return outerPegs
  }

  useEffect(() => {
    const handleResize = () => {
      const canvas = canvasRef.current
      if (!canvas) return

      const container = canvas.parentElement
      if (container) {
        canvas.width = container.clientWidth
        canvas.height = container.clientWidth * 1.1
      }
    }

    window.addEventListener("resize", handleResize)
    return () => window.removeEventListener("resize", handleResize)
  }, [])

  return (
    <div className="w-full aspect-[10/11] bg-muted/20 rounded-lg overflow-hidden">
      <canvas ref={canvasRef} className="w-full h-full" />
    </div>
  )
}
