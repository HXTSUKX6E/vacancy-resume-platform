'use client'
import { API_URL } from '@/app/lib/api';

import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/app/components/AuthGuard'
import { Header } from "@/app/components/Header"
import { motion } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminSidebar from "@/app/components/AdminSidebar";
import useRole from '@/app/hooks/useRole'
import TeenagerSidebar from "@/app/components/TeenagerSidebar";
import EmployeeSidebar from "@/app/components/EmpoyeeSidebar"
import { Mail } from 'lucide-react'; // или 'heroicons-react'

type ResumeData = {
    resumeId: number
    education: string
    placeEducation: string
    skills: string
    birthday: string
    gender: string
    fullName: string
    phone: string
    contact: string
    description: string
    date: string
    images?: string[]
}

export default function ResumesListPage() {
    const role = useRole()
    const router = useRouter()
    const [resumes, setResumes] = useState<ResumeData[]>([])
    const [loading, setLoading] = useState(true)
    const [searchTerm, setSearchTerm] = useState('')

    const formatDate = (dateString: string) => {
        if (!dateString) return 'Не указано'
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear().toString().slice(-2)
        return `${day}.${month}.${year}`
    }

    useEffect(() => {
        const fetchResumes = async () => {
            try {
                if (typeof window === 'undefined') return // SSR protection
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Token not found')

                const response = await axios.get(`${API_URL}/api/user/resume`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setResumes(response.data)
            } catch (error) {
                console.error('Error fetching resumes:', error)
                toast.error('Ошибка при загрузке резюме')
            } finally {
                setLoading(false)
            }
        }

        fetchResumes()
    }, [])

    const filteredResumes = resumes.filter(resume => {
        const searchLower = searchTerm.toLowerCase()
        return (
            resume.fullName.toLowerCase().includes(searchLower) ||
            resume.contact.toLowerCase().includes(searchLower)
        )
    })

    const container = {
        hidden: { opacity: 0 },
        show: {
            opacity: 1,
            transition: { staggerChildren: 0.1 }
        }
    }

    const item = {
        hidden: { opacity: 0, y: 20 },
        show: { opacity: 1, y: 0, transition: { duration: 0.5 } }
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50 flex flex-col">
                <Header />
                <div className="flex flex-1">
                    {role === 'Администратор' && <AdminSidebar />}
                    {role === 'Пользователь' && <TeenagerSidebar />}
                    {role === "Сотрудник" && <EmployeeSidebar />}

                    <main className="flex-1 overflow-y-auto">
                        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full">
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.5 }}
                                className="flex justify-between items-center mb-8"
                            >
                                <h1 className="text-3xl font-bold text-gray-900">Список резюме</h1>
                            </motion.div>

                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.2 }}
                                className="bg-white rounded-2xl shadow-lg p-6 mb-8 border border-gray-100"
                            >
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Поиск по ФИО или электронной почте
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <svg className="h-5 w-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                                            </svg>
                                        </div>
                                        <input
                                            type="text"
                                            placeholder="Поиск..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black"
                                        />
                                    </div>
                                </div>
                            </motion.div>

                            {loading ? (
                                <motion.div
                                    key="loading"
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    exit={{ opacity: 0 }}
                                    className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50"
                                >
                                    <div className="text-center">
                                        <motion.div
                                            animate={{ rotate: 360 }}
                                            transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                            className="mx-auto rounded-full h-16 w-16 border-t-4 border-b-4 border-blue-600"
                                        ></motion.div>
                                        <p className="mt-4 text-lg font-medium text-gray-700">Загрузка резюме...</p>
                                    </div>
                                </motion.div>
                            ) : (
                                <>
                                    {filteredResumes.length === 0 ? (
                                        <motion.div
                                            key="empty"
                                            initial={{ opacity: 0 }}
                                            animate={{ opacity: 1 }}
                                            transition={{ duration: 0.5 }}
                                            className="bg-white rounded-2xl shadow-lg p-8 text-center border border-gray-100"
                                        >
                                            <svg
                                                className="mx-auto h-16 w-16 text-gray-400"
                                                fill="none"
                                                viewBox="0 0 24 24"
                                                stroke="currentColor"
                                            >
                                                <path
                                                    strokeLinecap="round"
                                                    strokeLinejoin="round"
                                                    strokeWidth={1.5}
                                                    d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                                                />
                                            </svg>
                                            <h3 className="mt-4 text-xl font-medium text-gray-900">Резюме не найдены</h3>
                                            <p className="mt-2 text-gray-500">Попробуйте изменить параметры поиска</p>
                                            <motion.button
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                onClick={() => setSearchTerm('')}
                                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                                            >
                                                Сбросить поиск
                                            </motion.button>
                                        </motion.div>
                                    ) : (
                                        <motion.div
                                            key="content"
                                            variants={container}
                                            initial="hidden"
                                            animate="show"
                                            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
                                        >
                                            {filteredResumes.map((resume) => (
                                                <motion.div
                                                    key={resume.resumeId}
                                                    variants={item}
                                                    whileHover={{ y: -5, scale: 1.02 }}
                                                    className="bg-white rounded-2xl shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 border border-gray-100 h-full flex flex-col"
                                                >
                                                    <div className="p-6 flex-1">
                                                        <div className="flex justify-between items-start">
                                                            <div>
                                                                <h2 className="text-xl font-bold text-gray-900 mb-1">
                                                                        {resume.fullName}
                                                                </h2>
                                                                <p className="text-sm text-gray-500 mb-2">
                                                                    {formatDate(resume.birthday)} · {(resume.gender === 'Female') ? 'Женский' : 'Мужской'}
                                                                </p>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <h3 className="text-sm font-medium text-gray-700">Образование</h3>
                                                            <p className="text-gray-600 font-medium">{resume.education}</p>
                                                            <p className="text-sm text-gray-500 mt-1">{resume.placeEducation}</p>
                                                        </div>

                                                        <div className="mt-4">
                                                            <div className="mt-4 flex items-center space-x-2">
                                                                <Mail className="w-5 h-5 text-gray-700" />
                                                                <h3 className="text-sm font-medium text-gray-700">{resume.contact}</h3>
                                                            </div>
                                                        </div>

                                                        <div className="mt-4">
                                                            <h3 className="text-sm font-medium text-gray-700">Навыки</h3>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {resume.skills?.split(',').filter(s => s.trim()).slice(0, 5).map((skill, index) => (
                                                                    <motion.span
                                                                        key={index}
                                                                        initial={{ scale: 0.8, opacity: 0 }}
                                                                        animate={{ scale: 1, opacity: 1 }}
                                                                        transition={{ delay: index * 0.05 }}
                                                                        className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs"
                                                                    >
                                                                        {skill.trim()}
                                                                    </motion.span>
                                                                ))}
                                                                {resume.skills?.split(',').filter(s => s.trim()).length > 5 && (
                                                                    <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded-full text-xs">
                      +{resume.skills.split(',').filter(s => s.trim()).length - 5}
                    </span>
                                                                )}
                                                            </div>
                                                        </div>

                                                        <div className="mt-6 flex justify-end">
                                                            <motion.div
                                                                whileHover={{ scale: 1.05 }}
                                                                whileTap={{ scale: 0.95 }}
                                                            >
                                                                <Link
                                                                    href={`/candidates/${resume.resumeId}`}
                                                                    className="px-4 py-2 bg-gradient-to-r from-blue-600 to-blue-400 text-white rounded-lg hover:from-blue-700 hover:to-blue-500 transition-all duration-300 shadow-md hover:shadow-lg text-sm font-medium"
                                                                >
                                                                    Просмотреть резюме
                                                                </Link>
                                                            </motion.div>
                                                        </div>
                                                    </div>
                                                </motion.div>
                                            ))}
                                        </motion.div>
                                    )}
                                </>
                            )}
                        </div>
                    </main>
                </div>
                <ToastContainer position="bottom-right" autoClose={5000} />
            </div>
        </AuthGuard>
    )
}