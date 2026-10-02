// app/companies/page.tsx
'use client'
import { API_URL } from '@/app/lib/api';
import { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Header } from "@/app/components/Header"
import Link from 'next/link'
import AuthGuard from "@/app/components/AuthGuard"
import useRole from "@/app/hooks/useRole"
import AdminSidebar from "@/app/components/AdminSidebar"

type Company = {
    company_id: number
    name: string
    is_accepted: boolean
}

type FilterOption = 'all' | 'accepted' | 'pending'

export default function CompaniesPage() {
    const router = useRouter()
    const [companies, setCompanies] = useState<Company[]>([])
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [page, setPage] = useState(1)
    const [searchQuery, setSearchQuery] = useState('')
    const [filter, setFilter] = useState<FilterOption>('all')
    const role = useRole()

    const itemsPerPage = 9

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true)
                setError(null)

                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/auth/login')
                    return
                }

                const response = await axios.get(`${API_URL}/api/comp-vac/company`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })

                setCompanies(response.data)
            } catch (error) {
                console.error('Ошибка загрузки компаний:', error)
                setError('Произошла ошибка при загрузке данных компаний')
            } finally {
                setLoading(false)
            }
        }

        void fetchData()
    }, [router])

    // Фильтрация и пагинация
    const filteredCompanies = companies.filter(company => {
        // Фильтр по поиску
        const matchesSearch = company.name.toLowerCase().includes(searchQuery.toLowerCase())

        // Фильтр по статусу
        let matchesFilter = true
        if (filter === 'accepted') {
            matchesFilter = company.is_accepted
        } else if (filter === 'pending') {
            matchesFilter = !company.is_accepted
        }

        return matchesSearch && matchesFilter
    })

    const totalPages = Math.ceil(filteredCompanies.length / itemsPerPage)
    const startIndex = (page - 1) * itemsPerPage
    const currentCompanies = filteredCompanies.slice(startIndex, startIndex + itemsPerPage)

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    {role === "Администратор" && <AdminSidebar />}

                    <main className="flex-1">
                        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
                            {/* Заголовок и кнопки */}
                            <div className="mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                <div>
                                    <h1 className="text-3xl font-bold text-gray-900">Компании</h1>
                                    <p className="mt-2 text-gray-600">
                                        {filteredCompanies.length} компаний найдено
                                    </p>
                                </div>

                                {(role === "Администратор" || role === "Работодатель") && (
                                    <Link
                                        href="/companies/create"
                                        className="whitespace-nowrap px-6 py-3 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg hover:from-green-600 hover:to-emerald-700 transition-all shadow-md hover:shadow-lg flex items-center gap-2"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                                            <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                                        </svg>
                                        Зарегистрировать компанию
                                    </Link>
                                )}
                            </div>

                            {/* Фильтры и поиск */}
                            <div className="mb-8 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
                                <div className="flex flex-col md:flex-row gap-4 items-center">
                                    <div className="relative w-full md:w-96">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Поиск по названию компании..."
                                            value={searchQuery}
                                            onChange={(e) => {
                                                setSearchQuery(e.target.value)
                                                setPage(1)
                                            }}
                                            className="block w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 placeholder-gray-400 transition-all"
                                        />
                                    </div>

                                    <div className="flex items-center space-x-2 w-full md:w-auto">
                                        <label htmlFor="filter" className="text-gray-700 whitespace-nowrap font-medium">
                                            Статус:
                                        </label>
                                        <select
                                            id="filter"
                                            value={filter}
                                            onChange={(e) => {
                                                setFilter(e.target.value as FilterOption)
                                                setPage(1)
                                            }}
                                            className="px-4 py-3 border border-gray-300 rounded-lg bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-gray-900 transition-all"
                                        >
                                            <option value="all">Все компании</option>
                                            <option value="accepted">Подтверждённые</option>
                                            <option value="pending">На модерации</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Контент */}
                            {loading ? (
                                <div className="flex justify-center items-center h-64">
                                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-500"></div>
                                    <span className="ml-3 text-gray-600">Загрузка...</span>
                                </div>
                            ) : error ? (
                                <div className="flex flex-col items-center justify-center p-6 bg-red-50 rounded-xl shadow-sm border border-red-100 text-center">
                                    <svg className="h-12 w-12 text-red-500 mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                    </svg>
                                    <h3 className="text-xl font-semibold text-red-800 mb-2">Ошибка загрузки</h3>
                                    <p className="text-red-600 max-w-md">{error}</p>
                                    <button
                                        onClick={() => window.location.reload()}
                                        className="mt-4 px-6 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors font-medium"
                                    >
                                        Попробовать снова
                                    </button>
                                </div>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
                                        {currentCompanies.map((company) => (
                                            <div
                                                key={company.company_id}
                                                className="bg-white overflow-hidden shadow-md hover:shadow-lg transition-all rounded-xl border border-gray-100 hover:border-blue-100"
                                            >
                                                <div className="p-6">
                                                    <div className="flex items-start justify-between">
                                                        <div>
                                                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2">
                                                                {company.name}
                                                            </h3>
                                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${
                                                                company.is_accepted
                                                                    ? 'bg-green-100 text-green-800'
                                                                    : 'bg-yellow-100 text-yellow-800'
                                                            }`}>
                                                                {company.is_accepted ? 'Подтверждена' : 'На модерации'}
                                                            </span>
                                                        </div>
                                                        <div className="bg-blue-50 p-2 rounded-lg">
                                                            <svg className="h-6 w-6 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                                                            </svg>
                                                        </div>
                                                    </div>
                                                    <div className="mt-6">
                                                        <Link
                                                            href={`/companies/${company.company_id}?from=company`}
                                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 font-medium transition-colors"
                                                        >
                                                            Подробнее о компании
                                                            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                                                            </svg>
                                                        </Link>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {filteredCompanies.length === 0 && (
                                        <div className="text-center py-12 bg-white rounded-xl shadow-sm border border-gray-100">
                                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            <h3 className="mt-2 text-lg font-medium text-gray-900">Компании не найдены</h3>
                                            <p className="mt-1 text-gray-500">Попробуйте изменить параметры поиска или фильтрации.</p>
                                        </div>
                                    )}

                                    {totalPages > 1 && (
                                        <div className="flex flex-col sm:flex-row justify-between items-center gap-4 mt-8 bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                                            <div className="text-sm text-gray-500">
                                                Показаны компании с {startIndex + 1} по {Math.min(startIndex + itemsPerPage, filteredCompanies.length)} из {filteredCompanies.length}
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
                        </div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}