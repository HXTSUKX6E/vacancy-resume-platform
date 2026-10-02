'use client'
import { API_URL } from '@/app/lib/api';
import { useState } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import { Header } from "@/app/components/Header"
import Link from 'next/link'
import AuthGuard from "@/app/components/AuthGuard"
import useRole from "@/app/hooks/useRole"
import AdminSidebar from "@/app/components/AdminSidebar"
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateCompanyPage() {
    const router = useRouter()
    const role = useRole()
    const [formData, setFormData] = useState({
        name: '',
        inn: '',
        kpp: '',
        ogrn: '',
        address: '',
        director: '',
        date_reg: new Date().toISOString().split('T')[0],
        is_accepted: false
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        setSuccess('')

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                router.push('/auth/login')
                return
            }

            await axios.post(
                `${API_URL}/api/comp-vac/company`,
                formData,
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            )

            setSuccess('Компания успешно создана!')
            setTimeout(() => {
                router.push('/companies')
            }, 1500)
        } catch (error) {
            console.error('Ошибка создания компании:', error)
            setError(
                axios.isAxiosError(error)
                    ? error.response?.data?.message || 'Ошибка при создании компании'
                    : 'Неизвестная ошибка'
            )
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setFormData(prev => ({ ...prev, [name]: value }))
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    {role === "Администратор" && <AdminSidebar />}

                    <main className="flex-1 max-w-7xl mx-auto py-10 px-4 sm:px-6 lg:px-8">
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ duration: 0.6 }}
                            className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8"
                        >
                            <div className="flex justify-between items-center mb-8">
                                <h1 className="text-3xl font-semibold text-gray-800">Создание компании</h1>
                                <Link
                                    href="/companies"
                                    className="text-blue-600 hover:text-blue-800 flex items-center transition-colors"
                                >
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-1" fill="currentColor" viewBox="0 0 20 20">
                                        <path fillRule="evenodd" d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z" clipRule="evenodd" />
                                    </svg>
                                    Назад
                                </Link>
                            </div>

                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                                    >
                                        {error}
                                    </motion.div>
                                )}

                                {success && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0, y: -10 }}
                                        className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
                                    >
                                        {success}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    {[
                                        { label: 'Название компании*', name: 'name' },
                                        { label: 'ИНН*', name: 'inn' },
                                        { label: 'КПП*', name: 'kpp' },
                                        { label: 'ОГРН*', name: 'ogrn' },
                                        { label: 'Директор*', name: 'director' }
                                    ].map(field => (
                                        <div key={field.name} className="space-y-2">
                                            <label className="block text-sm font-medium text-gray-700">{field.label}</label>
                                            <input
                                                type="text"
                                                name={field.name}
                                                value={(formData as any)[field.name]}
                                                onChange={handleChange}
                                                className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                                required
                                            />
                                        </div>
                                    ))}

                                    <div className="space-y-2 md:col-span-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Юридический адрес*
                                        </label>
                                        <textarea
                                            name="address"
                                            value={formData.address}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="block text-sm font-medium text-gray-700">
                                            Дата регистрации*
                                        </label>
                                        <input
                                            type="date"
                                            name="date_reg"
                                            value={formData.date_reg}
                                            onChange={handleChange}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-xl shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900"
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-gray-200 flex justify-end space-x-3">
                                    <Link
                                        href="/companies"
                                        className="px-4 py-2 border border-gray-300 rounded-xl shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-100 transition"
                                    >
                                        Отмена
                                    </Link>
                                    <button
                                        type="submit"
                                        disabled={loading}
                                        className="px-4 py-2 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 transition"
                                    >
                                        {loading ? (
                                            <span className="flex items-center">
                                                <svg className="animate-spin mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.3 0 0 5.3 0 12h4zm2 5.3A8 8 0 014 12H0c0 3 1.1 5.8 3 7.9l3-2.6z" />
                                                </svg>
                                                Создание...
                                            </span>
                                        ) : 'Создать компанию'}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </main>
                </div>
            </div>
        </AuthGuard>
    )
}
