import { ArrowDown, ArrowUp, X } from 'lucide-react'
import { CheckboxField, IconButton, SelectField, SwitchField, TextField } from '@/components/form'
import { bulletsOf, candidates, move, unnamedCount, updateItem, updateSection } from '@/cv/editing'
import { describeRef, wording, type ResolveContext } from '@/cv/resolve'
import {
  DEFAULT_SECTION_TITLES, HEADER_FIELD_KEYS, ROW_SECTION_LISTS, SECTION_KINDS, isRowSection, templateStyles,
  type CvPreset, type ItemSectionKind, type PresetItem, type PresetSection, type RowSectionKind, type WordedRow,
} from '@/cv/schema'
import { templates } from '@/cv/templates'

/**
 * The preset editor: the builder's left column. Every control edits a draft of
 * the preset, which the builder resolves and renders as it changes; nothing is
 * saved until the builder's Save.
 */

type EditorProps = { preset: CvPreset; onChange: (next: CvPreset) => void; context: ResolveContext }

const KIND_LABELS: Record<string, string> = {
  summary: 'Summary', education: 'Education', experience: 'Experience', projects: 'Projects', publications: 'Publications',
  certifications: 'Certifications', positions: 'Positions', awards: 'Awards', interests: 'Interests', skills: 'Skills',
}

