import { Pet } from '@prisma/client'

export type PetPayload = Omit<Pet, 'id' | 'updatedAt' | 'createdAt'>
