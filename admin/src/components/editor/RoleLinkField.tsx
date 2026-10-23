import { useId, useRef, useState } from 'react'
import type { KeyboardEvent } from 'react'
import { CircleSlash, FileBadge, Globe, TriangleAlert } from 'lucide-react'
import { Button, TextField } from '@/components/form'
import { isWebsiteUrl, roleLinkKind, WEBSITE_URL_ERROR, type RoleLinkKind } from '@/lib/roleLinks'

export type RoleLink = { credential: string; website: string }

type RoleLinkFieldProps = RoleLink & {
  onChange: (link: RoleLink) => void
  /**
   * How many documents the role's credential lists, when it is a list this
   * editor cannot edit. The credential is then shown, not offered for change.
   */
  keptCredentials?: number
  label?: string
}

const choices: { kind: RoleLinkKind; label: string; icon: typeof Globe }[] = [
  { kind: 'none', label: 'None', icon: CircleSlash },
  { kind: 'credential', label: 'Credential', icon: FileBadge },
  { kind: 'website', label: 'Website', icon: Globe },
]

/**
 * One link per role, either a credential or a website: choosing one clears the
 * other, so the file never holds a link the card would hide.
 */
export function RoleLinkField({ credential, website, onChange, keptCredentials, label = 'Link' }: RoleLinkFieldProps) {
  const id = useId()
  const locked = keptCredentials !== undefined
  // The values decide whenever one is filled in; the choice only counts while
  // both are empty, as when Website is picked and nothing is typed yet.
  const [chosen, setChosen] = useState<RoleLinkKind>(() => roleLinkKind(credential, website))
  const filled = locked ? 'credential' : roleLinkKind(credential, website)
  const kind = filled === 'none' ? chosen : filled
  // What each choice held before it was switched away from, so trying the
  // other one and coming back loses nothing before the entry is saved.
  const stash = useRef<RoleLink>({ credential, website })
  const buttons = useRef<(HTMLButtonElement | null)[]>([])
  // Content written by hand can hold both; the card shows only the credential.
  const hidden = kind === 'credential' && Boolean(credential.trim() || locked) && Boolean(website.trim())
  const badWebsite = kind === 'website' && Boolean(website.trim()) && !isWebsiteUrl(website)

  const choose = (next: RoleLinkKind) => {
    if (next === kind) return
    stash.current = {
      credential: kind === 'credential' ? credential : stash.current.credential,
      website: kind === 'website' || hidden ? website : stash.current.website,
    }
    setChosen(next)
    onChange({
      credential: next === 'credential' ? stash.current.credential : '',
      website: next === 'website' ? stash.current.website : '',
    })
  }

  const enabled = choices.filter(choice => !locked || choice.kind === 'credential')
  // A radio group moves with the arrow keys, as a native one does.
  const step = (event: KeyboardEvent, from: RoleLinkKind) => {
    const delta = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1 : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0
    if (!delta) return
    event.preventDefault()
    const position = enabled.findIndex(choice => choice.kind === from)
    const next = enabled[(position + delta + enabled.length) % enabled.length]
    choose(next.kind)
    buttons.current[choices.indexOf(next)]?.focus()
  }

  return (
    <div className="role-link-field">
      <div className="role-link-head">
        <span id={`${id}-label`}>{label}</span>
        <div className="role-link-choices" role="radiogroup" aria-labelledby={`${id}-label`}>
          {choices.map(({ kind: choice, label: caption, icon: Icon }, index) => {
            const disabled = locked && choice !== 'credential'
            return (
              <button
                key={choice}
                ref={element => { buttons.current[index] = element }}
                type="button"
                role="radio"
                aria-checked={kind === choice}
                tabIndex={kind === choice ? 0 : -1}
                disabled={disabled}
                title={disabled ? 'Remove the documents in the YAML first; the card shows them instead.' : undefined}
                onClick={() => choose(choice)}
                onKeyDown={event => step(event, choice)}
              ><Icon aria-hidden="true" />{caption}</button>
            )
          })}
        </div>
      </div>
      {kind === 'credential' && (locked
        ? <p className="role-link-kept">{keptCredentials} credential document{keptCredentials === 1 ? '' : 's'}, kept as they are. Edit them in the YAML.</p>
        : <TextField aria-label={`${label} credential`} value={credential} placeholder="Google Drive link or file ID" onChange={value => onChange({ credential: value, website })} />)}
      {kind === 'website' && (
        <TextField aria-label={`${label} website`} aria-invalid={badWebsite || undefined} value={website} placeholder="https://" inputMode="url" onChange={value => onChange({ credential: '', website: value })} />
      )}
      {badWebsite
        ? <small className="role-link-error" role="alert">{WEBSITE_URL_ERROR}</small>
        : <small className="role-link-hint">{kind === 'credential' ? 'Opens in the document viewer.' : kind === 'website' ? 'Opens in a new tab.' : 'The card shows no link icon.'}</small>}
      {hidden && (
        <div className="role-link-conflict">
          <TriangleAlert aria-hidden="true" />
          <span>Also has a website link (<code>{website}</code>) that the site hides, because the credential wins.</span>
          <Button variant="outline" size="sm" onClick={() => onChange({ credential, website: '' })}>Remove website</Button>
        </div>
      )}
    </div>
  )
}
