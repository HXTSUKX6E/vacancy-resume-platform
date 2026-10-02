'use client'
import { API_URL } from '@/app/lib/api';
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import AuthGuard from "@/app/components/AuthGuard"
import axios from "axios"
import { motion, AnimatePresence } from 'framer-motion'

export function Header() {
    const router = useRouter()
    const [currentSlide, setCurrentSlide] = useState(0)
    const [showProfileMenu, setShowProfileMenu] = useState(false)
    const [isHovered, setIsHovered] = useState(false)
    const [userId, setUserId] = useState<string | null>(null)

    const slides = [
        '/images/slide2.jpg',
        '/images/slide3.jpg'
    ]

    useEffect(() => {
        const interval = setInterval(() => {
            setCurrentSlide((prev) => (prev === slides.length - 1 ? 0 : prev + 1))
        }, 5000)
        return () => clearInterval(interval)
    }, [slides.length])

    useEffect(() => {
        const fetchProfile = async () => {
            try {
                const token = localStorage.getItem('token')
                if (token) {
                    const res = await axios.get(`${API_URL}/api/auth/profile`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    setUserId(res.data.userId)
                }
            } catch (err) {
                console.error('Ошибка при загрузке профиля:', err)
            }
        }
        fetchProfile()
    }, [])

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token')
            if (token) {
                await axios.post(`${API_URL}/api/auth/logout`, {}, {
                    headers: { Authorization: `Bearer ${token}` }
                })
            }
        } catch (err) {
            console.error('Logout error:', err)
        } finally {
            localStorage.removeItem('token')
            router.push('/auth/login')
        }
    }

    const stats = [
        { title: '30', subtitle: 'направлений обучения', text: 'Более 30 направлений обучения по разным специальностям' },
        { title: '80%', subtitle: 'практики', text: 'В ходе обучения 80% времени уделяется практике' },
        { title: '850', subtitle: 'студентов', text: 'Ежегодно выпускается по разным специальностям' },
        { title: '73', subtitle: 'года', text: 'Успешного существования нашего учебного центра' }
    ]

    return (
        <AuthGuard>
            <div className="relative h-80 md:h-96 bg-gray-900 overflow-hidden shadow-2xl" onClick={() => showProfileMenu && setShowProfileMenu(false)}>
                {/* Animated background slides */}
                <AnimatePresence mode='wait'>
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 1.5 }}
                        className="absolute inset-0"
                    >
                        <Image
                            src={slides[currentSlide]}
                            alt={`Slide ${currentSlide + 1}`}
                            fill
                            className="object-cover"
                            priority
                            quality={100}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/40 to-transparent" />
                    </motion.div>
                </AnimatePresence>

                {/* Contact info in top left corner */}
                <div className="absolute top-4 left-4 z-10 bg-white/90 backdrop-blur-md p-3 rounded-lg shadow-lg max-w-xs opacity-60">
                    <div className="text-sm text-gray-800 space-y-1">
                        <div className="font-semibold">614000, Пермь, ул. Стахановская 18</div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                            </svg>
                            +7 (342) 280-46-61
                        </div>
                        <div className="flex items-center">
                            <svg className="w-4 h-4 mr-2 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                            </svg>
                            merkyriy1973@mail.ru
                        </div>
                    </div>
                </div>

                {/* Stats cards */}
                <div className="absolute top-4 left-1/2 transform -translate-x-1/2 z-10 flex flex-wrap justify-center gap-4 px-2">
                    {stats.map((item, idx) => (
                        <motion.div
                            key={idx}
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: idx * 0.1, duration: 0.5 }}
                            whileHover={{ y: -5 }}
                            className="bg-white/90 backdrop-blur-md p-4 rounded-xl shadow-lg w-[180px] text-center border border-white/20 hover:shadow-xl transition-all"
                        >
                            <h4 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                {item.title}
                            </h4>
                            <p className="text-sm font-semibold text-gray-800 mt-1">{item.subtitle}</p>
                            <p className="text-xs text-gray-600 mt-2">{item.text}</p>
                        </motion.div>
                    ))}
                </div>

                {/* Main link button */}
                <motion.div
                    className="absolute bottom-8 left-8 z-10"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                >
                    <Link
                        href="https://ykkperm.org/"
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2 group"
                    >
                        <span>Образовательный центр</span>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5 group-hover:translate-x-1 transition-transform"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                    </Link>
                </motion.div>

                {/* Profile menu */}
                <div className="absolute top-6 right-6 z-20">
                    <motion.button
                        onClick={(e) => {
                            e.stopPropagation()
                            setShowProfileMenu(!showProfileMenu)
                        }}
                        className="relative bg-white/20 backdrop-blur-md rounded-full flex text-sm focus:outline-none p-2 cursor-pointer border-2 border-white/30 hover:border-white/50 transition-all"
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                        onHoverStart={() => setIsHovered(true)}
                        onHoverEnd={() => setIsHovered(false)}
                    >
                        <span className="sr-only">Открыть меню профиля</span>
                        <AnimatePresence>
                            {isHovered && (
                                <motion.span
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    className="absolute -inset-1 bg-white/10 rounded-full"
                                />
                            )}
                        </AnimatePresence>
                        <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-8 w-8 text-white"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                            />
                        </svg>
                    </motion.button>

                    <AnimatePresence>
                        {showProfileMenu && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                                className="absolute right-0 mt-2 w-56 rounded-xl shadow-xl bg-white/95 backdrop-blur-lg py-2 ring-1 ring-black/5 z-30 overflow-hidden"
                            >
                                <div className="px-4 py-3 border-b border-gray-100">
                                    <p className="text-sm font-medium text-gray-900">Меню пользователя</p>
                                </div>
                                <div className="py-1">
                                    <Link
                                        href="/profile"
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                        </svg>
                                        Настройки профиля
                                    </Link>
                                    <button

                                        onClick={() => userId && router.push(`/resume/${userId}`)}
                                        className="flex w-full items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                        </svg>
                                        Резюме
                                    </button>
                                    <Link
                                        href="/reviews"
                                        className="flex items-center px-4 py-3 text-sm text-gray-700 hover:bg-gray-50/80 transition-colors"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
                                        </svg>
                                        Отзывы
                                    </Link>
                                </div>
                                <div className="py-1 border-t border-gray-100">
                                    <button
                                        onClick={handleLogout}
                                        className="flex w-full items-center px-4 py-3 text-sm text-red-600 hover:bg-gray-50/80 transition-colors cursor-pointer"
                                    >
                                        <svg className="w-5 h-5 mr-3 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                        Выйти
                                    </button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Animated indicators */}
                <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 flex space-x-2 z-10">
                    {slides.map((_, index) => (
                        <button
                            key={index}
                            onClick={() => setCurrentSlide(index)}
                            className={`h-2 rounded-full transition-all duration-300 ${index === currentSlide ? 'w-8 bg-white' : 'w-2 bg-white/50'}`}
                            aria-label={`Go to slide ${index + 1}`}
                        />
                    ))}
                </div>
            </div>
        </AuthGuard>
    )
}