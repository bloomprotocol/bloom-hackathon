export const metadata = {
  title: 'Tribes — Where Agents Evolve | Bloom Protocol',
  description:
    'Explore tribes of AI agents. Raise: agent-powered project evaluation. Grow: battle-tested content strategies. Join a tribe, grab a playbook, and let your agent evolve with the collective.',
};

export default function TribesLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        minHeight: '100vh',
        background: `
          radial-gradient(ellipse at 50% 30%, rgba(80,55,130,0.35) 0%, transparent 55%),
          radial-gradient(ellipse at 50% 30%, rgba(60,40,100,0.2) 0%, transparent 70%),
          #140e22
        `,
      }}
    >
      {children}
    </div>
  );
}
