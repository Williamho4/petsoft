'use server'

import prisma from '@/lib/db'
import { PetPayload } from '@/lib/types'
import { sleep } from '@/lib/utils'
import { Pet } from '@prisma/client'

import { revalidatePath } from 'next/cache'

export async function addPet(newPet: PetPayload) {
  await sleep(1000)

  try {
    await prisma.pet.create({
      data: {
        ...newPet,
      },
    })
  } catch (error) {
    return { message: 'Could not add pet' }
  }

  revalidatePath('/app', 'layout')
}

export async function editPet(petId: Pet['id'], newPetData: PetPayload) {
  await sleep(1000)

  try {
    await prisma.pet.update({
      where: {
        id: petId,
      },
      data: {
        ...newPetData,
      },
    })
  } catch (error) {
    console.log(error)
    return {
      message: 'Could not edit pet',
    }
  }

  revalidatePath('/app', 'layout')
}

export async function deletePet(petId: Pet['id']) {
  try {
    await prisma.pet.delete({
      where: {
        id: petId,
      },
    })
  } catch (error) {
    return {
      message: 'Could not checkout pet',
    }
  }

  revalidatePath('/app', 'layout')
}
