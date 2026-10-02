import type { ReactNode } from 'react'

type PageHeaderProps = {
  title: string
  description: ReactNode
  actions?: ReactNode
  /** A small note under the actions, such as a SaveStatusHint. */
  status?: ReactNode
}

export function PageHeader({ title, description, actions, status }: PageHeaderProps) {
  const buttons = actions && <div className="page-actions">{actions}</div>
  return (
    <div className="page-heading">
      <div>
        <h1>{title}</h1>
        <p>{description}</p>
      </div>
      {status ? <div className="page-action-stack">{buttons}{status}</div> : buttons}
    </div>
  )
}
