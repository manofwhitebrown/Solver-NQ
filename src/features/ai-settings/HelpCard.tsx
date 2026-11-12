import { Card } from '@/components/ui';

export function HelpCard() {
  return (
    <Card className="!bg-raised">
      <h3 className="text-lg font-semibold">How to get a free key</h3>
      <ol className="mt-3 list-decimal space-y-2 pl-5 text-base">
        <li>Open Google AI Studio and sign in.</li>
        <li>Tap Get API key, then Create key.</li>
        <li>Copy it and paste it here.</li>
      </ol>
      <p className="mt-3 text-sm text-muted">
        Limits are per Google project, not per key. For extra free limit, create the key in a new project and give it its own name.
      </p>
      <a className="mt-3 inline-flex min-h-[44px] items-center font-semibold text-accent underline" href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer">
        Open Google AI Studio
      </a>
    </Card>
  );
}
