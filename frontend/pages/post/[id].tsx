"use client"

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Home, Send, AlertCircle, User } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { toast, Toaster } from 'react-hot-toast'

export default function PostPage() {
  const router = useRouter()
  const [post, setPost] = useState(null)
  const [comments, setComments] = useState([])
  const [commentText, setCommentText] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    const fetchPost = async () => {
      const token = localStorage.getItem('token')
      if (!token) return router.push('/login')

      const id = window.location.pathname.split('/').pop()

      try {
        const response = await fetch(`http://localhost:5000/api/posts/${id}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        const data = await response.json()
        if (response.ok) {
          setPost(data.post)
          setComments(data.comments)
        } else {
          setError('Failed to load post')
          toast.error('Failed to load post')
        }
      } catch (err) {
        setError('Error fetching post')
        toast.error('Error fetching post')
      }
    }

    fetchPost()
  }, [])

  const handleCommentSubmit = async () => {
    const token = localStorage.getItem('token')
    if (!token) return

    const id = window.location.pathname.split('/').pop()

    try {
      const response = await fetch(`http://localhost:5000/api/posts/${id}/comments`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ comment: commentText }),
      })

      const data = await response.json()
      if (response.ok) {
        setComments(prev => [...prev, { comment: commentText, id: data.commentId }])
        setCommentText('')
        toast.success('Comment posted successfully')
      } else {
        setError(data.message)
        toast.error(data.message)
      }
    } catch (err) {
      setError('Failed to post comment')
      toast.error('Failed to post comment')
    }
  }

  const handleBackToHome = () => {
    router.push('/home')
  }

  const this_is_a_hidden_flag ="hello";

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <Toaster position="top-right" />
      <motion.h1 
        className="text-4xl font-bold text-purple-800 mb-8 text-center"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Welcome to CRB Room
      </motion.h1>

      <div id="flag" style={{ display: 'none' }}>FLAG{this_is_a_hidden_flag}</div>

      <Button variant="outline" onClick={handleBackToHome} className="mb-8">
        <Home className="mr-2 h-4 w-4" /> Back to Home
      </Button>

      {post && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <img src={post.image_url} alt={post.description} className="w-full h-64 object-cover rounded-lg mb-4" />
              <p className="text-lg text-gray-700">{post.description}</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Comments</CardTitle>
            </CardHeader>
            <CardContent>
              {comments.map((comment, index) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.1 }}
                  className="flex items-start space-x-4 mb-4"
                >
                  <div className="w-8 h-8 rounded-full bg-purple-200 flex items-center justify-center">
                    <User className="w-4 h-4 text-purple-600" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm text-gray-600" dangerouslySetInnerHTML={{ __html: comment.comment }} />
                  </div>
                </motion.div>
              ))}
            </CardContent>
            <CardFooter>
              <div className="flex w-full items-center space-x-2">
                <Input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  placeholder="Add a comment"
                  className="flex-1"
                />
                <Button onClick={handleCommentSubmit}>
                  <Send className="mr-2 h-4 w-4" /> Submit
                </Button>
              </div>
            </CardFooter>
          </Card>
        </motion.div>
      )}

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
          className="flex items-center justify-center mt-4"
        >
          <AlertCircle className="text-red-500 mr-2" />
          <p className="text-red-500">{error}</p>
        </motion.div>
      )}
    </div>
  )
}