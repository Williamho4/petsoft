import "server-only";

import { redirect } from "next/navigation";
import { auth } from "./auth";
import { Pet, User } from "@prisma/client";
import prisma from "./db";

export async function checkAuth() {
  const session = await auth();
  if (!session?.user) {
    redirect("/");
  }

  return session;
}

export async function getUserByEmail(email: User["email"]) {
  const user = await prisma.user.findUnique({
    where: {
      email,
    },
  });

  return user;
}

export async function getPetByPetId(petId: Pet["id"]) {
  const pet = await prisma.pet.findUnique({
    where: {
      id: petId,
    },
  });

  return pet;
}

export async function getPetByUserId(userId: Pet["userId"]) {
  const pets = await prisma.pet.findMany({
    where: {
      userId,
    },
  });

  return pets;
}
