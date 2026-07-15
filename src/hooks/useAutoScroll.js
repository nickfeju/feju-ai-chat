import { useEffect, useRef } from "react";

export function useAutoScroll(messageCount, loading) {
    const endRef = useRef(null);

    useEffect(() => {
        endRef.current?.scrollIntoView({ behavior: "smooth", block: "end" });
    }, [messageCount, loading]);

    return endRef;
}
