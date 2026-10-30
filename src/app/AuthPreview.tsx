import { DemoAuthForm } from './DemoAuth';

export default function AuthPreview({ signup = false }: { signup?: boolean }) {
  return <DemoAuthForm signup={signup} />;
}
