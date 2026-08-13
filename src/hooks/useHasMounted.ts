import { useEffect, useState } from "react";

export function useHasMounted(): boolean {
  const [mounted, setMounted] = useState(false);
  // Intentional: this is the standard hydration-safe "client has mounted"
  // flag, with no prop to key a remount off of.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setMounted(true), []);
  return mounted;
}
