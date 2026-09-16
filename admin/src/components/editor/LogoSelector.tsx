import { useId, useState } from 'react'
import { ChevronDown, RefreshCw, X } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useLogoCatalog } from '@/hooks/logoContext'
import { Button } from '@/components/ui/button'

type LogoSelectorProps = { values: string[]; onChange: (values: string[]) => void; multiple?: boolean }

export function LogoSelector({ values, onChange, multiple = true }: LogoSelectorProps) {
  const { logos, loading, error, refresh } = useLogoCatalog()
  const [query, setQuery] = useState('')
  const id = useId()
  const options = logos.filter(logo => `${logo.name} ${logo.value}`.toLowerCase().includes(query.toLowerCase()))
  return (
    <div className="logo-selector">
      <span id={id} className="logo-selector-label">Logos</span>
      <Popover.Root>
        <Popover.Trigger asChild><Button variant="outline" className="logo-selector-trigger" aria-labelledby={id}>{values.length ? `${values.length} selected` : 'Select logos'}<ChevronDown aria-hidden="true" /></Button></Popover.Trigger>
        <Popover.Portal><Popover.Content className="logo-selector-menu" sideOffset={6} align="start" onMouseDown={event => event.stopPropagation()}>
          <div className="logo-selector-search"><input aria-label="Search logos" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search logos" /><Button variant="ghost" size="icon-sm" title="Refresh logos" aria-label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></Button></div>
          <div className="logo-selector-options">
            {loading && <p>Loading logos...</p>}
            {options.map(logo => <label key={logo.value}><input type="checkbox" checked={values.includes(logo.value)} onChange={event => onChange(event.target.checked ? multiple ? [...values, logo.value] : [logo.value] : values.filter(value => value !== logo.value))} /><img src={logo.url} alt="" /><span>{logo.name}<small>{logo.source === 'r2' ? 'R2' : logo.source === 'local' ? 'Local draft' : 'Repository'}</small></span></label>)}
            {!loading && !options.length && <p>No matching logos.</p>}
          </div>
          {error && <p className="logo-catalog-notice">{error}</p>}
        </Popover.Content></Popover.Portal>
      </Popover.Root>
      <div className="logo-selection">{values.map(value => { const logo = logos.find(item => item.value === value); return <span key={value}>{logo && <img src={logo.url} alt="" />}<span>{logo?.name ?? value}</span><button type="button" title="Remove logo" aria-label={`Remove logo ${value}`} onClick={() => onChange(values.filter(item => item !== value))}><X aria-hidden="true" /></button></span> })}</div>
    </div>
  )
}
