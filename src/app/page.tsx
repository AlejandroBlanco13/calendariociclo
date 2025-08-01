"use client"

import { useState, useEffect } from "react"

interface CycleData {
  lastPeriodDate: string
  cycleDuration: number
  periodDuration: number
  jointType: "ankle" | "knee"
  stressValue: number
}

interface DayInfo {
  date: Date
  phase: string
  phaseColor: string
  riskFactor: number
  isHighRisk: boolean
}

export default function MenstrualCycleTracker() {
  const [cycleData, setCycleData] = useState<CycleData>({
    lastPeriodDate: "",
    cycleDuration: 28,
    periodDuration: 5,
    jointType: "knee",
    stressValue: 5,
  })

  const [selectedDay, setSelectedDay] = useState<DayInfo | null>(null)
  const [currentMonth, setCurrentMonth] = useState(new Date())
  const [calendarDays, setCalendarDays] = useState<DayInfo[]>([])

  const phaseInfo = {
    Menstrual: { color: "bg-pink-200", factor: 1.0 },
    "Folicular Temprana": { color: "bg-blue-200", factor: 1.2 },
    "Folicular Tardía": { color: "bg-blue-400", factor: 1.8 }, // Alto riesgo
    Ovulación: { color: "bg-purple-300", factor: 1.3 },
    "Lútea Temprana": { color: "bg-orange-200", factor: 1.1 },
    "Lútea Tardía": { color: "bg-red-200", factor: 1.7 }, // Alto riesgo
  }

  const getPhase = (dayOfCycle: number): string => {
    if (dayOfCycle <= cycleData.periodDuration) return "Menstrual"
    if (dayOfCycle <= 7) return "Folicular Temprana"
    if (dayOfCycle <= 13) return "Folicular Tardía"
    if (dayOfCycle <= 16) return "Ovulación"
    if (dayOfCycle <= 22) return "Lútea Temprana"
    return "Lútea Tardía"
  }

  const calculateRisk = (phase: string, stressValue: number, jointType: string): number => {
    const jointParams = {
      ankle: { sBase: 5.8, sMax: 9 },
      knee: { sBase: 0, sMax: 3 },
    }

    const params = jointParams[jointType as keyof typeof jointParams]
    const E = (stressValue - params.sBase) / (params.sMax - params.sBase)
    const F = phaseInfo[phase as keyof typeof phaseInfo]?.factor || 1.0

    return Math.max(0, Math.min(10, E * F))
  }

  const generateCalendarDays = () => {
    if (!cycleData.lastPeriodDate) return []

    const lastPeriod = new Date(cycleData.lastPeriodDate)
    const firstDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1)
    const lastDay = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 0)
    const startDate = new Date(firstDay)
    startDate.setDate(startDate.getDate() - firstDay.getDay())

    const days: DayInfo[] = []
    const currentDate = new Date(startDate)

    for (let i = 0; i < 42; i++) {
      const daysDiff = Math.floor((currentDate.getTime() - lastPeriod.getTime()) / (1000 * 60 * 60 * 24))
      const dayOfCycle =
        (((daysDiff % cycleData.cycleDuration) + cycleData.cycleDuration) % cycleData.cycleDuration) + 1

      const phase = getPhase(dayOfCycle)
      const riskFactor = phaseInfo[phase as keyof typeof phaseInfo]?.factor || 1.0
      const isHighRisk = phase === "Folicular Tardía" || phase === "Lútea Tardía"

      days.push({
        date: new Date(currentDate),
        phase,
        phaseColor: phaseInfo[phase as keyof typeof phaseInfo]?.color || "bg-gray-100",
        riskFactor,
        isHighRisk,
      })

      currentDate.setDate(currentDate.getDate() + 1)
    }

    return days
  }

  useEffect(() => {
    setCalendarDays(generateCalendarDays())
  }, [cycleData, currentMonth])

  const handleInputChange = (field: keyof CycleData, value: string | number) => {
    setCycleData((prev) => ({
      ...prev,
      [field]: value,
    }))
  }

  const handleDayClick = (day: DayInfo) => {
    setSelectedDay(day)
  }

  const getHighRiskDays = () => {
    return calendarDays.filter((day) => day.isHighRisk && day.date.getMonth() === currentMonth.getMonth())
  }

  const navigateMonth = (direction: number) => {
    setCurrentMonth((prev) => {
      const newDate = new Date(prev)
      newDate.setMonth(newDate.getMonth() + direction)
      return newDate
    })
  }

  const monthNames = [
    "Enero",
    "Febrero",
    "Marzo",
    "Abril",
    "Mayo",
    "Junio",
    "Julio",
    "Agosto",
    "Septiembre",
    "Octubre",
    "Noviembre",
    "Diciembre",
  ]

  const dayNames = ["Dom", "Lun", "Mar", "Mié", "Jue", "Vie", "Sáb"]

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 p-4">
      <div className="max-w-7xl mx-auto">
        <header className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-2">Seguimiento del Ciclo Menstrual</h1>
          <p className="text-gray-600">Monitoreo de fases hormonales y cálculo de riesgo de lesión</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Formulario de entrada */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
              <h2 className="text-xl font-semibold text-gray-800 mb-4">Datos del Ciclo</h2>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Fecha del último período</label>
                  <input
                    type="date"
                    value={cycleData.lastPeriodDate}
                    onChange={(e) => handleInputChange("lastPeriodDate", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración del ciclo (días)</label>
                  <input
                    type="number"
                    min="21"
                    max="35"
                    value={cycleData.cycleDuration}
                    onChange={(e) => handleInputChange("cycleDuration", Number.parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Duración del período (días)</label>
                  <input
                    type="number"
                    min="3"
                    max="8"
                    value={cycleData.periodDuration}
                    onChange={(e) => handleInputChange("periodDuration", Number.parseInt(e.target.value))}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Tipo de articulación</label>
                  <select
                    value={cycleData.jointType}
                    onChange={(e) => handleInputChange("jointType", e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  >
                    <option value="knee">Rodilla</option>
                    <option value="ankle">Tobillo</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Estrés biomecánico (0-10)</label>
                  <input
                    type="range"
                    min="0"
                    max="10"
                    step="0.1"
                    value={cycleData.stressValue}
                    onChange={(e) => handleInputChange("stressValue", Number.parseFloat(e.target.value))}
                    className="w-full"
                  />
                  <div className="text-center text-sm text-gray-600 mt-1">{cycleData.stressValue}</div>
                </div>
              </div>
            </div>

            {/* Panel de resumen */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Resumen del Mes</h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-gray-600">Días de alto riesgo:</span>
                  <span className="font-semibold text-red-600">{getHighRiskDays().length}</span>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-700 mb-2">Fechas de alto riesgo:</h4>
                  <div className="space-y-1 max-h-32 overflow-y-auto">
                    {getHighRiskDays().map((day, index) => (
                      <div key={index} className="text-xs bg-red-50 px-2 py-1 rounded">
                        {day.date.getDate()}/{day.date.getMonth() + 1} - {day.phase}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-yellow-50 p-3 rounded-lg">
                  <h4 className="text-sm font-medium text-yellow-800 mb-1">Recomendación</h4>
                  <p className="text-xs text-yellow-700">
                    Durante los días de alto riesgo (Folicular Tardía y Lútea Tardía), considera reducir la intensidad
                    del entrenamiento y enfócate en ejercicios de fortalecimiento y flexibilidad.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Calendario */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-xl shadow-lg p-6">
              <div className="flex justify-between items-center mb-6">
                <button
                  onClick={() => navigateMonth(-1)}
                  className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                >
                  ←
                </button>
                <h2 className="text-xl font-semibold text-gray-800">
                  {monthNames[currentMonth.getMonth()]} {currentMonth.getFullYear()}
                </h2>
                <button onClick={() => navigateMonth(1)} className="p-2 hover:bg-gray-100 rounded-lg transition-colors">
                  →
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {dayNames.map((day) => (
                  <div key={day} className="text-center text-sm font-medium text-gray-500 py-2">
                    {day}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {calendarDays.map((day, index) => {
                  const isCurrentMonth = day.date.getMonth() === currentMonth.getMonth()
                  const isToday = day.date.toDateString() === new Date().toDateString()

                  return (
                    <button
                      key={index}
                      onClick={() => handleDayClick(day)}
                      className={`
                        aspect-square p-2 text-sm rounded-lg transition-all hover:scale-105
                        ${isCurrentMonth ? day.phaseColor : "bg-gray-50 text-gray-400"}
                        ${isToday ? "ring-2 ring-purple-500" : ""}
                        ${day.isHighRisk && isCurrentMonth ? "ring-2 ring-red-400" : ""}
                        ${selectedDay?.date.toDateString() === day.date.toDateString() ? "ring-2 ring-blue-500" : ""}
                      `}
                    >
                      <div className="font-medium">{day.date.getDate()}</div>
                      {isCurrentMonth && day.isHighRisk && <div className="text-xs text-red-600 font-bold">!</div>}
                    </button>
                  )
                })}
              </div>

              {/* Leyenda */}
              <div className="mt-6 grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                {Object.entries(phaseInfo).map(([phase, info]) => (
                  <div key={phase} className="flex items-center space-x-2">
                    <div className={`w-3 h-3 rounded ${info.color}`}></div>
                    <span className="text-gray-600">{phase}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Panel de información del día seleccionado */}
          <div className="lg:col-span-1">
            {selectedDay && typeof selectedDay.riskFactor === "number" && !isNaN(selectedDay.riskFactor) && (
              <div className="bg-white rounded-xl shadow-lg p-6">
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Información del Día</h3>
                <div className="space-y-4">
                  <div>
                    <span className="text-sm text-gray-600">Fecha:</span>
                    <div className="font-medium">
                      {selectedDay.date.getDate()}/{selectedDay.date.getMonth() + 1}/{selectedDay.date.getFullYear()}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Fase:</span>
                    <div
                      className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${selectedDay.phaseColor}`}
                    >
                      {selectedDay.phase}
                    </div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Factor hormonal:</span>
                    <div className="font-medium">{selectedDay.riskFactor?.toFixed(1)}x</div>
                  </div>
                  <div>
                    <span className="text-sm text-gray-600">Riesgo estimado:</span>
                    <div className="font-medium">
                      {calculateRisk(selectedDay.phase, cycleData.stressValue, cycleData.jointType).toFixed(2)}/10
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-gradient-to-r from-green-400 to-red-500 h-2 rounded-full transition-all"
                        style={{
                          width: `${(calculateRisk(selectedDay.phase, cycleData.stressValue, cycleData.jointType) / 10) * 100}%`,
                        }}
                      ></div>
                    </div>
                  </div>
                  {selectedDay.isHighRisk && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3">
                      <div className="flex items-center space-x-2">
                        <span className="text-red-600 font-bold">⚠️</span>
                        <span className="text-sm font-medium text-red-800">Día de alto riesgo</span>
                      </div>
                      <p className="text-xs text-red-700 mt-1">Considera modificar la intensidad del entrenamiento</p>
                    </div>
                  )}
                  <div className="bg-blue-50 p-3 rounded-lg">
                    <h4 className="text-sm font-medium text-blue-800 mb-1">Cálculo del riesgo:</h4>
                    <div className="text-xs text-blue-700 space-y-1">
                      <div>E = (S - Sbase) / (Smax - Sbase)</div>
                      <div>Riesgo = E × F</div>
                      <div className="mt-2">
                        <strong>Donde:</strong>
                        <br />S = {cycleData.stressValue}
                        <br />F = {selectedDay.riskFactor?.toFixed(1)}
                        <br />
                        {cycleData.jointType === "ankle" ? "Sbase=5.8, Smax=9" : "Sbase=0, Smax=3"}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
