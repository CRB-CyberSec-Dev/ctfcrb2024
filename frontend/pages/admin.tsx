"use client"

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Trash2, UserPlus, UserMinus, LogOut, Home, Plus } from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { toast, Toaster } from 'react-hot-toast';
import CryptoJS from 'crypto-js';

const secret = 'MulSVQT1HJG7Qwph+R4p1/IaeXhiEJeXqbruyeJvGI/dnKOTTEZObRCvbj32fFJ8';

// Decrypt function
function decrypt(encryptedData, secret) {
  try {
    const iv = CryptoJS.enc.Hex.parse(encryptedData.iv);
    const content = CryptoJS.enc.Hex.parse(encryptedData.content);

    const key = CryptoJS.SHA256(secret).toString(CryptoJS.enc.Hex); // Ensure the key is the same
    const keyWords = CryptoJS.enc.Hex.parse(key);

    const decrypted = CryptoJS.AES.decrypt(
      { ciphertext: content },
      keyWords,
      { iv: iv }
    );

    const decryptedText = decrypted.toString(CryptoJS.enc.Utf8);
    
    if (!decryptedText) {
      throw new Error('Decryption resulted in an empty string. Please check the input data.');
    }

    return decryptedText;
    
  } catch (error) {
    console.error('Decryption error:', error.message);
    console.error('Input data:', JSON.stringify(encryptedData));
    throw new Error('Failed to decrypt the data.');
  }
}

export default function AdminPage() {
  const [posts, setPosts] = useState([]);
  const [users, setUsers] = useState([]);
  const [newPostImage, setNewPostImage] = useState('');
  const [newPostDescription, setNewPostDescription] = useState('');
  const [error, setError] = useState('');
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('status');
    router.push('/login');
  };

  const handleBackToHome = () => {
    router.push('/home');
  };

  useEffect(() => {
    const fetchData = async (token) => {
      try {
        const [postsResponse, usersResponse] = await Promise.all([
          fetch('http://localhost:5000/api/posts', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch('http://localhost:5000/api/users', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);
  
        if (postsResponse.ok && usersResponse.ok) {
          const postsData = await postsResponse.json();
          const usersData = await usersResponse.json();
          setPosts(postsData);
          setUsers(usersData);
        } else {
          setError('Failed to load posts or users');
        }
      } catch (err) {
        setError('Error fetching data');
      }
    };
  
    const fetchUserStatus = async (token) => {
      try {
        const response = await fetch('http://localhost:5000/api/user-status', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
  
        if (!response.ok) {
          throw new Error('Failed to fetch user status');
        }
  
        const data = await response.json();
        // const decryptedStatus = decrypt(data, secret);
        console.log(data);
        console.log(data.login);
        setIsAdmin(data.login === 'approvedbycrb');
      } catch (err) {
        setError('Error fetching user status');
      }
    };
  
    const token = localStorage.getItem('token');
    if (!token) {
      router.push('/login');
      return;
    }
  
    fetchUserStatus(token)
      .then(() => fetchData(token))
      .catch(err => setError(err.message));
  
  }, []);
  
  const handleAddPost = async () => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch('http://localhost:5000/api/postsadd', {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          image_url: newPostImage,
          description: newPostDescription,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setPosts([...posts, data]);
        setNewPostImage('');
        setNewPostDescription('');
        toast.success('Post added successfully');
      } else {
        setError('Failed to add post');
        toast.error('Failed to add post');
      }
    } catch (err) {
      setError('Error adding post');
      toast.error('Error adding post');
    }
  };

  const handleRemovePost = async (postId: number) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/postsrem/${postId}`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        setPosts(posts.filter(post => post.id !== postId));
        toast.success('Post removed successfully');
      } else {
        setError('Failed to remove post');
        toast.error('Failed to remove post');
      }
    } catch (err) {
      setError('Error removing post');
      toast.error('Error removing post');
    }
  };

  const handleUserStatusChange = async (userId: number, newStatus: string) => {
    const token = localStorage.getItem('token');
    if (!token) return;

    try {
      const response = await fetch(`http://localhost:5000/api/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        setUsers(users.map(user => (user.id === userId ? { ...user, role: newStatus } : user)));
        toast.success(`User status updated to ${newStatus}`);
        localStorage.setItem('status', newStatus);
      } else {
        setError('Failed to update user status');
        toast.error('Failed to update user status');
      }
    } catch (err) {
      setError('Error updating user status');
      toast.error('Error updating user status');
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-100 p-8">
      <Toaster position="top-right" />
      <motion.h1 
        className="text-4xl font-bold text-purple-800 mb-8"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        Admin Dashboard
      </motion.h1>

      <div className="flex justify-between mb-8">
        <Button variant="outline" onClick={handleBackToHome}>
          <Home className="mr-2 h-4 w-4" /> Back to Home
        </Button>
        <Button variant="destructive" onClick={handleLogout}>
          <LogOut className="mr-2 h-4 w-4" /> Logout
        </Button>
      </div>

      {isAdmin ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Add New Post</h2>
              <div className="space-y-4">
                <Input
                  type="text"
                  value={newPostImage}
                  onChange={(e) => setNewPostImage(e.target.value)}
                  placeholder="Image URL"
                />
                <Input
                  type="text"
                  value={newPostDescription}
                  onChange={(e) => setNewPostDescription(e.target.value)}
                  placeholder="Description"
                />
                <Button onClick={handleAddPost}>
                  <Plus className="mr-2 h-4 w-4" /> Add Post
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mb-8">
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">Posts</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {posts.map((post, index) => (
                  <motion.div
                    key={post.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                  >
                    <Card>
                      <CardContent className="p-4">
                        <img src={post.image_url} alt={post.description} className="w-full h-48 object-cover mb-2 rounded" />
                        <p className="text-sm text-gray-600 mb-2">{post.description}</p>
                        <Button variant="destructive" onClick={() => handleRemovePost(post.id)}>
                          <Trash2 className="mr-2 h-4 w-4" /> Remove Post
                        </Button>
                      </CardContent>
                    </Card>
                  </motion.div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <h2 className="text-2xl font-semibold mb-4">User Management</h2>
              <div className="overflow-x-auto">
                <table className="w-full border-collapse">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="p-2 text-left">Email</th>
                      <th className="p-2 text-left">Status</th>
                      <th className="p-2 text-left">Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((user) => (
                      <tr key={user.id} className="border-t">
                        <td className="p-2">{user.email}</td>
                        <td className="p-2">{user.role}</td>
                        <td className="p-2">
                          {user.role === 'admin' ? (
                            <Button variant="destructive" onClick={() => handleUserStatusChange(user.id, 'user')}>
                              <UserMinus className="mr-2 h-4 w-4" /> Demote to User
                            </Button>
                          ) : (
                            <Button variant="outline" onClick={() => handleUserStatusChange(user.id, 'admin')}>
                              <UserPlus className="mr-2 h-4 w-4" /> Promote to Admin
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <p className="text-red-500">You are not authorized to access this page.</p>
      )}

      {error && <p className="text-red-500 mt-4">{error}</p>}
    </div>
  );
}
