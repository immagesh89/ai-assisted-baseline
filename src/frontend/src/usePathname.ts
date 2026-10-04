import { useCallback, useEffect, useState } from "react";

type Navigate = (path: string) => void;

// The app has two pages and no router dependency, so the pathname is read
// straight off window.location and navigation goes through the History API.
// That keeps /saved a real path (the dev server and nginx.conf both fall back to
// index.html) without pulling in react-router.
export function usePathname(): [string, Navigate] {
  const [pathname, setPathname] = useState(() =>
    normalize(window.location.pathname),
  );

  useEffect(() => {
    const handlePopState = () =>
      setPathname(normalize(window.location.pathname));

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const navigate = useCallback((path: string) => {
    window.history.pushState({}, "", path);
    setPathname(normalize(path));
  }, []);

  return [pathname, navigate];
}

function normalize(path: string): string {
  const trimmed = path.replace(/\/+$/, "");

  return trimmed.length > 0 ? trimmed : "/";
}
