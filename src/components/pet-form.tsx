'use client'

import { usePetContext } from '@/lib/hooks'
import { Input } from './ui/input'
import { Label } from './ui/label'
import { Textarea } from './ui/textarea'
import { addPet, editPet } from '@/actions/actions'
import PetFormBtn from './pet-form-btn'
<<<<<<< HEAD
import { toast } from 'sonner'
=======
import { useForm } from 'react-hook-form'
import { DEFAULT_PET_IMAGE } from '@/lib/constants'
import { zodResolver } from '@hookform/resolvers/zod'
import { petFormSchema, TPetForm } from '@/lib/validations'
>>>>>>> 20e67b3 (auth)

type PetFormProps = {
  actionType: 'edit' | 'add'
  onFormSubmission: () => void
}

export default function PetForm({
  actionType,
  onFormSubmission,
}: PetFormProps) {
<<<<<<< HEAD
  const { selectedPet } = usePetContext()
=======
  const { selectedPet, handleAddPet, handleEditPet } = usePetContext()

  const {
    register,
    trigger,
    getValues,
    formState: { errors },
  } = useForm<TPetForm>({
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
>>>>>>> 20e67b3 (auth)

  return (
    <form
      action={async (formData) => {
        if (actionType === 'add') {
          const error = await addPet(formData)
          if (error) {
            toast.warning(error.message)
            return
          }
        } else if (actionType === 'edit') {
          const error = await editPet(selectedPet?.id!, formData)
          if (error) {
            toast.warning(error.message)
            return
          }
        }
        onFormSubmission()
      }}
      className="flex flex-col"
    >
      <div className="space-y-3">
        <div className="space-y-1">
          <Label htmlFor="name">Name</Label>
          <Input
            id="name"
            name="name"
            type="text"
            required
            defaultValue={actionType === 'edit' ? selectedPet?.name : ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="ownerName">Owner Name</Label>
          <Input
            id="ownerName"
            name="ownerName"
            type="text"
            required
            defaultValue={actionType === 'edit' ? selectedPet?.ownerName : ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="imageUrl">Image Url</Label>
          <Input
            id="imageUrl"
            name="imageUrl"
            type="text"
            defaultValue={actionType === 'edit' ? selectedPet?.imageUrl : ''}
          />
        </div>

        <div className="space-y-1">
          <Label htmlFor="age">Age</Label>
<<<<<<< HEAD
          <Input
            id="age"
            name="age"
            type="number"
            required
            defaultValue={actionType === 'edit' ? selectedPet?.age : ''}
          />
=======
          <Input {...register('age')} id="age" />
          {errors.age && <p className="text-red-500">{errors.age.message}</p>}
>>>>>>> 20e67b3 (auth)
        </div>

        <div className="space-y-1">
          <Label htmlFor="notes">Notes</Label>
          <Textarea
            id="notes"
            name="notes"
            rows={3}
            required
            defaultValue={actionType === 'edit' ? selectedPet?.notes : ''}
          />
        </div>
      </div>
      <PetFormBtn actionType={actionType} />
    </form>
  )
}
