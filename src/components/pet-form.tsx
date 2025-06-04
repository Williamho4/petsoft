'use client'

import { usePetContext } from '@/lib/hooks'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import PetFormBtn from './pet-form-btn'
import { useForm } from 'react-hook-form'
import { PetPayload } from '@/lib/types'
import { DEFAULT_PET_IMAGE } from '@/lib/constants'
import { z } from 'zod'
import { zodResolver } from '@hookform/resolvers/zod'

type PetFormProps = {
  actionType: 'edit' | 'add'
  onFormSubmission: () => void
}

type Inputs = PetPayload & {}

const petFormSchema = z.object({
  name: z.string().trim().min(1, { message: 'Name is required' }).max(100),
  ownerName: z
    .string()
    .trim()
    .min(1, { message: 'Owner name is required' })
    .max(100),
  imageUrl: z.union([
    z.literal(''),
    z.string().trim().url({ message: 'Image url must be a valid url' }),
  ]),
  age: z.coerce
    .number({ message: 'Must be a valid number' })
    .int()
    .positive()
    .max(99999),
  notes: z.union([z.literal(''), z.string().trim().max(1000)]),
})

export default function PetForm({
  actionType,
  onFormSubmission,
}: PetFormProps) {
  const { selectedPet, handleAddPet, handleEditPet } = usePetContext()

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<Inputs>({
    resolver: zodResolver(petFormSchema),
    defaultValues:
      actionType === 'edit'
        ? {
            name: selectedPet?.name,
            ownerName: selectedPet?.ownerName,
            imageUrl: selectedPet?.imageUrl,
            age: selectedPet?.age,
            notes: selectedPet?.notes,
          }
        : undefined,
  })

  return (
    <form
      action={async () => {
        const result = await trigger()
        if (!result) return

        onFormSubmission()

        const petData = getValues()
        petData.imageUrl = petData.imageUrl || DEFAULT_PET_IMAGE

        if (actionType === 'add') {
          await handleAddPet(petData)
        } else if (actionType === 'edit') {
          await handleEditPet(selectedPet!.id, petData)
        }
      }}
      className="flex flex-col"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input {...register('name')} id="name" />
          {errors.name && <p className="text-red-500">{errors.name.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input {...register('ownerName')} id="ownerName" />
          {errors.ownerName && (
            <p className="text-red-500">{errors.ownerName.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image Url</Label>
          <Input {...register('imageUrl')} id="imageUrl" />
          {errors.imageUrl && (
            <p className="text-red-500">{errors.imageUrl.message}</p>
          )}
        </div>

        <div className="space-y-1">
          <Label htmlFor="age">Age</Label>
          <Input {...register('age', { valueAsNumber: true })} id="age" />
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea {...register('notes')} id="notes" />
          {errors.notes && (
            <p className="text-red-500">{errors.notes.message}</p>
          )}
        </div>
      </div>
      <PetFormBtn actionType={actionType} />
    </form>
  )
}
