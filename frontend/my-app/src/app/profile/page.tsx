'use client'
import { API_URL } from '@/app/lib/api';
import { useEffect, useState } from 'react'
import axios from 'axios'
import { Header } from '@/app/components/Header'
import AdminSidebar from '@/app/components/AdminSidebar'
import AuthGuard from '@/app/components/AuthGuard'
import useRole from '@/app/hooks/useRole'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { motion } from 'framer-motion'
import TeenagerSidebar from "@/app/components/TeenagerSidebar"
import EmployeeSidebar from "@/app/components/EmpoyeeSidebar"

export default function ProfilePage() {
    const role = useRole()
    const [login, setLogin] = useState('')
    const [newLogin, setNewLogin] = useState('')
    const [oldLogin, setOldLogin] = useState('')
    const [newPassword, setNewPassword] = useState('')
    const [roleId, setRoleId] = useState<number | null>(null)
    const [message, setMessage] = useState('')
    const [error, setError] = useState('')
    const [showLoginChangeMessage, setShowLoginChangeMessage] = useState(false)
    const [isEditingLogin, setIsEditingLogin] = useState(false)
    const [isLoading, setIsLoading] = useState(true)

    const router = useRouter()
    const searchParams = useSearchParams()

    const [userId, setUserId] = useState<string | null>(null)


    useEffect(() => {
        const fetchUserId = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const res = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setUserId(res.data.userId)
            } catch (err) {
                console.error('Error fetching user ID:', err)
            }
        }

        fetchUserId()
    }, [])
    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) return

                const response = await axios.get(`${API_URL}/api/auth/profile`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                setLogin(response.data.login)
                setOldLogin(response.data.login)
                setNewLogin(response.data.login)
                setRoleId(response.data.role_id)
            } catch (err) {
                console.error(err)
                setError('Не удалось загрузить профиль')
            } finally {
                setIsLoading(false)
            }
        }

        fetchProfile()
    }, [])

    useEffect(() => {
        const tokenFromQuery = searchParams.get('token')
        if (tokenFromQuery) {
            const confirmEmailChange = async () => {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500))
                    const response = await axios.get(`${API_URL}/api/auth/confirm-email-change?token=${tokenFromQuery}`)

                    if (response.data.token) {
                        localStorage.setItem('token', response.data.token)
                    }

                    setMessage('Логин успешно изменён')
                    setTimeout(() => router.push('/profile'), 5000)
                } catch (err) {
                    console.error(err)
                    setError('Не удалось подтвердить изменение логина')
                }
            }

            confirmEmailChange()
        }
    }, [searchParams, router])

    const handleLoginChange = async () => {
        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const response = await axios.put(`${API_URL}/api/auth/profile/change-login`, {
                login_old: oldLogin,
                login: newLogin
            }, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.status === 200) {
                setLogin(newLogin)
                setOldLogin(newLogin)
                setIsEditingLogin(false)
                setShowLoginChangeMessage(true)
            }
        } catch (err) {
            console.error(err)
            setError('Ошибка при изменении логина')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError('')
        setMessage('')

        try {
            const token = localStorage.getItem('token')
            if (!token) return

            const payload: any = {
                login,
                password: newPassword,
                role_id: role === 'Администратор' ? 1 : roleId
            }

            const response = await axios.put(`${API_URL}/api/auth/profile`, payload, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            })

            if (response.data.token) {
                localStorage.setItem('token', response.data.token)
            }

            setMessage('Профиль успешно обновлён!')
            setNewPassword('')
        } catch (err) {
            console.error(err)
            setError('Ошибка при обновлении профиля')
        }
    }

    // Анимации
    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.1,
                delayChildren: 0.2
            }
        }
    }

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                duration: 0.5,
                ease: "easeOut"
            }
        }
    }

    if (isLoading) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex items-center justify-center">
                <motion.div
                    animate={{ rotate: 360 }}
                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                    className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full"
                />
            </div>
        )
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-purple-50 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    {role === 'Администратор' && <AdminSidebar />}
                    {role === 'Пользователь' && <TeenagerSidebar />}
                    {role === "Сотрудник" && <EmployeeSidebar />}
                    <main className="flex-1 max-w-4xl mx-auto py-10 px-4 sm:px-6 relative">
                        {/* Floating action button */}
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ type: "spring", stiffness: 300, damping: 20 }}
                            whileHover={{ scale: 1.05 }}
                            className="absolute top-4 right-4 z-10"
                        >
                            <Link href={`/resume/${userId}`}>
                                <button className="bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white font-medium py-2.5 px-5 rounded-full shadow-lg transition-all duration-300 ease-in-out flex items-center gap-2 group cursor-pointer">
                                    <span>Моё резюме</span>
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                    </svg>
                                </button>
                            </Link>
                        </motion.div>

                        <motion.div
                            initial="hidden"
                            animate="visible"
                            variants={containerVariants}
                        >
                            <motion.h1
                                variants={itemVariants}
                                className="text-4xl font-bold text-gray-900 mb-8 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent"
                            >
                                Профиль пользователя
                            </motion.h1>

                            <motion.div
                                variants={itemVariants}
                                className="bg-white rounded-2xl shadow-xl p-8 space-y-8 backdrop-blur-sm bg-opacity-90 border border-white border-opacity-20"
                            >
                                <motion.div
                                    variants={itemVariants}
                                    className="flex flex-col sm:flex-row items-center gap-6"
                                >
                                    <div className="relative">
                                        <div className="w-28 h-28 bg-gradient-to-br from-blue-100 to-purple-100 rounded-full flex items-center justify-center shadow-inner">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-14 w-14 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                            </svg>
                                        </div>
                                        <div className="absolute -bottom-2 -right-2 bg-blue-500 text-white rounded-full w-8 h-8 flex items-center justify-center shadow-md">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                                            </svg>
                                        </div>
                                    </div>
                                    <div className="text-center sm:text-left">
                                        <p className="text-lg text-gray-500 font-medium">E-mail:</p>
                                        <div className="flex items-center justify-center sm:justify-start space-x-2 mt-1">
                                            <span className="text-2xl font-bold text-gray-800 font-sans">{login}</span>
                                        </div>
                                        <div className="mt-2">
                                            <span className="inline-block px-3 py-1 rounded-full text-sm font-medium bg-blue-100 text-blue-800">
                                                {role || 'Пользователь'}
                                            </span>
                                        </div>
                                    </div>
                                </motion.div>

                                {(showLoginChangeMessage || message || error) && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`p-4 rounded-lg text-base ${showLoginChangeMessage || message ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}
                                    >
                                        {showLoginChangeMessage && 'Подтвердите изменение логина на указанной почте!'}
                                        {message && message}
                                        {error && error}
                                    </motion.div>
                                )}

                                {isEditingLogin && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: 'auto' }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="overflow-hidden"
                                    >
                                        <label className="block text-base font-medium text-gray-700 mb-2">
                                            Новый логин
                                        </label>
                                        <input
                                            type="text"
                                            value={newLogin}
                                            onChange={(e) => setNewLogin(e.target.value)}
                                            className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base transition-all"
                                        />
                                        <button
                                            onClick={handleLoginChange}
                                            className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-all duration-300 cursor-pointer font-medium"
                                        >
                                            Изменить логин
                                        </button>
                                    </motion.div>
                                )}

                                <motion.form
                                    onSubmit={handleSubmit}
                                    className="space-y-6"
                                    variants={itemVariants}
                                >
                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">
                                            Новый пароль
                                        </label>
                                        <div className="relative">
                                            <input
                                                type="password"
                                                value={newPassword}
                                                onChange={(e) => setNewPassword(e.target.value)}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base transition-all pr-10"
                                                required
                                            />
                                            <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                                </svg>
                                            </div>
                                        </div>
                                        <p className="mt-1 text-sm text-gray-500">Минимум 6 символов</p>
                                    </div>

                                    <div>
                                        <label className="block text-base font-medium text-gray-700 mb-2">
                                            Роль
                                        </label>
                                        {role === 'Администратор' ? (
                                            <div className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-base bg-gray-50 cursor-not-allowed shadow-inner">
                                                Администратор
                                            </div>
                                        ) : role === 'Сотрудник' ? (
                                            <div className="px-4 py-3 border border-gray-300 rounded-lg text-gray-900 text-base bg-gray-50 cursor-not-allowed shadow-inner">
                                                Сотрудник
                                            </div>
                                        ) : (
                                            <select
                                                value={roleId ?? ''}
                                                onChange={(e) => setRoleId(Number(e.target.value))}
                                                className="w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 text-base transition-all appearance-none bg-white bg-[url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIyNCIgaGVpZ2h0PSIyNCIgdmlld0JveD0iMCAwIDI0IDI0IiBmaWxsPSJub25lIiBzdHJva2U9ImN1cnJlbnRDb2xvciIgc3Ryb2tlLXdpZHRoPSIyIiBzdHJva2UtbGluZWNhcD0icm91bmQiIHN0cm9rZS1saW5lam9pbj0icm91bmQiIGNsYXNzPSJsdWNpZGUgbHVjaWRlLWNoZXZyb24tZG93biI+PHBhdGggZD0ibTYgOSA2IDYgNi02Ii8+PC9zdmc+')] bg-no-repeat bg-[center_right_1rem]"
                                                required
                                            >
                                                <option value={2}>Пользователь</option>
                                                <option value={3}>Сотрудник</option>
                                            </select>
                                        )}
                                    </div>

                                    <div className="pt-4">
                                        <motion.button
                                            type="submit"
                                            whileHover={{ scale: 1.02 }}
                                            whileTap={{ scale: 0.98 }}
                                            className="w-full px-6 py-3.5 bg-gradient-to-r from-blue-600 to-purple-600 text-white rounded-lg shadow-lg hover:from-blue-700 hover:to-purple-700 transition-all duration-300 text-base font-medium cursor-pointer flex items-center justify-center gap-2"
                                        >
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                            </svg>
                                            Сохранить изменения
                                        </motion.button>
                                    </div>
                                </motion.form>
                            </motion.div>
                        </motion.div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}