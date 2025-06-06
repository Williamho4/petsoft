<<<<<<< HEAD
export type Pet = {
  id: string
  name: string
  ownerName: string
  imageUrl: string
  age: number
  notes: string
}
=======
import { Pet } from '@prisma/client'

export type PetPayload = Omit<Pet, 'id' | 'updatedAt' | 'createdAt' | 'userId'>
>>>>>>> 20e67b3 (auth)
