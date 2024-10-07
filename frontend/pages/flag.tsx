import { useEffect, useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';

const PostPage = () => {
  const router = useRouter();
  const { id } = router.query;
  const [isAccessedCorrectly, setIsAccessedCorrectly] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [fadeIn, setFadeIn] = useState(false);

  useEffect(() => {
    console.log('Current pathname:', router.asPath);
    console.log(window.parent.location.pathname);
    
    const isLocalhost = window.location.hostname === 'localhost';
    const isPathCorrect = window.parent.location.pathname.startsWith('/post/');

    console.log('Is localhost:', isLocalhost);
    console.log('Is path correct:', isPathCorrect);

    if (isLocalhost && isPathCorrect) {
      setIsAccessedCorrectly(true);
      setTimeout(() => setFadeIn(true), 100);
    } else {
      setRedirecting(true);
      const timer = setTimeout(() => {
        window.location.href = '/home';
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [router.asPath]);

  if (redirecting) {
    return (
      <div className="access-denied">
        <Head>
          <title>Access Denied - CRB Room</title>
        </Head>
        <h1>Access Denied</h1>
        <p>You can only access this page via the correct route.</p>
        <p>You will be redirected to the home page in 5 seconds...</p>
        <div className="loader"></div>
        <style jsx>{`
          .access-denied {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            font-family: Arial, sans-serif;
            background-color: #f0f0f0;
            color: #333;
          }
          h1 {
            font-size: 2.5rem;
            margin-bottom: 1rem;
          }
          p {
            font-size: 1.2rem;
            margin-bottom: 0.5rem;
          }
          .loader {
            border: 5px solid #f3f3f3;
            border-top: 5px solid #3498db;
            border-radius: 50%;
            width: 50px;
            height: 50px;
            animation: spin 1s linear infinite;
            margin-top: 2rem;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  if (!isAccessedCorrectly) {
    return null;
  }

  return (
    <div className={`success-page ${fadeIn ? 'fade-in' : ''}`}>
      <Head>
        <title>Success - CRB Room</title>
      </Head>
      <h1>Congratulations!</h1>
      <p>You've successfully accessed the secret page.</p>
      <div className="flag-container">
        <h2>Here's your flag:</h2>
        <p className="flag">CRB_YouLetMeInside</p>
      </div>
      <style jsx>{`
        .success-page {
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          height: 100vh;
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
  );
};

export default PostPage;