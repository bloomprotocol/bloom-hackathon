import figma from '@figma/code-connect';
import SeedPassCertificate from './SeedPassCertificate';

/**
 * Figma Code Connect Configuration
 *
 * This file maps the Figma design components to the React component implementation.
 * It allows designers to see real code directly in Figma.
 *
 * Figma Node IDs:
 * - Seed (L1): 1789:49345
 * - Sprout (L2): 1789:49356
 * - Bloom (L3): 1789:49369
 */

// Seed Certificate - L1
figma.connect(
  SeedPassCertificate,
  'https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49345',
  {
    props: {
      level: figma.enum('Property 1', {
        Default: 'seed',
      }),
    },
    example: () => <SeedPassCertificate level="seed" />,
  }
);

// Sprout Certificate - L2
figma.connect(
  SeedPassCertificate,
  'https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49356',
  {
    props: {
      level: figma.enum('Property 1', {
        Variant2: 'sprout',
      }),
    },
    example: () => <SeedPassCertificate level="sprout" />,
  }
);

// Bloom Certificate - L3
figma.connect(
  SeedPassCertificate,
  'https://www.figma.com/design/MBzMGT7TcUncjhUjzEbNCA/Bloom-Protocol-New--Copy-?node-id=1789-49369',
  {
    props: {
      level: figma.enum('Property 1', {
        Variant3: 'bloom',
      }),
    },
    example: () => <SeedPassCertificate level="bloom" />,
  }
);
