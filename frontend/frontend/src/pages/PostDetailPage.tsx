import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { postsApi } from '../api/posts'
import { Post } from '../types'
import CommentModal from '../components/post/CommentModal'
import toast from 'react-hot-toast'

export default function PostDetailPage() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const [post, setPost] = useState<Post | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (id) postsApi.getPost(id).then(setPost).catch(() => toast.error('Topilmadi')).finally(() => setLoading(false))
  }, [id])

  if (loading) return <div className="flex justify-center py-20"><div className="w-8 h-8 rounded-full border-2 border-neon-pink border-t-transparent animate-spin" style={{ filter: 'drop-shadow(0 0 6px #ff2d78)' }}/></div>
  if (!post) return <div className="text-center py-20 text-white/30 font-mono">POST TOPILMADI</div>

  return <CommentModal post={post} onClose={() => navigate(-1)}/>
}
