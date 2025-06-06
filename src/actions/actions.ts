'use server'

import { auth, signIn, signOut } from '@/lib/auth'
import prisma from '@/lib/db'
import { sleep } from '@/lib/utils'
import { petFormSchema, petIdSchema } from '@/lib/validations'
import bcrypt from 'bcryptjs'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

//user actions

export async function login(formData: FormData) {
  const authData = Object.fromEntries(formData.entries())

  await signIn('credentials', authData)
}

export async function logOut() {
  await signOut({ redirectTo: '/' })
}

export async function signUp(formData: FormData) {
  const hashedPassword = await bcrypt.hash(
    formData.get('password') as string,
    10
  )

  const user = await prisma.user.create({
    data: {
      email: formData.get('email'),
      hashedPassword,
    },
  })

  await signIn('credentials', user)
}

//pet actions

export async function addPet(newPet: unknown) {
  await sleep(1000)

  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const validatedPet = petFormSchema.safeParse(newPet)
  if (!validatedPet.success) {
    return {
      message: 'Invalid pet data',
    }
  }

  try {
    await prisma.pet.create({
      data: {
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
      },
    })
  } catch (error) {
    console.log(error)
    return { message: 'Could not add pet' }
  }

  revalidatePath('/app', 'layout')
}

export async function editPet(petId: unknown, newPetData: unknown) {
  await sleep(1000)

  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const validatedId = petIdSchema.safeParse(petId)
  const validatedPet = petFormSchema.safeParse(newPetData)
  if (!validatedId.success || !validatedPet.success) {
    return {
      message: 'Invalid pet data',
    }
  }

  const pet = await prisma.pet.findUnique({
    where: {
      id: validatedId.data,
    },
    select: {
      userId: true,
    },
  })

  if (!pet) {
    return {
      message: 'Pet not found',
    }
  }

  if (pet.userId !== session.user.id) {
    return {
      message: 'Not authorized',
    }
  }

  try {
    await prisma.pet.update({
      where: {
        id: validatedId.data,
      },
      data: {
        ...validatedPet.data,
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

export async function deletePet(petId: unknown) {
  const session = await auth()
  if (!session?.user) {
    redirect('/')
  }

  const validatedId = petIdSchema.safeParse(petId)
  if (!validatedId.success) {
    return {
      message: 'Invalid pet data',
    }
  }

  const pet = await prisma.pet.findUnique({
    where: {
      id: validatedId.data,
    },
    select: {
      userId: true,
    },
  })

  if (!pet) {
    return {
      message: 'Pet not found',
    }
  }

  if (pet.userId !== session.user.id) {
    return {
      message: 'Not authorized',
    }
  }

  try {
    await prisma.pet.delete({
      where: {
        id: validatedId.data,
      },
    })
  } catch (error) {
    return {
      message: 'Could not checkout pet',
    }
  }

  revalidatePath('/app', 'layout')
}
