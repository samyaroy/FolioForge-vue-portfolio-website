import { useId, useState } from 'react'
import { ChevronDown, RefreshCw, X } from 'lucide-react'
import { Popover } from 'radix-ui'
import { useLogoCatalog } from '@/hooks/logoContext'
import { Button, CheckboxField, IconButton, TextField } from '@/components/form'

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
          <div className="logo-selector-search"><TextField aria-label="Search logos" className="h-8 flex-1 border-0 bg-transparent px-1" value={query} onChange={setQuery} placeholder="Search logos" /><IconButton label="Refresh logos" disabled={loading} onClick={refresh}><RefreshCw aria-hidden="true" /></IconButton></div>
          <div className="logo-selector-options">
            {loading && <p>Loading logos...</p>}
            {options.map(logo => <CheckboxField key={logo.value} fieldClassName="logo-selector-option" checked={values.includes(logo.value)} onChange={checked => onChange(checked ? multiple ? [...values, logo.value] : [logo.value] : values.filter(value => value !== logo.value))} label={<><img src={logo.url} alt="" /><span>{logo.name}<small>{logo.source === 'r2' ? 'R2' : logo.source === 'local' ? 'Local draft' : 'Repository'}</small></span></>} />)}
            {!loading && !options.length && <p>No matching logos.</p>}
          </div>
          {error && <p className="logo-catalog-notice">{error}</p>}
        </Popover.Content></Popover.Portal>
      </Popover.Root>
      <div className="logo-selection">{values.map(value => { const logo = logos.find(item => item.value === value); return <span key={value}>{logo && <img src={logo.url} alt="" />}<span>{logo?.name ?? value}</span><IconButton variant="bare" size="none" label={`Remove logo ${value}`} title="Remove logo" onClick={() => onChange(values.filter(item => item !== value))}><X aria-hidden="true" /></IconButton></span> })}</div>
    </div>
  )
}
