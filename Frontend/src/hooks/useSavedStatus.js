import { useEffect, useState } from "react";

export default function useSavedStatus({ token, toolId }) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;

    const run = async () => {
      if (!token || !toolId) {
        setIsSaved(false);
        return;
      }

      // If a user is on their own dashboard, they can still have local saved tools
      // but we keep Explore cards in sync from the backend.

      setLoading(true);
      setError(null);

      try {
        // We fetch saved tools list once and check membership.
        const res = await fetch("/api/users/me/saved", {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (!res.ok)
          throw new Error(`Failed to load saved tools (${res.status})`);
        const data = await res.json();

        if (!cancelled) {
          const savedIds = (data || []).map((t) => String(t.id));
          setIsSaved(savedIds.includes(String(toolId)));
        }
      } catch (e) {
        if (!cancelled) {
          setError(e?.message || "Failed to load saved status");
          setIsSaved(false);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    };

    run();

    return () => {
      cancelled = true;
    };
  }, [token, toolId]);

  return { isSaved, setIsSaved, loading, error };
}
