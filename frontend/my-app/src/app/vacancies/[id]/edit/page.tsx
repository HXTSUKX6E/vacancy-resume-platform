'use client'
import { API_URL } from '@/app/lib/api';
import React, { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import axios from 'axios'
import { motion, AnimatePresence } from 'framer-motion'

export default function EditVacancyPage() {
    const router = useRouter()
    const { id } = useParams()
    const [vacancy, setVacancy] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState('')
    const [success, setSuccess] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        const fetchVacancy = async () => {
            try {
                const token = localStorage.getItem('token')
                const response = await axios.get(`${API_URL}/api/comp-vac/vacancy/${id}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setVacancy(response.data)
            } catch (err) {
                console.error('Ошибка загрузки вакансии:', err)
                setError('Не удалось загрузить вакансию')
            } finally {
                setLoading(false)
            }
        }

        fetchVacancy()
    }, [id])

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        if (!vacancy || !vacancy.company?.company_id) {
            setError('Отсутствует информация о компании');
            setIsSubmitting(false);
            return;
        }

        try {
            const token = localStorage.getItem('token');
            if (!token) {
                setError('Требуется авторизация');
                setIsSubmitting(false);
                return;
            }

            await axios.put(
                `${API_URL}/api/comp-vac/vacancy/${id}`,
                {
                    name: vacancy.name,
                    title: vacancy.title,
                    description: vacancy.description,
                    company_id: Number(vacancy.company.company_id),
                    contact: vacancy.contact,
                    experience: vacancy.experience,
                    format: vacancy.format,
                    address: vacancy.address,
                    schedule: vacancy.schedule,
                    hours: vacancy.hours,
                    is_educated: vacancy.is_educated,
                },
                {
                    headers: {
                        Authorization: `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            setSuccess(true);
            setTimeout(() => router.push(`/vacancies/${id}`), 1500);
        } catch (err) {
            console.error('Ошибка при обновлении вакансии:', err);
            if (axios.isAxiosError(err)) {
                setError(err.response?.data?.message || 'Ошибка при обновлении вакансии');
            } else {
                setError('Неизвестная ошибка');
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target
        setVacancy((prev: any) => ({ ...prev, [name]: value }))
    }

    const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, checked } = e.target
        setVacancy((prev: any) => ({ ...prev, [name]: checked }))
    }

    if (loading) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
            <motion.div
                animate={{ rotate: 360 }}
                transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                className="h-12 w-12 rounded-full border-t-2 border-b-2 border-blue-500"
            />
        </div>
    )

    if (!vacancy) return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex items-center justify-center">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white p-6 rounded-xl shadow-lg max-w-md w-full text-center"
            >
                <h2 className="text-xl font-bold text-gray-800 mb-4">Вакансия не найдена</h2>
                <motion.button
                    onClick={() => router.back()}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    Вернуться назад
                </motion.button>
            </motion.div>
        </div>
    )

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 text-gray-800">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="max-w-4xl mx-auto py-8 px-4"
            >
                <motion.div
                    className="bg-white p-8 rounded-xl shadow-lg"
                    initial={{ scale: 0.98 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', stiffness: 100 }}
                >
                    <motion.h1
                        className="text-3xl font-bold mb-6 text-gray-800 border-b pb-4"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.1 }}
                    >
                        Редактирование вакансии
                    </motion.h1>

                    <AnimatePresence>
                        {error && (
                            <motion.div
                                className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                {error}
                            </motion.div>
                        )}

                        {success && (
                            <motion.div
                                className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-6"
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -20 }}
                                transition={{ duration: 0.3 }}
                            >
                                Вакансия успешно обновлена! Перенаправляем...
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Название вакансии*</label>
                                <input
                                    type="text"
                                    name="name"
                                    value={vacancy.name || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Заголовок*</label>
                                <input
                                    type="text"
                                    name="title"
                                    value={vacancy.title || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </motion.div>
                        </div>

                        <motion.div
                            className="space-y-2"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                        >
                            <label className="block text-sm font-medium text-gray-700">Описание (до 1000 символов)</label>
                            <textarea
                                name="description"
                                value={vacancy.description || ''}
                                onChange={handleChange}
                                rows={5}
                                maxLength={1000}
                                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                            />
                        </motion.div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Контактная информация*</label>
                                <input
                                    type="text"
                                    name="contact"
                                    value={vacancy.contact || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    required
                                />
                            </motion.div>

                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.4 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Требуемый опыт (до 1000 символов)</label>
                                <input
                                    type="text"
                                    name="experience"
                                    value={vacancy.experience || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    maxLength={1000}
                                />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Формат работы</label>
                                <input
                                    type="text"
                                    name="format"
                                    value={vacancy.format || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </motion.div>

                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Адрес (до 1000 символов)</label>
                                <input
                                    type="text"
                                    name="address"
                                    value={vacancy.address || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                    maxLength={1000}
                                />
                            </motion.div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">График работы</label>
                                <input
                                    type="text"
                                    name="schedule"
                                    value={vacancy.schedule || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </motion.div>

                            <motion.div
                                className="space-y-2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.6 }}
                            >
                                <label className="block text-sm font-medium text-gray-700">Заработная плата</label>
                                <input
                                    type="text"
                                    name="hours"
                                    value={vacancy.hours || ''}
                                    onChange={handleChange}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                                />
                            </motion.div>
                        </div>

                        <motion.div
                            className="flex flex-col space-y-4"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            transition={{ delay: 0.7 }}
                        >
                            <div className="flex items-center space-x-2">
                                <input
                                    type="checkbox"
                                    name="is_educated"
                                    checked={vacancy.is_educated || false}
                                    onChange={handleCheckboxChange}
                                    className="h-5 w-5 rounded border-gray-300 text-blue-600 focus:ring-blue-500 transition-all"
                                />
                                <label className="text-sm font-medium text-gray-700">
                                    Требуется обучение
                                </label>
                            </div>
                        </motion.div>

                        <motion.div
                            className="flex justify-end space-x-4 pt-8"
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.8 }}
                        >
                            <motion.button
                                type="button"
                                onClick={() => router.push(`/vacancies/${id}`)}
                                className="px-6 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                Отмена
                            </motion.button>
                            <motion.button
                                type="submit"
                                className="px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-500 text-white rounded-lg hover:from-blue-700 hover:to-blue-600 transition-all relative overflow-hidden"
                                disabled={isSubmitting}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                            >
                                {isSubmitting && (
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
                                {isSubmitting ? (
                                    <span className="flex items-center justify-center">
                                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Сохранение...
                                    </span>
                                ) : (
                                    'Сохранить изменения'
                                )}
                            </motion.button>
                        </motion.div>
                    </form>
                </motion.div>
            </motion.div>
        </div>
    )
}