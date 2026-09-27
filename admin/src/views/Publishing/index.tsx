import { useState } from 'react'
import { FileCode2, Rocket, Trash2 } from 'lucide-react'
import { toast } from 'react-toastify'
import { LocalNotice } from '@/components/admin/LocalNotice'
import { MetricGrid } from '@/components/admin/MetricGrid'
import { PageHeader } from '@/components/admin/PageHeader'
import { Button, IconButton, TextField } from '@/components/form'
import { publishingTarget } from '@/config/publishing'
import { usePending } from '@/hooks/usePending'
import { discardPending, publishPending } from '@/services/pending'

export function PublishingPage() {
  const { files, ready, refresh } = usePending()
  const [message, setMessage] = useState('')
  const [busy, setBusy] = useState(false)
  const changeCount = files.reduce((total, file) => total + file.summaries.length, 0)

  const publish = async () => {
    if (!window.confirm(`Publish ${files.length} file${files.length === 1 ? '' : 's'} as one commit on ${publishingTarget.branch}?`)) return
    setBusy(true)
    try {
      const { commit, files: written } = await publishPending(message)
      setMessage('')
      await refresh()
      toast.success(`Published ${written.length} file${written.length === 1 ? '' : 's'} as ${commit.slice(0, 7)}.`)
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not publish.')
    } finally {
      setBusy(false)
    }
  }

  const discard = async (path?: string) => {
    const what = path ? `changes to ${path.split('/').pop()}` : `all ${files.length} pending files`
    if (!window.confirm(`Discard ${what}? The edits are lost.`)) return
    setBusy(true)
    try {
      await discardPending(path)
      await refresh()
      toast.success('Discarded.')
    } catch (error) {
      toast.error(error instanceof Error ? error.message : 'Could not discard.')
    } finally {
      setBusy(false)
    }
  }

  return (
    <>
      <PageHeader
        title="Publishing"
        description={<>Everything edited since the last publish, committed together to <code>{publishingTarget.branch}</code>.</>}
        actions={<Button disabled={!files.length || busy} onClick={() => void publish()}><Rocket aria-hidden="true" /> {busy ? 'Publishing...' : 'Publish changes'}</Button>}
      />
      <MetricGrid metrics={[
        { label: 'Files waiting', value: files.length, detail: files.length ? 'Committed together' : 'Nothing to publish', healthy: files.length === 0 },
        { label: 'Edits', value: changeCount, detail: 'Since the last publish' },
        { label: 'Branch', value: publishingTarget.branch, detail: publishingTarget.environment },
      ]} />
      <LocalNotice>
        An edit changes a file here rather than committing it, so a session of work lands as one commit instead of one per edit. Publishing checks that {publishingTarget.branch} has not moved underneath these edits before writing.
      </LocalNotice>

      <section className="content-list-panel">
        <div className="panel-heading">
          <div><span>Pending</span><h2>Changed files</h2></div>
          {files.length > 0 && <Button variant="outline" size="sm" disabled={busy} onClick={() => void discard()}><Trash2 aria-hidden="true" /> Discard all</Button>}
        </div>
        {files.length > 0 && (
          <div className="publish-message">
            <TextField
              label="Commit message"
              value={message}
              onChange={setMessage}
              placeholder={`content(admin): ${changeCount} change${changeCount === 1 ? '' : 's'}`}
            />
            <span>Left blank, the edits below become the message.</span>
          </div>
        )}
        <div className="repository-entry-list">
          {files.map(file => (
            <article key={file.path}>
              <span><FileCode2 aria-hidden="true" /></span>
              <div>
                <strong>{file.path}</strong>
                <span className="entry-facts">
                  {file.summaries.map((summary, index) => <span key={`${summary}-${index}`}>{summary}</span>)}
                </span>
              </div>
              <IconButton variant="outline" title="Discard changes to this file" label={`Discard changes to ${file.path}`} disabled={busy} onClick={() => void discard(file.path)}><Trash2 aria-hidden="true" /></IconButton>
            </article>
          ))}
          {!files.length && (
            <div className="collection-empty-state">
              <strong>{ready ? 'Nothing waiting to publish' : 'Checking for pending changes...'}</strong>
              <span>{ready ? 'Edits you make will collect here until you publish them.' : ''}</span>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
