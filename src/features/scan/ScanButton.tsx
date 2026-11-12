import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui';
import type { ButtonProps } from '@/components/ui/Button';

// Drop-in button for the Ask screen: opens /scan, which hands { text, imageDataUrl } back via router state.
export function ScanButton(props: Omit<ButtonProps, 'onClick'>) {
  const nav = useNavigate();
  return (
    <Button variant="secondary" {...props} onClick={() => nav('/scan')}>
      {props.children ?? 'Scan'}
    </Button>
  );
}
