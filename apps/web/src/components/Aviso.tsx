export function Aviso({ mensaje }: { mensaje: string }) {
  if (!mensaje) return null;
  return <p className="rounded-md bg-red-50 p-2 text-sm text-red-700">{mensaje}</p>;
}
