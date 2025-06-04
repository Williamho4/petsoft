'use client'

import { addPet, deletePet, editPet } from '@/actions/actions'
import { PetPayload } from '@/lib/types'
import { Pet } from '@prisma/client'
import { createContext, useOptimistic, useState } from 'react'
import { toast } from 'sonner'

type PetContextProviderProps = {
  data: Pet[]
  children: React.ReactNode
}

type TPetContext = {
  pets: Pet[]
  selectedPetId: Pet['id'] | null
  handleChangeSelectedPetId: (id: Pet['id']) => void
  selectedPet: Pet | undefined
  numberOfPets: number
  handleAddPet: (newPet: PetPayload) => Promise<void>
  handleEditPet: (petId: Pet['id'], newPetData: PetPayload) => Promise<void>
  handleCheckoutPet: (petId: Pet['id']) => Promise<void>
}

export const PetContext = createContext<TPetContext | null>(null)

export default function PetContextProvider({
  children,
  data,
}: PetContextProviderProps) {
  const [optimisticPets, setOptimsticPets] = useOptimistic(
    data,
    (state, { action, payload }) => {
      switch (action) {
        case 'add':
          return [
            ...state,
            {
              ...payload,
              id: Math.random().toString(),
            },
          ]
        case 'edit':
          return state.map((pet) => {
            return pet.id === payload.id
              ? {
                  ...pet,
                  ...payload.newPetData,
                }
              : pet
          })
        case 'delete':
          return state.filter((pet) => pet.id !== payload)
        default:
          return state
      }
    }
  )

  const [selectedPetId, setSelectedPetId] = useState<string | null>(null)

  const selectedPet = optimisticPets.find((pet) => pet.id === selectedPetId)
  const numberOfPets = optimisticPets.length

  const handleAddPet = async (newPet: PetPayload) => {
    setOptimsticPets({ action: 'add', payload: newPet })
    console.log(data)

    const error = await addPet(newPet)
    if (error) {
      toast.warning(error.message)
      return
    }
  }

  const handleEditPet = async (petId: Pet['id'], newPetData: PetPayload) => {
    setOptimsticPets({
      action: 'edit',
      payload: {
        id: petId,
        newPetData,
      },
    })

    const error = await editPet(petId, newPetData)
    if (error) {
      toast.warning(error.message)
      return
    }
  }

  const handleCheckoutPet = async (petId: Pet['id']) => {
    setOptimsticPets({ action: 'delete', payload: petId })
    await deletePet(petId)
    setSelectedPetId(null)
  }

  const handleChangeSelectedPetId = (id: Pet['id']) => {
    setSelectedPetId(id)
  }

  return (
    <PetContext.Provider
      value={{
        pets: optimisticPets,
        selectedPetId,
        handleChangeSelectedPetId,
        selectedPet,
        numberOfPets,
        handleAddPet,
        handleEditPet,
        handleCheckoutPet,
      }}
    >
      {children}
    </PetContext.Provider>
  )
}
