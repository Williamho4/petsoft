import { Button } from './ui/button'

type petFormBtnProps = {
  actionType: 'edit' | 'add'
}

export default function PetFormBtn({ actionType }: petFormBtnProps) {
  return (
    <Button type="submit" className="mt-5 self-end">
      {actionType === 'add' ? 'Add a new pet' : 'Edit pet'}
    </Button>
  )
}
