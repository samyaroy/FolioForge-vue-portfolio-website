import { useParams } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { getPost } from '../../lib/posts'
import { formatDate } from '../../lib/format'
import { POST_COPY } from '../../content/sections'
import { NotFoundPage } from '../NotFound'

export function PostPage() {
  const { slug } = useParams<{ slug: string }>()
  const post = slug ? getPost(slug) : undefined

  if (!post) {
    return <NotFoundPage />
  }

  return (
    <article className="post">
      <header className="post__header">
        <a className="post__back" href="/">
          {POST_COPY.backToBlogs}
        </a>
        <h1>{post.title}</h1>
        {post.date && (
          <time className="post__date" dateTime={post.date}>
            {formatDate(post.date)}
          </time>
        )}
      </header>
      <div className="prose">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>{post.body}</ReactMarkdown>
      </div>
    </article>
  )
}
