'use client'
import { API_URL } from '@/app/lib/api';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import { Header } from "@/app/components/Header";
import AuthGuard from '@/app/components/AuthGuard'
import AdminSidebar from "@/app/components/AdminSidebar";
import EmpoyeeSidebar from "@/app/components/EmpoyeeSidebar";
import useRole from "@/app/hooks/useRole";
import { motion, AnimatePresence } from 'framer-motion';
import TeenagerSidebar from "@/app/components/TeenagerSidebar"
type Company = {
    company_id: number
    name: string
    inn: string
    kpp: string
    ogrn: string
    address: string
    director: string
    date_reg: string
    is_accepted: boolean
    userName: string
}

type Vacancy = {
    vacancy_id: number
    name: string
    title: string
    description: string | null
    company: Company
    contact: string
    experience: string | null
    format: string | null
    address: string | null
    schedule: string | null
    hours: string | null
    is_educated: boolean
}

export default function VacancyPage() {
    const router = useRouter()
    const params = useParams()
    const id = params.id
    const [vacancy, setVacancy] = useState<Vacancy | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
    const [responseStatus, setResponseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')

    useEffect(() => {
        const token = localStorage.getItem('token')
        if (!token) {
            router.push('/auth/login')
        }
    }, [router])

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const response = await axios.get(`${API_URL}/api/comp-vac/vacancy/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    validateStatus: (status) => {
                        return (status >= 200 && status < 300) || status === 404;
                    }
                });

                if (response.status === 404) {
                    setVacancy(null);
                    setError('Вакансия не найдена');
                } else {
                    setVacancy(response.data);
                    setError(null);
                }
            } catch (error) {
                console.error('Ошибка загрузки вакансии:', error);

                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        router.push('/auth/login');
                    } else if (error.response?.status === 404) {
                        setVacancy(null);
                        setError('Вакансия не найдена');
                    } else {
                        setError('Произошла ошибка при загрузке данных');
                        router.push('/main/main-page');
                    }
                } else {
                    setError('Неизвестная ошибка');
                    router.push('/main/main-page');
                }
            } finally {
                setLoading(false);
            }
        };

        void fetchData();
    }, [id, router]);

    const role = useRole()

    const handleResponse = async () => {
        try {
            setResponseStatus('loading')
            const token = localStorage.getItem('token')

            if (!token) {
                router.push('/auth/login')
                return
            }

            const response = await axios.post(
                `${API_URL}/api/comp-vac/vacancy/${vacancy?.vacancy_id}/response`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    validateStatus: (status) => {
                        return (status >= 200 && status < 300) || status === 404
                    }
                }
            )

            if (response.status === 404) {
                setResponseStatus('error')
                setIsResponseModalOpen(true)
            } else if (response.status >= 200 && response.status < 300) {
                setResponseStatus('success')
                setIsResponseModalOpen(true)
            }
        } catch (error) {
            console.error('Ошибка при отклике на вакансию:', error)
            setResponseStatus('error')
            setIsResponseModalOpen(true)

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 401) {
                    router.push('/auth/login')
                }
            }
        }
    }

    const getValue = (value: string | null) => value || 'Не указано'

    const formatDate = (dateString: string) => {
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear()
        return `${day}.${month}.${year}`
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-blue-50 to-gray-50">
                <Header />
                <div className="flex flex-1">
                    {/* Боковое меню для админа */}
                    {role === "Администратор" && <AdminSidebar />}
                    {role === "Сотрудник" && <EmpoyeeSidebar />}
                    {role === "Пользователь" && <TeenagerSidebar />}

                    <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8 w-full">
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.3 }}
                        >
                            <Link
                                href="/main/main-page"
                                className="inline-flex items-center mb-4 text-blue-600 hover:text-blue-800 transition-colors duration-300 cursor-pointer group"
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform"
                                    viewBox="0 0 20 20"
                                    fill="currentColor"
                                >
                                    <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                </svg>
                                Назад к списку вакансий
                            </Link>
                        </motion.div>

                        {loading ? (
                            <motion.div
                                className="flex justify-center items-center h-64"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                            >
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    className="rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"
                                />
                            </motion.div>
                        ) : !vacancy ? (
                            <motion.div
                                className="flex justify-center items-center p-4 bg-red-100 text-red-800 rounded-md shadow-lg"
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                transition={{ type: 'spring', stiffness: 300 }}
                            >
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    className="h-6 w-6 mr-3"
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        strokeLinecap="round"
                                        strokeLinejoin="round"
                                        strokeWidth={2}
                                        d="M12 8c2 0 2 2 2 2s0 2-2 2s-2-2-2-2s0-2 2-2zm0 6c3.333 0 6 1.667 6 4s-2.667 4-6 4s-6-1.667-6-4s2.667-4 6-4z"
                                    />
                                </svg>
                                <p className="text-lg font-semibold">Вакансия не найдена!</p>
                            </motion.div>
                        ) : (
                            <motion.div
                                className="bg-white overflow-hidden shadow-xl rounded-lg"
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.4 }}
                            >
                                <div className="px-4 py-5 sm:p-6">
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <motion.h1
                                                className="text-2xl font-bold text-blue-700"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.1 }}
                                            >
                                                {vacancy.title || 'Без названия'}
                                            </motion.h1>
                                            <motion.div
                                                className="text-black text-2xl font-semibold hover:text-blue-600 transition-colors duration-300 cursor-pointer"
                                                onClick={(e) => {
                                                    e.stopPropagation();
                                                    router.push(`/companies/${vacancy.company.company_id}?from=vacancy&vacancyId=${vacancy?.vacancy_id}`);
                                                }}
                                                whileHover={{ scale: 1.01 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {vacancy.company.name}
                                            </motion.div>
                                        </div>
                                        <motion.div
                                            className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm font-medium"
                                            initial={{ scale: 0.9 }}
                                            animate={{ scale: 1 }}
                                            transition={{ type: 'spring', stiffness: 500 }}
                                        >
                                            {vacancy.is_educated ? 'Требуется обучение' : 'Обучение не требуется'}
                                        </motion.div>
                                    </div>

                                    <div className="mt-8 grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Заработная плата</h3>
                                                <p className="text-gray-700">
                                                    {getValue(vacancy.hours)}
                                                </p>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Требования</h3>
                                                <p className="text-gray-700">
                                                    {getValue(vacancy.experience)}
                                                </p>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: -20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Описание вакансии</h3>
                                                <p className="text-gray-700 whitespace-pre-line">
                                                    {getValue(vacancy.description)}
                                                </p>
                                            </motion.div>

                                        </div>

                                        <div className="space-y-6">
                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">Детали</h3>
                                                <div className="space-y-3">
                                                    <motion.div
                                                        className="flex items-start"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                        </svg>
                                                        <div className="text-black">
                                                            <span className="font-medium">Адрес: </span>
                                                            {getValue(vacancy.address)}
                                                        </div>
                                                    </motion.div>
                                                    <motion.div
                                                        className="flex items-start"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                        </svg>
                                                        <div className="text-black">
                                                            <span className="font-medium">График работы: </span>
                                                            {getValue(vacancy.schedule)}
                                                        </div>
                                                    </motion.div>
                                                    <motion.div
                                                        className="flex items-start"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                                                        </svg>
                                                        <div className="text-black">
                                                            <span className="font-medium">Формат работы: </span>
                                                            {getValue(vacancy.format)}
                                                        </div>
                                                    </motion.div>
                                                    <motion.div
                                                        className="flex items-start"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <div className="text-black">
                                                            <span className="font-medium">Эл. почта: </span>
                                                            {getValue(vacancy.company.userName)}
                                                        </div>
                                                    </motion.div>
                                                    <motion.div
                                                        className="flex items-start"
                                                        whileHover={{ x: 5 }}
                                                    >
                                                        <svg className="h-5 w-5 text-blue-500 mr-2 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                                                        </svg>
                                                        <div className="text-black">
                                                            <span className="font-medium">Контакт: </span>
                                                            <span className="font-medium"> {vacancy.contact} </span>
                                                        </div>
                                                    </motion.div>
                                                </div>
                                            </motion.div>

                                            <motion.div
                                                initial={{ opacity: 0, x: 20 }}
                                                animate={{ opacity: 1, x: 0 }}
                                                transition={{ delay: 0.3 }}
                                            >
                                                <h3 className="text-lg font-semibold text-gray-900 mb-2">О компании</h3>
                                                <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                                                    <p className="text-black">
                                                        {getValue(vacancy.company.name)} - компания, зарегистрированная {formatDate(vacancy.company.date_reg)}.
                                                    </p>
                                                    <p className="text-black mt-2">
                                                        <span className="font-medium">Юридический адрес:</span> {vacancy.company.address}
                                                    </p>
                                                </div>
                                            </motion.div>
                                        </div>
                                    </div>

                                    <motion.div
                                        className="mt-8 pt-6 border-t border-gray-200 flex justify-center"
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        transition={{ delay: 0.4 }}
                                    >
                                        <motion.button
                                            type="button"
                                            className="inline-flex items-center px-6 py-3 border border-transparent text-lg font-medium rounded-md shadow-sm text-white bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 cursor-pointer relative overflow-hidden"
                                            onClick={handleResponse}
                                            disabled={responseStatus === 'loading'}
                                            whileHover={{ scale: 1.03 }}
                                            whileTap={{ scale: 0.98 }}
                                        >
                                            {responseStatus === 'loading' && (
                                                <motion.span
                                                    className="absolute inset-0 bg-blue-700 opacity-20"
                                                    animate={{
                                                        x: [-100, 100],
                                                    }}
                                                    transition={{
                                                        repeat: Infinity,
                                                        duration: 1.5,
                                                        ease: "easeInOut",
                                                    }}
                                                />
                                            )}
                                            {responseStatus === 'loading' ? (
                                                <>
                                                    <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Отправка...
                                                </>
                                            ) : (
                                                'Откликнуться на вакансию'
                                            )}
                                        </motion.button>
                                    </motion.div>
                                </div>
                            </motion.div>
                        )}

                        {/* Модальное окно отклика */}
                        <AnimatePresence>
                            {isResponseModalOpen && (
                                <motion.div
                                    className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                >
                                    <motion.div
                                        className="bg-white rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl"
                                        initial={{ scale: 0.9, opacity: 0 }}
                                        animate={{ scale: 1, opacity: 1 }}
                                        exit={{ scale: 0.9, opacity: 0 }}
                                        transition={{ type: 'spring', damping: 20 }}
                                    >
                                        {responseStatus === 'success' ? (
                                            <>
                                                <motion.div
                                                    className="flex items-center justify-center mb-4"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </motion.div>
                                                <h3 className="text-xl font-medium text-center mb-2 text-gray-800">Отклик отправлен!</h3>
                                                <p className="text-gray-600 text-center mb-6">
                                                    Вы успешно откликнулись на вакансию "{vacancy?.title || vacancy?.name}". Если работодатель заинтересуется вами, с вами обязательно свяжутся!
                                                </p>
                                            </>
                                        ) : (
                                            <>
                                                <motion.div
                                                    className="flex items-center justify-center text-red-500 mb-4"
                                                    initial={{ scale: 0 }}
                                                    animate={{ scale: 1 }}
                                                    transition={{ delay: 0.1 }}
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                                    </svg>
                                                </motion.div>
                                                <h3 className="text-xl font-medium text-center mb-2 text-gray-800">Ошибка!</h3>
                                                <p className="text-gray-600 text-center mb-6">
                                                    Не удалось отправить отклик на вакансию "{vacancy?.title || vacancy?.name}"
                                                </p>
                                            </>
                                        )}
                                        <div className="flex justify-center">
                                            <motion.button
                                                onClick={() => {
                                                    setIsResponseModalOpen(false)
                                                    setResponseStatus('idle')
                                                }}
                                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none cursor-pointer transition-colors duration-300"
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                            >
                                                Закрыть
                                            </motion.button>
                                        </div>
                                    </motion.div>
                                </motion.div>
                            )}
                        </AnimatePresence>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}