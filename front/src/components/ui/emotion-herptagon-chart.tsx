import { useEffect, useRef } from 'react'
import Chart from 'chart.js/auto'

interface EmotionData {
  labels: string[]
  values: number[]
}

interface EmotionHeptagonChartProps {
  data: EmotionData
}

export function EmotionHeptagonChart({ data }: EmotionHeptagonChartProps) {
  const chartRef = useRef<HTMLCanvasElement | null>(null)
  const chartInstance = useRef<Chart | null>(null)

  useEffect(() => {
    if (chartInstance.current) {
      chartInstance.current.destroy()
    }

    const ctx = chartRef.current?.getContext('2d')
    if (!ctx) return

    chartInstance.current = new Chart(ctx, {
      type: 'radar',
      data: {
        labels: data.labels,
        datasets: [
          {
            label: '감정 분석',
            data: data.values,
            fill: true,
            backgroundColor: 'rgba(59, 130, 246, 0.2)',
            borderColor: 'rgb(59, 130, 246)',
            pointBackgroundColor: 'rgb(59, 130, 246)',
            pointBorderColor: '#fff',
            pointHoverBackgroundColor: '#fff',
            pointHoverBorderColor: 'rgb(59, 130, 246)'
          }
        ]
      },
      options: {
        scales: {
          r: {
            angleLines: {
              display: true
            },
            suggestedMin: 0,
            suggestedMax: Math.max(...data.values)
          }
        },
        plugins: {
          legend: {
            display: false
          }
        }
      }
    })

    return () => {
      if (chartInstance.current) {
        chartInstance.current.destroy()
      }
    }
  }, [data])

  return <canvas ref={chartRef} style={{ maxHeight: '400px', maxWidth: '400px' }}></canvas>
}
