import { Link } from 'react-router-dom'
import type { PostMeta } from '../../../../types'
import { formatDate } from '../../../../lib/format'

type PostCardProps = {
  post: PostMeta
}

export function PostCard({ post }: PostCardProps) {
  return (
    <article className="post-card">
      <div className="post-card__content">
        <h2 className="post-card__title">
          <Link to={`/posts/${post.slug}`}>{post.title}</Link>
        </h2>
        <div className="post-card__meta">
          <span>Article</span>
          {post.date && <time dateTime={post.date}>{formatDate(post.date)}</time>}
        </div>
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
      </div>
    </article>
  )
}
