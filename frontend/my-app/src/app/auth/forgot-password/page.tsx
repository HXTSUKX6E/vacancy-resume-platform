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
const forgotPasswordSchema = z.object({
    email: z.string().email('Некорректный email')
})

type ForgotPasswordFormData = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm<ForgotPasswordFormData>({
        resolver: zodResolver(forgotPasswordSchema)
    })

    const onSubmit = async (formData: ForgotPasswordFormData) => {
        setIsLoading(true)
        try {
            // Преобразуем данные перед отправкой
            const requestData = {
                login: formData.email // Переименовываем email в login
            }

            const response = await axios.post(
                `${API_URL}/api/auth/forgot-password`,
                requestData, // Используем преобразованные данные
                {
                    timeout: 10000,
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            )

            if (response.status === 200) {
                setIsSuccess(true)
            } else {
                throw new Error('Не удалось отправить запрос')
            }
        } catch (error) {
            if (axios.isAxiosError(error)) {
                if (error.response) {
                    // Ошибки от сервера
                    const status = error.response.status
                    const serverMessage = error.response.data?.message || 'Ошибка сервера'

                    if (status === 404) {
                        setError('email', { message: 'Пользователь с таким email не найден' })
                    } else if (status === 429) {
                        setError('root', { message: 'Слишком много запросов. Попробуйте позже' })
                    } else {
                        setError('root', { message: serverMessage })
                    }
                } else if (error.request) {
                    setError('root', { message: 'Нет ответа от сервера' })
                } else {
                    setError('root', { message: 'Ошибка при отправке запроса' })
                }
            } else {
                setError('root', { message: 'Неизвестная ошибка' })
            }
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                        Проверьте вашу почту
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-6 shadow rounded-lg sm:px-10 border border-gray-200 text-center">
                        <svg
                            className="mx-auto h-12 w-12 text-green-500"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                            xmlns="http://www.w3.org/2000/svg"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                        </svg>
                        <p className="mt-4 text-lg font-medium text-gray-900">
                            Инструкции по восстановлению пароля отправлены на ваш email
                        </p>
                        <p className="mt-2 text-sm text-gray-600">
                            Если письмо не пришло, проверьте папку "Спам" или попробуйте отправить запрос повторно через несколько минут
                        </p>
                        <div className="mt-6">
                            <button
                                onClick={() => router.push('/auth/login')}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                Вернуться к входу
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="mt-6 text-center text-3xl font-extrabold text-gray-900">
                    Восстановление пароля
                </h2>
                <p className="mt-2 text-center text-sm text-gray-600">
                    Введите email, указанный при регистрации
                </p>
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
                                    {...register('email')}
                                    className={`appearance-none block w-full px-3 py-2 border ${
                                        errors.email ? 'border-red-300' : 'border-gray-300'
                                    } rounded-md shadow-sm text-gray-900 focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm`}
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className={`w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 ${
                                    isLoading ? 'opacity-75 cursor-not-allowed' : ''
                                }`}
                            >
                                {isLoading ? (
                                    <span className="flex items-center">
                    <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                    >
                      <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                      ></circle>
                      <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    Отправка...
                  </span>
                                ) : (
                                    'Отправить инструкции'
                                )}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Вспомнили пароль?{' '}
                            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Войти в аккаунт
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}