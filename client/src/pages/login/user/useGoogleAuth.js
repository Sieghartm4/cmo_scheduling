import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const useGoogleAuth = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const handleGoogleAuth = async (credentialResponse) => {
    try {
      setLoading(true)
      setError(null)

      // Decode JWT token to extract user info
      const token = credentialResponse.credential
      const base64Url = token.split('.')[1]
      const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/')
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split('')
          .map((c) => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      )

      const userData = JSON.parse(jsonPayload)

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/auth/google-auth`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            googleId: userData.sub,
            email: userData.email,
            name: userData.name,
            picture: userData.picture,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        throw new Error(errorData.message || 'Google authentication failed')
      }

      const result = await response.json()

      if (result.success) {
        // Store token and user data
        localStorage.setItem('userToken', result.data.token)
        localStorage.setItem('user', JSON.stringify(result.data.user))

        // Redirect to user dashboard
        navigate('/dashboard')
      } else {
        setError(result.message || 'Authentication failed')
      }
    } catch (err) {
      console.error('Google auth error:', err)
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleGoogleError = () => {
    setError('Google login failed. Please try again.')
  }

  return { handleGoogleAuth, handleGoogleError, loading, error }
}

export default useGoogleAuth
