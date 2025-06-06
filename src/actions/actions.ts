"use server";

import { signIn, signOut } from "@/lib/auth";
import prisma from "@/lib/db";
import { checkAuth, getPetByPetId } from "@/lib/server-utils";
import { sleep } from "@/lib/utils";
import { authSchema, petFormSchema, petIdSchema } from "@/lib/validations";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

//user actions

export async function login(formData: unknown) {
  if (!(formData instanceof FormData)) {
    return {
      message: "Invalid form data",
    };
  }

  await signIn("credentials", formData);

  redirect("app/dashboard");
}

export async function logOut() {
  await signOut({ redirectTo: "/" });
}

export async function signUp(formData: unknown) {
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

  await prisma.user.create({
    data: {
      email: email,
      hashedPassword,
    },
  });

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
    });
  } catch (error) {
    console.log(error);
    return { message: "Could not add pet" };
  }

  revalidatePath("/app", "layout");
}

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

  try {
    await prisma.pet.update({
      where: {
        id: validatedId.data,
      },
      data: {
        ...validatedPet.data,
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
