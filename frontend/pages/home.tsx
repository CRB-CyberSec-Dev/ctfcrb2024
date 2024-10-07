"use client"

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Search, LogOut, Shield } from 'lucide-react'
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent } from "@/components/ui/card"

export default function HomePage() {
  const [posts, setPosts] = useState([])
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [userStatus, setUserStatus] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState([])
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [fadeIn, setFadeIn] = useState(false)
  const router = useRouter()
  
  useEffect(() => {
    const token = localStorage.getItem('token')
    const status = localStorage.getItem('status')

    if (!token) {
      router.push('/login')  // Redirect to login if token is not present
    } else {
      setIsLoggedIn(true)  // Set login status
      setUserStatus(status)
    }
  }, [router])

  useEffect(() => {
    const fetchPosts = async () => {
      const token = localStorage.getItem('token')
      if (!token) {
        return router.push('/login')
      }

      try {
        const response = await fetch('http://localhost:5000/api/posts', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        const data = await response.json()
        if (response.ok) {
          setPosts(data)
        } else {
          setError('Failed to load posts')
        }
      } catch (err) {
        setError('Error fetching posts')
      }
    }
    setTimeout(() => setFadeIn(true), 100)
    fetchPosts()
  }, [router])

  const handleLogout = () => {
    localStorage.removeItem('token')
    localStorage.removeItem('status')
    router.push('/login')
  }

  const handleGoAdmin = () => {
    router.push('/admin')
  }

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    const token = localStorage.getItem('token')
    if (!token) return

    const xmlData = `<search><term>${searchTerm}</term></search>`

    try {
      const response = await fetch('http://localhost:5000/api/search', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/xml',
        },
        body: xmlData,
      })

      const data = await response.json()
      if (response.ok) {
        setSearchResults(data)
      } else {
        setError('Failed to search posts')
      }
    } catch (err) {
      setError('Error performing search')
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <nav className="flex justify-between items-center mb-8">
        <motion.h1 
          className="text-4xl font-bold text-purple-800"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          Welcome to CRB Room
        </motion.h1>
        <div className="relative">
          <Button variant="outline" onClick={() => setIsMenuOpen(!isMenuOpen)}>
            Menu
          </Button>
          {isMenuOpen && (
            <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-10">
              <p className="px-4 py-2 text-sm text-gray-700">
                Status: {userStatus === 'admin' ? 'Admin' : 'User'}
              </p>
              {userStatus === 'admin' && (
                <button
                  onClick={handleGoAdmin}
                  className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
                >
                  <Shield className="mr-2 h-4 w-4" />
                  Admin Panel
                </button>
              )}
              <button
                onClick={handleLogout}
                className="w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center"
              >
                <LogOut className="mr-2 h-4 w-4" />
                Log out
              </button>
            </div>
          )}
        </div>
      </nav>

      <motion.div 
        className="mb-8"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        <form onSubmit={handleSearch} className="flex gap-2">
          <Input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search for posts..."
            className="flex-grow"
          />
          <Button type="submit">
            <Search className="mr-2 h-4 w-4" />
            Search
          </Button>
        </form>
      </motion.div>

      {searchTerm && (
        <p className="mb-4 text-purple-700">
          Showing results for: <strong>{searchTerm}</strong>
        </p>
      )}

      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.4 }}
      >
        {(searchResults.length > 0 ? searchResults : posts).map((post, index) => (
          <motion.div 
            key={post.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.1 }}
          >
            <Card 
              className="overflow-hidden cursor-pointer transition-shadow hover:shadow-lg"
              onClick={() => router.push(`/post/${post.id}`)}
            >
              <img src={post.image_url} alt={post.description} className="w-full h-48 object-cover" />
              <CardContent className="p-4">
                <p className="text-sm text-gray-600">{post.description}</p>
              </CardContent>
            </Card>
          </motion.div>
          
        ))}
      </motion.div>

      {/* Only show the flag if the user is logged in */}
      {isLoggedIn && posts.length > 0 && (
        <div className={`success-page ${fadeIn ? 'fade-in' : ''}`}>
          <h1>Congratulations!</h1>
          <p>You've successfully bypassed the login page.</p>
          <div className="flag-container">
            <h2>Here's your flag:</h2>
            <p className="flag">CRB_AreYouThief</p>
          </div>
          <style jsx>{`
            .success-page {
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              height: 500px;
              font-family: Arial, sans-serif;
              background-color: #e6f7ff;
              color: #005a8c;
              opacity: 0;
              transition: opacity 1s ease-in-out;
            }
            .fade-in {
              opacity: 1;
            }
            h1 {
              font-size: 3rem;
              margin-bottom: 1rem;
            }
            p {
              font-size: 1.5rem;
              margin-bottom: 2rem;
            }
            .flag-container {
              background-color: #ffffff;
              padding: 2rem;
              border-radius: 10px;
              box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              text-align: center;
            }
            h2 {
              font-size: 2rem;
              margin-bottom: 1rem;
              color: #003366;
            }
            .flag {
              font-size: 2rem;
              font-weight: bold;
              color: #ff6600;
              background-color: #ffe6cc;
              padding: 0.5rem 1rem;
              border-radius: 5px;
              display: inline-block;
            }
          `}</style>
        </div>
      )}

      {error && (
        <motion.p 
          className="mt-4 text-red-500"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
}
