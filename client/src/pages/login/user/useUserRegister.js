import { useState } from 'react'
import { useNavigate } from 'react-router-dom'

const useUserRegister = () => {
  const [registerData, setRegisterData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(null)
  const navigate = useNavigate()

  const register = async (formData) => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(
        `${import.meta.env.VITE_SERVER_LINK}/auth/user-register`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            mu_fullname: formData.fullname,
            mu_email: formData.email,
            mu_password: formData.password,
          }),
        },
      )

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}))
        const errorMessage =
          errorData.message || `HTTP error! status: ${response.status}`
        throw new Error(errorMessage)
      }

      const result = await response.json()

      if (result.success) {
        setRegisterData(result.data)
        // Redirect to login page
        navigate('/login')
      } else {
        setError(result.message || 'Registration failed')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  return { registerData, loading, error, register }
}

export default useUserRegister
