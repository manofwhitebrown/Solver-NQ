import { PageHeader } from '@/components/ui';
import { BackupPanel } from './BackupPanel';

export default function BackupPage() {
  return (
    <>
      <PageHeader title="Backup and restore" subtitle="Keep your library safe" back />
      <BackupPanel />
    </>
  );
}
