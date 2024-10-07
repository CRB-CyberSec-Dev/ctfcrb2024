import { useState, useEffect, FormEvent } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import Link from 'next/link';
import dynamic from 'next/dynamic';
import jwt from 'jsonwebtoken';
import loginAnimation from '@/lib/loginAnimation';

// Dynamically import the Lottie animation to avoid SSR issues
const Lottie = dynamic(() => import('react-lottie-player'), { ssr: false });

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [animationData, setAnimationData] = useState<any>(null);

  useEffect(() => {
    setAnimationData(loginAnimation);
  }, []);

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }
    setError('');

    try {
      const response = await fetch('http://localhost:5000/api/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (response.ok) {
        console.log('Login successful:  JWT genarated done buy using email, expiresIn , secret ', data);


        // // Ensure the secret key is valid
        // if (typeof secretKey !== 'string') {
        //   throw new Error('Secret key must be a string');
        // }

        // // Generate the token
        // const generatedToken = jwt.sign(payload, secretKey, options);
        // console.log('Token generated successfully!');

        localStorage.setItem('token', data.utoken);
        localStorage.setItem('status', data.status);

        window.location.href = '/home'; // Redirect to homepage
      } else {
        setError(data.message);
      }
    } catch (err) {
      setError('An error occurred while logging in');
      console.error(err);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <h1 className="text-4xl font-bold text-primary mb-8 text-center">
        Welcome to CRB Room, Let's Play
      </h1>
      <div className="w-full max-w-[350px] mb-8">
        {animationData && (
          <Lottie loop animationData={animationData} play style={{ width: 350, height: 200 }} />
        )}
      </div>
      <Card className="w-full max-w-[350px]">
        <CardHeader>
          <CardTitle>Login</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent>
            <div className="grid w-full items-center gap-4">
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  placeholder="Enter your email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="flex flex-col space-y-1.5">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  placeholder="Enter your password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
              </div>
            </div>
            {error && (
              <Alert variant="destructive" className="mt-4">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
          </CardContent>
          <CardFooter className="flex flex-col">
            <Button className="w-full" type="submit">
              Login
            </Button>
            <div className="mt-4 text-sm text-center space-y-2">
              <Link href="/forgot-password" className="text-primary hover:underline block">
                Forgot password?
              </Link>
              <span>
                Don't have an account?{' '}
                <Link href="/signup" className="text-primary hover:underline">
                  Sign up
                </Link>
              </span>
            </div>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
};

export default LoginPage;
