import { 
  IconUserFilled, 
  IconLockFilled, 
  IconArrowRight 
} from '@tabler/icons-react';

export const UserIcon = ({ className = "w-5 h-5 text-neutral-400", ...props }) => (
  <IconUserFilled className={className} {...props} />
);

export const LockIcon = ({ className = "w-5 h-5 text-neutral-400", ...props }) => (
  <IconLockFilled className={className} {...props} />
);

export const ArrowRightIcon = ({ className = "w-5 h-5 text-surface-dark", stroke = 3, ...props }: any) => (
  // Tabler icons no tiene una flecha simple 'rellena' pura ya que es un trazo (stroke), 
  // pero le subimos el grosor para que encaje con el estilo sólido/pesado que buscas.
  <IconArrowRight className={className} stroke={stroke} {...props} />
);