function clip(text: string, length = 110) {
  const plain = text.replace(/\*\*|__|`/g, '')
  return plain.length > length ? `${plain.slice(0, length - 1)}…` : plain
}

/** Which wording a row prints: the preset's preference unless a variant is picked for it. */
function VariantPicker({ row, preset, onChange }: { row: WordedRow; preset: CvPreset; onChange: (next: CvPreset) => void }) {
  const keys = Object.keys(row.variants)
  if (!keys.length) return null
  const choose = (value: string) => {
    const variants = { ...preset.variants }
    if (value) variants[row.id] = value
    else delete variants[row.id]
    onChange({ ...preset, variants })
  }
  return (
    <SelectField
      value={preset.variants[row.id] ?? ''}
      onChange={value => choose(value === 'preferred' ? '' : value)}
      options={[{ value: 'preferred', label: 'Preferred wording' }, ...keys.map(key => ({ value: key, label: key }))]}
      placeholder="Preferred wording"
      aria-label={`Wording for ${row.id}`}
      className="cv-variant-select"
    />
  )
}

function OrderButtons({ index, count, onMove, onRemove, label }: { index: number; count: number; onMove: (delta: number) => void; onRemove: () => void; label: string }) {
  return (
    <span className="cv-order">
      <IconButton label={`Move ${label} up`} disabled={index === 0} onClick={() => onMove(-1)}><ArrowUp aria-hidden="true" /></IconButton>
      <IconButton label={`Move ${label} down`} disabled={index === count - 1} onClick={() => onMove(1)}><ArrowDown aria-hidden="true" /></IconButton>
      <IconButton label={`Remove ${label}`} onClick={onRemove}><X aria-hidden="true" /></IconButton>
    </span>
  )
}

function RowSection({ kind, section, index, preset, onChange, context }: EditorProps & { kind: RowSectionKind; section: PresetSection; index: number }) {
  const rows = context.library[ROW_SECTION_LISTS[kind]] as WordedRow[]
  const included = section.items.map(item => rows.find(row => row.id === item.ref)).filter((row): row is WordedRow => Boolean(row))
  const setItems = (items: PresetItem[]) => onChange(updateSection(preset, index, current => ({ ...current, items })))
  const rowLabel = (row: WordedRow) => ('label' in row ? `${row.label}: ` : '') + clip(wording(row, preset), 80)

  if (kind === 'summary') {
    const chosen = section.items[0]?.ref ?? ''
    const row = rows.find(candidate => candidate.id === chosen)
    return (
      <div className="cv-rows">
        <SelectField value={chosen} onChange={ref => setItems([{ ref, style: 'full' }])} options={rows.map(candidate => ({ value: candidate.id, label: candidate.id }))} aria-label="Summary" />
        {row && <p className="cv-wording">{clip(wording(row, preset), 220)}</p>}
        {row && <VariantPicker row={row} preset={preset} onChange={onChange} />}
      </div>
    )
  }

  return (
    <div className="cv-rows">
      {included.map((row, at) => (
        <div className="cv-row" key={row.id}>
          <span className="cv-row-text">{rowLabel(row)}</span>
          <VariantPicker row={row} preset={preset} onChange={onChange} />
          <OrderButtons index={at} count={included.length} label={row.id} onMove={delta => setItems(move(section.items, at, delta))} onRemove={() => setItems(section.items.filter(item => item.ref !== row.id))} />
        </div>
      ))}
      {rows.filter(row => !section.items.some(item => item.ref === row.id)).map(row => (
        <CheckboxField key={row.id} checked={false} onChange={() => setItems([...section.items, { ref: row.id, style: 'full' }])} label={<span className="cv-row-muted">{rowLabel(row)}</span>} />
      ))}
    </div>
  )
}

function ItemSection({ kind, section, index, preset, onChange, context }: EditorProps & { kind: ItemSectionKind; section: PresetSection; index: number }) {
  const template = Object.hasOwn(templates, preset.template) ? templates[preset.template] : undefined
  const styles = template ? templateStyles(template, kind) : ['full']
  const setItems = (items: PresetItem[]) => onChange(updateSection(preset, index, current => ({ ...current, items })))
  const available = candidates(kind, context.library, context.portfolio).filter(ref => !section.items.some(item => item.ref === ref))
  const unnamed = unnamedCount(kind, context.portfolio)

  return (
    <div className="cv-items">
      {section.items.map((item, at) => {
        const described = describeRef(item.ref, context)
        const own = bulletsOf(item.ref, context.library)
        const shown = (item.bullets ?? []).map(id => own.find(bullet => bullet.id === id)).filter(bullet => bullet !== undefined)
        const hidden = own.filter(bullet => !(item.bullets ?? []).includes(bullet.id))
        const setBullets = (bullets: string[]) => onChange(updateItem(preset, index, item.ref, current => ({ ...current, bullets })))
        return (
          <article className="cv-item" key={item.ref}>
            <header>
              <span><strong>{described?.title ?? item.ref}</strong><small>{described?.detail}</small></span>
              <OrderButtons index={at} count={section.items.length} label={described?.title ?? item.ref} onMove={delta => setItems(move(section.items, at, delta))} onRemove={() => setItems(section.items.filter(entry => entry.ref !== item.ref))} />
            </header>
            {styles.length > 1 && (
              <SelectField prefix="Style" value={item.style} onChange={style => onChange(updateItem(preset, index, item.ref, current => ({ ...current, style: style as PresetItem['style'] })))} options={styles.map(style => ({ value: style, label: style === 'full' ? 'Full' : 'One line' }))} />
            )}
            {item.style === 'full' && own.length > 0 && (
              <div className="cv-bullets">
                {shown.map((bullet, position) => (
                  <div className="cv-row" key={bullet.id}>
                    <span className="cv-row-text">{bullet.kind === 'lead' ? <em>Lead: </em> : null}{clip(wording(bullet, preset))}</span>
                    <VariantPicker row={bullet} preset={preset} onChange={onChange} />
                    <OrderButtons index={position} count={shown.length} label={bullet.id} onMove={delta => setBullets(move(item.bullets ?? [], position, delta))} onRemove={() => setBullets((item.bullets ?? []).filter(id => id !== bullet.id))} />
                  </div>
                ))}
                {hidden.map(bullet => (
                  <CheckboxField key={bullet.id} checked={false} onChange={() => setBullets([...(item.bullets ?? []), bullet.id])} label={<span className="cv-row-muted">{bullet.kind === 'lead' ? 'Lead: ' : ''}{clip(wording(bullet, preset))}</span>} />
                ))}
              </div>
            )}
          </article>
        )
      })}
      {available.length > 0 && (
        <SelectField
          value=""
          placeholder={`Add to ${KIND_LABELS[kind].toLowerCase()}…`}
          onChange={ref => setItems([...section.items, { ref, style: 'full', bullets: bulletsOf(ref, context.library).map(bullet => bullet.id) }])}
          options={available.map(ref => {
            const described = describeRef(ref, context)
            return { value: ref, label: described ? `${described.title}${described.detail ? ` — ${described.detail}` : ''}` : ref }
          })}
          aria-label={`Add an entry to ${KIND_LABELS[kind]}`}
        />
      )}
      {unnamed > 0 && <p className="cv-hint">{unnamed} {unnamed === 1 ? 'entry' : 'entries'} in these collections {unnamed === 1 ? 'has' : 'have'} no id yet, so a CV cannot name {unnamed === 1 ? 'it' : 'them'}. Give one an <code>id</code> in its portfolio editor to offer it here.</p>}
    </div>
  )
}

export function PresetEditor({ preset, onChange, context }: EditorProps) {
  const template = Object.hasOwn(templates, preset.template) ? templates[preset.template] : undefined
  const variantKeys = [...new Set([context.library.bullets, context.library.summaries, context.library.skills, context.library.interests].flat().flatMap(row => Object.keys(row.variants)))]
  const kindsAllowed = SECTION_KINDS.filter(kind => !template || template.sections.kinds.includes(kind))

  return (
    <section className="cv-panel cv-config" aria-label="Preset configuration">
      <div className="cv-panel-heading"><div><span>Configuration</span><h2>{preset.name}</h2></div></div>
      <div className="cv-config-body">
        <fieldset className="cv-fieldset">
          <legend>Preset</legend>
          <TextField label="Name" value={preset.name} onChange={name => onChange({ ...preset, name })} />
          <TextField label="Download name" value={preset.filename} onChange={filename => onChange({ ...preset, filename })} />
          <SelectField label="Template" value={preset.template} onChange={id => onChange({ ...preset, template: id, template_options: {} })} options={Object.values(templates).map(entry => ({ value: entry.id, label: entry.name }))} />
          <TextField label="Page budget" type="number" min={1} value={preset.pages ? String(preset.pages) : ''} onChange={value => onChange({ ...preset, pages: Number(value) > 0 ? Math.floor(Number(value)) : undefined })} />
          <TextField
            label="Preferred wording"
            value={preset.prefer.join(', ')}
            placeholder="canonical text"
            onChange={value => onChange({ ...preset, prefer: value.split(',').map(key => key.trim()).filter(Boolean) })}
          />
          <p className="cv-hint">Variant keys in order of preference, comma-separated. In the library: {variantKeys.map(key => <code key={key}>{key}</code>)}</p>
        </fieldset>

        {template && Object.keys(template.options).length > 0 && (
          <fieldset className="cv-fieldset">
            <legend>{template.name} options</legend>
            {Object.entries(template.options).map(([name, option]) => {
              const value = preset.template_options[name] ?? option.default
              const set = (next: string | boolean) => onChange({ ...preset, template_options: { ...preset.template_options, [name]: next } })
              if (option.type === 'boolean') return <SwitchField key={name} label={option.label} checked={value === true} onChange={set} />
              if (option.type === 'choice') return <SelectField key={name} label={option.label} value={String(value)} onChange={set} options={option.choices.map(choice => ({ value: choice, label: choice }))} />
              return <TextField key={name} label={option.label} value={String(value)} onChange={set} />
            })}
          </fieldset>
        )}

        <fieldset className="cv-fieldset">
          <legend>Header</legend>
          <div className="cv-header-fields">
            {HEADER_FIELD_KEYS.map(key => (
              <CheckboxField
                key={key}
                label={key.replace('_', ' ')}
                checked={preset.header.includes(key)}
                onChange={checked => onChange({ ...preset, header: HEADER_FIELD_KEYS.filter(field => (field === key ? checked : preset.header.includes(field))) })}
              />
            ))}
          </div>
        </fieldset>

        {preset.sections.map((section, index) => (
          <fieldset className="cv-fieldset cv-section" key={`${section.kind}-${index}`}>
            <legend>{KIND_LABELS[section.kind]}</legend>
            <div className="cv-section-heading">
              <TextField aria-label={`${KIND_LABELS[section.kind]} heading`} value={section.title ?? ''} placeholder={DEFAULT_SECTION_TITLES[section.kind]} onChange={title => onChange(updateSection(preset, index, current => ({ ...current, title: title || undefined })))} />
              <OrderButtons index={index} count={preset.sections.length} label={`the ${KIND_LABELS[section.kind]} section`} onMove={delta => onChange({ ...preset, sections: move(preset.sections, index, delta) })} onRemove={() => onChange({ ...preset, sections: preset.sections.filter((_, at) => at !== index) })} />
            </div>
            {isRowSection(section.kind)
              ? <RowSection kind={section.kind} section={section} index={index} preset={preset} onChange={onChange} context={context} />
              : <ItemSection kind={section.kind} section={section} index={index} preset={preset} onChange={onChange} context={context} />}
          </fieldset>
        ))}

        <SelectField
          value=""
          placeholder="Add a section…"
          onChange={kind => onChange({ ...preset, sections: [...preset.sections, { kind: kind as PresetSection['kind'], items: [] }] })}
          options={kindsAllowed.map(kind => ({ value: kind, label: KIND_LABELS[kind] }))}
          aria-label="Add a section"
        />
      </div>
    </section>
  )
}
