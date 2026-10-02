'use client'
import { API_URL } from '@/app/lib/api';
import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'

export default function ConfirmEmailPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading')
    const [error, setError] = useState('')

    useEffect(() => {
        if (!token) {
            setStatus('error')
            setError('Неверная ссылка подтверждения')
            return
        }

        const confirmEmail = async () => {
            try {
                const response = await fetch(`${API_URL}/api/auth/confirm?token=${token}`)

                if (response.ok) {
                    setStatus('success')
                    // Автоматический переход через 5 секунд
                    setTimeout(() => router.push('/auth/login'), 5000)
                } else {
                    const errorData = await response.json()
                    setStatus('error')
                    setError(errorData.message || 'Ошибка подтверждения email')
                }
            } catch (err) {
                setStatus('error')
                setError('Ошибка соединения с сервером')
            }
        }

        confirmEmail()
    }, [token, router])

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    {status === 'success' ? 'Email подтверждён' : 'Подтверждение email'}
                </h2>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                    {status === 'loading' && (
                        <div className="space-y-4">
                            <svg className="animate-spin mx-auto h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                            </svg>
                            <p className="text-gray-700">Идёт подтверждение email...</p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="space-y-4">
                            <svg className="mx-auto h-12 w-12 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-lg font-medium text-gray-900">Ваш email успешно подтверждён!</p>
                            <p className="text-gray-600">Вы будете перенаправлены на страницу входа через 5 секунд.</p>
                            <div className="pt-4">
                                <Link href="/auth/login" className="text-blue-600 hover:text-blue-500 font-medium">
                                    Перейти сейчас
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="space-y-4">
                            <svg className="mx-auto h-12 w-12 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                            </svg>
                            <p className="text-lg font-medium text-gray-900">Ошибка подтверждения</p>
                            <p className="text-gray-600">{error}</p>
                            <div className="pt-4">
                                <Link href="/auth/register" className="text-blue-600 hover:text-blue-500 font-medium">
                                    Попробовать снова
                                </Link>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}