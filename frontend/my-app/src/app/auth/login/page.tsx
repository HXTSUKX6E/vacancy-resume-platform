'use client'
import { API_URL } from '@/app/lib/api';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

// Схема валидации
const loginSchema = z.object({
    login: z.string().email('Некорректный email'),
    password: z.string().min(8, 'Пароль должен содержать минимум 8 символов')
})

type LoginFormData = z.infer<typeof loginSchema>

export default function LoginPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<LoginFormData>({
        resolver: zodResolver(loginSchema)
    })

    const onSubmit = async (data: LoginFormData) => {
        setIsLoading(true)
        try {
            const response = await axios.post(`${API_URL}/api/auth/login`, {
                login: data.login,
                password: data.password
            }, {
                timeout: 5000 // 5 секунд таймаут
            })

            if (response.data.authenticated && response.data.token) {
                localStorage.setItem('token', response.data.token)
                router.push('/main/main-page')
            } else {
                setError('root', {
                    message: 'Ошибка аутентификации. Попробуйте снова'
                })
            }

        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Ошибки Axios
                if (error.code === 'ECONNABORTED') {
                    setError('root', {
                        message: 'Таймаут соединения. Попробуйте позже'
                    })
                } else if (error.response) {
                    // Ошибки от сервера
                    const status = error.response.status
                    const responseData = error.response.data

                    if (status === 403) {
                        // Аккаунт не подтвержден
                        setError('root', {
                            message: responseData.error || 'Аккаунт не подтвержден. Проверьте почту.'
                        })
                    } else if (status === 401) {
                        // Неверные учетные данные
                        setError('root', {
                            message: responseData.error || 'Неверный email или пароль! Повторите попытку...'
                        })
                    } else if (status === 400) {
                        // Некорректный запрос
                        setError('root', {
                            message: responseData.error || 'Некорректные данные'
                        })
                    } else if (status >= 500) {
                        // Серверные ошибки
                        setError('root', {
                            message: 'Ошибка сервера. Попробуйте позже'
                        })
                    }
                } else if (error.request) {
                    // Нет ответа от сервера
                    setError('root', {
                        message: 'Нет ответа от сервера. Проверьте интернет-соединение'
                    })
                }
            } else if (error instanceof Error) {
                // Другие JavaScript ошибки
                setError('root', {
                    message: error.message
                })
            } else {
                // Неизвестные ошибки
                setError('root', {
                    message: 'Неизвестная ошибка при входе'
                })
            }
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Вход в систему
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-200">
                    {errors.root && (
                        <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md text-sm">
                            {errors.root.message}
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    {...register('login')}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.login ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.login && (
                                    <p className="mt-1 text-sm text-red-600">{errors.login.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-700">
                                Пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    {...register('password')}
                                    className={`appearance-none block w-full px-3 py-2 border ${errors.password ? 'border-red-300' : 'border-gray-300'} rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div className="flex items-center justify-between">
                            <div className="text-sm">
                                <Link href="/auth/forgot-password" className="font-medium text-blue-600 hover:text-blue-500">
                                    Забыли пароль?
                                </Link>
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${isLoading ? 'opacity-75 cursor-not-allowed' : ''}`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Вход...
                                    </span>
                                ) : 'Войти'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6">
                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <div className="w-full border-t border-gray-300"></div>
                            </div>
                            <div className="relative flex justify-center text-sm">
                                <span className="px-2 bg-white text-gray-500">
                                    Или
                                </span>
                            </div>
                        </div>

                        <div className="mt-6 text-center">
                            <p className="text-sm text-gray-600">
                                Нет аккаунта?{' '}
                                <Link href="/auth/register" className="font-medium text-blue-600 hover:text-blue-500">
                                    Зарегистрироваться
                                </Link>
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}