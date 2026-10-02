'use client'
import { API_URL } from '@/app/lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import { Header } from "@/app/components/Header"
import Link from 'next/link'
import AuthGuard from "@/app/components/AuthGuard"
import useRole from "@/app/hooks/useRole"
import AdminSidebar from "@/app/components/AdminSidebar"
import EmpoyeeSidebar from "@/app/components/EmpoyeeSidebar"
import { motion, AnimatePresence } from 'framer-motion'

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
}

export default function CompanyPage() {
    const router = useRouter()
    const params = useParams()
    const searchParams = useSearchParams()
    const id = params.id
    const [company, setCompany] = useState<Company | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)
    const [statusLoading, setStatusLoading] = useState(false)
    const [showMenu, setShowMenu] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [editMode, setEditMode] = useState(false)
    const [editData, setEditData] = useState<Partial<Company>>({})
    const role = useRole()

    useEffect(() => {
        const fetchCompany = async () => {
            try {
                setLoading(true)
                setError(null)

                const token = localStorage.getItem('token')
                if (!token) {
                    router.push('/auth/login')
                    return
                }

                const response = await axios.get(`${API_URL}/api/comp-vac/company/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`
                    },
                    validateStatus: (status) => (status >= 200 && status < 300) || status === 404
                })

                if (response.status === 404) {
                    setCompany(null)
                    setError('Компания не найдена')
                } else {
                    setCompany(response.data)
                    setEditData(response.data)
                }
            } catch (error) {
                console.error('Ошибка загрузки компании:', error)
                setError('Произошла ошибка при загрузке данных компании')
            } finally {
                setLoading(false)
            }
        }

        void fetchCompany()
    }, [id, router])

    const formatDate = (dateString: string) => {
        try {
            const date = new Date(dateString)
            if (isNaN(date.getTime())) return 'Дата не указана'
            return date.toLocaleDateString('ru-RU')
        } catch {
            return 'Дата не указана'
        }
    }

    const handleVerify = async () => {
        if (!company) return

        try {
            setStatusLoading(true)
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            await axios.put(
                `${API_URL}/api/comp-vac/company-accept/${id}`,
                {},
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            setCompany(prev => prev ? { ...prev, is_accepted: true } : null)
        } catch (error) {
            console.error('Ошибка подтверждения компании:', error)
            setError('Не удалось верифицировать компанию')
        } finally {
            setStatusLoading(false)
        }
    }

    const handleDelete = async () => {
        try {
            setStatusLoading(true)
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            await axios.delete(`${API_URL}/api/comp-vac/company/${id}`, {
                headers: {
                    Authorization: `Bearer ${token}`
                }
            })

            router.push('/companies')
        } catch (error) {
            console.error('Ошибка удаления компании:', error)
            setError('Не удалось удалить компанию')
        } finally {
            setStatusLoading(false)
            setShowDeleteModal(false)
        }
    }

    const handleAdd = () => {
        router.push(`/vacancies/create?companyId=${id}`)
    }

    const handleEdit = async () => {
        if (!company) return

        try {
            setStatusLoading(true)
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            const response = await axios.put(
                `${API_URL}/api/comp-vac/my-company/${id}`,
                editData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            setCompany(response.data)
            setEditMode(false)
        } catch (error) {
            console.error('Ошибка редактирования компании:', error)
            setError('Не удалось обновить данные компании')
        } finally {
            setStatusLoading(false)
        }
    }

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setEditData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    {/*{role === "Администратор" && <AdminSidebar />}*/}
                    {role === "Сотрудник" && <EmpoyeeSidebar />}
                    <main className="flex-1 max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
                        <div className="max-w-5xl mx-auto py-6 sm:px-6 lg:px-8">
                            {error ? (
                                <>
                                    <motion.div
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="mt-4 text-left"
                                    >
                                        <Link
                                            href="/main/main-page"
                                            className="inline-flex items-center justify-start mb-4 text-blue-600 hover:text-blue-800 transition-colors duration-300 group"
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
                                    <motion.div
                                        className="flex justify-center items-center p-4 bg-red-100 text-red-800 rounded-xl shadow-lg"
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
                                        <p className="text-lg font-semibold">{error}</p>
                                    </motion.div>
                                </>
                            ) : loading ? (
                                <motion.div
                                    className="flex justify-center items-center h-64"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                >
                                    <motion.div
                                        animate={{ rotate: 360 }}
                                        transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                        className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"
                                    />
                                </motion.div>
                            ) : company ? (
                                <>
                                    <motion.div
                                        className="flex justify-between items-center mb-4"
                                        initial={{ opacity: 0, y: -20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <Link
                                            href={
                                                searchParams.get('from') === 'vacancy' && searchParams.get('vacancyId')
                                                    ? `/vacancies/${searchParams.get('vacancyId')}`
                                                    : searchParams.get('from') === 'company'
                                                        ? '/companies'
                                                        : searchParams.get('from') === 'my-company'
                                                            ? '/my-company'
                                                            : '/main/main-page'
                                            }
                                            className="inline-flex items-center text-blue-600 hover:text-blue-800 transition-colors duration-300 group"
                                        >
                                            <svg
                                                xmlns="http://www.w3.org/2000/svg"
                                                className="h-5 w-5 mr-1 group-hover:-translate-x-1 transition-transform"
                                                viewBox="0 0 20 20"
                                                fill="currentColor"
                                            >
                                                <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                            </svg>
                                            Назад
                                        </Link>

                                        {(role === "Сотрудник") && (
                                            <motion.div
                                                className="relative inline-block z-10"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                                transition={{ delay: 0.2 }}
                                            >
                                                <motion.button
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        setShowMenu(!showMenu);
                                                    }}
                                                    className="p-2 rounded-full hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-colors"
                                                    whileHover={{ scale: 1.1 }}
                                                    whileTap={{ scale: 0.95 }}
                                                >
                                                    <svg
                                                        xmlns="http://www.w3.org/2000/svg"
                                                        className="h-6 w-6 text-gray-600"
                                                        fill="none"
                                                        viewBox="0 0 24 24"
                                                        stroke="currentColor"
                                                    >
                                                        <path
                                                            strokeLinecap="round"
                                                            strokeLinejoin="round"
                                                            strokeWidth={2}
                                                            d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
                                                        />
                                                    </svg>
                                                </motion.button>

                                                <AnimatePresence>
                                                    {showMenu && (
                                                        <motion.div
                                                            className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-lg z-50 border border-gray-200"
                                                            onClick={(e) => e.stopPropagation()}
                                                            initial={{ opacity: 0, y: -10 }}
                                                            animate={{ opacity: 1, y: 0 }}
                                                            exit={{ opacity: 0, y: -10 }}
                                                            transition={{ duration: 0.2 }}
                                                        >
                                                            <div className="py-1">
                                                                {!company.is_accepted && (

                                                                <motion.button
                                                                    onClick={() => {
                                                                        setEditMode(true);
                                                                        setShowMenu(false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 hover:text-gray-900 transition-colors"
                                                                    whileHover={{ x: 5 }}
                                                                >
                                                                    Редактировать
                                                                </motion.button>)}
                                                                <motion.button
                                                                    onClick={() => {
                                                                        setShowDeleteModal(true);
                                                                        setShowMenu(false);
                                                                    }}
                                                                    className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100 hover:text-red-800 transition-colors"
                                                                    whileHover={{ x: 5 }}
                                                                >
                                                                    Удалить
                                                                </motion.button>
                                                            </div>
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </motion.div>
                                        )}
                                    </motion.div>

                                    <motion.div
                                        className="bg-white overflow-hidden shadow-xl rounded-xl"
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ duration: 0.4 }}
                                    >
                                        <div className="px-4 py-5 sm:p-6">
                                            <div className="flex justify-between items-start mb-4">
                                                {editMode ? (
                                                    <motion.input
                                                        type="text"
                                                        name="name"
                                                        value={editData.name || ''}
                                                        onChange={handleInputChange}
                                                        className="text-2xl font-bold text-blue-700 border-b border-gray-300 focus:outline-none focus:border-blue-500 transition-colors"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                    />
                                                ) : (
                                                    <motion.h1
                                                        className="text-2xl font-bold text-blue-700"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.1 }}
                                                    >
                                                        {company.name}
                                                    </motion.h1>
                                                )}
                                                {/*{role === "Сотрудник" && !company.is_accepted && (*/}
                                                {/*    <motion.button*/}
                                                {/*        onClick={handleVerify}*/}
                                                {/*        disabled={statusLoading}*/}
                                                {/*        className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"*/}
                                                {/*        whileHover={{ scale: 1.05 }}*/}
                                                {/*        whileTap={{ scale: 0.95 }}*/}
                                                {/*    >*/}
                                                {/*        {statusLoading ? (*/}
                                                {/*            <span className="flex items-center">*/}
                                                {/*                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">*/}
                                                {/*                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>*/}
                                                {/*                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>*/}
                                                {/*                </svg>*/}
                                                {/*                Верификация...*/}
                                                {/*            </span>*/}
                                                {/*        ) : 'Верифицировать'}*/}
                                                {/*    </motion.button>*/}
                                                {/*)}*/}
                                                {role === "Сотрудник" && company.is_accepted && (
                                                    <motion.div
                                                        className="mb-4 flex justify-end"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.2 }}
                                                    >
                                                        <motion.button
                                                            onClick={handleAdd}
                                                            className="px-4 py-2 bg-gradient-to-r from-green-600 to-green-500 text-white rounded-lg hover:from-green-700 hover:to-green-600 transition-all focus:outline-none cursor-pointer"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Добавить вакансию
                                                        </motion.button>
                                                    </motion.div>
                                                )}
                                            </div>

                                            {editMode ? (
                                                <motion.div
                                                    className="space-y-4"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                                        <div className="space-y-4">
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">ИНН</label>
                                                                <input
                                                                    type="text"
                                                                    name="inn"
                                                                    value={editData.inn || ''}
                                                                    onChange={handleInputChange}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.15 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">КПП</label>
                                                                <input
                                                                    type="text"
                                                                    name="kpp"
                                                                    value={editData.kpp || ''}
                                                                    onChange={handleInputChange}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                            <motion.div
                                                                initial={{ opacity: 0, x: -20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">ОГРН</label>
                                                                <input
                                                                    type="text"
                                                                    name="ogrn"
                                                                    value={editData.ogrn || ''}
                                                                    onChange={handleInputChange}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                        </div>

                                                        <div className="space-y-4">
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.1 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">Юридический адрес</label>
                                                                <textarea
                                                                    name="address"
                                                                    value={editData.address || ''}
                                                                    onChange={handleInputChange}
                                                                    rows={3}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.15 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">Директор</label>
                                                                <input
                                                                    type="text"
                                                                    name="director"
                                                                    value={editData.director || ''}
                                                                    onChange={handleInputChange}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                            <motion.div
                                                                initial={{ opacity: 0, x: 20 }}
                                                                animate={{ opacity: 1, x: 0 }}
                                                                transition={{ delay: 0.2 }}
                                                            >
                                                                <label className="block text-sm font-medium text-gray-500">Дата регистрации</label>
                                                                <input
                                                                    type="date"
                                                                    name="date_reg"
                                                                    value={editData.date_reg ? new Date(editData.date_reg).toISOString().split('T')[0] : ''}
                                                                    onChange={handleInputChange}
                                                                    className="mt-1 block w-full border border-gray-300 text-black rounded-lg shadow-sm py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                                                />
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                    <motion.div
                                                        className="flex justify-end space-x-3 pt-4"
                                                        initial={{ opacity: 0 }}
                                                        animate={{ opacity: 1 }}
                                                        transition={{ delay: 0.3 }}
                                                    >
                                                        <motion.button
                                                            onClick={() => setEditMode(false)}
                                                            className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            Отмена
                                                        </motion.button>
                                                        <motion.button
                                                            onClick={handleEdit}
                                                            disabled={statusLoading}
                                                            className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                                            whileHover={{ scale: 1.05 }}
                                                            whileTap={{ scale: 0.95 }}
                                                        >
                                                            {statusLoading && (
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
                                                            {statusLoading ? (
                                                                <span className="flex items-center justify-center">
                                                                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                                    </svg>
                                                                    Сохранение...
                                                                </span>
                                                            ) : 'Сохранить'}
                                                        </motion.button>
                                                    </motion.div>
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                                                    initial={{ opacity: 0 }}
                                                    animate={{ opacity: 1 }}
                                                    transition={{ duration: 0.3 }}
                                                >
                                                    <div className="space-y-4">
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">ИНН</h3>
                                                            <p className="text-black text-lg">{company.inn || 'Не указано'}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.15 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">КПП</h3>
                                                            <p className="text-black text-lg">{company.kpp || 'Не указано'}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: -20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">ОГРН</h3>
                                                            <p className="text-black text-lg">{company.ogrn || 'Не указано'}</p>
                                                        </motion.div>
                                                    </div>

                                                    <div className="space-y-4">
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.1 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">Юридический адрес</h3>
                                                            <p className="text-black text-lg">{company.address || 'Не указано'}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.15 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">Директор</h3>
                                                            <p className="text-black text-lg">{company.director || 'Не указано'}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.2 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">Дата регистрации</h3>
                                                            <p className="text-black text-lg">{formatDate(company.date_reg)}</p>
                                                        </motion.div>
                                                        <motion.div
                                                            initial={{ opacity: 0, x: 20 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            transition={{ delay: 0.25 }}
                                                        >
                                                            <h3 className="text-sm font-medium text-gray-500">Статус</h3>
                                                            <p className={`text-lg font-medium ${
                                                                company.is_accepted ? 'text-green-600' : 'text-yellow-600'
                                                            }`}>
                                                                {company.is_accepted ? 'Подтверждена' : 'На модерации'}
                                                            </p>
                                                        </motion.div>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </div>
                                    </motion.div>
                                </>
                            ) : null}
                        </div>
                    </main>
                </div>
            </div>

            {/* Модальное окно подтверждения удаления */}
            <AnimatePresence>
                {showDeleteModal && (
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
                            <h3 className="text-xl font-medium text-gray-900 mb-4">Подтверждение удаления</h3>
                            <p className="text-gray-600 mb-6">Вы уверены, что хотите удалить компанию "{company?.name}"? ВНИМАНИЕ! Это действие нельзя отменить.</p>
                            <div className="flex justify-end space-x-3">
                                <motion.button
                                    onClick={() => setShowDeleteModal(false)}
                                    className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition-colors"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    Отмена
                                </motion.button>
                                <motion.button
                                    onClick={handleDelete}
                                    disabled={statusLoading}
                                    className="px-4 py-2 bg-gradient-to-r from-red-600 to-red-500 text-white rounded-lg hover:from-red-700 hover:to-red-600 transition-all disabled:opacity-50 disabled:cursor-not-allowed relative overflow-hidden"
                                    whileHover={{ scale: 1.05 }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    {statusLoading && (
                                        <motion.span
                                            className="absolute inset-0 bg-red-700 opacity-20"
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
                                    {statusLoading ? (
                                        <span className="flex items-center justify-center">
                                            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                            </svg>
                                            Удаление...
                                        </span>
                                    ) : 'Удалить'}
                                </motion.button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </AuthGuard>
    )
}