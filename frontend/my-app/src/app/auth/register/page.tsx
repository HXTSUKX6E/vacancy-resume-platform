'use client'
import { API_URL } from '@/app/lib/api';
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useState } from 'react'

const registerSchema = z.object({
    email: z.string()
        .min(1, 'Email обязателен')
        .email('Некорректный email')
        .max(100, 'Email слишком длинный'),
    password: z.string()
        .min(8, 'Пароль должен содержать минимум 8 символов')
        .max(50, 'Пароль слишком длинный')
        .regex(/[A-Z]/, 'Пароль должен содержать хотя бы одну заглавную букву')
        .regex(/[0-9]/, 'Пароль должен содержать хотя бы одну цифру')
})

export default function RegisterPage() {
    const router = useRouter()
    const [isLoading, setIsLoading] = useState(false)
    const {
        register,
        handleSubmit,
        formState: { errors },
        setError
    } = useForm({
        resolver: zodResolver(registerSchema)
    })

    const onSubmit = async (data: { email: string; password: string }) => {
        setIsLoading(true);
        try {
            const response = await axios.post(
                `${API_URL}/api/auth/register`,
                {
                    login: data.email,
                    password: data.password
                },
                {
                    timeout: 10000, // 10 секунд таймаут
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (response.status === 200 || response.status === 201) {
                router.push('/auth/register-success');
                return;
            }

            // Обработка нестандартных успешных статусов
            setError('root', {
                type: 'manual',
                message: 'Регистрация завершена, но возникла непредвиденная ошибка'
            });

        } catch (error) {
            if (axios.isAxiosError(error)) {
                // Ошибка Axios
                if (error.code === 'ECONNABORTED') {
                    setError('root', {
                        type: 'manual',
                        message: 'Таймаут соединения. Попробуйте позже'
                    });
                } else if (error.response) {
                    // Ошибка с ответом сервера
                    const status = error.response.status;
                    const serverMessage = error.response.data?.message || 'Ошибка сервера';

                    switch (status) {
                        case 400:
                            setError('root', {
                                type: 'manual',
                                message: serverMessage || 'Некорректные данные'
                            });
                            break;
                        case 409:
                            setError('email', {
                                type: 'manual',
                                message: 'Пользователь с таким email уже существует'
                            });
                            break;
                        case 422:
                            // Обработка ошибок валидации
                            if (error.response.data.errors) {
                                Object.entries(error.response.data.errors).forEach(([field, messages]) => {
                                    // @ts-ignore
                                    return setError(field, {
                                        type: 'manual',
                                        message: (messages as string[]).join(', ')
                                    })
                                });
                            }
                            break;
                        case 429:
                            setError('root', {
                                type: 'manual',
                                message: 'Слишком много запросов. Попробуйте позже'
                            });
                            break;
                        case 500:
                        case 502:
                        case 503:
                            setError('root', {
                                type: 'manual',
                                message: 'Сервис временно недоступен. Попробуйте позже'
                            });
                            break;
                        default:
                            setError('root', {
                                type: 'manual',
                                message: serverMessage
                            });
                    }
                } else if (error.request) {
                    // Ошибка без ответа сервера
                    setError('root', {
                        type: 'manual',
                        message: 'Нет ответа от сервера. Проверьте интернет-соединение'
                    });
                } else {
                    // Другие ошибки Axios
                    setError('root', {
                        type: 'manual',
                        message: 'Ошибка при отправке запроса'
                    });
                }
            } else if (error instanceof Error) {
                // Стандартные JavaScript ошибки
                setError('root', {
                    type: 'manual',
                    message: error.message
                });
            } else {
                // Неизвестные ошибки
                setError('root', {
                    type: 'manual',
                    message: 'Неизвестная ошибка при регистрации'
                });
            }
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
            <div className="sm:mx-auto sm:w-full sm:max-w-md">
                <h2 className="text-center text-3xl font-bold text-gray-900">
                    Создать аккаунт
                </h2>
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
                            <label htmlFor="email" className="block text-sm font-medium text-gray-900">
                                Email
                            </label>
                            <div className="mt-1">
                                <input
                                    id="email"
                                    type="email"
                                    {...register('email')}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                                    style={{ color: '#111827' }} // Добавлен явный темный цвет текста
                                />
                                {errors.email && (
                                    <p className="mt-1 text-sm text-red-600">{errors.email.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-gray-900">
                                Пароль
                            </label>
                            <div className="mt-1">
                                <input
                                    id="password"
                                    type="password"
                                    {...register('password')}
                                    className="block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm text-gray-900 placeholder-gray-400"
                                    style={{ color: '#111827' }} // Добавлен явный темный цвет текста
                                />
                                {errors.password && (
                                    <p className="mt-1 text-sm text-red-600">{errors.password.message}</p>
                                )}
                            </div>
                        </div>

                        <div>
                            <button
                                type="submit"
                                disabled={isLoading}
                                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                            >
                                {isLoading ? 'Регистрация...' : 'Зарегистрироваться'}
                            </button>
                        </div>
                    </form>

                    <div className="mt-6 text-center">
                        <p className="text-sm text-gray-600">
                            Уже есть аккаунт?{' '}
                            <Link href="/auth/login" className="font-medium text-blue-600 hover:text-blue-500">
                                Войти
                            </Link>
                        </p>
                    </div>
                </div>
            </div>
        </div>
    )
}