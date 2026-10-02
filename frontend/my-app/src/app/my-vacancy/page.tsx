'use client'
import { API_URL } from '@/app/lib/api';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/app/components/AuthGuard'
import { Header } from "@/app/components/Header"
import AdminSidebar from "@/app/components/AdminSidebar"
import TeenagerSidebar from "@/app/components/TeenagerSidebar"
import EmployeeSidebar from "@/app/components/EmpoyeeSidebar"
import useRole from "@/app/hooks/useRole"
import {useLogin} from "@/app/hooks/useLogin"

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

export default function HomePage() {
    const router = useRouter()
    const [vacancies, setVacancies] = useState<Vacancy[]>([])
    const [loading, setLoading] = useState(true)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const itemsPerPage = 12
    const [isResponseModalOpen, setIsResponseModalOpen] = useState(false)
    const [responseStatus, setResponseStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
    const [currentVacancyName, setCurrentVacancyName] = useState('')
    const [dropdownOpen, setDropdownOpen] = useState<number | null>(null)
    const role = useRole()
    const login = useLogin()

    useEffect(() => {
        const fetchData = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/api/comp-vac/my-vacancy`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                setVacancies(response.data)
            } catch (error) {
                console.error('Ошибка загрузки вакансий:', error)
                if (axios.isAxiosError(error) && error.response?.status === 401) {
                    router.push('/auth/login')
                }
            } finally {
                setLoading(false)
            }
        }

        void fetchData()
    }, [router])

    const getValue = (value: string | null) => value || 'Не указано'

    const handleResponse = async (vacancyId: number, vacancyName: string) => {
        try {
            setResponseStatus('loading')
            setCurrentVacancyName(vacancyName)
            const token = localStorage.getItem('token')

            if (!token) {
                router.push('/auth/login')
                return
            }

            const response = await axios.post(
                `${API_URL}/api/comp-vac/vacancy/${vacancyId}/response`,
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

    const toggleDropdown = (id: number) => {
        setDropdownOpen(dropdownOpen === id ? null : id)
    }

    const handleEdit = (vacancyId: number) => {
        router.push(`/vacancies/${vacancyId}/edit`)
    }

    const handleDelete = async (vacancyId: number) => {
        if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const response = await axios.delete(
                    `${API_URL}/api/comp-vac/vacancy/${vacancyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 200) {
                    setVacancies(vacancies.filter(vacancy => vacancy.vacancy_id !== vacancyId));
                }
            } catch (error) {
                console.error('Ошибка при удалении вакансии:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        router.push('/auth/login');
                    } else {
                        alert(`Ошибка при удалении: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
                    }
                }
            }
        }
    };

    const handleDeleteMy = async (vacancyId: number) => {
        if (confirm('Вы уверены, что хотите удалить эту вакансию?')) {
            try {
                const token = localStorage.getItem('token');
                if (!token) {
                    router.push('/auth/login');
                    return;
                }

                const response = await axios.delete(
                    `${API_URL}/api/comp-vac/my-company/${vacancyId}`,
                    {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'application/json',
                        },
                    }
                );

                if (response.status === 200) {
                    setVacancies(vacancies.filter(vacancy => vacancy.vacancy_id !== vacancyId));
                }
            } catch (error) {
                console.error('Ошибка при удалении вакансии:', error);
                if (axios.isAxiosError(error)) {
                    if (error.response?.status === 401) {
                        router.push('/auth/login');
                    } else {
                        alert(`Ошибка при удалении: ${error.response?.data?.message || 'Неизвестная ошибка'}`);
                    }
                }
            }
        }
    };

    const filteredVacancies = vacancies.filter(vacancy =>
        vacancy.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        vacancy.company.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const totalPages = Math.ceil(filteredVacancies.length / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const currentVacancies = filteredVacancies.slice(startIndex, startIndex + itemsPerPage)

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
                <Header />
                <div className="flex flex-1">
                    {role === "Администратор" && <AdminSidebar />}
                    {role === "Пользователь" && <TeenagerSidebar/>}
                    {role === "Сотрудник" && <EmployeeSidebar />}
                    <main className="flex-1">
                        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                            {/* Заголовок и поиск */}
                            <div className="mb-8">
                                <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
                                    <div>
                                        <h1 className="text-3xl font-bold text-gray-900">Вакансии</h1>
                                        <p className="mt-2 text-gray-600">
                                            {filteredVacancies.length} вакансий найдено
                                        </p>
                                    </div>

                                    <div className="relative w-full md:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Поиск по вакансии или компании..."
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all shadow-sm"
                                        />
                                    </div>


                                </div>
                            </div>

                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <span className="ml-3 text-gray-600">Загрузка вакансий...</span>
                                </div>
                            ) : currentVacancies.length === 0 ? (
                                <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                    <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                    </svg>
                                    <h3 className="mt-2 text-lg font-medium text-gray-900">Вакансии не найдены</h3>
                                    <p className="mt-1 text-gray-500">Попробуйте изменить параметры поиска</p>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                        {currentVacancies.map((vacancy) => (
                                            <div
                                                key={vacancy.vacancy_id}
                                                className="bg-white overflow-hidden shadow-lg hover:shadow-xl transition-all rounded-xl border border-gray-100 hover:border-blue-100 flex flex-col"
                                            >
                                                {/* Шапка карточки */}
                                                <div className="p-6 pb-0">
                                                    <div className="flex justify-between items-start">
                                                        <div
                                                            className="cursor-pointer"
                                                            onClick={() => router.push(`/vacancies/${vacancy.vacancy_id}`)}
                                                        >
                                                            <h3 className="text-xl font-bold text-gray-900 line-clamp-2">
                                                                {vacancy.name || 'Без названия'}
                                                            </h3>
                                                        </div>

                                                        {(role === "Администратор" ||
                                                            (role === "Сотрудник" && login === vacancy.company.userName)) && (
                                                            <div className="relative">
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        toggleDropdown(vacancy.vacancy_id)
                                                                    }}
                                                                    className="text-gray-400 hover:text-gray-600 focus:outline-none"
                                                                >
                                                                    <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z" />
                                                                    </svg>
                                                                </button>

                                                                {dropdownOpen === vacancy.vacancy_id && (
                                                                    <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border border-gray-200">
                                                                        <div className="py-1">
                                                                            <button
                                                                                onClick={(e) => {
                                                                                    e.stopPropagation()
                                                                                    handleEdit(vacancy.vacancy_id)
                                                                                    setDropdownOpen(null)
                                                                                }}
                                                                                className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                            >
                                                                                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                                                                                </svg>
                                                                                Редактировать
                                                                            </button>

                                                                            {/* Удаление оставляем только для администратора */}
                                                                            {role === "Администратор" && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        handleDelete(vacancy.vacancy_id)
                                                                                        setDropdownOpen(null)
                                                                                    }}
                                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                                >
                                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                    Удалить
                                                                                </button>
                                                                            )}

                                                                            {(role === "Сотрудник" && login === vacancy.company.userName) && (
                                                                                <button
                                                                                    onClick={(e) => {
                                                                                        e.stopPropagation()
                                                                                        handleDelete(vacancy.vacancy_id)
                                                                                        setDropdownOpen(null)
                                                                                    }}
                                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 flex items-center gap-2"
                                                                                >
                                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                                                    </svg>
                                                                                    Удалить
                                                                                </button>
                                                                            )}
                                                                        </div>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        )}
                                                    </div>

                                                    {/* Компания */}
                                                    <div
                                                        className="mt-4 flex items-center gap-3 cursor-pointer group"
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            router.push(`/companies/${vacancy.company.company_id}`);
                                                        }}
                                                    >
                                                        <div className="bg-blue-100 p-2 rounded-lg">
                                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                        <span className="font-medium text-gray-900 group-hover:text-blue-600 transition-colors">
                                                            {vacancy.company.name}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Основная информация */}
                                                <div
                                                    className="p-6 pt-4 flex-grow cursor-pointer"
                                                    onClick={() => router.push(`/vacancies/${vacancy.vacancy_id}`)}
                                                >
                                                    <div className="space-y-4">
                                                        {vacancy.hours && vacancy.hours !== 'Не указано' && (
                                                            <div className="flex items-start gap-3">
                                                                <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3h6a3 3 0 010 6H9m0 0v12m0-6h4" />
                                                                </svg>
                                                                <div>
                                                                    <p className="text-sm text-gray-500">Зарплата</p>
                                                                    <p className="font-medium text-gray-900">{vacancy.hours}</p>
                                                                </div>
                                                            </div>
                                                        )}

                                                        <div className="flex items-start gap-3">
                                                            <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-gray-500">Адрес</p>
                                                                <p className="font-medium text-gray-900">{getValue(vacancy.address)}</p>
                                                            </div>
                                                        </div>

                                                        <div className="flex items-start gap-3">
                                                            <svg className="h-5 w-5 text-gray-400 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                            </svg>
                                                            <div>
                                                                <p className="text-sm text-gray-500">График работы</p>
                                                                <p className="font-medium text-gray-900">{getValue(vacancy.schedule)}</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>

                                                {/* Футер карточки */}
                                                <div className="px-6 pb-6 pt-4">
                                                    <button
                                                        onClick={(e) => {
                                                            e.stopPropagation();
                                                            handleResponse(vacancy.vacancy_id, vacancy.name);
                                                        }}
                                                        disabled={responseStatus === 'loading'}
                                                        className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-medium rounded-lg shadow-md transition-all flex items-center justify-center cursor-pointer"
                                                    >
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
                                                    </button>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Пагинация */}
                                    {totalPages > 1 && (
                                        <div className="mt-10 flex flex-col sm:flex-row justify-between items-center gap-4 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                Показаны вакансии с {startIndex + 1} по {Math.min(startIndex + itemsPerPage, filteredVacancies.length)} из {filteredVacancies.length}
                                            </div>

                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => setPage((prev) => Math.max(prev - 1, 1))}
                                                    disabled={page === 1}
                                                    className={`px-4 py-2 border rounded-lg flex items-center gap-1 ${page === 1 ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                                                    </svg>
                                                    Назад
                                                </button>

                                                <div className="flex items-center gap-1">
                                                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                                                        let pageNum
                                                        if (totalPages <= 5) {
                                                            pageNum = i + 1
                                                        } else if (page <= 3) {
                                                            pageNum = i + 1
                                                        } else if (page >= totalPages - 2) {
                                                            pageNum = totalPages - 4 + i
                                                        } else {
                                                            pageNum = page - 2 + i
                                                        }

                                                        return (
                                                            <button
                                                                key={pageNum}
                                                                onClick={() => setPage(pageNum)}
                                                                className={`w-10 h-10 rounded-lg flex items-center justify-center ${page === pageNum ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                                            >
                                                                {pageNum}
                                                            </button>
                                                        )
                                                    })}

                                                    {totalPages > 5 && page < totalPages - 2 && (
                                                        <span className="px-2">...</span>
                                                    )}

                                                    {totalPages > 5 && page < totalPages - 2 && (
                                                        <button
                                                            onClick={() => setPage(totalPages)}
                                                            className={`w-10 h-10 rounded-lg flex items-center justify-center ${page === totalPages ? 'bg-blue-600 text-white' : 'text-gray-700 hover:bg-gray-100'}`}
                                                        >
                                                            {totalPages}
                                                        </button>
                                                    )}
                                                </div>

                                                <button
                                                    onClick={() => setPage((prev) => Math.min(prev + 1, totalPages))}
                                                    disabled={page === totalPages}
                                                    className={`px-4 py-2 border rounded-lg flex items-center gap-1 ${page === totalPages ? 'text-gray-400 bg-gray-50 cursor-not-allowed' : 'text-gray-700 hover:bg-gray-100'}`}
                                                >
                                                    Вперёд
                                                    <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                                                    </svg>
                                                </button>
                                            </div>
                                        </div>
                                    )}
                                </>
                            )}

                            {/* Модальное окно отклика */}
                            {isResponseModalOpen && (
                                <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                                    <div className="bg-white rounded-xl shadow-2xl max-w-md w-full overflow-hidden">
                                        <div className="p-6">
                                            {responseStatus === 'success' ? (
                                                <>
                                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-green-100 mb-4">
                                                        <svg className="h-6 w-6 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Отклик отправлен!</h3>
                                                    <p className="text-gray-500 text-center mb-6">
                                                        Вы успешно откликнулись на вакансию <span className="font-medium text-gray-900">"{currentVacancyName}"</span>.
                                                    </p>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 mb-4">
                                                        <svg className="h-6 w-6 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                                        </svg>
                                                    </div>
                                                    <h3 className="text-lg font-medium text-center text-gray-900 mb-2">Ошибка отправки</h3>
                                                    <p className="text-gray-500 text-center mb-6">
                                                        Не удалось отправить отклик на вакансию <span className="font-medium text-gray-900">"{currentVacancyName}"</span>.
                                                    </p>
                                                </>
                                            )}

                                            <button
                                                onClick={() => {
                                                    setIsResponseModalOpen(false)
                                                    setResponseStatus('idle')
                                                }}
                                                className={`w-full px-4 py-3 rounded-lg font-medium text-white ${responseStatus === 'success' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'} transition-colors`}
                                            >
                                                Закрыть
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}