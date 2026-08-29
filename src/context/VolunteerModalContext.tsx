'use client'

import React, { createContext, useContext, useState, useCallback, useMemo } from 'react'
import VolunteerModal from '@/components/forms/VolunteerModal'

interface VolunteerModalContextType {
  isOpen: boolean
  openVolunteerModal: () => void
  closeVolunteerModal: () => void
}

const VolunteerModalContext = createContext<VolunteerModalContextType | undefined>(undefined)

export function VolunteerModalProvider({ children }: { children: React.ReactNode }) {
  const [isOpen, setIsOpen] = useState(false)

  const openVolunteerModal = useCallback(() => {
    setIsOpen(true)
  }, [])

  const closeVolunteerModal = useCallback(() => {
    setIsOpen(false)
  }, [])

  const value = useMemo(
    () => ({
      isOpen,
      openVolunteerModal,
      closeVolunteerModal,
    }),
    [isOpen, openVolunteerModal, closeVolunteerModal],
  )

  return (
    <VolunteerModalContext.Provider value={value}>
      {children}
      <VolunteerModal isOpen={isOpen} onClose={closeVolunteerModal} />
    </VolunteerModalContext.Provider>
  )
}

export function useVolunteerModal() {
  const context = useContext(VolunteerModalContext)
  if (!context) {
    throw new Error('useVolunteerModal must be used within a VolunteerModalProvider')
  }
  return context
}
