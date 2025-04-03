export default async function Layout({ children }: { children: React.ReactNode }) {
  return <div className="flex flex-col items-start w-full">{children}</div>;
}
