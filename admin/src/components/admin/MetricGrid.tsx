import { Check } from 'lucide-react'

export type Metric = {
  label: string
  value: string | number
  detail: string
  healthy?: boolean
}

export function MetricGrid({ metrics }: { metrics: Metric[] }) {
  return (
    <section className="metrics-grid" aria-label="Content summary">
      {metrics.map(metric => (
        <article className="metric" key={metric.label}>
          <div className="metric-label">
            <span>{metric.label}</span>
            {metric.healthy && <Check aria-hidden="true" />}
          </div>
          <strong>{metric.value}</strong>
          <small>{metric.detail}</small>
        </article>
      ))}
    </section>
  )
}
