// components/AuthGuard.tsx
'use client'
import { API_URL } from '@/app/lib/api';
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'
import axios from 'axios'

export default function AuthGuard({ children }: { children: React.ReactNode }) {
    const router = useRouter()
    const [role, setRole] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            try {
                const response = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setRole(response.data.role)
            } catch (error) {
                console.error('Ошибка при проверке авторизации:', error)
                router.push('/auth/login')
            } finally {
                setLoading(false)
            }
        }

        checkAuth()
    }, [router])

    if (loading) {
        return (
            <div className="flex justify-center items-center h-screen">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
            </div>
        )
    }

    // Просто рендерим children, а роль будем получать отдельным запросом
    return <>{children}</>
}