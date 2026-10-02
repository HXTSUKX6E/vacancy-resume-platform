'use client'
import { API_URL } from '@/app/lib/api';
import React, { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function CreateVacancyPage() {
    const searchParams = useSearchParams()
    const companyId = searchParams.get('companyId')
    const router = useRouter()
    const [vacancy, setVacancy] = useState({
        name: '',
        title: '',
        description: '',
        contact: '',
        experience: '',
        format: '',
        address: '',
        schedule: '',
        hours: '',
        is_educated: false,
    })
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)

    useEffect(() => {
        if (!companyId) setError('Не указана компания')
    }, [companyId])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()

        if (!companyId) {
            setError('Не указана компания')
            return
        }

        try {
            const token = localStorage.getItem('token')
            if (!token) {
                setError('Требуется авторизация')
                return
            }

            await axios.post(
                `${API_URL}/api/comp-vac/vacancy`,
                {
                    ...vacancy,
                    company_id: Number(companyId),
                    isHidden: true,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json',
                    },
                }
            )

            setSuccess(true)
            setTimeout(() => router.push(`/companies/${companyId}`), 1500)
        } catch (err) {
            console.error('Ошибка создания:', err)
            setError(
                axios.isAxiosError(err)
                    ? err.response?.data?.message || 'Ошибка при создании вакансии'
                    : 'Неизвестная ошибка'
            )
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setVacancy(prev => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setVacancy(prev => ({ ...prev, [name]: checked }))
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-100 to-gray-200 py-10 px-4">
            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5 }}
                className="max-w-4xl mx-auto bg-white shadow-xl rounded-2xl p-8"
            >
                <h1 className="text-3xl font-bold mb-6 text-center text-gray-800">
                    Создание новой вакансии
                </h1>

                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded mb-4"
                        >
                            {error}
                        </motion.div>
                    )}
                </AnimatePresence>

                <AnimatePresence>
                    {success && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0 }}
                            className="bg-green-100 border border-green-400 text-green-800 px-4 py-3 rounded mb-4"
                        >
                            Вакансия успешно создана!
                        </motion.div>
                    )}
                </AnimatePresence>

                <form onSubmit={handleSubmit} className="space-y-6">
                    {/* Двухколоночные поля */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {[
                            { label: 'Название вакансии*', name: 'name', required: true },
                            { label: 'Заголовок*', name: 'title', required: true },
                            { label: 'Контактная информация*', name: 'contact', required: true },
                            { label: 'Требуемый опыт', name: 'experience' },
                            { label: 'Формат работы', name: 'format' },
                            { label: 'Адрес', name: 'address' },
                            { label: 'График работы', name: 'schedule' },
                            { label: 'Заработная плата', name: 'hours' },
                        ].map(({ label, name, required }) => (
                            <div key={name} className="space-y-1">
                                <label className="block text-sm font-medium text-gray-900">
                                    {label}
                                </label>
                                <input
                                    type="text"
                                    name={name}
                                    required={required}
                                    value={(vacancy as any)[name]}
                                    onChange={handleChange}
                                    className="text-black w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                                />
                            </div>
                        ))}
                    </div>

                    {/* Описание */}
                    <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                            Описание (до 1000 символов)
                        </label>
                        <textarea
                            name="description"
                            rows={5}
                            maxLength={1000}
                            value={vacancy.description}
                            onChange={handleChange}
                            className="text-black w-full px-3 py-2 border border-gray-300 rounded-xl bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
                        />
                    </div>

                    {/* Чекбокс */}
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            name="is_educated"
                            checked={vacancy.is_educated}
                            onChange={handleCheckboxChange}
                            className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label className="text-sm font-medium text-gray-700">
                            Требуется обучение
                        </label>
                    </div>

                    {/* Кнопки */}
                    <div className="flex justify-end gap-4 pt-4">
                        <button
                            type="button"
                            onClick={() => router.push(`/companies/${companyId}`)}
                            className="px-4 py-2 border rounded-xl bg-white text-gray-700 hover:bg-gray-50 transition"
                        >
                            Отмена
                        </button>
                        <button
                            type="submit"
                            className="px-6 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 transition"
                        >
                            Опубликовать вакансию
                        </button>
                    </div>
                </form>
            </motion.div>
        </div>
    )
}
