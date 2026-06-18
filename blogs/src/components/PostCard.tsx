import { Link } from 'react-router-dom'
import type { PostMeta } from '../types'
import { formatDate } from '../lib/format'

export function PostCard({ post }: { post: PostMeta }) {
  return (
    <article className="post-card">
      <h2 className="post-card__title">
        <Link to={`/posts/${post.slug}`}>{post.title}</Link>
      </h2>
      {post.date && (
        <time className="post-card__date" dateTime={post.date}>
          {formatDate(post.date)}
        </time>
      )}
      {post.description && (
        <p className="post-card__excerpt">{post.description}</p>
      )}
      {post.tags.length > 0 && (
        <ul className="tag-list">
          {post.tags.map((tag) => (
            <li key={tag} className="tag">
              {tag}
            </li>
          ))}
        </ul>
      )}
    </article>
  )
}
