import { useFormStatus } from 'react-dom'
import { Button } from './ui/button'

type petFormBtnProps = {
  actionType: 'edit' | 'add'
}

export default function PetFormBtn({ actionType }: petFormBtnProps) {
  const { pending } = useFormStatus()

  return (
    <Button type="submit" disabled={pending} className="mt-5 self-end">
      {actionType === 'add' ? 'Add a new pet' : 'Edit pet'}
    </Button>
  )
}
