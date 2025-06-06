"use server";

<<<<<<< HEAD
import prisma from '@/lib/db'
import { sleep } from '@/lib/utils'
import { revalidatePath } from 'next/cache'

export async function addPet(formData) {
  await sleep(2000)
=======
import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkAuth, getPetByPetId } from "@/lib/server-utils";
import { sleep } from "@/lib/utils";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import { Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import { AuthError } from "next-auth";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

const stripe = require("stripe")(process.env.STRIPE_SECRET_KEY);

//user actions

export async function logIn(prevState: unknown, formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  try {
    await signIn("credentials", formData);
  } catch (error) {
    if (error instanceof AuthError) {
      switch (error.type) {
        case "CredentialsSignin": {
          return {
            message: "Invalid credentials",
          };
        }
        default: {
          return {
            message: "Could not sign in",
          };
        }
      }
    }

    throw error;
  }
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function signUp(prevState: unknown, formData: unknown) {
  await sleep(1000);

  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  const formDataObject = Object.fromEntries(formData.entries());
  const validatedFormDataObject = authSchema.safeParse(formDataObject);

  if (!validatedFormDataObject.success) {
    return {
      message: "Invalid form data",
    };
  }

  const { email, password } = validatedFormDataObject.data;

  const hashedPassword = await bcrypt.hash(password, 10);

  try {
    await prisma.user.create({
      data: {
        email: email,
        hashedPassword,
      },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2002") {
        return {
          message: "Email already exist",
        };
      }
    }
    return {
      message: "Could not create user",
    };
  }

  await signIn("credentials", formData);
}

//pet actions

export async function addPet(newPet: unknown) {
  await sleep(1000);

  const session = await checkAuth();

  const validatedPet = petFormSchema.safeParse(newPet);
  if (!validatedPet.success) {
    return {
      message: "Invalid pet data",
    };
  }
>>>>>>> 20e67b3 (auth)

  try {
    await prisma.pet.create({
      data: {
<<<<<<< HEAD
        name: formData.get('name'),
        ownerName: formData.get('ownerName'),
        age: parseInt(formData.get('age')),
        imageUrl:
          formData.get('imageUrl') ||
          'https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png',
        notes: formData.get('notes'),
=======
        ...validatedPet.data,
        user: {
          connect: {
            id: session.user.id,
          },
        },
>>>>>>> 20e67b3 (auth)
      },
    });
  } catch (error) {
    console.log(error);
    return { message: "Could not add pet" };
  }

  revalidatePath("/app", "layout");
}

<<<<<<< HEAD
export async function editPet(petId: string, formData) {
  await sleep(2000)
=======
export async function editPet(petId: unknown, newPetData: unknown) {
  await sleep(1000);

  const session = await checkAuth();

  const validatedId = petIdSchema.safeParse(petId);
  const validatedPet = petFormSchema.safeParse(newPetData);
  if (!validatedId.success || !validatedPet.success) {
    return {
      message: "Invalid pet data",
    };
  }

  const pet = await getPetByPetId(validatedId.data);

  if (!pet) {
    return {
      message: "Pet not found",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    };
  }
>>>>>>> 20e67b3 (auth)

  try {
    await prisma.pet.update({
      where: {
        id: validatedId.data,
      },
      data: {
<<<<<<< HEAD
        name: formData.get('name'),
        ownerName: formData.get('ownerName'),
        imageUrl:
          formData.get('imageUrl') ||
          'https://bytegrad.com/course-assets/react-nextjs/pet-placeholder.png',
        age: parseInt(formData.get('age')),
        notes: formData.get('notes'),
=======
        ...validatedPet.data,
>>>>>>> 20e67b3 (auth)
      },
    });
  } catch (error) {
    console.log(error);
    return {
      message: "Could not edit pet",
    };
  }

  revalidatePath("/app", "layout");
}

<<<<<<< HEAD
export async function deletePet(petId: string) {
=======
export async function deletePet(petId: unknown) {
  const session = await checkAuth();

  const validatedId = petIdSchema.safeParse(petId);
  if (!validatedId.success) {
    return {
      message: "Invalid pet data",
    };
  }

  const pet = await getPetByPetId(validatedId.data);

  if (!pet) {
    return {
      message: "Pet not found",
    };
  }

  if (pet.userId !== session.user.id) {
    return {
      message: "Not authorized",
    };
  }

>>>>>>> 20e67b3 (auth)
  try {
    await prisma.pet.delete({
      where: {
        id: validatedId.data,
      },
    });
  } catch (error) {
    return {
      message: "Could not checkout pet",
    };
  }

  revalidatePath("/app", "layout");
}

export async function createCheckoutSession() {
  const session = await checkAuth();

  const checkoutSession = await stripe.checkout.sessions.create({
    customer_email: session.user.email,
    line_items: [
      {
        price: "price_1RXSN3PF2OTRjqycgpotwEX9",
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${process.env.CANONICAL_URL}//payment?success=true`,
    cancel_url: `${process.env.CANONICAL_URL}/payment?cancelled=true`,
  });

  redirect(checkoutSession.url);
}
