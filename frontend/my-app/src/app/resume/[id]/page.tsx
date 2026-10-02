'use client'
import { API_URL } from '@/app/lib/api';
import React, { useState, useEffect } from 'react'
import axios from 'axios'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import AuthGuard from '@/app/components/AuthGuard'
import { Header } from "@/app/components/Header"
import { motion, AnimatePresence } from 'framer-motion'
import { toast, ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'
import AdminSidebar from "@/app/components/AdminSidebar";
import useRole from '@/app/hooks/useRole'
import TeenagerSidebar from "@/app/components/TeenagerSidebar";
import EmployeeSidebar from "@/app/components/EmpoyeeSidebar"

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

type ResumeImage = {
    id: number
    url: string
}

export default function ResumePage() {
    const role = useRole()
    const router = useRouter()
    const [resume, setResume] = useState<ResumeData | null>(null)
    const isCreating = !resume;
    const [loading, setLoading] = useState(true)
    const [isEditing, setIsEditing] = useState(false)
    const [formData, setFormData] = useState<Partial<ResumeData>>({})
    const [imageUploading, setImageUploading] = useState(false)
    const [selectedImage, setSelectedImage] = useState<File | null>(null)
    const [activeImageTab, setActiveImageTab] = useState(0)
    const [images, setImages] = useState<ResumeImage[]>([])
    const [modalImage, setModalImage] = useState<string | null>(null)
    const [userId, setUserId] = useState<number | null>(null)
    const [loadingImages, setLoadingImages] = useState(true);

    const validateForm = (data: Partial<ResumeData>): boolean => {
        if (!data.fullName || data.fullName.trim().length < 5) {
            toast.error('Введите корректное ФИО (не менее 5 символов)')
            return false
        }

        if (!data.birthday) {
            toast.error('Укажите дату рождения')
            return false
        } else {
            const birthdayDate = new Date(data.birthday)
            if (birthdayDate > new Date()) {
                toast.error('Дата рождения не может быть в будущем')
                return false
            }
        }

        if (!data.gender || (data.gender !== 'Male' && data.gender !== 'Female')) {
            toast.error('Выберите пол')
            return false
        }

        if (!data.skills) {
            toast.error('Заполните хотя бы 1 навык')
            return false
        }

        if (data.skills) {
            const skillsArray = data.skills.split(',').map(s => s.trim()).filter(Boolean)
            if (skillsArray.length > 10) {
                toast.error('Максимум 10 навыков')
                return false
            }
        }

        if (!data.education) {
            toast.error('Заполните поле с образованием!')
            return false
        }

        if (!data.placeEducation) {
            toast.error('Заполните поле с местом обучения!')
            return false
        }

        // Можно добавить и другие проверки, если нужно

        return true
    }
    // Format date to dd.mm.yy
    const formatDate = (dateString: string) => {
        if (!dateString) return 'Не указано'
        const date = new Date(dateString)
        const day = date.getDate().toString().padStart(2, '0')
        const month = (date.getMonth() + 1).toString().padStart(2, '0')
        const year = date.getFullYear().toString().slice(-2)
        return `${day}.${month}.${year}`
    }

    const getUserId = async (token: string): Promise<number> => {
        const profileRes = await axios.get(`${API_URL}/api/auth/profile`, {
            headers: { Authorization: `Bearer ${token}` }
        })
        return profileRes.data.userId
    }

    useEffect(() => {
        const fetchResume = async () => {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Token not found')

                const currentUserId = await getUserId(token)
                setUserId(currentUserId)

                if (!currentUserId) throw new Error('User ID not found in profile response')

                let resumeData = null

                try {
                    const response = await axios.get(`${API_URL}/api/user/resume/${currentUserId}`, {
                        headers: { Authorization: `Bearer ${token}` }
                    })
                    resumeData = response.data
                    setResume(resumeData)
                    setFormData(resumeData)
                } catch (resumeErr) {
                    if (axios.isAxiosError(resumeErr) && resumeErr.response?.status === 404) {
                        setResume(null) // резюме не найдено
                        return // не продолжаем, если нет резюме
                    } else {
                        throw resumeErr
                    }
                }
                setLoadingImages(true);
                // Загружаем изображения только если резюме существует
                const imagesResponse = await axios.get(`${API_URL}/api/user/${currentUserId}/images/content`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                const formattedImages = imagesResponse.data.map((img: { id: number, imageUrl: string }) => ({
                    id: img.id,
                    url: img.imageUrl
                }))
                setImages(formattedImages)
            } catch (error) {
                console.error('Error fetching resume or user data:', error)
            } finally {
                setLoadingImages(false);
                setLoading(false)
            }
        }

        fetchResume()
    }, [])

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value } = e.target

        // Special validation for skills
        if (name === 'skills') {
            const skillsArray = value.split(',')
            if (skillsArray.length > 10) {
                toast.warning('Максимально 10 навыков')
                return
            }
        }

        setFormData(prev => ({ ...prev, [name]: value }))
    }

    const handleSaveResume = async () => {
        if (!validateForm(formData)) {
            return
        }
        try {
            const token = localStorage.getItem('token')
            if (!token) throw new Error('Token not found')

            // Получаем userId, если он ещё не получен
            let currentUserId = userId
            if (!currentUserId) {
                currentUserId = await getUserId(token)
                setUserId(currentUserId)
            }

            if (!currentUserId) throw new Error('User ID not found')

            if (!resume) {
                // Создание нового резюме
                const response = await axios.post(
                    `${API_URL}/api/user/resume`,
                    {
                        ...formData,
                        resumeId: currentUserId
                    },
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                setResume(response.data)
                toast.success('Резюме успешно создано!')
            } else {
                // Обновление существующего резюме
                const response = await axios.put(
                    `${API_URL}/api/user/resume/${currentUserId}`,
                    formData,
                    {
                        headers: { Authorization: `Bearer ${token}` }
                    }
                )
                setResume(response.data)
                toast.success('Резюме успешно обновлено!')
            }

            setIsEditing(false)

        } catch (error) {
            console.error('Error saving resume:', error)

            if (axios.isAxiosError(error)) {
                if (error.response?.status === 400) {
                    const message = error.response.data?.message || 'Некорректные данные. Проверьте форму.'
                    toast.error(`Ошибка 400: ${message}`)
                } else {
                    const message = error.response?.data?.message || 'Ошибка при сохранении резюме'
                    toast.error(message)
                }
            } else {
                toast.error('Непредвиденная ошибка при сохранении резюме')
            }
        }
    }


    const handleDeleteResume = async () => {
        if (confirm('Вы уверены, что хотите удалить резюме?')) {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Token not found')

                if (!userId) {
                    const currentUserId = await getUserId(token)
                    setUserId(currentUserId)
                    if (!currentUserId) throw new Error('User ID not found')
                }

                await axios.delete(`${API_URL}/api/user/resume/${userId}`, {
                    headers: { Authorization: `Bearer ${token}` }
                })
                setResume(null)
                setIsEditing(false)
                setImages([])
                toast.success('Резюме удалено')
            } catch (error) {
                console.error('Error deleting resume:', error)
                toast.error('Ошибка при удалении резюме')
            }
        }
    }

    const handleImageUpload = async () => {
        if (!selectedImage || !resume) return
        if (images.length >= 6) {
            toast.warning('Максимум 6 изображений можно загрузить в портфолио')
            return
        }
        try {
            setImageUploading(true)
            const formData = new FormData()
            formData.append('file', selectedImage)

            const token = localStorage.getItem('token')
            if (!token) throw new Error('Token not found')

            if (!userId) {
                const currentUserId = await getUserId(token)
                setUserId(currentUserId)
                if (!currentUserId) throw new Error('User ID not found')
            }
            console.log('userId:', userId)
            console.log('token:', token)
            await axios.post(`${API_URL}/api/user/${userId}/image`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': 'multipart/form-data'
                }
            })

            // Refresh images
            const imagesResponse = await axios.get(`${API_URL}/api/user/${userId}/images/content`, {
                headers: { Authorization: `Bearer ${token}` }
            })

            // Transform images array to include IDs
            const formattedImages = imagesResponse.data.map((img: { id: number, imageUrl: string }) => ({
                id: img.id,
                url: img.imageUrl
            }))
            setImages(formattedImages)
            setSelectedImage(null)
            toast.success('Фото успешно добавлено')
        } catch (error) {
            console.error('Error uploading image:', error)
            toast.error('Ошибка при загрузке фото')
        } finally {
            setImageUploading(false)
        }
    }

    const handleDeleteImage = async (resumeImageid: number) => {
        if (confirm('Удалить это фото из портфолио?')) {
            try {
                const token = localStorage.getItem('token')
                if (!token) throw new Error('Token not found')

                if (!userId) {
                    const currentUserId = await getUserId(token)
                    setUserId(currentUserId)
                    if (!currentUserId) throw new Error('User ID not found')
                }

                console.log(resumeImageid)
                await axios.delete(`${API_URL}/api/user/resume-image/${resumeImageid}/content`, {
                    headers: { Authorization: `Bearer ${token}` },
                    // data: { imageId }
                })

                // Refresh images
                const imagesResponse = await axios.get(`${API_URL}/api/user/${userId}/images/content`, {
                    headers: { Authorization: `Bearer ${token}` }
                })

                // Transform images array to include IDs
                const formattedImages = imagesResponse.data.map((img: { id: number, imageUrl: string }) => ({
                    id: img.id,
                    url: img.imageUrl
                }))
                setImages(formattedImages)
                // setImages(formattedImages)
                toast.success('Фото удалено')
            } catch (error) {
                console.error('Error deleting image:', error)
                toast.error('Ошибка при удалении фото')
            }
        }
    }

    return (
        <AuthGuard>
            <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
                <Header />
                <div className="flex flex-1">
                    {role === 'Администратор' && <AdminSidebar />}
                    {role === 'Пользователь' && <TeenagerSidebar />}
                    {role === "Сотрудник" && <EmployeeSidebar />}
                <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                    <div className="flex justify-between items-center mb-8">

                        <h1 className="text-3xl font-bold text-gray-900">
                            {resume ? `${resume.fullName} - Резюме` : 'Моё резюме'}
                        </h1>

                        <div className="flex gap-4">
                            {resume && !isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Редактировать
                                </button>
                            )}

                            {isEditing && (
                                <>
                                    <button
                                        onClick={handleSaveResume}
                                        className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors cursor-pointer"
                                    >
                                        Сохранить
                                    </button>
                                    <button
                                        onClick={() => setIsEditing(false)}
                                        className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors cursor-pointer"
                                    >
                                        Отмена
                                    </button>
                                </>
                            )}

                            {/*{resume && isEditing && (*/}
                            {/*    <button*/}
                            {/*        onClick={handleDeleteResume}*/}
                            {/*        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"*/}
                            {/*    >*/}
                            {/*        Удалить резюме*/}
                            {/*    </button>*/}
                            {/*)}*/}
                        </div>
                    </div>

                    {!resume && !isEditing ? (
                        <div className="bg-white rounded-xl shadow-md p-8 text-center">
                            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <h3 className="mt-2 text-lg font-medium text-gray-900">Резюме не найдено</h3>
                            <p className="mt-1 text-gray-500">Создайте своё резюме, чтобы работодатели могли вас найти</p>
                            <div className="mt-6">
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-6 py-3 bg-blue-600 text-white rounded-lg shadow hover:bg-blue-700 transition-colors font-medium cursor-pointer"
                                >
                                    Создать резюме
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                            {/* Left column - Personal info */}
                            <div className="lg:col-span-1">
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        {isEditing ? (
                                            <>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">ФИО*</label>
                                                    <input
                                                        type="text"
                                                        name="fullName"
                                                        value={formData.fullName || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Дата рождения*</label>
                                                    <input
                                                        type="date"
                                                        name="birthday"
                                                        value={formData.birthday || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Пол*</label>
                                                    <select
                                                        name="gender"
                                                        value={formData.gender || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    >
                                                        <option value="" disabled hidden>Выбрать пол</option>
                                                        <option value="Male">Мужской</option>
                                                        <option value="Female">Женский</option>
                                                    </select>
                                                </div>

                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Телефон</label>
                                                    <input
                                                        type="tel"
                                                        name="phone"
                                                        value={formData.phone || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                </div>

                                                {/*<div className="mb-4">*/}
                                                {/*    <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>*/}
                                                {/*    <input*/}
                                                {/*        type="email"*/}
                                                {/*        name="contact"*/}
                                                {/*        disabled*/}
                                                {/*        value={resume.}*/}
                                                {/*        onChange={handleInputChange}*/}
                                                {/*        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"*/}
                                                {/*    />*/}
                                                {/*</div>*/}
                                            </>
                                        ) : (
                                            <>
                                                <h2 className="text-xl font-bold text-gray-900 mb-4">{resume?.fullName}</h2>
                                                <div className="space-y-3">
                                                    <div>
                                                        <p className="text-sm text-gray-500">Дата рождения</p>
                                                        <p className="text-gray-900">{formatDate(resume?.birthday || '')}</p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Пол</p>
                                                        <p className="text-gray-900">
                                                            {(resume?.gender === 'Female') ? 'Женский' : 'Мужской'}
                                                        </p>
                                                    </div>
                                                    <div>
                                                        <p className="text-sm text-gray-500">Телефон</p>
                                                        <p className="text-gray-900">{resume?.phone || 'Не указано'}</p>
                                                    </div>
                                                    {/*<div>*/}
                                                    {/*    <p className="text-sm text-gray-500">Email</p>*/}
                                                    {/*    <p className="text-gray-900">{resume?.contact || 'Не указано'}</p>*/}
                                                    {/*</div>*/}
                                                </div>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {/* Right column - Main content */}
                            <div className="lg:col-span-2 space-y-6">
                                {/* Education */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Образование</h3>
                                        {isEditing ? (
                                            <>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Уровень образования*</label>
                                                    <input
                                                        type="text"
                                                        name="education"
                                                        value={formData.education || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                </div>
                                                <div className="mb-4">
                                                    <label className="block text-sm font-medium text-gray-700 mb-1">Учебное заведение*</label>
                                                    <input
                                                        type="text"
                                                        name="placeEducation"
                                                        value={formData.placeEducation || ''}
                                                        onChange={handleInputChange}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    />
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <p className="text-gray-900 font-medium">{resume?.education}</p>
                                                <p className="text-gray-600">{resume?.placeEducation}</p>
                                            </>
                                        )}
                                    </div>
                                </div>

                                {/* Skills */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">Навыки</h3>
                                        {isEditing ? (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                                    Ключевые навыки (через запятую, максимум 10)
                                                </label>
                                                <input
                                                    type="text"
                                                    name="skills"
                                                    value={formData.skills || ''}
                                                    onChange={handleInputChange}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                    placeholder="Java, Spring, React, ..."
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    {formData.skills?.split(',').filter(s => s.trim()).length || 0 }/10 навыков
                                                </p>
                                            </div>
                                        ) : (

                                            <div className="flex flex-wrap gap-2">
                                                {resume?.skills?.split(',').filter(s => s.trim()).map((skill, index) => (
                                                    <span key={index} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                            {skill.trim()}
                          </span>
                                                )) || 'Не указано'}
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* About */}
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <h3 className="text-lg font-medium text-gray-900 mb-4">О себе</h3>
                                        {isEditing ? (
                                            <div className="mb-4">
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Описание</label>
                                                <textarea
                                                    name="description"
                                                    value={formData.description || ''}
                                                    onChange={handleInputChange}
                                                    rows={4}
                                                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-800"
                                                />
                                            </div>
                                        ) : (
                                            <p className="text-gray-700 whitespace-pre-line">{resume?.description || 'Не указано'}</p>
                                        )}
                                    </div>
                                </div>

                                {/* Portfolio */}
                                {!isCreating && (
                                <div className="bg-white rounded-xl shadow-md overflow-hidden">
                                    <div className="p-6">
                                        <div className="flex justify-between items-center mb-4">
                                            <h3 className="text-lg font-medium text-gray-900">Портфолио</h3>
                                            {isEditing && (
                                                <div className="flex items-center gap-2">
                                                    <input
                                                        type="file"
                                                        accept="image/*"
                                                        onChange={(e) => setSelectedImage(e.target.files?.[0] || null)}
                                                        className="hidden"
                                                        id="portfolio-upload"
                                                    />
                                                    <label
                                                        htmlFor="portfolio-upload"
                                                        className="px-3 py-1 bg-gray-100 text-gray-700 rounded-md text-sm cursor-pointer hover:bg-gray-200"
                                                    >
                                                        Выбрать фото
                                                    </label>
                                                    {selectedImage && (
                                                        <button
                                                            onClick={handleImageUpload}
                                                            disabled={images.length >= 6 || imageUploading}
                                                            className="px-3 py-1 bg-blue-600 text-white rounded-md text-sm hover:bg-blue-700 disabled:opacity-50"
                                                        >
                                                            {imageUploading ? 'Загрузка...' : 'Загрузить'}
                                                        </button>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        {loadingImages ? (
                                                <div className="text-center py-8 text-gray-500">Загрузка изображений...</div>
                                            ) :
                                        images.length > 0 ? (
                                            <>
                                                <div className="flex overflow-x-auto pb-2 mb-4 gap-2">
                                                    {images.map((img, index) => (
                                                        <div
                                                            key={img.id}
                                                            className={`relative flex-shrink-0 cursor-pointer ${activeImageTab === index ? 'ring-2 ring-blue-500' : ''}`}
                                                            onClick={() => setActiveImageTab(index)}
                                                        >
                                                            <img
                                                                src={img.url}
                                                                alt={`Портфолио ${index + 1}`}
                                                                className="h-20 w-20 object-cover rounded-md"
                                                                onClick={() => setModalImage(img.url)}
                                                            />
                                                            {isEditing && (
                                                                <button
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteImage(img.id)
                                                                    }}
                                                                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600 cursor-pointer"
                                                                >
                                                                    <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                                                    </svg>
                                                                </button>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>

                                                {/*<div className="relative h-64 bg-gray-100 rounded-md overflow-hidden">*/}
                                                {/*    <img*/}
                                                {/*        src={images[activeImageTab]?.url}*/}
                                                {/*        alt={`Портфолио ${activeImageTab + 1}`}*/}
                                                {/*        className="absolute inset-0 w-full h-full object-contain cursor-pointer"*/}
                                                {/*        onClick={() => setModalImage(images[activeImageTab]?.url)}*/}
                                                {/*    />*/}
                                                {/*</div>*/}
                                            </>
                                        ) : (
                                            <div className="text-center py-8 text-gray-500">
                                                <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                                                </svg>
                                                <p className="mt-2">Нет загруженных работ</p>
                                            </div>
                                        )}
                                    </div>
                                </div>)}
                            </div>
                        </div>
                    )}

                    {/* Image Modal */}
                    <AnimatePresence>
                        {modalImage && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black bg-opacity-90 z-50 flex items-center justify-center p-4"
                                onClick={() => setModalImage(null)}
                            >
                                <div className="relative max-w-4xl w-full max-h-[90vh]">
                                    <button
                                        className="absolute -top-10 right-0 text-white hover:text-gray-300"
                                        onClick={() => setModalImage(null)}
                                    >
                                        <svg className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                    <img
                                        src={modalImage}
                                        alt="Портфолио"
                                        className="w-full h-full object-contain"
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </main>
                <ToastContainer position="bottom-right" autoClose={5000} />
                </div>
            </div>
        </AuthGuard>
    )
}