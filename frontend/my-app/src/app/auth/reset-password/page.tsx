'use client'
import { API_URL } from '@/app/lib/api';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру'),
    repeatPassword: z.string()
}).refine(data => data.password === data.repeatPassword, {
    message: 'Пароли не совпадают',
    path: ['repeatPassword']
})

export default function ResetPasswordPage() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get('token')
    const [isLoading, setIsLoading] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm({
        resolver: zodResolver(resetPasswordSchema)
    })

    const onSubmit = async (data: { password: any; repeatPassword: any }) => {
        if (!token) {
            setError('root', { message: 'Недействительная ссылка для сброса пароля' })
            return
        }

        setIsLoading(true)
        try {
            const response = await axios.post(
                `${API_URL}/api/auth/confirm-reset-password?token=${token}`,
                {
                    password: data.password,
                    repeatPassword: data.repeatPassword
                }
            )

            if (response.status === 200) {
                setIsSuccess(true)
            }
        } catch (error) {
            // Обработка ошибок
        } finally {
            setIsLoading(false)
        }
    }

    if (isSuccess) {
        return (
            <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
                <div className="sm:mx-auto sm:w-full sm:max-w-md">
                    <h2 className="text-center text-3xl font-bold text-gray-900">
                        Пароль успешно изменен
                    </h2>
                </div>

                <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                    <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10 text-center">
                        {/* Иконка успеха */}
                        <div className="mt-6">
                            <Link
                                href="/auth/login"
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                            >
                                Войти в систему
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Сброс пароля
                </h2>
                <p className="mt-2 text-center text-gray-800">
                    Введите новый пароль для вашего аккаунта
                </p>
            </div>

            <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
                <div className="bg-white py-8 px-4 shadow sm:rounded-lg sm:px-10">
                    {errors.root && (
                        <div className="mb-4 bg-red-50 border-l-4 border-red-500 p-4">
                            <p className="text-red-700 font-medium">{errors.root.message}</p>
                        </div>
                    )}

                    <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Новый пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600 font-medium">
                                        {errors.password.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="repeatPassword" className="block text-sm font-medium text-gray-900">
                                Повторите пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="repeatPassword"
                                    type="password"
                                    {...register('repeatPassword')}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900"
                                />
                                {errors.repeatPassword && (
                                    <p className="mt-1 text-sm text-red-600 font-medium">
                                        {errors.repeatPassword.message}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50"
                            >
                                {isLoading ? 'Сохранение...' : 'Сохранить новый пароль'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}