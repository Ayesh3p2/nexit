import { Metadata } from 'next';
import { ChangeForm } from '@/modules/changes/components/ChangeForm/ChangeForm';

export const metadata: Metadata = {
  title: 'New Change | NexIT ITSM',
  description: 'Create a new change request',
};

export default function NewChangePage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <ChangeForm />
    </div>
  );
}
