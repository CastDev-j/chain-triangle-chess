import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function GameRules() {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Ajedrez Triangular en Cadena - Reglas</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <h3 className="text-lg font-semibold mb-2">Descripción General</h3>
          <p>
            Ajedrez Triangular en Cadena es un juego estratégico donde 2-4 jugadores compiten para formar triángulos
            conectando puntos en una cuadrícula hexagonal. El jugador que obtiene más puntos gana.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Tablero</h3>
          <p>
            El juego se juega en un tablero hexagonal con puntos dispuestos en un patrón hexagonal. Las líneas
            semitransparentes muestran las conexiones posibles. Cada triángulo reclamado se marca con una forma única en
            el color del jugador:
          </p>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li>Jugador 1: Círculo</li>
            <li>Jugador 2: Cuadrado</li>
            <li>Jugador 3: Triángulo</li>
            <li>Jugador 4: Diamante</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Configuración</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Elige el número de jugadores (2-4)</li>
            <li>Selecciona un tamaño de tablero (pequeño, medio o grande)</li>
            <li>A cada jugador se le asigna un color único</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Jugabilidad</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Los jugadores se turnan en sentido horario</li>
            <li>En tu turno, haz clic en dos puntos para crear una línea entre ellos</li>
            <li>Solo se permiten conexiones entre puntos adyacentes (mostradas por líneas semitransparentes)</li>
            <li>
              <strong>
                Cuando un jugador completa el tercer lado (último) de un triángulo, obtiene un punto por ese triángulo
              </strong>
            </li>
            <li>Después de colocar una línea, el turno pasa al siguiente jugador</li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Puntuación</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>
              <strong>Un punto se obtiene por cada triángulo completado</strong> (triángulos formados por tres líneas
              que conectan tres puntos adyacentes)
            </li>
            <li>
              <strong>El jugador que coloca la última línea para completar un triángulo obtiene el punto</strong>, sin
              importar quién colocó las otras líneas
            </li>
            <li>El triángulo reclamado se marca con el color y símbolo del jugador que obtuvo el punto</li>
            <li>
              Un jugador puede obtener múltiples puntos en un solo movimiento si su línea completa varios triángulos
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Victoria</h3>
          <p>
            El juego termina cuando no se pueden colocar más líneas. El jugador con más puntos gana. En caso de empate,
            el juego termina en empate.
          </p>
        </div>

        <div>
          <h3 className="text-lg font-semibold mb-2">Consejos</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Busca oportunidades para completar el tercer lado de triángulos y obtener puntos</li>
            <li>Evita colocar el segundo lado de un triángulo si no puedes colocar también el tercero</li>
            <li>
              Observa cuidadosamente el tablero para identificar triángulos que están a un lado de ser completados
            </li>
            <li>
              A veces es mejor bloquear a un oponente que extender tus propias líneas, especialmente si están cerca de
              completar varios triángulos
            </li>
          </ul>
        </div>
      </CardContent>
    </Card>
  )
}
